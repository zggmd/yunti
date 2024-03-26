import { registerEnumType } from '@nestjs/graphql';

export enum OrderBy {
  /** 升序 */
  ASC = 'ASC',
  /** 降序 */
  DESC = 'DESC',
}

registerEnumType(OrderBy, {
  name: 'OrderBy',
  description: '排序',
  valuesMap: {
    ASC: {
      description:
        '升序，对于文本数据，升序表示按照字母顺序排列（A-Z），对于数字数据则是从小到大排列',
    },
    DESC: {
      description:
        '降序，对于文本数据，降序表示按字母逆序排列（Z-A），对于数字数据则是从大到小排列',
    },
  },
});
