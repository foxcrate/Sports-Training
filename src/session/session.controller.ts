import { Body, Controller, Post, UseGuards, Version } from '@nestjs/common';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { UserId } from 'src/decorators/user-id.decorator';
import { JoiValidation } from 'src/pipes/joi-validaiton.pipe';
import { RateSessionValidation } from './dtos/rate-session.validation';
import { RateSessionDto } from './dtos/rate-session.dto';
import { SessionService } from './session.service';

@Controller('session')
export class SessionController {
  constructor(private sessionService: SessionService) {}

  @Post('/player-rate')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async rateSession1(
    @Body(new JoiValidation(RateSessionValidation)) reqBody: RateSessionDto,
    @UserId() userId: number,
  ) {
    return await this.sessionService.playerRateSession(userId, reqBody);
  }
}
