import { Controller, Post, Version, Request, UsePipes } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { ChildService } from './child.service';
import { JoiValidation } from 'src/pipes/joi-validaiton.pipe';
import { ChildActivateAccountValidation } from './validations/child-activate-account.validation';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SwaggerErrorResponse } from 'src/global/classes/swagger-error-response';
import { ReturnUserDto } from 'src/user/dtos/return.dto';

@Controller('child')
export class ChildController {
  constructor(private childService: ChildService) {}

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        mobileNumber: {
          type: 'string',
        },
        password: {
          type: 'string',
        },
      },
    },
  })
  @ApiCreatedResponse({
    type: ReturnUserDto,
  })
  @ApiNotFoundResponse(new SwaggerErrorResponse('ACCOUNT_ALREADY_ACTIVATED').init())
  @ApiTags('Child: Activate Account')
  //
  @Post('activate-account')
  @Version('1')
  @UsePipes(new JoiValidation(ChildActivateAccountValidation))
  async activateAccount1(@Request() req: ExpressRequest) {
    return await this.childService.activateAccount(req.body);
  }
}
