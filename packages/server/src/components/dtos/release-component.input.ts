import { InputType } from '@nestjs/graphql';
import { Matches } from 'class-validator';

@InputType()
export class ReleaseComponentInput {
  /** 组件 id */
  componentId: string;

  /** 版本 */
  @Matches(
    /^(\d+)\.(\d+)\.(\d+)(-[\dA-Za-z-]+(\.[\dA-Za-z-]+)*)?(\+[\dA-Za-z-]+(\.[\dA-Za-z-]+)*)?$/,
    {
      message:
        'The version number format is X.Y.Z, where X is the major version number, Y is the minor version number, and Z is the revision number',
    }
  )
  version: string;

  /** 版本描述 (发布日志等) */
  description?: string;

  /** 若为 true，则会覆盖已存在版本 */
  force?: boolean;
}
