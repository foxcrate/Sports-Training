import {
  Controller,
  Get,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Version,
} from '@nestjs/common';
import { GlobalService } from './global.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/decorators/roles.decorator';
import { AvailableRoles } from 'src/auth/dtos/available-roles.dto';
import { RoleGuard } from 'src/guards/role.guard';

@Controller('global')
export class GlobalController {
  constructor(private globalService: GlobalService) {}

  @Post('upload-image')
  @Roles(AvailableRoles.User)
  @UseGuards(AuthGuard, RoleGuard)
  @Version('1')
  @UseInterceptors(FileInterceptor('imageFile'))
  async uploadFile(
    @UploadedFile(new ParseFilePipe())
    file: Express.Multer.File,
  ) {
    return await this.globalService.uploadFile(file);
  }

  @Get('age-groups')
  @Roles(AvailableRoles.User)
  @UseGuards(AuthGuard, RoleGuard)
  @Version('1')
  async getAllAgeGroups() {
    return await this.globalService.getAllAgeGroups();
  }

  @Get('feedback')
  @Roles(AvailableRoles.User)
  @UseGuards(AuthGuard, RoleGuard)
  @Version('1')
  async getAllFeedbacks() {
    return await this.globalService.getAllFeedbacks();
  }
}

//   {
//   validators: [new FileTypeValidator({ fileType: /\.(jpg|jpeg|png)$/ })],
// }
