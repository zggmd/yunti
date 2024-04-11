import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WsAdapter } from '@nestjs/platform-ws';
import { json } from 'body-parser';
import * as compression from 'compression';
import RedisStore from 'connect-redis';
import * as session from 'express-session';
import helmet from 'helmet';
import Redis from 'ioredis';
import { join } from 'node:path';

import { AppModule } from './app.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { IS_PROD } from './common/utils';
import { SERVER_CONFIG } from './config/server.config';

import ejs = require('ejs');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: IS_PROD ? SERVER_CONFIG.log.levels.split(',') : undefined,
  });

  app.enableCors({
    origin: true,
    credentials: true,
    // allowedHeaders: ['Authorization'],
  });

  app.useWebSocketAdapter(new WsAdapter(app));

  app.set('trust proxy', true);

  // 启用 gzip 压缩
  if (SERVER_CONFIG.compression?.enabled) {
    app.use(compression(SERVER_CONFIG.compression));
  }

  // ~ set ejs
  ejs.delimiter = '?';
  ejs.openDelimiter = '[';
  ejs.closeDelimiter = ']';
  app.engine('html', ejs.renderFile);
  app.setBaseViewsDir(join(__dirname, '../../../', 'public'));
  app.setViewEngine('html');

  app.use(json(SERVER_CONFIG.bodyParser.json));

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );

  // init session
  app.use(
    session({
      store: new RedisStore({
        client: new Redis(SERVER_CONFIG.redis),
      }),
      ...SERVER_CONFIG.session,
    })
  );

  app.use(LoggerMiddleware);

  await app.listen(SERVER_CONFIG.web.port, SERVER_CONFIG.web.hostname);

  // eslint-disable-next-line no-console
  console.log(`bff-server is running on: ${await app.getUrl()}`);
}
bootstrap();
