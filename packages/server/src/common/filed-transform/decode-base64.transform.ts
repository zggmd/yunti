import { ApolloServerErrorCode } from '@apollo/server/errors';
import { Transform, TransformOptions } from 'class-transformer';
import { isBase64 } from 'class-validator';

import { CustomException, decodeBase64, encryptText } from '../utils';

export interface DecodeBase64TransformOptions extends TransformOptions {
  /** 是否加密 */
  encrypt?: boolean;
}

/**
 * base64 解码
 *
 * 也可对解码后的字符串进行 AES 加密，一般用于密码保存
 *
 * Can be applied to properties only.
 */
export function DecodeBase64Transform(
  options: DecodeBase64TransformOptions = {}
): PropertyDecorator {
  const { encrypt, ...transformOptions } = options;
  return Transform(({ value, key, obj }) => {
    if (!isBase64(value)) {
      throw new CustomException(
        ApolloServerErrorCode.BAD_USER_INPUT,
        `${key} must be base64 encoded`,
        400,
        obj
      );
    }
    value = decodeBase64(value);
    if (encrypt) {
      value = encryptText(value);
    }
    return value;
  }, transformOptions);
}
