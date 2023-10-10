import {
  Controller,
  FileTypeValidator,
  Get,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';
import { GlobalService } from './global/global.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { Roles } from './decorators/roles.decorator';
import { AvailableRoles } from './auth/dtos/availableRoles.dto';

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

  // @Roles(AvailableRoles.User)
  // @UseGuards(AuthGuard)
  // @Post('v1/upload-image')
  // @UseInterceptors(FileInterceptor('imageFile'))
  // uploadFile(
  //   @UploadedFile(new ParseFilePipe())
  //   file: Express.Multer.File,
  // ) {
  //   return this.globalService.uploadFile(file);
  // }
}

//   {
//   validators: [new FileTypeValidator({ fileType: /\.(jpg|jpeg|png)$/ })],
// }
