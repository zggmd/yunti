import { Injectable, Logger } from '@nestjs/common';
import { HttpClient, RequestOptions } from 'urllib';

import { decryptText } from '@/common/utils';
import { PublishChannelHelm } from '@/publish-channels-helm/models/publish-channel-helm.model';
import { PublishChannelStatus } from '@/publish-channels/models/publish-channel-status.enum';

import { Chartmuseum } from './models/chartmuseum.model';

@Injectable()
export class ChartmuseumService {
  urllib: HttpClient;
  logger = new Logger('ChartmuseumService');

  constructor() {
    this.urllib = new HttpClient({
      defaultArgs: {
        timeout: 5 * 1000,
        dataType: 'json',
      },
      connect: { rejectUnauthorized: false },
    });
  }

  async checkHealthy(url: string) {
    try {
      const res = await this.urllib.request(url + '/health', { timeout: 2000 });
      return res.data?.healthy === true
        ? PublishChannelStatus.Healthy
        : PublishChannelStatus.Abnormal;
    } catch {
      return PublishChannelStatus.Abnormal;
    }
  }

  private async callChartApi(helm: PublishChannelHelm, endpoint: string, options?: RequestOptions) {
    const { url, username, password } = helm;
    const auth = username && password && `${username}:${decryptText(password)}`;
    const reqUrl = url + endpoint;
    this.logger.debug(`callChartApi => ${reqUrl}`);
    const res = await this.urllib.request(reqUrl, Object.assign({ auth }, options));
    if (res.data?.error) {
      this.logger.error(`callChartApi faild => ${res.data?.error}`);
      return null;
    }
    return res.data;
  }

  async getChartAllVersions(helm: PublishChannelHelm, name: string): Promise<[Chartmuseum]> {
    return this.callChartApi(helm, `/api/charts/${name}`);
  }

  async getChartOneVersion(
    helm: PublishChannelHelm,
    name: string,
    version: string
  ): Promise<Chartmuseum> {
    return this.callChartApi(helm, `/api/charts/${name}/${version}`);
  }
}
