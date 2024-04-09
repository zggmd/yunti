import {
  IPublicTypeAssetsJson,
  IPublicTypeLowCodeComponent,
  IPublicTypeProCodeComponent,
} from '@alilc/lowcode-types';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { extractI18n } from '@yuntijs/lowcode-i18n-extract';
import { flatten, merge, unionWith } from 'lodash';

import { AppsMembersService } from '@/apps-members/apps-members.service';
import { AppMember } from '@/common/entities/apps-members.entity';
import { App, I18nUsage } from '@/common/entities/apps.entity';
import { Page } from '@/common/entities/pages.entity';
import { MemberRole } from '@/common/models/member-role.enum';
import treeDataSources from '@/common/tree-data-sources';
import {
  CustomException,
  RELEASE_BRANCH_PREFIX,
  TREE_DEFAULT,
  checkUserTreeMutationPermision,
  extractI18nKeyPathFromSchema,
  genNanoid,
} from '@/common/utils';
import { ComponentsVersionsService } from '@/components-versions/components-versions.service';
import serverConfig from '@/config/server.config';
import { GitService } from '@/git/git.service';
import { MergeRequestService } from '@/merge-requests/merge-requests.service';
import { sortPackages } from '@/packages/utils';
import { PagesService } from '@/pages/pages.service';
import { ILoginUser } from '@/types';

import { UpdateSchemaI18nArgs } from '../common/dto/update-schema-i18n.args';
import { AppI18nExtractInput } from './dtos/app-i18n-extract.input';
import { CheckoutAppNewBranch } from './dtos/checkout-app-new-branch.input';
import { NewAppInput } from './dtos/new-app.input';
import { UpdateAppInput } from './dtos/update-app.input';
import * as defaultAssets from './templates/assets.json';
import * as defaultSchema from './templates/schema.json';

@Injectable()
export class AppsService {
  constructor(
    @Inject(serverConfig.KEY)
    private config: ConfigType<typeof serverConfig>,
    private readonly gitService: GitService,
    private readonly appsMembersService: AppsMembersService,
    private readonly pagesService: PagesService,
    private readonly componentsVersionsService: ComponentsVersionsService,
    private readonly mergeRequestService: MergeRequestService
  ) {}
  logger = new Logger('AppsService');

  getAppsRepository = (tree: string) => treeDataSources.getRepository<App>(tree, App);

  async listApps(tree: string): Promise<App[]> {
    const appsRepository = await this.getAppsRepository(tree);
    return appsRepository.find({
      order: {
        createAt: 'DESC',
      },
    });
  }

  async getAppById(tree: string, user: ILoginUser, id: string): Promise<App> {
    await this.appsMembersService.checkUserAppMemberRole(user, id);
    const appsRepository = await this.getAppsRepository(tree);
    const app = await appsRepository.findOne({
      where: { id },
      order: {
        pages: {
          createAt: 'DESC',
        },
      },
      relations: {
        pages: true,
      },
    });
    // @Todo 后面最好提供单独的字段获取资产，每次获取详情的时候都处理的话可能会导致加载速度变慢
    app.assets = await this.componentsVersionsService.improveAndSortAssets(app.assets);
    app.tree = tree;
    return app;
  }

  async createApp(tree: string, user: ILoginUser, body: NewAppInput) {
    const dataSource = await treeDataSources.getDataSource(tree);
    const queryRunner = dataSource.createQueryRunner();
    const id = genNanoid('app');

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const { name, namespace, description, schema, assets } = body;
      const app = new App();
      app.id = id;
      app.name = name;
      app.description = description;
      app.assets = assets || (defaultAssets as unknown as IPublicTypeAssetsJson);
      const basename = `${(schema as any)?.meta?.basename || `/${namespace}`}`;
      app.schema = merge({}, defaultSchema, schema, {
        meta: {
          name,
          description,
          namespace,
          version: '0.1.0',
          basename,
        },
        constants: {
          basename: {
            builtin: true,
            value: `'${basename}'`,
          },
        },
      });
      await queryRunner.manager.save(app);

      const appMember = new AppMember();
      appMember.role = MemberRole.Owner;
      appMember.member = user;
      appMember.app = app;
      await queryRunner.manager.save(appMember);

      // 创建默认分支
      await this.gitService.DOLT_BRANCH([`${id}/${TREE_DEFAULT}`], queryRunner);

      await queryRunner.commitTransaction();

      // 提交事务后，再提交 commit，否则 app 表可能会出现未提交的改动（@Todo: 猜测原因在这儿，先改下试试）
      await this.gitService.commitNt(tree, {
        committer: user,
        tables: [App.tableName, AppMember.tableName],
        message: `Create app ${body.name}(${id}).`,
      });
    } catch (error) {
      // since we have errors lets rollback the changes we made
      this.logger.error('createApp failed', error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }

    const appsRepository = await this.getAppsRepository(tree);
    return appsRepository.findOne({
      where: { id },
      order: {
        members: {
          createAt: 'DESC',
        },
      },
      relations: {
        members: true,
      },
    });
  }

