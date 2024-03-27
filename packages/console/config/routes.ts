const routes = [
  {
    path: '/',
    component: '@/layouts',
    routes: [
      {
        path: '/preview/page',
        component: 'PreviewPage',
      },
      {
        path: '/preview/component',
        component: 'PreviewComponent',
      },
      { path: '/', redirect: '/apps' },
      {
        path: '/',
        component: '@/layouts/BasicLayout',
        routes: [
          {
            path: '/apps',
            component: 'Apps',
            title: '应用管理',
          },
          {
            path: '/components',
            component: 'Components',
            title: '组件管理',
          },
          {
            path: '/design/components/:componentId',
            component: 'ComponentDesigner',
          },
          {
            path: '*',
            component: '404',
          },
        ],
      },
      {
        path: '/apps',
        component: '@/layouts/AppsLayout',
        routes: [
          { path: '/apps/:appId', redirect: '/apps/:appId/pages' },
          {
            path: '/apps/:appId/pages',
            component: 'AppDetailPages',
          },
          {
            path: '/apps/:appId/members',
            component: 'AppDetailMembers',
          },
          {
            path: '/apps/:appId/branches',
            component: 'AppDetailBranches',
          },
          {
            path: '/apps/:appId/merge',
            component: 'AppDetailMerge',
          },
          {
            path: '/apps/:appId/publish-records',
            component: 'AppPublishRecords',
          },
          {
            path: '/apps/:appId/publish-channels',
            component: 'AppPublishChannels',
          },
        ],
      },
      {
        path: '/design/apps/:appId/pages',
        component: '@/layouts/PageDesignerLayout',
        routes: [
          {
            path: '/design/apps/:appId/pages/:pageId',
            component: 'PageDesigner',
          },
        ],
      },
      {
        path: '/components',
        component: '@/layouts/ComponentLayout',
        routes: [
          { path: '/components/:id', redirect: '/components/:id/versions' },
          {
            path: '/components/:id/versions',
            component: 'ComponentDetailVersions',
          },
        ],
      },
    ],
  },
];

export default routes;
