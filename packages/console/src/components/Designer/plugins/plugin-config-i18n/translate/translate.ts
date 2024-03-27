import { sdk } from '@tenx-ui/yunti-bff-client';
import request from '@yuntijs/request';
import crypto from 'crypto';

const TRANSLATE_TAG = '{TRANSLATE_TAG}';

const signature = string => {
  const md5 = crypto.createHash('md5');
  md5.update(string);
  return md5.digest('hex');
};

export interface TranslatePayloadValue {
  i18nKey: string;
  zhCN: string;
}
export interface TranslatePayload {
  config: {
    [key: string]: any;
  };
  values: TranslatePayloadValue[];
}

export interface ErrItem {
  message: string;
  i18nKey: string;
  zhCN: string;
  enUS: string;
}
export interface TranslateResultItem {
  i18nKey: string;
  zhCN: string;
  enUS: string;
}
interface BaiduRes {
  error_msg?: string;
  trans_result?: {
    src: string;
    dst: string;
  }[];
}
export const baiduTranslate = async ({
  config,
  values,
}: TranslatePayload): Promise<TranslateResultItem[] | ErrItem[]> => {
  const zhCN = values?.map(item => item.zhCN)?.join(TRANSLATE_TAG);
  try {
    const { to = 'en', from = 'auto', appid, secret } = config;
    const sign = appid + zhCN + 'salt' + secret;
    const res = (await request.get(`/api/translate/baidu`, {
      method: 'get',
      params: {
        appid,
        salt: 'salt',
        sign: signature(sign),
        q: zhCN,
        from: from,
        to,
        dict: 1,
        tts: 1,
      },
    })) as BaiduRes;
    if (res.error_msg) {
      return values?.map(item => ({ ...item, message: res.error_msg }));
    }
    return values?.map((item, i) => ({
      ...item,
      enUS: res?.trans_result?.map(r => r.dst)?.[0]?.split(TRANSLATE_TAG)?.[i],
    }));
  } catch {
    return values?.map((item, i) => ({ ...item, message: '翻译失败' }));
  }
};
export const googleTranslate = async ({
  config,
  values,
}: TranslatePayload): Promise<TranslateResultItem[] | ErrItem[]> => {
  return [];
};
export const youdaoTranslate = async ({
  config,
  values,
}: TranslatePayload): Promise<TranslateResultItem[] | ErrItem[]> => {
  return [];
};
export const biyingTranslate = async ({
  config,
  values,
}: TranslatePayload): Promise<TranslateResultItem[] | ErrItem[]> => {
  const result = await Promise.all(
    values?.map(async item =>
      (async () => {
        try {
          const res = await sdk.translate({
            text: item.zhCN,
            to: 'en',
          });
          return {
            ...item,
            enUS: res?.translate?.translation,
          };
        } catch {
          return {
            message: '翻译失败',
            i18nKey: item.i18nKey,
            zhCN: item.zhCN,
          };
        }
      })()
    )
  );
  return result as any;
};
