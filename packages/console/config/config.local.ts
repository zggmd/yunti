/**
 * Licensed Materials
 * (C) Copyright 2024 YuntiJS. All Rights Reserved.
 */

/**
 * local config
 *
 * @author Carrotzpc
 * @date 2022-12-19
 */
import { defineConfig } from '@umijs/max';

const yuntiServer = 'http://localhost:8034/';

export default defineConfig({
  proxy: {
    '/-/yunti/api': {
      target: yuntiServer,
      changeOrigin: true,
    },
    '/yunti': {
      target: yuntiServer,
      changeOrigin: true,
      pathRewrite: { '^/yunti': '' },
    },
    '/bff': {
      target: yuntiServer,
      changeOrigin: true,
    },
    '/logout': {
      target: yuntiServer,
      changeOrigin: true,
    },
    '/bc-apis': {
      target: 'https://portal.172.22.96.136.nip.io',
      // target: 'https://bc.172.22.50.142.nip.io',
      changeOrigin: true,
      secure: false,
    },
    '/bc-explorer': {
      pathRewrite: { '^/bc-explorer': '' },
      target: 'https://bc-explorer.172.22.96.136.nip.io',
      changeOrigin: true,
      secure: false,
    },
    '/bc-saas': {
      target: 'https://portal.172.22.96.136.nip.io',
      changeOrigin: true,
      secure: false,
    },
    '/component-store-apis/bff': {
      target: 'https://portal.172.22.96.136.nip.io/component-store-apis/bff',
      changeOrigin: true,
      secure: false,
    },
  },
});
