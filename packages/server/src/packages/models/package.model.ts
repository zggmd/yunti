import { Field, HideField, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PackageVersion {
  /** 版本名称 */
  @Field(() => ID, { description: '版本名称' })
  version: string;

  /** 发布时间 */
  publishTime?: number;
}

@ObjectType()
export class ExternalsPkgItem {
  /** npm 包名 */
  name: string;
  /** npm 包版本 */
  version: string;
}

@ObjectType()
export class PackageUmdMetaConfig {
  /** 组件低码描述配置地址 */
  url: string;
  /** 组件低码描述配置地址 */
  exportName: string;
}

@ObjectType()
export class PackageUmdConfig {
  /** 全局变量名称 */
  @Field(() => ID, { description: '全局变量名称' })
  library: string;

  /** 外部依赖及版本 */
  @Field(() => JSON, { description: '外包依赖及版本' })
  externals?: Record<string, string>;

  /** 外包依赖包列表 */
  @Field(() => [ExternalsPkgItem], { description: '外包依赖包列表' })
  externalsPkgs?: ExternalsPkgItem[];

  /** npm 包 umd 产物 cdn 地址 */
  urls: string[];

  /** 组件低码描述配置 */
  @Field(() => PackageUmdMetaConfig, {
    description: '组件低码描述配置',
    nullable: true,
  })
  meta?: PackageUmdMetaConfig;

  /** npm 包专属于编辑态的 umd 产物 cdn 地址 (lowcode engine 专用) */
  editUrls?: string[];
}

export type PackageMetaType = string | { entry: string; exportName: string };

export interface YuntiConfig {
  /** umd 相关配置 */
  umd: {
    /** 全局变量名称 */
    library: string;
    /** 入口文件路径列表 */
    entry: string[];
    /** 外部依赖及版本 */
    externals?: Record<string, string>;
  };
  /** 低码相关配置 */
  lowCode?: {
    /** 组件低码描述文件配置 */
    meta?: PackageMetaType;
    /** 组件编辑态 umd 入口文件路径列表 */
    editEntry?: string[];
  };
}

@ObjectType()
export class Package {
  /** npm 包名称 */
  @Field(() => ID, { description: 'npm 包名称' })
  name: string;

  /** 描述 */
  description?: string;

  /** 版本 */
  version: string;

  /** 版本列表 */
  @Field(() => [PackageVersion], { description: '版本列表', nullable: true })
  versions?: PackageVersion[];

  /** 作者 */
  @Field(() => JSON, { description: '作者' })
  author?: Record<string, string>;

  /** 主页 */
  homepage?: string;

  /** 依赖 */
  @Field(() => JSON, { description: '依赖' })
  dependencies?: Record<string, string>;

  /** 同级依赖 */
  @HideField()
  peerDependencies?: Record<string, string>;

  /** 许可 */
  license?: string;

  /** 是否私有 */
  private: boolean;

  /** npm 包 umd 配置 */
  @Field(() => PackageUmdConfig, {
    description: 'npm 包 umd 配置',
    nullable: true,
  })
  umd?: PackageUmdConfig;

  /** 数据来源 */
  source?: string;

  /** 云梯相关配置 */
  @HideField()
  yunti?: YuntiConfig;
}
