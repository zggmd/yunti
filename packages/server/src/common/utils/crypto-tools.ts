import { BinaryLike, createCipheriv, createDecipheriv, scryptSync } from 'node:crypto';

const IV_DEFAULT = Buffer.from('f99fcf46ab498c4b7d6a8097a9b24c48', 'hex');
const PASSWORD_DEFAULT = '496bc47be845b862957cd72dfdc1efbb8fa0deb7de22d4ff168acd875f9eeac1';
const ALGORITHM_DEFAULT = 'aes-256-ctr';
const SALT_DETAULT = 'yunti-tenxcloud';

// The key length is dependent on the algorithm.
// In this case for aes256, it is 32 bytes.
const genKey = (password: BinaryLike = PASSWORD_DEFAULT, salt: BinaryLike = SALT_DETAULT) =>
  scryptSync(password, salt, 32);

export interface CryptoOptions {
  password?: BinaryLike;
  iv?: BinaryLike;
  salt?: BinaryLike;
}

/**
 * 加密字符串
 * @param textToEncrypt 待加密字符串
 */
export const encryptText = (textToEncrypt: string, options: CryptoOptions = {}) => {
  const { password, iv = IV_DEFAULT, salt } = options;
  const key = genKey(password, salt);
  const cipher = createCipheriv(ALGORITHM_DEFAULT, key, iv);
  return Buffer.concat([cipher.update(textToEncrypt), cipher.final()]).toString('hex');
};

/**
 * 解密字符串
 * @param encryptedText 加密后的字符串
 */
export const decryptText = (encryptedText: string, options: CryptoOptions = {}) => {
  const { password, iv = IV_DEFAULT, salt } = options;
  const key = genKey(password, salt);
  const decipher = createDecipheriv(ALGORITHM_DEFAULT, key, iv);
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedText, 'hex')),
    decipher.final(),
  ]).toString();
};
