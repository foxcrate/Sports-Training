import { Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';
import { AWSS3Utility } from './utils/aws-s3.util';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('v1/upload-image')
  @UseInterceptors(FileInterceptor('image-file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return AWSS3Utility.uploadFile(file);
  }
}
