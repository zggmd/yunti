import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GraphQLModule } from '@nestjs/graphql';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KubernetesModule } from '@yuntijs/k8s-client';
import { Response } from 'express';
import { DirectiveLocation, GraphQLDirective } from 'graphql';
import { join } from 'node:path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppsMembersModule } from './apps-members/apps-members.module';
import { AppsModule } from './apps/apps.module';
import { BlocksModule } from './blocks/blocks.module';
import { ChartmuseumModule } from './chartmuseum/chartmuseum.module';
import { DataLoaderInterceptor } from './common/dataloader';
import { namespaceDirectiveTransformer } from './common/directives/namespace.directive';
import { passwdDirectiveTransformer } from './common/directives/password.directive';
import { upperDirectiveTransformer } from './common/directives/upper-case.directive';
import dbConfig from './common/entities';
import { AllExceptionFilter } from './common/filters/all-exception.filter';
import { AuthGuard } from './common/guards/auth.guard';
import { AuthMiddleware } from './common/middleware/auth.middleware';
import { ComplexityPlugin } from './common/plugins/complexity.plugin';
import { ErrorFormatPlugin } from './common/plugins/error-format.plugin';
import { DateScalar } from './common/scalars/date.scalar';
import { JSONObjectScalar, JSONScalar } from './common/scalars/json.scalar';
import { GRAPHQL_PATH } from './common/utils';
import { ComponentsMembersModule } from './components-members/components-members.module';
import { ComponentsVersionsModule } from './components-versions/components-versions.module';
import { ComponentsModule } from './components/components.module';
import serverConfig, { SERVER_CONFIG } from './config/server.config';
import { GitModule } from './git/git.module';
import { MergeRequestModule } from './merge-requests/merge-requests.module';
import { MinioModule } from './minio/minio.module';
import { PackagesModule } from './packages/packages.module';
import { PagesModule } from './pages/pages.module';
import { PipelinesModule } from './pipelines/pipelines.module';
import { PublishChannelsHelmModule } from './publish-channels-helm/publish-channels-helm.module';
import { PublishChannelsModule } from './publish-channels/publish-channels.module';
import { PublishRecordsModule } from './publish-records/publish-records.module';
import { ToolsModule } from './tools/tools.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      load: [serverConfig, dbConfig],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => configService.get('db'),
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../../', 'public'),
      exclude: [GRAPHQL_PATH],
      serveStaticOptions: {
        setHeaders: (res: Response) => {
          const url = res.req.url;
          if (
            url.includes('.') &&
            !url.startsWith('/profile/') &&
            !url.endsWith('.html') &&
            url !== '/favicon.ico'
          ) {
            res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
          }
        },
      },
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      path: GRAPHQL_PATH,
      // 生产环境是否允许获取 schemas
      introspection: true,
      driver: ApolloDriver,
      // installSubscriptionHandlers: true,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: {
        settings: {
          'request.credentials': 'same-origin',
          'tracing.hideTracingResponse': true,
          'queryPlan.hideQueryPlanResponse': true,
          'schema.polling.interval': 1000 * 60,
        },
      },
      transformSchema: schema => {
        let newSchema = namespaceDirectiveTransformer(schema, 'namespace');
        newSchema = passwdDirectiveTransformer(newSchema, 'passwd');
        return upperDirectiveTransformer(newSchema, 'upper');
      },
      buildSchemaOptions: {
        directives: [
          new GraphQLDirective({
            name: 'namespace',
            locations: [DirectiveLocation.FIELD_DEFINITION],
          }),
          new GraphQLDirective({
            name: 'upper',
            locations: [DirectiveLocation.FIELD_DEFINITION],
          }),
          new GraphQLDirective({
            name: 'passwd',
            locations: [DirectiveLocation.FIELD_DEFINITION],
          }),
        ],
      },
      subscriptions: {
        'graphql-ws': {
          path: GRAPHQL_PATH,
        },
      },
    }),
    KubernetesModule.forRoot(SERVER_CONFIG.kubernetes),
    EventEmitterModule.forRoot(),
    UsersModule,
    PagesModule,
    AppsModule,
    BlocksModule,
    GitModule,
    AppsMembersModule,
    ComponentsModule,
    ComponentsMembersModule,
    ComponentsVersionsModule,
    ToolsModule,
    PackagesModule,
    PublishChannelsModule,
    PublishRecordsModule,
    ChartmuseumModule,
    PublishChannelsHelmModule,
    MinioModule,
    PipelinesModule,
    MergeRequestModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: DataLoaderInterceptor,
    },
    DateScalar,
    JSONScalar,
    JSONObjectScalar,
    ComplexityPlugin,
    ErrorFormatPlugin,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
