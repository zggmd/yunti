import { ArgsType } from '@nestjs/graphql';

@ArgsType()
export class TranslateArgs {
  /** 源文本 */
  text: string;

  /** 源文本的语言 code，不指定会自动识别，支持的语言列表见 https://github.com/plainheart/bing-translate-api/blob/master/src/lang.json */
  from?: string;

  /** 要翻译的语言 code，支持的语言列表同 `from` */
  to: string;

  /** 是否修正源文本 */
  correct?: boolean;
}
