import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TranslationResult {
  @Field(() => String, { description: '源文本' })
  text: string;

  /** 源文本的语言 code */
  from: string;

  /** 要翻译的语言 code */
  to: string;

  /** 翻译后的文本  */
  translation: string;

  /** 修正后的文本，当 `correct` 设置为 `true` 时返回 */
  correctedText?: string;
}
