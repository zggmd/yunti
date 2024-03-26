import {
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Redirect,
  Req,
  Request,
  Res,
} from '@nestjs/common';
import { Response } from 'express';

import type { Request as IRequest } from '@/types';

import { AppService } from './app.service';
import { NoAuth } from './common/decorators/no-auth.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @NoAuth()
  @Get('health')
  health(): string {
    return this.appService.getHello();
  }

  @NoAuth()
  @Get('logout')
  @Redirect()
  async logout(@Request() req: IRequest, @Query('redirect') redirect?: string) {
    await new Promise((resolve, reject) => {
      req.session.destroy(err => {
        if (err) {
          return reject(err);
        }
        resolve(true);
      });
    });
    return {
      url: this.appService.getOidcLogoutUrl(redirect),
      statusCode: HttpStatus.SEE_OTHER,
    };
  }

  @NoAuth()
  @Post('logout')
  async logoutPost(@Request() req: IRequest) {
    await new Promise((resolve, reject) => {
      req.session.destroy(err => {
        if (err) {
          return reject(err);
        }
        resolve(true);
      });
    });
    return {
      message: 'logout successfully.',
    };
  }

  @NoAuth()
  @Get('callback/oidc')
  async oidcCallback(@Query('code') code: string, @Request() req: IRequest, @Res() res: Response) {
    const token = await this.appService.getOidcToken(code, req.session.__redirect_uri);
    // @Todo 用户名和邮箱都有可能被篡改
    const { preferred_username, email } = this.appService.decodeToken(token.id_token);
    const user = await this.appService.checkLoginUser(preferred_username, email);
    /* const [, username] = (process.env.DB_NAME || '').split('/');
    if (user.name !== 'admin' && username && username !== user.name) {
      return res.json({
        statusCode: 401,
        messsage: `当前登录用户 ${user.name} 与数据库 ${process.env.DB_NAME} 不匹配`,
      });
    } */
    delete req.session.__redirect_uri;
    req.session.loginUser = {
      ...user,
      createAt: new Date(user.createAt).getTime(),
      updateAt: new Date(user.updateAt).getTime(),
      ip: req.ip,
      loginAt: Date.now(),
      // token for k8s client
      token: token.id_token,
      oidcToken: token,
    };
    res.redirect(302, '/');
  }

  @NoAuth()
  @Get('callback/oidc/workaround')
  async oidcCallback2(
    @Query('code') code: string,
    @Query('login') login: string,
    @Request() req: IRequest,
    @Res() res: Response
  ) {
    if (!code || code !== process.env.CODE) {
      return res.json({
        statusCode: 401,
      });
    }
    const preferred_username = login || 'admin';
    const email = 'admin@yuntijs.com';
    const token = 'token';

    const user = await this.appService.checkLoginUser(preferred_username, email);
    req.session.loginUser = {
      ...user,
      createAt: new Date(user.createAt).getTime(),
      updateAt: new Date(user.updateAt).getTime(),
      ip: req.ip,
      loginAt: Date.now(),
      token,
    };
    res.redirect(302, '/');
  }

  @Get(['/', 'apps', 'apps/*', 'components', 'components/*', 'preview/*', 'design/*'])
  oidcLogin(@Req() req: IRequest, @Res() res: Response) {
    const reqUrl = req.url;
    const LOW_CODE = reqUrl.startsWith('/design/');
    res.render('console/index', { LOW_CODE });
  }
}
