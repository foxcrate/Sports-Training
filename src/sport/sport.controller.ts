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
import { JoiValidation } from 'src/pipes/joi-validaiton.pipe';
import { AuthGuard } from 'src/guards/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleGuard } from 'src/guards/role.guard';
import { SportService } from './sport.service';
import { AddSportValidation } from './validations/create.validation';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SwaggerErrorResponse } from 'src/global/classes/swagger-error-response';
import { CreateSportDto } from './dtos/create.dto';
import { ReturnSportDto } from './dtos/return.dto';

@Controller('sport')
export class SportController {
  constructor(private sportService: SportService) {}

  @ApiBody({
    type: CreateSportDto,
  })
  @ApiCreatedResponse({
    type: ReturnSportDto,
  })
  @ApiBadRequestResponse(new SwaggerErrorResponse('REPEATED_SPORT').init())
  @ApiTags('Sport: Create')
  @ApiBearerAuth()
  //
  @Post()
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @UsePipes(new JoiValidation(AddSportValidation))
  async create1(@Body() reqBody, @Request() req: ExpressRequest) {
    return await this.sportService.create(reqBody);
  }

  @ApiCreatedResponse({
    type: ReturnSportDto,
    isArray: true,
  })
  @ApiTags('Sport: Get All')
  @ApiBearerAuth()
  //
  @Get()
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async getAll() {
    return await this.sportService.getAll();
  }
}
