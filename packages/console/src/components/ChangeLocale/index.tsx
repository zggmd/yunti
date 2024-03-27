import { getCookie, setCookie } from '@tenx-ui/utils/es/cookies';
import { Button, Tooltip } from 'antd';
import enUS from 'antd/locale/en_US';
import zhCN from 'antd/locale/zh_CN';
import React from 'react';

export const LOCALE_KEY = 'intl_locale';
export const LOCALE_MAP = {
  en: {
    key: 'en',
    i18nKey: 'en-US', // 低代码编译器
    text: 'English',
    tooltip: '切换为中文',
    change: 'zh',
    locale: enUS, // antd
  },
  zh: {
    key: 'zh',
    i18nKey: 'zh-CN',
    text: '中文',
    tooltip: '切换为英文',
    change: 'en',
    locale: zhCN,
  },
} as any;

export const getLangInfo = () => {
  const lang = getCookie(LOCALE_KEY) || window.localStorage.getItem(LOCALE_KEY) || 'zh';
  return LOCALE_MAP[lang];
};

export const setLang = (v: string) => {
  window.localStorage.setItem(LOCALE_KEY, v);
  return setCookie(LOCALE_KEY, v);
};

const ChangeLocale = () => {
  const langInfo = getLangInfo();
  return (
    <Tooltip title={langInfo.tooltip}>
      <Button
        onClick={() => {
          setLang(langInfo.change);
          window.location.reload();
        }}
        size="large"
        type="text"
      >
        {langInfo.text}
      </Button>
    </Tooltip>
  );
};
export default ChangeLocale;
