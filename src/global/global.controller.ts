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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UploadImageReturnDto } from './dtos/upload-image-return.dto';
import { GlobalReturnDTO } from './dtos/global-return.dto';
import { FeedbackReturnDto } from './dtos/feedback-return.dto';
import { WeekDayReturnDto } from './dtos/weekday-return.dto';

@Controller('global')
export class GlobalController {
  constructor(private globalService: GlobalService) {}

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        imageFile: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({
    type: UploadImageReturnDto,
  })
  @ApiBearerAuth()
  @ApiTags('General: Upload Image')
  //
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

  @ApiCreatedResponse({
    type: GlobalReturnDTO,
    isArray: true,
  })
  @ApiTags('Global: Get All Age Groups')
  @ApiBearerAuth()
  //
  @Get('age-groups')
  @Roles(AvailableRoles.User)
  @UseGuards(AuthGuard, RoleGuard)
  @Version('1')
  async getAllAgeGroups() {
    return await this.globalService.getAllAgeGroups();
  }

  @ApiCreatedResponse({
    type: GlobalReturnDTO,
    isArray: true,
  })
  @ApiTags('Global: Get All Levels')
  @ApiBearerAuth()
  //
  @Get('levels')
  @Roles(AvailableRoles.User)
  @UseGuards(AuthGuard, RoleGuard)
  @Version('1')
  async getAllLevels() {
    return await this.globalService.getAllLevels();
  }

  @ApiCreatedResponse({
    type: GlobalReturnDTO,
    isArray: true,
  })
  @ApiTags('Global: Get All Genders')
  @ApiBearerAuth()
  //
  @Get('genders')
  @Roles(AvailableRoles.User)
  @UseGuards(AuthGuard, RoleGuard)
  @Version('1')
  async getAllGenders() {
    return await this.globalService.getAllGenders();
  }

  @ApiCreatedResponse({
    type: FeedbackReturnDto,
    isArray: true,
  })
  @ApiTags('Global: Get All Feedbacks')
  @ApiBearerAuth()
  //
  @Get('feedback')
  @Roles(AvailableRoles.User)
  @UseGuards(AuthGuard, RoleGuard)
  @Version('1')
  async getAllFeedbacks() {
    return await this.globalService.getAllFeedbacks();
  }

  @ApiCreatedResponse({
    type: WeekDayReturnDto,
    isArray: true,
  })
  @ApiTags('Global: Get All Week Days')
  @ApiBearerAuth()
  //
  @Get('week-days')
  @Roles(AvailableRoles.User)
  @UseGuards(AuthGuard, RoleGuard)
  @Version('1')
  async getAllWeekdays() {
    return await this.globalService.getAllWeekDays();
  }
}

//   {
//   validators: [new FileTypeValidator({ fileType: /\.(jpg|jpeg|png)$/ })],
// }
