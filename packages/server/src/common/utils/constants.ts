import { join } from 'node:path';

const { env } = process;

/** 默认配置的路径 */
export const SERVER_DEFAULT_CONFIG_PATH = join(
  __dirname,
  '../../../../../',
  'configs/config.default.yaml'
);
/** 运行时配置的路径 */
export const SERVER_CONFIG_PATH = join(__dirname, '../../../../../', 'configs/config.yaml');
/** 开发时配置的路径 */
export const SERVER_DEV_CONFIG_PATH = join(__dirname, '../../../../../', 'configs/config.dev.yaml');

export const GRAPHQL_PATH = '/-/yunti/api';

/** 是否为生产环境 */
export const IS_PROD = env.NODE_ENV === 'production';

/** k8s 注入到 pod 中的 service account token 路径 */
export const K8S_SA_TOKEN_PATH = '/var/run/secrets/kubernetes.io/serviceaccount/token';

export const NO_AUTH = 'NO_AUTH';

/** 系统操作统一使用 yunti-server committer */
export const YUNTI_SERVER_COMMITTER = 'yunti-server <yunti-server@tenxcloud.com>';

/** 默认树 */
export const TREE_DEFAULT = 'main';
export const RELEASE_BRANCH_PREFIX = 'release-';

/** git 提交成功后事件触发 */
export const NEW_GIT_COMMIT = 'NEW_GIT_COMMIT';
