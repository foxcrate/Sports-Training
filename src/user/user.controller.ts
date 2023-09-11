import { Controller, Post, UseGuards, Version, Request } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { UserService } from './user.service';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Version('1')
  @UseGuards(AuthGuard)
  @Post('verifyPhone')
  async verifyPhone(@Request() req: ExpressRequest) {
    return this.userService.verifyPhone(req);
  }
}
