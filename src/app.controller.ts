import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { UserService } from './user/user.service';
import { ConfigService } from 'aws-sdk';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private userService: UserService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/test')
  async test() {
    // let x = await this.userService.getAll();
    let y = process.env.DATABASE_URL;
    console.log('alo2');

    console.log(y);
  }
}
