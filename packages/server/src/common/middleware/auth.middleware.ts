import { Injectable, Logger, NestMiddleware } from '@nestjs/common';

import { AppService } from '@/app.service';

import { NextFunction, Request, Response } from '../../types';

// import { UserRole } from '../models/user-role.enum';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly appSerivce: AppService) {}

  logger = new Logger('AuthMiddleware');

  async use(req: Request, res: Response, next: NextFunction) {
    req.session.ip = req.ip;
    const loginUser = req.session.loginUser;
    if (
      !loginUser &&
      // @Todo: workaround
      // req.baseUrl === GRAPHQL_PATH &&
      req.baseUrl !== '/health' &&
      req.baseUrl !== '/logout' &&
      req.baseUrl !== '/callback/oidc' &&
      req.baseUrl !== '/callback/oidc/workaround' &&
      req.baseUrl !== '/graphql-voyager' &&
      req.accepts().includes('text/html')
    ) {
      req.session.__redirect_uri = req.query?.redirect_uri as string;
      const rediret = this.appSerivce.getOidcAuthUrl(req.query?.redirect_uri as string);
      this.logger.log('redirect to =>', rediret);
      return res.redirect(rediret);
    }
    /* if (loginUser && !req.accepts().includes('text/html')) {
      const tree = (req.query.tree || 'main') as string;
      const [username] = tree.split('/');
      const isGqlMutation =
        req.path === GRAPHQL_PATH &&
        typeof req.body?.query === 'string' &&
        /^\s+?mutation\s+/i.test(typeof req.body?.query);
      if (
        loginUser.role !== UserRole.SystemAdmin &&
        username !== loginUser.name &&
        isGqlMutation
      ) {
        return res.json({
          statusCode: 401,
          messsage: `当前登录用户 ${loginUser.name} 不能操作对应 tree: ${tree}`,
        });
      }
    } */
    next();
  }
}
