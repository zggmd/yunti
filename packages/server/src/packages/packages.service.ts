import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { stringify } from 'node:querystring';
import * as semver from 'semver';
import { HttpClient, ProxyAgent, RequestOptions } from 'urllib';

import { AppsService } from '@/apps/apps.service';
import { semverLt, semverMinVersion } from '@/common/utils';
import { ComponentsService } from '@/components/components.service';
import serverConfig from '@/config/server.config';
import { ILoginUser } from '@/types';

import {
  ExternalsPkgItem,
  Package,
  PackageMetaType,
  PackageUmdConfig,
  PackageUmdMetaConfig,
} from './models/package.model';
import { EXTERNALS_SKIP_PKGS, guessLibraryByPkgName, sortPackages } from './utils';

@Injectable()
export class PackagesService {
  logger = new Logger('PackagesService');
  urllib: HttpClient;
  dispatcher?: ProxyAgent;

  constructor(
    @Inject(serverConfig.KEY)
    private config: ConfigType<typeof serverConfig>,
    private appsService: AppsService,
    private componentsService: ComponentsService
  ) {
    const { http: httpProxy, https: httpsProxy } = this.config.proxy || {};
    if (httpsProxy || httpProxy) {
      this.dispatcher = new ProxyAgent(httpsProxy || httpProxy);
    }
    this.urllib = new HttpClient({
      defaultArgs: {
        timeout: 10 * 10_000,
        dataType: 'json',
        dispatcher: this.dispatcher,
      },
      connect: { rejectUnauthorized: false },
    });
  }

  isTenxPackage = (name: string) => {
    const decodedName = decodeURIComponent(name);
    return (
      decodedName.startsWith('@tenx-ui/') ||
      decodedName.endsWith('-tenx') ||
      decodedName.startsWith('tenx-') ||
      decodedName.includes('-tenx-') ||
      decodedName.startsWith('@yunti/')
    );
  };

  private formatPrivatePackage(pkg: Record<string, any>) {
    pkg.private = true;
    if (!pkg.homepage) {
      pkg.homepage = pkg.repository?.url;
    }
    if (typeof pkg.author !== 'object') {
      delete pkg.author;
    }
    return pkg as Package;
  }

  async queryPrivateRegistry(keyword: string): Promise<Package[]> {
    const method = 'queryPrivateRegistry';
    const { url, token, proxy } = this.config.npm?.registry?.private || {};
    const reqUrl = `${url}/-/verdaccio/data/search/${encodeURIComponent(keyword)}`;
    this.logger.debug(`${method}  url => ${reqUrl}`);
    const res = await this.urllib.request(reqUrl, {
      // 有些 registry 不支持代理
      dispatcher: proxy ? this.dispatcher : undefined,
      headers: {
        Authorization: token,
      },
    });
    this.logger.debug(`${method}  res.data => ${res.data.length}`);
    return (Array.isArray(res.data) ? res.data : [])
      .filter((pkg: any) => pkg.name.toLowerCase().includes(keyword.toLocaleLowerCase()))
      .map(pkg => this.formatPrivatePackage(pkg));
  }

  private formatPublicPackage(pkg: Record<string, any>) {
    pkg.private = false;
    pkg.author = pkg.originalAuthor;
    if (typeof pkg.author !== 'object') {
      delete pkg.author;
    }
    if (!pkg.homepage) {
      pkg.homepage = pkg.repository?.url || pkg.links?.homepage;
    }
    if (pkg.versions) {
      const versions = [];
      for (const [version, publishTime] of Object.entries<string>(pkg.versions)) {
        versions.push({ version, publishTime: +new Date(publishTime) });
      }
      pkg.versions = versions;
    }
    return pkg as Package;
  }

  async queryPublicRegistry(q: string) {
    const method = 'queryPublicRegistry';
    const { url } = this.config.npm?.registry?.public || {};
    const reqUrl = `${url}/search/suggestions?${stringify({ q })}`;
    this.logger.debug(`${method} url => ${reqUrl}`);
    const res = await this.urllib.request(reqUrl);
    return (res.data || []).map((pkg: any) => this.formatPublicPackage(pkg));
  }

