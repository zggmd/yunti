import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Timeout } from '@nestjs/schedule';
import { CRD } from '@yuntijs/k8s-client';
import { Like } from 'typeorm';

import { AppsMembersService } from '@/apps-members/apps-members.service';
import { AppsService } from '@/apps/apps.service';
import { ChartmuseumService } from '@/chartmuseum/chartmuseum.service';
import { PublishChannel } from '@/common/entities/publish-channels.entity';
import { PublishRecord } from '@/common/entities/publish-records.entity';
import { MemberRole } from '@/common/models/member-role.enum';
import treeDataSources from '@/common/tree-data-sources';
import {
  CustomException,
  TREE_DEFAULT,
  decryptText,
  extractPipelineRunStatus,
  genNanoid,
} from '@/common/utils';
import serverConfig from '@/config/server.config';
import { GitService } from '@/git/git.service';
import { MinioService } from '@/minio/minio.service';
import { PipelinesService } from '@/pipelines/pipelines.service';
import { PublishChannelHelm } from '@/publish-channels-helm/models/publish-channel-helm.model';
import { PublishChannelType } from '@/publish-channels/models/publish-channel-type.enum';
import { PublishChannelsService } from '@/publish-channels/publish-channels.service';
import { ILoginUser } from '@/types';

import { NewPublishInput } from './dtos/new-publish.input';
import { PublishRecordsArgs, PublishRecordsOrderArgs } from './dtos/publish-records.args';
import { UpdatePublishInput } from './dtos/update-publish.input';
import { PublishRecordDetail } from './models/publish-record.model';
import { PublishStatus } from './models/publish-status.enum';

@Injectable()
export class PublishRecordsService {
  constructor(
    @Inject(serverConfig.KEY)
    private config: ConfigType<typeof serverConfig>,
    private readonly gitService: GitService,
    private readonly minioService: MinioService,
    private readonly chartmuseumService: ChartmuseumService,
    private readonly pipelinesService: PipelinesService,
    private readonly appsService: AppsService,
    private readonly appsMembersService: AppsMembersService,
    private readonly publishChannelsService: PublishChannelsService
  ) {}

  logger = new Logger('PublishRecordsService');

  getPublishChannelsRepository = () =>
    treeDataSources.getRepository<PublishChannel>(TREE_DEFAULT, PublishChannel);

  getPublishRecordsRepository = () =>
    treeDataSources.getRepository<PublishRecord>(TREE_DEFAULT, PublishRecord);

  async doPublish(loginUser: ILoginUser, body: NewPublishInput) {
    const method = 'doPublish';
    const { channelId, name, displayName, baseline, tree, commitId, version } = body;
    const pubc = await this.publishChannelsService.getPublishChannelById(channelId, loginUser);
    if (!pubc) {
      throw new CustomException('NotFound', `can not find publish channel ${channelId}`, 404, body);
    }
    const appId = pubc.appId || body.appId;
    if (!appId) {
      throw new CustomException(
        'APP_ID_REQUIRED',
        `appId is required when use built-in publish channel.`,
        400,
        body
      );
    }
    // 仅应用拥有者及维护者可发布应用
    await this.appsMembersService.checkUserAppMemberRole(loginUser, appId, {
      must: [MemberRole.Owner, MemberRole.Maintainer],
    });

    // 检查版本是否已存在
    if (pubc.type === PublishChannelType.Helm) {
      try {
        const chart = await this.chartmuseumService.getChartOneVersion(
          pubc.detail as PublishChannelHelm,
          name,
          version
        );
        if (chart) {
          throw new CustomException('Conflict', `chart ${name}@${version} already exist.`, 409, {
            body,
          });
        }
      } catch (error) {
        this.logger.warn(`${method} check helm chart ${name}@${version} failed`, error.stack);
      }
    }

    const publishRecordsRepo = await this.getPublishRecordsRepository();
    const id = genNanoid('pubr');
    const channel: PublishRecordDetail['channel'] = {
      id: pubc.id,
      name: pubc.name,
      type: pubc.type,
      detail: Object.assign({}, pubc.detail, {
        password: undefined,
      }),
      status: pubc.status,
      updatorId: pubc.updatorId,
      updateAt: pubc.updateAt,
    };
    const commit = await this.gitService.getCommitById(tree, commitId || tree);
    if (!commit) {
      throw new CustomException(
        'INVALID_COMMIT_ID',
        `can not find commit ${commitId || tree} in tree ${tree}`,
        400,
        { body }
      );
    }
    const pubr: PublishRecord = {
      id,
      buildId: `yuntib-${appId}-${id}`,
      appId: appId,
      channelId,
      channelName: pubc.name,
      name: `${displayName} (${name})`,
      baseline,
      tree,
      version,
      status: PublishStatus.Running,
      detail: {
        name,
        displayName,
        commit: {
          ...commit,
          date: new Date(commit.date).getTime(),
        },
        channel,
        status: { progress: 0 },
      },
      publisherId: loginUser.id,
    };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await publishRecordsRepo.insert(pubr);

    await this.gitService.commitNt(TREE_DEFAULT, {
      committer: loginUser,
      tables: [PublishRecord.tableName],
      message: `Do publish ${id}`,
    });
    const newPubr = await publishRecordsRepo.findOneBy({ id });

    // 耗时操作进行异步处理: 上传 schema.json 到 minio 并运行流水线
    this.uploadSchemaAndRunPipelineAsync(commitId || tree, loginUser, pubc, newPubr);
    return newPubr;
  }

