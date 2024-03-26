// import kubernetesConfig from '../config/kubernetes.config';
import * as K8s from '@kubernetes/client-node';
import { dumpYaml, loadAllYaml } from '@kubernetes/client-node';
import { WebSocketHandler } from '@kubernetes/client-node/dist/web-socket-handler';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { WebSocket } from 'ws';

import { K8S_CLIENT_CONFIG } from './kubernetes.constants';
import * as lib from './lib';
import { ClientOptions } from './lib/interfaces';

const K8S_WS_PROTOCOLS = [
  'base64.channel.k8s.io', // 增加了 base64 channel
  'v4.channel.k8s.io',
  'v3.channel.k8s.io',
  'v2.channel.k8s.io',
  'channel.k8s.io',
];

interface K8sUser extends K8s.User {
  ip?: string;
}

type KubernetesClientBase = Awaited<ReturnType<KubernetesService['getClientBase']>>;
export interface KubernetesClient extends KubernetesClientBase {
  /** _sa 下的资源会使用 server 自己的 service account 来作为调用 k8s api 的凭证，且只能操作管理集群的资源*/
  _sa?: Awaited<KubernetesClientBase>;
}

export interface K8sConfig {
  cluster?: K8s.Cluster;
  /** ServiceAccount 类型的 token */
  saToken?: string;
  options?: {
    /** 超时时间，单位 s，默认为 12 */
    timeout?: number;
  };
}

@Injectable()
export class KubernetesService {
  private readonly k8sConfig: K8sConfig;
  private readonly defaultInterceptor: K8s.Interceptor;

  private logger = new Logger('KubernetesService');

  constructor(@Inject(K8S_CLIENT_CONFIG) private config: K8sConfig) {
    this.k8sConfig = config;
    this.defaultInterceptor = requestOptions => {
      requestOptions.timeout = (this.k8sConfig.options?.timeout || 12) * 1000;
    };
  }

  createKubeConfig(cluster: K8s.Cluster, user: K8s.User) {
    const kubeConfig = new K8s.KubeConfig();
    kubeConfig.loadFromClusterAndUser(cluster, user);
    return kubeConfig;
  }

  private async getCluster(user: K8sUser, name: string) {
    const k8s = await this.getClient(user);
    const { body: cluster } = await k8s.cluster.read(name);
    const server = cluster.spec.apiEndpoint;
    return {
      name,
      server,
      skipTLSVerify: true,
    };
  }

  /**
   * 获取 k8s client
   *
   * @param user 用户认证信息
   * @param options 可选项，可以配置 cluster 和 interceptor
   * - 当指定的 `options.cluster` 为集群 name 时，会根据 name 获取到集群的 api 地址生成对应的 client
   * - 当指定的 `options.cluster` 为集群对象时，则直接根据集群对象返回对应的 client
   * - 当指定 `options.interceptor` 拦截器时，会把拦截器作用在每个 api 中，可以在拦截器里更改 request 的选项
   * - 当指定 `options._sa` 为 true 时，会增加 `_sa`_sa 下的资源会使用 server 自己的 service account 来作为调用 k8s api 的凭证，且返回的 client 是管理集群的，不支持指定集群
   */
  async getClient(user: K8sUser, options: ClientOptions = {}): Promise<KubernetesClient> {
    const client = await this.getClientBase(user, options);
    if (!options._sa) {
      return client;
    }
    const saClient = await this.getClientBase(
      { name: 'sa-client', token: this.k8sConfig.saToken, ip: user.ip },
      // 只支持管理集群，不支持指定其他集群
      { ...options, cluster: undefined }
    );
    return {
      ...client,
      _sa: saClient,
    };
  }

  /**
   * 获取 client，使用 service accout token 进行认证
   *
   */
  async getSaClient() {
    if (!this.k8sConfig.saToken) {
      this.logger.warn('getSaClient', 'saToken is required');
      return;
    }
    const saClient = await this.getClientBase({
      name: 'sa-client',
      token: this.k8sConfig.saToken,
    });
    return saClient;
  }

  /**
   * kubctl apply -f xxx.yaml
   * https://github.com/kubernetes-client/javascript/blob/master/examples/typescript/apply/apply-example.ts
   * @param user 用户认证信息
   * @param options 可选项，可以配置cluster为被操作的资源所属集群；自定义资源Patch时设置header；
   * @param specString 要更新的yaml
   * @returns 更新后的资源
   */
  async apply(
    user: K8sUser,
    specString: string,
    options: {
      cluster?: string | K8s.Cluster;
      headers?: { [name: string]: string };
    }
  ): Promise<string> {
    const { cluster: specifiedCluster, headers } = options;
    let cluster = this.k8sConfig.cluster;
    if (typeof specifiedCluster === 'string') {
      cluster = await this.getCluster(user, specifiedCluster);
    } else if (specifiedCluster?.server) {
      cluster = specifiedCluster;
    }
    const kc = this.createKubeConfig(cluster, user);
    const client = K8s.KubernetesObjectApi.makeApiClient(kc);
    const specs: K8s.KubernetesObject[] = loadAllYaml(specString);
    const validSpecs = specs.filter(s => s && s.kind && s.metadata);
    const created: K8s.KubernetesObject[] = [];
    for (const spec of validSpecs) {
      spec.metadata = spec.metadata || {};
      spec.metadata.annotations = spec.metadata.annotations || {};
      delete spec.metadata.annotations['kubectl.kubernetes.io/last-applied-configuration'];
      spec.metadata.annotations['kubectl.kubernetes.io/last-applied-configuration'] =
        JSON.stringify(spec);
      const { body: b } = await client.read(spec as any).catch(() => ({ body: null }));
      if (b) {
        // Note that this could fail if the spec refers to a custom resource. See: https://github.com/kubernetes/kubernetes/issues/97423
        // Selution: add headers { "Content-type": "application/merge-patch+json" }
        const { body } = await client.patch(spec, undefined, undefined, undefined, undefined, {
          headers,
        });
        created.push(body);
      } else {
        const { body } = await client.create(spec);
        created.push(body);
      }
    }
    return created.map(c => dumpYaml(c)).join('---\n');
  }

