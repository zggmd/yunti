import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import * as Minio from 'minio';
import { BucketItem, BucketItemFromList, BucketStream, UploadedObjectInfo } from 'minio';
import { Readable } from 'node:stream';

import serverConfig from '@/config/server.config';

@Injectable()
export class MinioService {
  private minioClient: Minio.Client;

  constructor(
    @Inject(serverConfig.KEY)
    private config: ConfigType<typeof serverConfig>
  ) {
    this.minioClient = new Minio.Client(this.config.minio?.client);
  }

  async bucketExists(bucket: string): Promise<boolean> {
    return this.minioClient.bucketExists(bucket);
  }

  async makeBucket(name: string): Promise<void> {
    return this.minioClient.makeBucket(name);
  }

  async listBuckets(): Promise<BucketItemFromList[]> {
    return this.minioClient.listBuckets();
  }

  listObjects(bucket: string, prefix?: string): BucketStream<BucketItem> {
    return this.minioClient.listObjects(bucket, prefix, true);
  }

  async getObject(bucket: string, name: string): Promise<Readable> {
    return this.minioClient.getObject(bucket, name);
  }

  async putObject(
    bucket: string,
    name: string,
    stream: Readable | Buffer | string
  ): Promise<UploadedObjectInfo> {
    return this.minioClient.putObject(bucket, name, stream);
  }

  async fgetObject(bucket: string, name: string, filePath: string): Promise<void> {
    return this.minioClient.fGetObject(bucket, name, filePath);
  }

  async fputObject(bucket: string, name: string, filePath: string): Promise<UploadedObjectInfo> {
    return this.minioClient.fPutObject(bucket, name, filePath);
  }

  async copyObject(
    bucket: string,
    name: string,
    targetPath: string
  ): Promise<Minio.BucketItemCopy> {
    const conds = new Minio.CopyConditions();
    return this.minioClient.copyObject(bucket, name, targetPath, conds);
  }

  async uploadFile(
    bucket: string,
    name: string,
    stream: Readable | Buffer | string
  ): Promise<UploadedObjectInfo> {
    if (!(await this.bucketExists(bucket))) {
      await this.makeBucket(bucket);
    }
    return this.minioClient.putObject(bucket, name, stream);
  }
}