  async uploadSchemaAndRunPipelineAsync(
    tree: string,
    loginUser: ILoginUser,
    pubc: PublishChannel,
    pubr: PublishRecord
  ) {
    const method = 'uploadSchemaAndRunPipelineAsync';
    const { minio, dockerhub } = this.config;
    const appId = pubr.appId;
    try {
      const app = await this.appsService.getAppById(tree, loginUser, appId);
      if (!app) {
        throw new Error(`app ${appId}@${tree} not found.`);
      }
      const schema = await this.appsService.getAppFullSchema(tree, loginUser, app);
      // 替换版本为发版版本
      schema.meta.version = pubr.version;
      this.logger.log(`[${method}] start upload schema.json of app ${appId}@${tree}.`);
      const SOURCE_PATH = `${minio?.bucket}/${pubr.buildId}`;
      const SCHEMA_PATH = `schema.json`;
      const uploadRes = await this.minioService.uploadFile(
        minio?.bucket,
        `${pubr.buildId}/${SCHEMA_PATH}`,
        JSON.stringify(schema)
      );
      this.logger.log(
        `[${method}] upload schema.json of app ${appId}@${tree} successfully => ${JSON.stringify(
          uploadRes
        )}`
      );
      await this.updatePublishRecord(
        pubr.id,
        {
          detail: {
            status: {
              progress: 5,
              message: 'app schema upload to minio successfully.',
            },
          },
        },
        loginUser
      );
      // 创建流水线进行发布，暂时只支持 helm
      if (pubc.type !== PublishChannelType.Helm) {
        throw new Error('app publish support helm only.');
      }
      const pipelineName = pubr.buildId;
      const APP_IMAGE = `${dockerhub?.name}/${pubr.detail.name}:${pubr.version}`;
      this.logger.log(`[${method}] create pipeline ${pipelineName} for $app ${appId}@${tree}.`);
      const pubcDetail = pubc.detail as PublishChannelHelm;
      await this.pipelinesService.runAppPublishToHelmPipeline(loginUser, pipelineName, {
        SOURCE_PATH,
        SCHEMA_PATH,
        APP_IMAGE,
        REPOSITORY_URL: pubcDetail.url,
        REPOSITORY_USER: pubcDetail.username,
        REPOSITORY_PASSWORD: decryptText(pubcDetail.password),
      });
      await this.updatePublishRecord(
        pubr.id,
        {
          detail: {
            build: {
              type: 'pipelines.tekton',
            },
            status: {
              progress: 10,
              message: `pipeline ${pipelineName} created successfully.`,
            },
          },
        },
        loginUser
      );
    } catch (error) {
      this.logger.warn(`[${method}] failed => ${error.stack}`);
      await this.updatePublishRecord(
        pubr.id,
        {
          status: PublishStatus.Failed,
          detail: {
            status: {
              progress: 100,
              message: error.message,
            },
          },
        },
        loginUser
      );
    }
  }

