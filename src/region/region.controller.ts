import {
  Controller,
  Post,
  UseGuards,
  Version,
  Request,
  UsePipes,
  Body,
  Get,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { RegionService } from './region.service';
import { JoiValidation } from 'src/pipes/joi-validaiton.pipe';
import { AddRegionValidation } from 'src/region/validaitons/create.validation';
import { AuthGuard } from 'src/guards/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleGuard } from 'src/guards/role.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RegionReturnDto } from './dtos/return.dto';
import { SwaggerErrorResponse } from 'src/global/classes/swagger-error-response';
import { RegionCreateDto } from './dtos/create.dto';

@Controller('region')
export class RegionController {
  constructor(private regionService: RegionService) {}

  @ApiBody({
    type: RegionCreateDto,
  })
  @ApiCreatedResponse({
    type: RegionReturnDto,
  })
  @ApiBadRequestResponse(new SwaggerErrorResponse('REPEATED_REGION').init())
  @ApiTags('Region: Create')
  @ApiBearerAuth()
  //
  @Post()
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @UsePipes(new JoiValidation(AddRegionValidation))
  async create1(@Body() reqBody, @Request() req: ExpressRequest) {
    return await this.regionService.create(reqBody);
  }

  @ApiCreatedResponse({
    type: RegionReturnDto,
    isArray: true,
  })
  @ApiTags('Region: Get All')
  @ApiBearerAuth()
  //
  @Get()
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async getAll() {
    return await this.regionService.getAll();
  }
}
