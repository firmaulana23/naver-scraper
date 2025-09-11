import { Module } from '@nestjs/common';
import { NaverService } from './naver.service';
import { NaverController } from './naver.controller';

@Module({
  controllers: [NaverController],
  providers: [NaverService],
})
export class NaverModule {}