  async deletePublishRecord(loginUser: ILoginUser, id: string) {
    const publishRecordsRepo = await this.getPublishRecordsRepository();
    const pubr = await publishRecordsRepo.findOneBy({ id });
    if (!pubr) {
      return true;
    }
    // 仅应用拥有者及维护者可删除发布记录
    await this.appsMembersService.checkUserAppMemberRole(loginUser, pubr.appId, {
      must: [MemberRole.Owner, MemberRole.Maintainer],
    });
    const { pipeline } = this.config;
    await Promise.all([
      publishRecordsRepo.delete(id),
      // 删除对应流水线
      pubr.status === PublishStatus.Running &&
        this.pipelinesService.deletePinelineRun(pubr.buildId, pipeline?.namespace),
    ]);
    await this.gitService.commitNt(TREE_DEFAULT, {
      committer: loginUser,
      tables: [PublishRecord.tableName],
      message: `Delete publish record ${id}`,
    });
    return true;
  }

  async updatePublishRecord(id: string, body: UpdatePublishInput, loginUser?: ILoginUser) {
    const publishRecordsRepo = await this.getPublishRecordsRepository();
    const pubr = await publishRecordsRepo.findOneBy({ id });
    if (!pubr) {
      throw new Error(`pubr ${id} not found.`);
    }
    const { status, detail } = body;
    await publishRecordsRepo.update(id, {
      status,
      detail: Object.assign({}, pubr.detail, detail),
    });
    await this.gitService.commitNt(TREE_DEFAULT, {
      committer: loginUser,
      tables: [PublishRecord.tableName],
      message: `Update publish record ${id}`,
    });
    return publishRecordsRepo.findOneBy({ id });
  }

