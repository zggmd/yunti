import {
  IPublicTypeBlockSchema,
  IPublicTypeComponentSchema,
  IPublicTypePageSchema,
  IPublicTypeProjectSchema,
} from '@alilc/lowcode-types';
import { Request as ExpressReq, Response } from 'express';
import * as session from 'express-session';

import { User } from './common/entities/users.entity';

export { NextFunction, Response } from 'express';

export interface ILoginUser extends User {
  /** 登录时间 */
  loginAt?: number;
  /** 登录 ip */
  ip?: string;
  token?: string;
  /** oidc token */
  oidcToken?: {
    access_token: string;
    expires_in: number;
    id_token: string;
    refresh_token: string;
    token_type: string;
  };
}

export interface Request extends ExpressReq {
  __reqId?: string;
  session: session.Session &
    Partial<session.SessionData> & {
      ip?: string;
      loginUser: ILoginUser;
      __redirect_uri?: string;
    };
}

export interface IContext {
  req: Request;
  res?: Response;
}

export * from './kubernetes/lib/interfaces';

export interface Labels {
  [k: string]: string;
}

export interface AnyObj {
  [k: string]: any;
}

export type KeyArrayStringMap = {
  [key: string]: string[];
};

export type KeyArrayStringMapNested = {
  [key: string]: KeyArrayStringMap;
};

interface A {
  [key1: string]: string[];
}

export interface MyContext {
  req: Request;
  res: Response;
  _my_parameters?: {
    tenantProjectsMap?: KeyArrayStringMap;
    tenantClustersMap?: KeyArrayStringMap;
    projectClustersMap?: KeyArrayStringMap;
    clusterProjectsMap?: KeyArrayStringMap;
    tenantClustersProjectsMap?: KeyArrayStringMapNested;
    [paramKey: string]: KeyArrayStringMap | KeyArrayStringMapNested;
  };
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type Merge<M, N> = Omit<M, Extract<keyof M, keyof N>> & N;

export type DesignerProjectSchema<T extends Record<string, any>> = Merge<
  IPublicTypeProjectSchema<T>,
  {
    // eslint-disable-next-line no-undef
    constants?: ConstantsSchema;
    // eslint-disable-next-line no-undef
    utils?: UtilsSchema;
  }
>;

export type IPublicTypeProjectPageSchema = DesignerProjectSchema<IPublicTypePageSchema>;

export type IPublicTypeProjectComponentSchema = DesignerProjectSchema<IPublicTypeComponentSchema>;

export type IPublicTypeProjectBlockSchema = DesignerProjectSchema<IPublicTypeBlockSchema>;
