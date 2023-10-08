import {
  Controller,
  FileTypeValidator,
  Get,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';
import { GlobalService } from './global/global.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private globalService: GlobalService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('v1/upload-image')
  @UseInterceptors(FileInterceptor('imageFile'))
  uploadFile(
    @UploadedFile(new ParseFilePipe())
    file: Express.Multer.File,
  ) {
    return this.globalService.uploadFile(file);
  }
}

//   {
//   validators: [new FileTypeValidator({ fileType: /\.(jpg|jpeg|png)$/ })],
// }
