// import { theme } from "antd";

const antdConfig = {
  configProvider: {
    prefixCls: 'yunti',
  },
  import: false,
  theme: {
    components: {
      Page: {
        pageBackground: 'transparent',
        pagePadding: 20,
        pagePaddingBottom: 32,
        pagePaddingTop: 20,
      },
      Row: { rowHorizontalGutter: 20, rowVerticalGutter: 20 },
    },
    token: {
      borderRadius: 2,
      colorPrimary: '#00b96b',
      fontSize: 12,
    },
    // algorithm: theme.darkAlgorithm,
  },
};

export default antdConfig;
