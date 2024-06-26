import { Global, Module } from '@nestjs/common';
import { MinioController } from './minio.controller';
import { MinioService } from './minio.service';

@Global()
@Module({
  controllers: [MinioController],
  providers: [MinioService],
  exports: [MinioService],
})
export class MinioModule {}
