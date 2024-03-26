import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { HttpClient } from 'urllib';

import { UserRole } from './common/models/user-role.enum';
import serverConfig from './config/server.config';
import { UsersService } from './users/users.service';

const urllib = new HttpClient({ connect: { rejectUnauthorized: false } });

@Injectable()
export class AppService {
  constructor(
    @Inject(serverConfig.KEY)
    private config: ConfigType<typeof serverConfig>,
    private readonly usersService: UsersService
  ) {}

  logger = new Logger('AppService');

  getHello(): string {
    return 'yunti-server is running.';
  }

  getOidcAuthUrl(redirect_uri?: string) {
    const {
      client,
      server: { url },
    } = this.config.oidc;
    const searchParams = new URLSearchParams({
      client_id: client.client_id,
      redirect_uri: redirect_uri || client.redirect_uri,
      response_type: 'code',
      scope: 'openid profile email groups offline_access',
    });
    return url + '/auth?' + searchParams.toString();
  }

  getOidcLogoutUrl(redirect = '') {
    const {
      server: { url },
    } = this.config.oidc;
    const searchParams = new URLSearchParams({
      redirect,
    });
    return url + '/logout?' + searchParams.toString();
  }

  async getOidcToken(code: string, redirect_uri?: string) {
    const {
      client: { client_id, client_secret },
      server: { url },
    } = this.config.oidc;
    const res = await urllib.request(url + '/token', {
      method: 'POST',
      auth: client_id + ':' + client_secret,
      dataType: 'json',
      timeout: 10 * 1000,
      data: {
        code,
        redirect_uri: redirect_uri || this.config.oidc.client.redirect_uri,
        grant_type: 'authorization_code',
      },
    });
    if (!res.data.id_token) {
      this.logger.error('getOidcToken failed =>', res.data);
      throw new BadRequestException(res.data, 'get oidc token failed');
    }
    return res.data;
  }

  decodeToken(token: string) {
    const decodedToken = jwt.decode(token, { complete: true });
    return decodedToken.payload as jwt.JwtPayload;
  }

  async checkLoginUser(name: string, email: string) {
    const user = await this.usersService.getLoginUser(name);
    if (user) {
      return user;
    }
    return this.usersService.createUser({
      name,
      email,
      role: name === 'admin' ? UserRole.SystemAdmin : UserRole.User,
    });
  }
}
