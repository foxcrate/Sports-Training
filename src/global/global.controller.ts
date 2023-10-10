import {
  Controller,
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
import { AvailableRoles } from 'src/auth/dtos/availableRoles.dto';
import { RoleGuard } from 'src/guards/role.guard';

@Controller('global')
export class GlobalController {
  constructor(private globalService: GlobalService) {}

  @Roles(AvailableRoles.User)
  @UseGuards(AuthGuard, RoleGuard)
  @Version('1')
  @Post('upload-image')
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
