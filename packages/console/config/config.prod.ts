/**
 * Licensed Materials
 * (C) Copyright 2024 YuntiJS. All Rights Reserved.
 */

/**
 * prod config
 *
 * @author Carrotzpc
 * @date 2022-12-19
 */
import { defineConfig } from '@umijs/max';

import { publicPath } from './public-path';

export default defineConfig({
  hash: true,
  publicPath,
  outputPath: './dist' + publicPath,
  define: {
    'process.env.PUBLIC_DIR': publicPath,
  },
  jsMinifier: 'terser',
  jsMinifierOptions: {},
  base: '/',
  extraBabelPlugins: ['transform-react-remove-prop-types'],
  theme: {},
  metas: [
    {
      name: 'keywords',
      content: 'lowcode',
    },
    {
      name: 'description',
      content: 'Console for yunti',
    },
  ],
  scripts: [],
  links: [{ rel: 'shortcut icon', type: 'image/x-icon', href: publicPath + 'favicon.ico' }],
});
