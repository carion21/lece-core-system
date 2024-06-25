import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { JwtStrategy } from 'src/auth/strategy.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, JwtStrategy],
})
export class AdminModule {}