  private async getClientBase(user: K8sUser, options: ClientOptions = {}) {
    const { cluster: specifiedCluster, interceptor = this.defaultInterceptor } = options;
    const defaultHeadersInterceptor: K8s.Interceptor = requestOptions => {
      this.logger.debug(
        `[${requestOptions.method}] ${(requestOptions as any).uri}`,
        JSON.stringify(requestOptions)
      );
      if (user.ip) {
        requestOptions.headers['X-Forwarded-For'] = user.ip;
      }
    };
    let cluster = this.k8sConfig.cluster;
    if (typeof specifiedCluster === 'string') {
      cluster = await this.getCluster(user, specifiedCluster);
    } else if (specifiedCluster?.server) {
      cluster = specifiedCluster;
    }

    const kubeConfig = this.createKubeConfig(cluster, user);

    const coreV1Api = kubeConfig.makeApiClient(K8s.CoreV1Api);
    coreV1Api.addInterceptor(defaultHeadersInterceptor);
    coreV1Api.addInterceptor(interceptor);

    const customObjectsApi = kubeConfig.makeApiClient(K8s.CustomObjectsApi);
    customObjectsApi.addInterceptor(defaultHeadersInterceptor);
    customObjectsApi.addInterceptor(interceptor);

    const rbacAuthorizationV1Api = kubeConfig.makeApiClient(K8s.RbacAuthorizationV1Api);
    rbacAuthorizationV1Api.addInterceptor(defaultHeadersInterceptor);
    rbacAuthorizationV1Api.addInterceptor(interceptor);

    const appsV1Api = kubeConfig.makeApiClient(K8s.AppsV1Api);
    appsV1Api.addInterceptor(defaultHeadersInterceptor);
    appsV1Api.addInterceptor(interceptor);

    const batchV1Api = kubeConfig.makeApiClient(K8s.BatchV1Api);
    batchV1Api.addInterceptor(defaultHeadersInterceptor);
    batchV1Api.addInterceptor(interceptor);

    const authorizationV1Api = kubeConfig.makeApiClient(K8s.AuthorizationV1Api);
    authorizationV1Api.addInterceptor(defaultHeadersInterceptor);
    authorizationV1Api.addInterceptor(interceptor);

    const authenticationV1Api = kubeConfig.makeApiClient(K8s.AuthenticationV1Api);
    authenticationV1Api.addInterceptor(defaultHeadersInterceptor);
    authenticationV1Api.addInterceptor(interceptor);

    const apisApi = kubeConfig.makeApiClient(K8s.ApisApi);
    apisApi.addInterceptor(defaultHeadersInterceptor);
    apisApi.addInterceptor(interceptor);

    const coreApi = kubeConfig.makeApiClient(K8s.CoreApi);
    coreApi.addInterceptor(defaultHeadersInterceptor);
    coreApi.addInterceptor(interceptor);

    return {
      kubeConfig,
      // ~ apis
      apisApi,
      coreApi,
      coreV1Api,
      customObjectsApi,
      rbacAuthorizationV1Api,
      appsV1Api,
      batchV1Api,
      authorizationV1Api,
      authenticationV1Api,
      exec:
        options.exec &&
        new K8s.Exec(
          kubeConfig,
          new WebSocketHandler(kubeConfig, (uri, options) => {
            options.headers['X-Forwarded-For'] = user.ip;
            return new WebSocket(uri, K8S_WS_PROTOCOLS, options);
          })
        ),
      // ~ core
      // <replace type="core">
      pod: new lib.Pod(coreV1Api),
      node: new lib.Node(coreV1Api),
      configMap: new lib.ConfigMap(coreV1Api),
      namespace: new lib.Namespace(coreV1Api),
      persistentVolumeClaim: new lib.PersistentVolumeClaim(coreV1Api),
      persistentVolume: new lib.PersistentVolume(coreV1Api),
      secret: new lib.Secret(coreV1Api),
      serviceAccount: new lib.ServiceAccount(coreV1Api),
      service: new lib.Service(coreV1Api),
      // </replace type="core">
      // ~ crd
      // <replace type="crd">
      application: new lib.Application(customObjectsApi),
      cluster: new lib.Cluster(customObjectsApi),
      pipelineRun: new lib.PipelineRun(customObjectsApi),
      user: new lib.User(customObjectsApi),
      // </replace type="crd">
      // ~ rbac
      // <replace type="rbac">
      clusterRoleBinding: new lib.ClusterRoleBinding(rbacAuthorizationV1Api),
      clusterRole: new lib.ClusterRole(rbacAuthorizationV1Api),
      roleBinding: new lib.RoleBinding(rbacAuthorizationV1Api),
      role: new lib.Role(rbacAuthorizationV1Api),
      // </replace type="rbac">
      // ~ apps
      // <replace type="apps">
      // </replace type="apps">
      // ~ batch
      // <replace type="batch">
      // </replace type="batch">
    };
  }
}
