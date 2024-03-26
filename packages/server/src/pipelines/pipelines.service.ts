import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { type CRD, K8s, KubernetesService } from '@yuntijs/k8s-client';

import { extractPipelineRunStatus } from '@/common/utils';
import serverConfig from '@/config/server.config';
import { ILoginUser } from '@/types';

export interface RunAppPublishPipelineOptions {
  /** minio's soruce path which is BUCKET/OBJECT */
  SOURCE_PATH: string;
  /** relative path to `SOURCE_PATH` of the component's schema */
  SCHEMA_PATH: string;
  /** The component's image name along with tag */
  APP_IMAGE: string;
  /** The url for the component repository */
  REPOSITORY_URL: string;
  /** The username for repository auth */
  REPOSITORY_USER: string;
  /** The password for the repository auth */
  REPOSITORY_PASSWORD: string;
}

@Injectable()
export class PipelinesService {
  constructor(
    @Inject(serverConfig.KEY)
    private config: ConfigType<typeof serverConfig>,
    private readonly k8sService: KubernetesService
  ) {}

  logger = new Logger('PipelinesService');

  private optionsToParams(options: Record<string, string>) {
    return Object.keys(options)
      .filter(key => options[key])
      .map(name => ({ name, value: options[name] }));
  }

  async getPipelineRunStatusByPipeline(
    loginUser: ILoginUser,
    namespace: string,
    pipeline: string
  ): Promise<
    Array<{
      status?: ReturnType<typeof extractPipelineRunStatus>;
      pr: CRD.PipelineRun;
    }>
  > {
    const k8s = await this.k8sService.getClient(loginUser, { _sa: true });
    const { body: prs } = await k8s._sa.pipelineRun.list(namespace, {
      labelSelector: `tekton.dev/pipeline=${pipeline}`,
    });
    return prs.items?.map(pr => {
      const statusCondition = pr.status?.conditions?.[0];
      return {
        status: statusCondition && extractPipelineRunStatus(statusCondition),
        pr,
      };
    });
  }

  async getPipelineRunStatus(loginUser: ILoginUser, namespace: string, name: string) {
    const k8s = await this.k8sService.getClient(loginUser, { _sa: true });
    try {
      const { body: pr } = await k8s._sa.pipelineRun.read(name, namespace);
      const statusCondition = pr.status?.conditions?.[0];
      return {
        status: statusCondition && extractPipelineRunStatus(statusCondition),
        pr,
      };
    } catch (error) {
      if (error.statusCode === 404) {
        return;
        // 由于时间差的原因，可能会把创建了发布记录但是还没创建流水线的发布错误标记为失败，先注释，后续优化
        // return {
        //   status: extractPipelineRunStatus({
        //     status: 'False',
        //     type: 'Failed',
        //     message: `PipelineRun ${name} not found.`,
        //   }),
        // };
      }
      throw error;
    }
  }

  async runAppPublishToHelmPipeline(
    loginUser: ILoginUser,
    name: string,
    options: RunAppPublishPipelineOptions
  ) {
    const { minio = {}, pipeline } = this.config;
    const { namespace, storageClassName } = pipeline || {};
    const params = this.optionsToParams({
      ...options,
      // minio host/domain to fetch
      SOURCE_MINIO_HOST: `${minio.client?.endPoint}${
        minio.client?.port ? `:${minio.client?.port}` : ''
      }`,
      SOURCE_MINIO_ACCESS_KEY: minio.client?.accessKey,
      SOURCE_MINIO_SECRET_KEY: minio.client?.secretKey,
    });
    const k8s = await this.k8sService.getClient(loginUser, { _sa: true });
    const { body } = await k8s._sa.pipelineRun.create(namespace, {
      metadata: { name },
      spec: {
        pipelineRef: { name: pipeline.publish?.name },
        params,
        workspaces: [
          {
            name: 'source-ws',
            volumeClaimTemplate: {
              spec: {
                storageClassName,
                accessModes: ['ReadWriteOnce'],
                resources: {
                  requests: {
                    storage: '500Mi',
                  },
                },
              },
            },
          },
          {
            name: 'dockerconfig-ws',
            secret: {
              secretName: pipeline.dockerConfig,
            },
          },
          {
            name: 'dockerfile-ws',
            configMap: {
              name: pipeline.publish?.dockerfile,
            },
          },
          {
            name: 'charttemplate-ws',
            configMap: {
              name: pipeline.publish?.chart,
            },
          },
        ],
      },
    });
    return body;
  }

  async makePipeLineRunInformer(namespace: string, pipeline: string) {
    const method = 'makePipeLineRunInformer';
    const k8s = await this.k8sService.getSaClient();
    if (!k8s) {
      return;
    }
    const labelSelector = `tekton.dev/pipeline=${pipeline}`;
    const listFn = () => k8s.pipelineRun.list(namespace, { labelSelector });
    const { group, version, name } = k8s.pipelineRun;
    const prApiPath = `/apis/${group}/${version}/namespaces/${namespace}/${name}`;
    const informer = K8s.makeInformer(k8s.kubeConfig, prApiPath, listFn, labelSelector);
    this.logger.log(`[${method}] informer for [${prApiPath}] created.`);
    return informer;
  }

  async deletePinelineRun(name: string, namespace: string) {
    const k8s = await this.k8sService.getSaClient();
    return k8s.pipelineRun.delete(name, namespace).catch(error => {
      if (error.statusCode === 404) {
        return error;
      }
      throw error;
    });
  }
}
