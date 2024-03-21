import { defineConfig } from 'dumi';
import { readdirSync } from 'fs';
import { join } from 'path';

const PUBLIC_PATH = '/yunti/';
const isProduction = process.env.NODE_ENV === 'production';

const headPkgList: string[] = [];
const pkgDirList = readdirSync(join(__dirname, 'packages')).filter(
  pkg => !pkg.includes('.') && !headPkgList.includes(pkg)
);
const pkgs = {
  //
};
export const alias = pkgDirList.reduce((pre, name) => {
  pre[`@yuntijs/${pkgs[name]}`] = join(__dirname, 'packages', name, 'src');
  return {
    ...pre,
  };
}, {});

export default defineConfig({
  alias,
  // autoAlias: true,
  base: isProduction ? PUBLIC_PATH : '/',
  resolve: {
    docDirs: ['docs'],
    atomDirs: [{ type: 'packages', dir: 'packages' }],
  },
  favicons: [`${PUBLIC_PATH}img/favicon.ico`],
  publicPath: PUBLIC_PATH,
  outputPath: `./dist${PUBLIC_PATH}`,
  themeConfig: {
    logo: `${PUBLIC_PATH}img/logo.svg`,
    nav: [{ title: '开发指南', link: '/guide' }],
  },
  ignoreMomentLocale: true,
  mfsu: {
    strategy: 'normal',
    shared: {
      react: {
        singleton: true,
      },
    },
  },
  // 默认重定向到子包的 src 文件夹
  monorepoRedirect: {
    peerDeps: true,
    useRootProject: true,
  },
  lessLoader: {
    javascriptEnabled: true,
    strictMath: false,
    math: 'parens-division',
    modifyVars: {
      // '@ant-prefix': PREFIX_CLS,
    },
  },
});