  async getPublishRecordsByAppId(loginUser: ILoginUser, appId: string, args?: PublishRecordsArgs) {
    if (!args) {
      // eslint-disable-next-line no-param-reassign
      args = new PublishRecordsArgs();
    }
    if (!args.order) {
      args.order = new PublishRecordsOrderArgs();
    }
    const { page, pageSize, filter, order } = args;
    const { q, status, baseline } = filter || {};
    const publishRecordsRepo = await this.getPublishRecordsRepository();
    const [pubrs, totalCount] = await publishRecordsRepo.findAndCount({
      // @Todo: 重复条件待优化
      where: [
        {
          appId,
          status,
          baseline,
          channelName: q && q.trim() && Like(`%${q}%`),
        },
        {
          appId,
          status,
          baseline,
          version: q && q.trim() && Like(`${q}%`),
        },
      ],
      relations: { publisher: true },
      order,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return {
      page,
      pageSize,
      totalCount,
      hasNextPage: page * pageSize < totalCount,
      nodes: pubrs,
    };
  }

  async getPublisRecordById(id: string) {
    const publishRecordsRepo = await this.getPublishRecordsRepository();
    const pubr = await publishRecordsRepo.findOneBy({ id });
    return pubr;
  }

  private prReasonToPublishStatus(reason: string, status: string) {
    switch (reason) {
      case 'Succeeded': {
        return PublishStatus.Done;
      }
      case 'Failed': {
        return PublishStatus.Failed;
      }
      case 'Running': {
        return PublishStatus.Running;
      }
      default: {
        if (status === 'False') {
          return PublishStatus.Failed;
        }
        if (status === 'True') {
          return PublishStatus.Done;
        }
        return PublishStatus.Running;
      }
    }
  }

  @Timeout(1000)
  async sysncPublishStatusByInformer() {
    const method = 'sysncPublishStatusByInformer';
    const publishRecordsRepo = await this.getPublishRecordsRepository();
    const { pipeline } = this.config;
    const informer = await this.pipelinesService.makePipeLineRunInformer(
      pipeline?.namespace,
      pipeline?.publish?.name
    );
    if (!informer) {
      this.logger.warn(`[${method}] ⚠ informer start failed ⚠`);
      return;
    }
    const startInformer = () =>
      informer.start().then(() => this.logger.log(`[${method}] informer started ...`));

    // informer.on('add', (pr: CRD.PipelineRun) => {
    //   console.log(`Added: ${pr.metadata!.name}`);
    // });
    informer.on('update', async (pr: CRD.PipelineRun) => {
      const pubr = await publishRecordsRepo.findOne({
        where: {
          buildId: pr.metadata.name,
          status: PublishStatus.Running,
        },
      });
      if (!pubr) {
        return;
      }
      const statusCondition = pr.status?.conditions?.[0];
      if (!statusCondition) {
        return;
      }
      const prStatus = extractPipelineRunStatus(statusCondition);
      const { reason, status, message, completed, total } = prStatus;
      const newStatus = this.prReasonToPublishStatus(reason, status);
      // 上传 schema 及创建流水线后进度为 10，这里更新的进度需要大于 10
      const progress = Math.floor((completed / total) * 100) || 11;
      if (
        newStatus === pubr.status &&
        progress === pubr.detail.status?.progress &&
        message === pubr.detail.status?.message
      ) {
        return;
      }
      this.logger.log(`[${method}] ${pubr.id} is ${newStatus}.`);
      await this.updatePublishRecord(pubr.id, {
        status: newStatus,
        detail: {
          status: {
            progress,
            message,
          },
        },
      });
    });
    informer.on('delete', async (pr: CRD.PipelineRun) => {
      const pubr = await publishRecordsRepo.findOne({
        where: {
          buildId: pr.metadata.name,
          status: PublishStatus.Running,
        },
      });
      if (!pubr) {
        return;
      }
      this.logger.log(`[${method}] ${pubr.id}'s pr(${pubr.buildId}) was deleted.`);
      await this.updatePublishRecord(pubr.id, {
        status: PublishStatus.Failed,
        detail: {
          status: {
            progress: 100,
            message: `PipelineRun(${pubr.buildId}) was deleted.`,
          },
        },
      });
    });
    informer.on('error', async (err: any) => {
      this.logger.error(`[${method}] informer error => ${err.stack}`);
      // Restart informer after 1s
      setTimeout(startInformer, 1000);
    });

    startInformer();
  }

  /**
   * @Deprecated 已废弃，目前通过 informer 主动更新
   */
  async sysncPublishStatus(loginUser: ILoginUser, appId: string) {
    const method = 'sysncPublishStatus';
    try {
      const publishRecordsRepo = await this.getPublishRecordsRepository();
      const pubrs = await publishRecordsRepo.find({
        where: {
          appId,
          status: PublishStatus.Running,
        },
      });
      this.logger.log(`[${method}] got ${pubrs.length} pubish of app(${appId}) is running.`);
      const { pipeline } = this.config;
      for (const pubr of pubrs) {
        const prStatus = await this.pipelinesService.getPipelineRunStatus(
          loginUser,
          pipeline?.namespace,
          pubr.buildId
        );
        if (!prStatus?.status) {
          return;
        }
        const { reason, status, message, completed, total } = prStatus.status;
        const newStatus = this.prReasonToPublishStatus(reason, status);
        // 状态一致（非运行中）跳过更新
        if (pubr.status !== PublishStatus.Running && pubr.status === newStatus) {
          return;
        }
        this.logger.log(`[${method}] ${pubr.id} is ${newStatus}.`);
        await this.updatePublishRecord(
          pubr.id,
          {
            status: newStatus,
            detail: {
              status: {
                // 上传 schema 及创建流水线后进度为 10，这里更新的进度需要大于 10
                progress: Math.floor((completed / total) * 100) || 11,
                message,
              },
            },
          },
          loginUser
        );
      }
    } catch (error) {
      this.logger.warn(`[${method}] failed => ${error.stack}`);
    }
  }
}
