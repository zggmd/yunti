import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { translate } from 'bing-translate-api';
import { HttpProxyAgent, HttpsProxyAgent } from 'hpagent';

import serverConfig from '@/config/server.config';

import { TranslateArgs } from './dto/translate.args';
import { TranslationResult } from './models/tool.model';

@Injectable()
export class ToolsService {
  constructor(
    @Inject(serverConfig.KEY)
    private config: ConfigType<typeof serverConfig>
  ) {}

  async translate(options: TranslateArgs): Promise<TranslationResult> {
    const { text, from, to, correct } = options;
    const proxyAgents: any = {};
    const { http: httpProxy, https: httpsProxy } = this.config.proxy || {};
    if (httpProxy) {
      proxyAgents.http = new HttpProxyAgent({
        keepAlive: true,
        keepAliveMsecs: 1000,
        maxSockets: 256,
        maxFreeSockets: 256,
        scheduling: 'lifo',
        proxy: httpProxy,
      });
    }
    if (httpProxy) {
      proxyAgents.https = new HttpsProxyAgent({
        keepAlive: true,
        keepAliveMsecs: 1000,
        maxSockets: 256,
        maxFreeSockets: 256,
        scheduling: 'lifo',
        proxy: httpsProxy || httpProxy,
      });
    }
    const { translation, correctedText, language } = await translate(
      text,
      from,
      to,
      correct,
      undefined,
      undefined,
      proxyAgents
    );
    return {
      text,
      translation,
      from: language.from,
      to: language.to,
      correctedText,
    };
  }
}
