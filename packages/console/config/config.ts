/**
 * Licensed Materials
 * (C) Copyright 2024 YuntiJS. All Rights Reserved.
 */

/**
 * default config
 *
 * @author Carrotzpc
 * @date 2023-02-02
 */
import { defineConfig } from '@umijs/max';
import { execSync } from 'child_process';

import { PREFIX_CLS } from '../src/utils';
import antd from './antd';
import { publicPath } from './public-path';
import routes from './routes';

/**
 * get last commit hash
 */
const getLastCommitHash = () => {
  try {
    return execSync('git rev-parse HEAD').toString().trim();
  } catch (error) {
    console.warn('Get last commit hash faild =>', error);
    return '-';
  }
};

const bannerFlag = `@Licensed Materials`;
const banner = `${bannerFlag}
(C) Copyright 2024 YuntiJS. All Rights Reserved.
@date ${Date.now()}
@hash ${getLastCommitHash()}`;

export default defineConfig({
  /**
   * @name 开启 hash 模式
   * @description 让 build 之后的产物包含 hash 后缀。通常用于增量发布和避免浏览器加载缓存。
   * @doc https://umijs.org/docs/api/config#hash
   */
  hash: true,
  /**
   * @name 快速热更新配置
   * @description 一个不错的热更新组件，更新时可以保留 state
   */
  fastRefresh: true,
  /**
   * @name moment2dayjs 插件
   * @description 将项目中的 moment 替换为 dayjs
   * @doc https://umijs.org/docs/max/moment2dayjs
   */
  moment2dayjs: {
    preset: 'antd',
    plugins: ['duration'],
  },
  /**
   * @name moment 的国际化配置
   * @description 如果对国际化没有要求，打开之后能减少js的包大小
   * @doc https://umijs.org/docs/api/config#ignoremomentlocale
   */
  ignoreMomentLocale: true,
  historyWithQuery: {},
  history: {
    type: 'browser',
  },
  codeSplitting: {
    jsStrategy: 'granularChunks',
  },
  antd: {
    ...antd,
  },
  lessLoader: {
    javascriptEnabled: true,
    strictMath: false,
    math: 'parens-division',
    modifyVars: {
      '@ant-prefix': PREFIX_CLS,
    },
  },
  favicons: ['/favicon.ico'],
  // 调整产物的压缩编码格式，防止中文字符被转换为 ascii 格式
  // jsMinifierOptions: { charset: 'utf8' },
  // cssMinifierOptions: { charset: 'utf8' },
  // extraBabelPlugins: [
  //   [
  //     'import',
  //     {
  //       libraryName: '@tenx-ui/materials',
  //       libraryDirectory: 'es/components',
  //       camel2DashComponentName: false,
  //     },
  //     '@tenx-ui/materials',
  //   ],
  // ],
  mfsu: {
    shared: {
      react: {
        singleton: true,
      },
    },
  },
  routes,
  targets: {
    chrome: 49,
    firefox: 64,
    safari: 10,
    edge: 13,
    ios: 10,
    // ie: 11,
  },
  base: '/',
  publicPath,
  define: {
    'process.env.PUBLIC_DIR': '/',
  },
  externals: {
    'react': 'var window.React',
    'react-dom': 'var window.ReactDOM',
    'prop-types': 'var window.PropTypes',
    'lodash': 'var window._',
    // 以下仅 /design 开头的设计页面可用
    '@alifd/next': 'var window.Next',
    '@alilc/lowcode-engine': 'var window.AliLowCodeEngine',
    '@alilc/lowcode-editor-core': 'var window.AliLowCodeEngine.common.editorCabin',
    '@alilc/lowcode-editor-skeleton': 'var window.AliLowCodeEngine.common.skeletonCabin',
    '@alilc/lowcode-designer': 'var window.AliLowCodeEngine.common.designerCabin',
    '@alilc/lowcode-engine-ext': 'var window.AliLowCodeEngineExt',
    '@ali/lowcode-engine': 'var window.AliLowCodeEngine',
    'moment': 'var window.moment',
  },
  headScripts: [
    'https://g.alicdn.com/code/lib/prop-types/15.7.2/prop-types.js',
    'https://g.alicdn.com/platform/c/react15-polyfill/0.0.1/dist/index.js',
    'https://g.alicdn.com/platform/c/lodash/4.6.1/lodash.min.js',
  ],
  chainWebpack() {
    const [memo, { env, webpack }]: any = arguments;
    // add copyright banner
    memo.plugin('banner').use(webpack.BannerPlugin, [
      {
        banner,
        exclude: /\.svg$/,
      },
    ]);
    if (env === 'production') {
      memo.optimization.minimizer('js-terser').tap((args: any) => {
        args[0].terserOptions.format.comments = new RegExp(bannerFlag);
        return args;
      });
    }
    // console.log('webpack config: \n', memo.toString())
    return memo;
  },
});
