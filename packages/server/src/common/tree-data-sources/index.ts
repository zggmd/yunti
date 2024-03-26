import { Logger } from '@nestjs/common';
import { orderBy } from 'lodash';
import { DataSource, DataSourceOptions, EntityTarget } from 'typeorm';

import { dbConfig, maxDataSources } from '../entities';
import { TREE_DEFAULT } from '../utils';

// import { writeFileSync } from 'fs';

export class TreeDataSources {
  protected logger = new Logger('TreeDataSources');

  /** 数据库配置 */
  protected config = dbConfig;

  /** 数据库数据源 */
  protected dataSources: { [tree: string]: DataSource } = {};

  /** 最大数据源 */
  protected maxDataSources = maxDataSources;

  /** 数据源活跃时间 */
  protected dataSourcesActiveTime: { [tree: string]: number } = {};

  /** 初始化数据源 */
  protected initDataSource = async (tree: string) => {
    const dataSource = new DataSource({
      ...this.config,
      database: `${this.config.database}/${tree}`,
      synchronize: false,
    } as DataSourceOptions);
    await dataSource.initialize();
    this.logger.log(`data source created => ${tree}`);
    return dataSource;
  };

  /** 添加数据源 */
  protected addDataSource = async (tree: string) => {
    const dataSource = await this.initDataSource(tree);
    this.dataSources[tree] = dataSource;
    return dataSource;
  };

  /** 清除超过最大数量限制的数据源 */
  protected doDataSourcesClear = () => {
    if (Object.keys(this.dataSources).length <= this.maxDataSources) {
      return;
    }
    let dsActiveTimeArray = Object.entries(this.dataSourcesActiveTime).map(([tree, dateNow]) => ({
      tree,
      dateNow,
    }));
    dsActiveTimeArray = orderBy(dsActiveTimeArray, 'dateNow', 'desc');
    for (const { tree } of dsActiveTimeArray.slice(this.maxDataSources)) {
      this.dataSources[tree]?.destroy();
      delete this.dataSources[tree];
      delete this.dataSourcesActiveTime[tree];
      this.logger.log(`data source removed => ${tree}`);
    }
  };

  /** 获取数据源 */
  getDataSource = async (tree = TREE_DEFAULT) => {
    let dataSource = this.dataSources[tree];
    if (!dataSource) {
      dataSource = await this.addDataSource(tree);
    }
    this.dataSourcesActiveTime[tree] = Date.now();
    this.doDataSourcesClear();
    return dataSource;
  };

  /** 获取 Repository */
  getRepository = async <T>(tree = TREE_DEFAULT, entity: EntityTarget<T>) => {
    const dataSource = await this.getDataSource(tree);
    // const dataSource2 = await this.getDataSource('app-4bkeq/user-5za70/test-new-22222');
    // const res = await dataSource2.query(`
    // select * from dolt_diff_apps where to_commit='u87bg197nmibi5usnhpo50orcg5saoo9';`);
    // console.log('res', res)
    // writeFileSync('test.txt', JSON.stringify(res, null, 2));
    return dataSource.getRepository<T>(entity);
  };
}

const treeDataSources = new TreeDataSources();
export default treeDataSources;
