import {
  Controller,
  Post,
  UseGuards,
  Version,
  Request,
  UsePipes,
  Body,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { RegionService } from './region.service';
import { JoiValidation } from 'src/pipes/joi-validaiton.pipe';
import { AddRegionValidation } from 'src/region/validaitons/create.validation';
import { AuthGuard } from 'src/guards/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleGuard } from 'src/guards/role.guard';

@Controller('region')
export class RegionController {
  constructor(private regionService: RegionService) {}

  @Post()
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @UsePipes(new JoiValidation(AddRegionValidation))
  async create1(@Body() reqBody, @Request() req: ExpressRequest) {
    return this.regionService.create(reqBody, req['id']);
  }
}
