import { Controller, Post, UseGuards, Version, Request, UsePipes } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { ChildService } from './child.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { JoiValidation } from 'src/pipes/joi_validaiton.pipe';
import { ChildActivateAccountValidation } from './validaitons/activate_account.validation';

@Controller('child')
export class ChildController {
  constructor(private childService: ChildService) {}

  @Version('1')
  // @Roles('child')
  // @UseGuards(AuthGuard, RoleGuard)
  @UsePipes(new JoiValidation(ChildActivateAccountValidation))
  @Post('activate_account')
  async activateAccount1(@Request() req: ExpressRequest) {
    return this.childService.activateAccount(req.body);
  }
}
