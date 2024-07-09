import { Body, Controller, Post, UseGuards, Version } from '@nestjs/common';
import { PackageService } from './package.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SwaggerErrorResponse } from 'src/global/classes/swagger-error-response';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { JoiValidation } from 'src/pipes/joi-validaiton.pipe';
import { UserId } from 'src/decorators/user-id.decorator';

@Controller('player/package')
export class PlayerPackageController {
  constructor(private packageService: PackageService) {}

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        trainerProfileId: {
          type: 'number',
        },
        slotId: {
          type: 'number',
        },
        dayDate: {
          type: 'string',
          // format: 'date-time',
        },
      },
    },
  })
  @ApiCreatedResponse({
    // type: SessionCardDTO,
  })
  @ApiBadRequestResponse(new SwaggerErrorResponse('PASSED_DATE').init())
  @ApiTags('Trainer-Schedule: User: Book Session')
  @ApiBearerAuth()
  //
  @Post('/book')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async bookTrainerSession(
    // @Body(new JoiValidation(BookTrainerSessionValidation)) reqBody,
    @UserId() userId: number,
  ) {
    // return await this.packageService.bookTrainerSession(
    //   userId,
    //   reqBody.trainerProfileId,
    //   reqBody.dayDate,
    //   reqBody.slotId,
    // );
  }
}
