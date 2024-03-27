export const DEFAULT_CONFIG = {
  antd: {
    configProvider: {
      componentSize: 'middle',
      space: {
        size: 12,
      },
      theme: {
        token: {
          colorPrimary: '#4461eb',
          fontSize: 12,
          borderRadius: 2,
          colorLink: '#4461eb',
          colorLinkHover: '#9CB3FF',
        },
        components: {
          Page: {
            pagePadding: 20,
            pagePaddingBottom: 32,
            pagePaddingTop: 20,
            pageBackground: '#ecf0f4',
          },
          Row: {
            rowHorizontalGutter: 20,
            rowVerticalGutter: 20,
          },
        },
      },
    },
  },
};
