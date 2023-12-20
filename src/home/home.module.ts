import { Module } from '@nestjs/common';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { HomeModel } from './home.model';

@Module({
  controllers: [HomeController],
  providers: [HomeService, HomeModel],
})
export class HomeModule {}
