import { Logger } from '@nestjs/common';
import { nanoid } from 'nanoid';

import { NextFunction, Request, Response } from '@/types';

import { GRAPHQL_PATH, genUserLogString } from '../utils';

export async function LoggerMiddleware(req: Request, res: Response, next: NextFunction) {
  // 忽略静态文件
  if (/\.[\da-z]+$/i.test(req.path)) {
    return next();
  }
  const startTime = Date.now();
  req.__reqId = nanoid();
  const userLogStr = genUserLogString(req);
  Logger.log(`--> ${userLogStr}`);
  if (req.path === GRAPHQL_PATH) {
    const query = req.body?.query || '-';
    Logger.debug(`--> ${userLogStr} ${query}`, req.body?.variables);
  }
  res.on('finish', () => {
    const time = Date.now() - startTime;
    const logStr = `<-- ${userLogStr} [${res.statusCode}] ${time}ms`;
    if (time > 500) {
      Logger.warn(logStr);
    } else {
      Logger.log(logStr);
    }
  });
  next();
}