  async updateApp(tree: string, loginUser: ILoginUser, body: UpdateAppInput) {
    const { id, ...updateAppInput } = body;
    const memberRole = await this.appsMembersService.checkUserAppMemberRole(loginUser, id, {
      not: [MemberRole.Guest, MemberRole.Reporter],
    });
    checkUserTreeMutationPermision(loginUser, tree, memberRole, id);

    const appsRepository = await this.getAppsRepository(tree);

    const log = await this.gitService.listLog(tree, { take: 2 });
    const updateAppKeys = Object.keys(updateAppInput).sort();
    const message = `Update app ${id}: ${updateAppKeys.join(', ')}`;

    const dataSource = await treeDataSources.getDataSource(tree);
    const queryRunner = dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      if (
        log.length === 2 &&
        log[0]?.message === message &&
        Date.now() - log[0].date < 1000 * 60 * (this.config.commit?.reset_minutes || 10)
      ) {
        await this.gitService.DOLT_RESET(['--soft', log[1].hash], queryRunner);
      }

      // 保存当前修改
      const app = new App();
      app.id = id;
      merge(app, updateAppInput);
      if (
        updateAppInput.name ||
        updateAppInput.description ||
        updateAppInput.schema ||
        updateAppInput.assets
      ) {
        const oldApp = await appsRepository.findOneBy({ id });
        const schema = updateAppInput.schema || oldApp.schema;
        const namespace = oldApp.schema?.meta?.namespace || oldApp.name;
        // constans 中定义的 basename 必须是个字符串，且不能是模板字符串
        const basename: string =
          updateAppInput.schema?.constants?.basename?.value?.trim() ||
          `'${schema?.meta?.basename || `/${namespace}`}'`;
        merge(schema, {
          meta: {
            name: updateAppInput.name || oldApp.name,
            namespace,
            description: updateAppInput.description || oldApp.description,
            version: updateAppInput.schema?.version || oldApp.schema?.version,
            // 去掉首尾引号
            basename: basename.replaceAll(/^["']|["'];?$/g, ''),
          },
          constants: {
            basename: {
              builtin: true,
              value: basename,
            },
          },
        });
        if (updateAppInput.assets) {
          // 对 assets 中的 packages 进行排序
          app.assets.packages = sortPackages(updateAppInput.assets.packages, 'package');
          // 更新 schema 中 componentsMap 的 npm 版本
          if (schema.componentsMap)
            for (const cm of schema.componentsMap) {
              if ((cm as IPublicTypeLowCodeComponent).devMode !== 'lowCode') {
                const targetPkg = updateAppInput.assets.packages.find(
                  pkg => pkg.package === (cm as IPublicTypeProCodeComponent).package
                );
                if (targetPkg) {
                  (cm as IPublicTypeProCodeComponent).version = targetPkg.version;
                }
              }
            }
          // 更新 schema 中 utils 的 npm 版本
          if (schema.utils)
            for (const util of schema.utils) {
              if (util.type === 'npm') {
                const targetPkg = updateAppInput.assets.packages.find(
                  pkg => pkg.package === util.content.package
                );
                if (targetPkg) {
                  util.content.version = targetPkg.version;
                }
              }
            }
        }
        app.schema = schema;
      }
      await queryRunner.manager.save(app);
      await queryRunner.commitTransaction();

      // 提交事务后，再提交 commit
      await this.gitService.commitNt(tree, {
        committer: loginUser,
        tables: [App.tableName],
        message,
      });
    } catch (error) {
      // since we have errors lets rollback the changes we made
      this.logger.error(`${message} failed`, error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
    const newApp = await appsRepository.findOneBy({ id });
    // @Todo 后面最好提供单独的字段获取资产，每次获取详情的时候都处理的话可能会导致加载速度变慢
    newApp.assets = await this.componentsVersionsService.improveAndSortAssets(newApp.assets);
    return newApp;
  }

  async fixNamespace(tree: string, loginUser: ILoginUser, id: string, namespace: string) {
    const appsRepository = await this.getAppsRepository(tree);
    const app = await appsRepository.findOneBy({ id });
    const { schema } = app;
    const oldNamespace = schema.meta.namespace;
    schema.meta.namespace = namespace;
    merge(schema, {
      constants: {
        basename: {
          builtin: true,
          value: `'/${namespace}'`,
        },
      },
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await appsRepository.update(id, { schema });
    // 提交修改
    await this.gitService.commitNt(tree, {
      committer: loginUser,
      tables: [App.tableName],
      message: `fix app(${id}) namespace: ${oldNamespace} => ${namespace}`,
    });
    return appsRepository.findOneBy({ id });
  }

  async updateAppI18n(tree: string, loginUser: ILoginUser, args: UpdateSchemaI18nArgs) {
    const { id, i18n } = args;
    const memberRole = await this.appsMembersService.checkUserAppMemberRole(loginUser, id, {
      not: [MemberRole.Guest, MemberRole.Reporter],
    });
    checkUserTreeMutationPermision(loginUser, tree, memberRole, id);

    const appsRepository = await this.getAppsRepository(tree);
    const oldApp = await appsRepository.findOneBy({ id });
    const { schema } = oldApp;
    schema.i18n = i18n;

    const log = await this.gitService.listLog(tree, { take: 2 });
    const message = `Update app ${id} i18n`;

    const dataSource = await treeDataSources.getDataSource(tree);
    const queryRunner = dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // 由于 i18n 更新比较频繁，为了减少 commit 数量，这里会判断最新的 commit 如果也是更新 i18n 而且
      // 提交时间在 10 分钟（默认时间，可配置）内的话，会做回退操作，新的 commit 中会包含所有修改
      if (
        log.length === 2 &&
        log[0]?.message === message &&
        Date.now() - log[0].date < 1000 * 60 * (this.config.commit?.reset_minutes || 10)
      ) {
        await this.gitService.DOLT_RESET(['--soft', log[1].hash], queryRunner);
      }

      // 保存当前修改
      const app = new App();
      app.id = id;
      app.schema = schema;
      await queryRunner.manager.save(app);
      await queryRunner.commitTransaction();

      // 提交事务后，再提交 commit
      await this.gitService.commitNt(tree, {
        committer: loginUser,
        tables: [App.tableName],
        message,
      });
    } catch (error) {
      // since we have errors lets rollback the changes we made
      this.logger.error(`${message} failed`, error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }

    const newApp = await appsRepository.findOneBy({ id });
    return newApp.schema.i18n;
  }

  async getAppFullSchema(tree: string, loginUser: ILoginUser, app: App) {
    const [pages, appMainBranch] = await Promise.all([
      this.pagesService.getAppPages(tree, loginUser, app.id),
      this.getAppById(TREE_DEFAULT, loginUser, app.id),
    ]);
    const componentsMap = [];
    const componentsTree = [];
    for (const p of pages) {
      componentsMap.push((p.content as any)?.componentsMap);
      componentsTree.push((p.content as any)?.componentsTree);
    }
    if (!app.schema.meta) {
      app.schema.meta = {};
    }
    // 以 main 分支的 meta 为准
    Object.assign(app.schema.meta, appMainBranch.schema?.meta);
    app.schema.meta.lowCode = {
      packages: app.assets.packages?.filter(pkg => (pkg as any).type === 'lowCode'),
    };
    // @Todo get app owner and matainers, add to meta.matainers
    return {
      version: '1.0.0',
      ...app.schema,
      componentsMap: unionWith(
        flatten(componentsMap).filter(cm => !!cm),
        (cmA, cmB) =>
          cmA.package === cmB.package &&
          cmA.subName === cmB.subName &&
          cmA.componentName === cmB.componentName
      ),
      componentsTree: flatten(componentsTree),
    };
  }

  async getI18nUsage(tree: string, loginUser: ILoginUser, app: App) {
    const i18nUsage: I18nUsage = {};
    const pages = await this.pagesService.getAppPages(tree, loginUser, app.id);

    const addKeyToI18n = (pageId: string, key: string, path: string[]) => {
      if (!i18nUsage[key]) {
        i18nUsage[key] = {
          [pageId]: [path],
        };
        return;
      }
      if (!i18nUsage[key][pageId]) {
        i18nUsage[key][pageId] = [path];
        return;
      }
      i18nUsage[key][pageId].push(path);
    };

    for (const page of pages) {
      extractI18nKeyPathFromSchema(page.content, [], (key, path) =>
        addKeyToI18n(page.id, key, path)
      );
    }
    return i18nUsage;
  }

  async checkoutNewBranchForApp(user: ILoginUser, branchInput: CheckoutAppNewBranch) {
    const { appId, name, sourceName } = branchInput;
    if (name === TREE_DEFAULT) {
      throw new CustomException('Conflict', 'can not create main branch', 409, branchInput);
    }
    const memberRole = await this.appsMembersService.checkUserAppMemberRole(user, appId, {
      not: [MemberRole.Guest, MemberRole.Reporter],
    });
    let branchName = `${appId}/${user.id}/${name}`;
    if (name.startsWith(RELEASE_BRANCH_PREFIX)) {
      if (memberRole !== MemberRole.Owner && memberRole !== MemberRole.Maintainer) {
        throw new CustomException(
          'Forbidden',
          'only Owner and Maintainer can create release branch',
          403,
          branchInput
        );
      }
      // release 分支不加 userId，方便共享
      branchName = `${appId}/${name}`;
    }

    // @Todo: 如果源分支 apps 表有未提交的改动，基于源分支创建的新分支会有冲突，目前还没找到原因（pages 表就没有这个问题）
    // 临时解决方案：在创建新分支前先把源分支 apps 的修改提交
    await this.gitService.commitNt(sourceName, {
      committer: user,
      tables: [App.tableName],
      message: `Commit changes of apps before create new branch ${branchName}.`,
    });

    await this.gitService.DOLT_BRANCH(['-c', sourceName, branchName]);
    const branch = await this.gitService.getBranchByName(branchName);
    branch.displayName = name;
    return branch;
  }

  async deleteBranchForApp(user: ILoginUser, name: string) {
    const [appId, userId] = name.split('/');
    const memberRole = await this.appsMembersService.checkUserAppMemberRole(user, appId, {
      not: [MemberRole.Guest, MemberRole.Reporter],
    });
    if (
      memberRole !== MemberRole.Owner &&
      memberRole !== MemberRole.Maintainer &&
      userId !== user.id
    ) {
      throw new CustomException(
        'Forbidden',
        'can not delete branch, because you have no permissions',
        403,
        { userId, name }
      );
    }
    await this.gitService.DOLT_BRANCH(['-D', name]);
    return true;
  }

  async appI18nExtract(user: ILoginUser, input: AppI18nExtractInput) {
    const { branch, appId } = input;
    const statusList = await this.gitService.listStatus(branch);
    if (statusList.length > 0) {
      throw new CustomException('COMMIT_CHANGES_FIRST', 'please commit your changes first', 400);
    }
    // ~ 1. 获取 app 完整的 schema (包含所有页面)
    const app = await this.getAppById(branch, user, appId);
    const fullSchema = await this.getAppFullSchema(branch, user, app);
    // ~ 2. 提取文案
    const { matches, schema: schemaWithI18n } = extractI18n(fullSchema);
    // ~ 3. 创建分支
    const i18nBranch = await this.checkoutNewBranchForApp(user, {
      appId,
      name: `i18n-extract-${Date.now()}`,
      sourceName: branch,
    });
    // ~ 4. 提交提取国际化文案后的 schema 相关改动
    const savePromises: Promise<any>[] = [
      this.updateAppI18n(branch, user, { id: appId, i18n: schemaWithI18n.i18n }),
    ];
    for (const page of app.pages) {
      const content: Page['content'] = Object.assign({}, page.content, {
        componentsTree: schemaWithI18n.componentsTree.find(ct => ct.id === page.id),
      });
      savePromises.push(
        this.pagesService.updatePage(i18nBranch.name, user, { id: page.id, content })
      );
    }
    await Promise.all(savePromises);
    await this.gitService.commitNt(i18nBranch.name, {
      committer: user,
      tables: [Page.tableName],
      message: 'update i18n by @yuntijs/lowcode-i18n-extract',
    });
    // ~ 5. 提交 merge request
    const branchDisplayName = this.gitService.getBranchDisplayName(appId, branch);
    return this.mergeRequestService.createMergeRequest(user, {
      sourceBranch: i18nBranch.name,
      targetBranch: branch,
      assigneeId: user.id,
      title: `[一键国际化] 分支 ${app.name}/${user.name}/${branchDisplayName} 共提取 ${matches.length} 处文案`,
      description: `共提取 ${matches.length} 处文案 (同一个函数或表达式中的文案计为 1 处)，
确认文案提取无误后即可 merge，重点关注下无需提取的中文常量或默认值等`,
    });
  }
}
