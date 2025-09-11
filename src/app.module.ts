import { Module } from '@nestjs/common';
import { NaverModule } from './naver/naver.module';

@Module({
  imports: [NaverModule],
})
export class AppModule {}
