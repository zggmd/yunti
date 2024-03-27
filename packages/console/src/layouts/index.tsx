import { initUnifiedLinkHistory } from '@tenx-ui/utils/es/UnifiedLink/index.prod';
import { Outlet, history, matchPath, useLocation } from '@umijs/max';
import { App, ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import qs from 'query-string';
import React, { useEffect } from 'react';

import { PREFIX_CLS, setTree } from '@/utils';

import antdConfig from '../../config/antd';
import { getLocale } from '../i18n';
import InintMNM from './InintMNM';

export { message, modal, notification } from './InintMNM';

ConfigProvider.config({
  prefixCls: PREFIX_CLS,
});

const Layout: React.FC = () => {
  const locale = getLocale().toLowerCase();
  const location = useLocation();
  const { pathname, search, hash } = location;

  // init tree from query
  useEffect(() => {
    if (pathname.startsWith('/design')) {
      const { id } = matchPath({ path: 'design/:type/:id', end: false }, pathname)?.params || {};
      if (id) {
        const { tree, ...resQuery } = qs.parse(search || '');
        if (tree) {
          setTree(id, tree as string, true);
          const newSearch = Object.keys(resQuery).length > 0 ? `?${qs.stringify(resQuery)}` : '';
          history.replace(`${pathname}${newSearch}${hash ? `#${hash}` : ''}`);
        }
      }
    }
  }, [hash, pathname, search]);

  useEffect(() => {
    // init history
    initUnifiedLinkHistory(
      Object.assign(history, {
        goBack: history.back,
      })
    );

    // set local
    if (locale === 'zh-cn') {
      dayjs.locale('zh-cn');
    } else {
      dayjs.locale('en');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ConfigProvider
      locale={locale === 'zh-cn' ? zhCN : enUS}
      prefixCls={PREFIX_CLS}
      theme={antdConfig.theme}
    >
      <App>
        <InintMNM />
        <Outlet />
      </App>
    </ConfigProvider>
  );
};

export default Layout;
