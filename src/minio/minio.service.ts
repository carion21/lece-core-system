import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestMinioModule } from 'nestjs-minio';
import { Consts } from 'utilities/constants';
import { generateUuid } from 'utilities/functions';

@Injectable()
export class MinioService {
  constructor(private readonly configService: ConfigService) {}

  readonly minioHost = this.configService.get<string>('MINIO_HOST');
  readonly minioPort = this.configService.get<number>('MINIO_PORT');
  readonly minioSecure = this.configService.get<boolean>('MINIO_SECURE');
  readonly minioAccess = this.configService.get<string>('MINIO_ACCESS_KEY');
  readonly minioSecret = this.configService.get<string>('MINIO_SECRET_KEY');
  readonly minioBucket = this.configService.get<string>('MINIO_BUCKET_NAME');

  getMinioClient() {
    const Minio = require('minio');
    return new Minio.Client({
      endPoint: this.minioHost,
      port: 9000,
      accessKey: this.minioAccess,
      secretKey: this.minioSecret,
      useSSL: false,
    });
  }

  async uploadFile(file: Express.Multer.File, generateObjectUrl = false) {
    const minioClient = this.getMinioClient();

    const fileExtension = file.originalname.split('.').pop();
    const objectName = generateUuid() + '.' + fileExtension;

    const metaData = {
      'Content-Type': file.mimetype,
    };

    const minioResponse = await minioClient.putObject(
      this.minioBucket,
      objectName,
      file.buffer,
      metaData,
    );

    let objectUrl = null;

    if (generateObjectUrl) {
      objectUrl = await minioClient.presignedGetObject(
        this.minioBucket,
        objectName,
        Consts.DEFAULT_DURATION * 24 * 60 * 60,
      );
    }

    return {
      minioBucket: this.minioBucket,
      objectName: objectName,
      objectUrl: objectUrl,
    };
  }

  async getFileUrl(objectName: string) {
    const minioClient = this.getMinioClient();

    return await minioClient.presignedGetObject(
      this.minioBucket,
      objectName,
      Consts.DEFAULT_DURATION * 24 * 60 * 60,
    );
  }

  async getFile(objectName: string) {
    const minioClient = this.getMinioClient();

    return await minioClient.getObject(this.minioBucket, objectName);
  }

  async deleteFile(objectName: string) {
    const minioClient = this.getMinioClient();

    return await minioClient.removeObject(this.minioBucket, objectName);
  }
}
