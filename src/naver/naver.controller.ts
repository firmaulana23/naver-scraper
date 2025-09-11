import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { NaverService } from './naver.service';

@Controller('naver')
export class NaverController {
  constructor(private readonly naverService: NaverService) {}

  @Get()
  async getNaver(@Query('url') url: string) {
    if (!url) {
      throw new BadRequestException('Missing url param');
    }
    return this.naverService.scrape(url);
  }
}
