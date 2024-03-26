const { env } = process;

/** 是否为生产环境 */
export const IS_PROD = env.NODE_ENV === 'production';
