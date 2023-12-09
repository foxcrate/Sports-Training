import { Controller, Post, Version, Request, UsePipes } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { ChildService } from './child.service';
import { JoiValidation } from 'src/pipes/joi-validaiton.pipe';
import { ChildActivateAccountValidation } from './validations/child-activate-account.validation';

@Controller('child')
export class ChildController {
  constructor(private childService: ChildService) {}

  @Post('activate-account')
  @Version('1')
  @UsePipes(new JoiValidation(ChildActivateAccountValidation))
  async activateAccount1(@Request() req: ExpressRequest) {
    return await this.childService.activateAccount(req.body);
  }
}