  // 详见 https://www.algolia.com/doc/rest-api/search/
  async queryPublicMirrorRegistry(keyword: string, hitsPerPage = 10): Promise<Package[]> {
    const method = 'queryPublicMirrorRegistry';
    const { url, appId, apiKey } = this.config.npm?.registry?.publicMirror?.algolia || {};
    const params: Record<string, string | number> = {
      query: keyword,
      hitsPerPage,
      page: 0,
    };
    // 当 hitsPerPage 为 1 时开启精确匹配
    if (hitsPerPage === 1) {
      params.filters = `objectID:${keyword}`;
      delete params.query;
    }
    const data = {
      params: stringify(params),
    };
    this.logger.debug(`${method} url => ${url}`);
    this.logger.debug(`${method} params => ${JSON.stringify(data)}`);
    const res = await this.urllib.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Algolia-Application-Id': appId,
        'X-Algolia-Api-Key': apiKey,
      },
      data,
    });
    // this.logger.debug(`${method} res.data => ${JSON.stringify(res.data)}`);
    this.logger.debug(`${method} res.data.hits => ${res.data.hits?.length}`);
    return (res.data.hits || []).map((pkg: any) => this.formatPublicPackage(pkg));
  }

  async query(keyword: string) {
    const [privateRes, publicRes] = await Promise.allSettled([
      this.queryPrivateRegistry(keyword),
      Promise.race([this.queryPublicRegistry(keyword), this.queryPublicMirrorRegistry(keyword)]),
    ]);
    const pkgList: Package[] = [];
    if (privateRes.status === 'fulfilled') {
      pkgList.push(...privateRes.value);
    }
    if (publicRes.status === 'fulfilled') {
      pkgList.push(...publicRes.value);
    }
    return pkgList;
  }

  /* async getPrivatePackageDetail(name: string, version?: string) {
    const method = 'getPrivatePackageDetail';
    const { url, token, proxy } = this.config.npm?.registry?.private || {};
    const reqUrl = `${url}/-/verdaccio/data/sidebar/${name}`;
    this.logger.debug(`${method}  url => ${reqUrl}`);
    const res = await this.urllib.request(reqUrl, {
      dispatcher: proxy ? this.dispatcher : undefined,
      headers: {
        Authorization: token,
      },
    });
    const target = version ? res.data.versions?.[version] : res.data.latest;
    if (!target) {
      return null;
    }
    const pkg = this.formatPrivatePackage(target);
    pkg.source = reqUrl;
    const versions = Object.keys(res.data.versions)
      .sort()
      .reverse()
      .map((version) => ({
        version,
        publishTime:
          res.data.time[version] && +new Date(res.data.time[version]),
      }));
    pkg.versions = versions;
    return pkg;
  }

  // @Todo npmjs.com 不会返回 dependencies 和 peerDependencies，也不会返回 package.json 自定义的字段
  async getPublicPackageDetail(name: string, version?: string) {
    const method = 'getPublicPackageDetail';
    const { url } = this.config.npm?.registry?.public || {};
    let reqUrl = `${url}/package/${name}`;
    if (version) {
      reqUrl += `/v/${version}`;
    }
    this.logger.debug(`${method}  url => ${reqUrl}`);
    const res = await this.urllib.request(reqUrl, {
      headers: {
        referer: `${reqUrl}?activeTab=versions`,
        'x-spiferack': '1',
      },
    });
    const data = res.data.packageVersion;
    if (!data) {
      return null;
    }
    const pkg = this.formatPublicPackage(data);
    pkg.versions = res.data.packument?.versions.map(({ version, date }) => ({
      version,
      publishTime: date?.ts,
    }));
    pkg.source = reqUrl;
    return pkg;
  }

  async getPublicPackageMirrorDetail(name: string, version?: string) {
    const method = 'getPublicPackageMirrorDetail';
    const { url, registry } = this.config.npm?.registry?.publicMirror || {};
    let versions: PackageVersion[] = [];
    if (!version) {
      const infoUrl = `${url}/api/info?${stringify({ pkgName: name })}`;
      this.logger.debug(`${method} info url => ${infoUrl}`);
      const res = await this.urllib.request(infoUrl);
      version = res.data.data?.['dist-tags']?.latest;
      versions = Object.keys(res.data.data?.versions || {})
        .sort()
        .reverse()
        .map((version) => ({
          version,
          publishTime: +new Date(res.data.data?.versions[version].publish_time),
        }));
    }
    // @Todo 经常请求失败，比较奇怪，暂时没找到原因
    const pkgUrl = `${registry}/${name}/${version}/files/package.json`;
    this.logger.debug(`${method} pkg url => ${pkgUrl}`);
    const res = await this.urllib.request(pkgUrl);
    const data = res.data;
    if (data.error) {
      return null;
    }
    const pkg = this.formatPublicPackage(data);
    pkg.versions = versions;
    pkg.source = pkgUrl;
    return pkg;
  }

  async getPackageDetail(name: string, version?: string) {
    const method = 'getPackageDetail';
    if (this.isTenxPackage(name)) {
      const detail = await this.getPrivatePackageDetail(name, version);
      if (detail) {
        return detail;
      }
    }
    try {
      return this.getPublicPackageMirrorDetail(name, version);
    } catch (error) {
      this.logger.warn(method, 'getPublicPackageMirrorDetail', error);
      return this.getPublicPackageDetail(name, version);
    }
  } */

  formatPkgDetail(pkg: Record<string, any>, version?: string): Package {
    if (!pkg.name) {
      return null;
    }
    const isTenxPackage = this.isTenxPackage(pkg.name);
    if (version) {
      return Object.assign(pkg, { private: isTenxPackage }) as Package;
    }
    // eslint-disable-next-line no-param-reassign
    version = pkg['dist-tags']?.latest;
    return Object.assign(pkg.versions[version] || {}, {
      private: isTenxPackage,
      versions: semver
        .sort(Object.keys(pkg.versions || {}))
        .reverse()
        .map(v => ({
          version: v,
          publishTime: pkg.time[v] && +new Date(pkg.time[v]),
        })),
    });
  }

  // 之前分别获取的逻辑太复杂，而且速度较慢，改为通过统一的 registry api 获取
  async getPackageDetail(name: string, version?: string) {
    const method = 'getPackageDetail';
    let fullName = name;
    if (version) {
      fullName += `/${version}`;
    }
    const {
      public: publicNpm,
      publicMirror,
      private: privateNpm,
    } = this.config.npm?.registry || {};
    const requestParamsList: { url: string; options?: RequestOptions }[] = [];
    requestParamsList.push({
      url: `${privateNpm.url}/${fullName}`,
      options: {
        // 有些 registry 不支持代理
        dispatcher: privateNpm.proxy ? this.dispatcher : undefined,
        headers: { Authorization: privateNpm.token },
      },
    });
    const isTenxPackage = this.isTenxPackage(name);
    if (isTenxPackage) {
      this.logger.debug(`${method}  url => ${requestParamsList[0].url}`);
      const res = await this.urllib.request(requestParamsList[0].url, requestParamsList[0].options);
      if (res.data?.name) {
        return this.formatPkgDetail(res.data, version);
      }
    }
    if (publicNpm?.registry) {
      requestParamsList.push({ url: `${publicNpm.registry}/${fullName}` });
    }
    if (publicMirror?.registry) {
      requestParamsList.push({ url: `${publicMirror.registry}/${fullName}` });
    }
    for (const { url } of requestParamsList) this.logger.debug(`${method}  url => ${url}`);
    const res = await Promise.race(
      requestParamsList.map(({ url, options }) => this.urllib.request(url, options))
    );
    return this.formatPkgDetail(res.data, version);
  }

  genPkgMeta(
    fullName: string,
    library: string,
    cdnServer: string,
    meta: PackageMetaType
  ): PackageUmdMetaConfig {
    if (!meta) {
      return null;
    }
    if (typeof meta === 'string') {
      return {
        url: `${cdnServer}/${fullName}${meta}`,
        exportName: `${library}Meta`,
      };
    }
    return {
      url: `${cdnServer}/${fullName}${meta.entry}`,
      exportName: meta.exportName,
    };
  }

  async getExternalsPkgs(
    externals: Record<string, string>,
    user: ILoginUser,
    tree: string,
    id: string
  ): Promise<ExternalsPkgItem[]> {
    const externalsPkgs = Object.keys(externals || {})
      .filter(name => !EXTERNALS_SKIP_PKGS.includes(name))
      .map(name => ({ name, version: externals[name] }));
    if (externalsPkgs.length === 0) {
      return [];
    }
    const resource = id.startsWith('app-')
      ? await this.appsService.getAppById(tree, user, id)
      : await this.componentsService.getComponentById(tree, user, id);
    const packages = resource.assets?.packages || [];
    const targetPkgs: ExternalsPkgItem[] = [];
    for (const { name, version } of externalsPkgs) {
      const existingPkg = packages.find(pkg => pkg.package === name);
      if (!existingPkg) {
        targetPkgs.push({
          name,
          version,
        });
        continue;
      }
      // 要求版本 >= 2.5.0，当前版本 2.6，满足要求，取版本 2.6
      // 要求版本 <= 2.5.0，当前版本 2.6，采用新版本，取版本 2.6
      if (
        semver.satisfies(existingPkg.version, version) ||
        semverLt(semverMinVersion(version), existingPkg.version)
      ) {
        continue;
      }
      targetPkgs.push({
        name,
        version,
      });
      continue;
    }

    const pkgDetailList = await Promise.all(targetPkgs.map(pkg => this.getPackageDetail(pkg.name)));

    return sortPackages(
      targetPkgs.map((pkg, index) => {
        const targetVersion = pkgDetailList[index].versions.find(v =>
          semver.satisfies(v.version, pkg.version)
        );
        // 版本取符合当前版本要求的最新版，如果均不满足则取最新版
        pkg.version = targetVersion ? targetVersion.version : pkgDetailList[index].version;
        return pkg;
      }),
      'name'
    );
  }

  async getUmdConfig(
    pkg: Package,
    user: ILoginUser,
    tree?: string,
    id?: string
  ): Promise<PackageUmdConfig> {
    const method = 'getPublicPackageDetail';
    const { name } = pkg;
    const { cdn, unpkg } = this.config.npm || {};
    const fullName = `${name}@${pkg.version}`;
    const isTenxPackage = this.isTenxPackage(name);
    const cdnServer = isTenxPackage ? unpkg : `${cdn.mirror}/npm`;
    if (pkg.yunti) {
      const {
        umd: { library, entry, externals },
        lowCode,
      } = pkg.yunti;
      const pkgUmdConfig: PackageUmdConfig = {
        library,
        externals,
        urls: entry?.map(file => `${cdnServer}/${fullName}${file}`),
        meta: this.genPkgMeta(fullName, library, cdnServer, lowCode?.meta),
        editUrls: lowCode?.editEntry?.map(file => `${cdnServer}/${fullName}${file}`),
      };
      if (tree && id) {
        pkgUmdConfig.externalsPkgs = await this.getExternalsPkgs(externals, user, tree, id);
      }
      return pkgUmdConfig;
    }
    const library = guessLibraryByPkgName(pkg.name);
    const externals = pkg.peerDependencies;
    if (isTenxPackage) {
      const urls = [`${cdnServer}/${fullName}/`];
      return {
        library,
        externals,
        urls,
      };
    }
    const url = `${cdn.apiUrl}/v1/packages/npm/${fullName}/entrypoints`;
    this.logger.debug(`${method} url => ${url}`);
    let urls: string[] = [];
    try {
      const res = await this.urllib.request(url);
      const { entrypoints = {} } = res.data;
      urls = Object.keys(entrypoints).map(
        key => `${cdnServer}/${fullName}${entrypoints[key]?.file}`
      );
    } catch (error) {
      this.logger.warn(`${method} get entrypoints from jsdelivr failed => ${url}`, error.stack);
    }
    return {
      library,
      externals,
      urls,
    };
  }
}
