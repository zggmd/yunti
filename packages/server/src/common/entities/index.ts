import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { SERVER_CONFIG } from '../../config/server.config';
import { AppMember } from './apps-members.entity';
import { App } from './apps.entity';
import { Block } from './blocks.entity';
import { ComponentMember } from './components-members.entity';
import { ComponentVersion } from './components-versions.entity';
import { Component } from './components.entity';
import { Branch } from './git/branches.entity';
import { Commit } from './git/commits.entity';
import { HistoryApp } from './git/history-apps.entity';
import { HistoryComponent } from './git/history-components.entity';
import { HistoryPage } from './git/history-pages.entity';
import { Log } from './git/log.entity';
import { Status } from './git/status.entity';
import { Tag } from './git/tags.entity';
import { MergeRequest } from './merge-request.entity';
import { Page } from './pages.entity';
import { PublishChannel } from './publish-channels.entity';
import { PublishRecord } from './publish-records.entity';
import { User } from './users.entity';

const { maxDataSources: maxDs, ...config } = SERVER_CONFIG.db;

/** yunti-server 与数据库建立的最大连接数 */
export const maxDataSources = maxDs;

export const dbConfig: TypeOrmModuleOptions = {
  extra: {
    connectionLimit: maxDataSources,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  },
  ...config,
  entities: [
    User,
    App,
    Page,
    AppMember,
    Block,
    Component,
    ComponentMember,
    ComponentVersion,
    Log,
    Branch,
    Status,
    Tag,
    Commit,
    HistoryApp,
    HistoryPage,
    HistoryComponent,
    PublishChannel,
    PublishRecord,
    MergeRequest,
  ],
};

export default registerAs('db', () => dbConfig);
