import { JSONSchema, Options, compile } from 'json-schema-to-typescript';
import * as fs from 'node:fs';

import { FILE_HEADER } from './constants';

const _replaceSpecialName = (name: string) =>
  name
    .replace(/^VM/, 'vm')
    .replace(/^OAuth2/, 'oauth2')
    .replace(/^TF/, 'tf');
/**
 * 将命名转换为横线命名
 * TwoWords => two-words
 *
 * @param {string} name 名称
 */
export const toKebabCase = (name: string) => {
  const newName = _replaceSpecialName(name);
  return newName
    .replaceAll(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');
};

/**
 * 将命名转换为首字母小写
 * TwoWords => twoWords
 *
 * @param {string} name 名称
 */
export const firstLetterToLowercase = (name: string) => {
  const newName = _replaceSpecialName(name);
  const [first, ...rest] = newName;
  return first.toLowerCase() + rest.join('');
};

export const getRegExp = (tagStart = '<remove>', tagEnd = '</remove>') =>
  new RegExp(`// ${tagStart}[\\s\\S]*// ${tagEnd}`, 'gu');

export const processContent = (name: string, content: string) => {
  // <remove>...</remove>
  let newContent = content.replace(getRegExp(), '');
  // <remove is="...">...</remove>
  newContent = newContent.replace(getRegExp(`<remove is="${name}">`, `</remove is="${name}">`), '');
  return FILE_HEADER + newContent;
};

export const writeFile = (path: fs.PathOrFileDescriptor, data: string) =>
  fs.writeFile(path, data, err => {
    if (err) {
      // eslint-disable-next-line no-console
      console.error(`write ${path} failed`, err);
    }
  });

export const processContentAndWriteFile = (
  name: string,
  path: fs.PathOrFileDescriptor,
  data: string
) => writeFile(path, processContent(name, data));

export interface RsImport {
  rs: string;
  fileName: string;
}
export const writeRsImportsFile = (path: fs.PathOrFileDescriptor, rsImports: RsImport[]) =>
  writeFile(
    path,
    rsImports.map(({ rs, fileName }) => `export { ${rs} } from './${fileName}'`).join('\n')
  );

export const schemaToTs = (
  schema: JSONSchema | undefined,
  name: string,
  options?: Partial<Options>
): Promise<string> => {
  if (!schema) {
    return Promise.resolve(`
export type ${name} = any;

`);
  }
  return compile(schema, name, options);
};
