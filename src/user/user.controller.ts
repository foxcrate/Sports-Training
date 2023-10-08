import {
  Controller,
  Post,
  UseGuards,
  Version,
  Request,
  UsePipes,
  Body,
  Get,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { UserService } from './user.service';
import { JoiValidation } from 'src/pipes/joi-validaiton.pipe';
import { AddChildValidation } from 'src/user/validations/add-child.validation';
import { AuthGuard } from 'src/guards/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleGuard } from 'src/guards/role.guard';
import * as Joi from 'joi';
import { GetOneChildValidation } from './validations/get-one-child.validation';
import { NewBadRequestException } from 'src/exceptions/new-bad-request.exception';
import { UpdateChildValidation } from './validations/update-child.validation';
import { UpdateUserValidation } from './validations/update-user.validation';
import { ChildIdValidation } from 'src/child-profile/validations/child-id.validation';
import { PrismaService } from 'src/prisma/prisma.service';
import { I18n, I18nContext } from 'nestjs-i18n';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private prisma: PrismaService,
  ) {}

  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @UsePipes(new JoiValidation(UpdateUserValidation))
  @Put()
  async update1(@Body() reqBody, @Request() req: ExpressRequest) {
    return this.userService.update(reqBody, req['id']);
  }

  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @Get()
  async getOne(@Request() req: ExpressRequest) {
    return this.userService.getOne(req['id']);
  }

  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @Post()
  @UsePipes(new JoiValidation(AddChildValidation))
  async createChild1(@Body() reqBody, @Request() req: ExpressRequest) {
    return this.userService.createChild(reqBody, req['id']);
  }

  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @Get('childs')
  async getChilds(@Request() req: ExpressRequest) {
    return this.userService.getChilds(req['id']);
  }

  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @UsePipes(new JoiValidation(GetOneChildValidation))
  @Get('childs/:childId')
  async getChild(@Param() params, @Request() req: ExpressRequest) {
    // return params.childId;
    return this.userService.getChild(params.childId, req['id']);
  }

  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  // @UsePipes(new JoiValidation(UpdateChildValidation))
  @Put('childs/:childId')
  async updateChild(
    @Body(new JoiValidation(UpdateChildValidation)) reqBody,
    @Param(new JoiValidation(ChildIdValidation)) params,
    @Request() req: ExpressRequest,
  ) {
    return this.userService.updateChild(reqBody, params.childId, req['id']);
  }

  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @UsePipes(new JoiValidation(GetOneChildValidation))
  @Delete('childs/:childId')
  async deleteChild(@Param() params, @Request() req: ExpressRequest) {
    // return params.childId;
    return this.userService.deleteChild(params.childId, req['id']);
  }

  @Version('1')
  @Get('test')
  async test(@I18n() i18n: I18nContext) {
    // let childProfileWithSports: any = await this.prisma.$queryRaw`
    // SELECT
    // pp.id AS id,
    // pp.level AS level,
    // pp.regionId AS regionId,
    // pp.userId AS userId,
    // CASE
    // WHEN COUNT(s.id ) = 0 THEN null
    // ELSE
    // JSON_ARRAYAGG(JSON_OBJECT(
    //   'id',s.id,
    //   'enName', s.enName,
    //   'arName', s.arName))
    // END AS sports
    // FROM PlayerProfile AS pp
    // LEFT JOIN PlayerProfileSports AS pps ON pp.id = pps.playerProfileId
    // LEFT JOIN Sport AS s ON pps.sportId = s.id
    // WHERE pp.userId = 1
    // GROUP BY pp.id
    // LIMIT 1
    // ;`;
    // return childProfileWithSports;
    // ----------------------------------
    // let childProfileWithSports: any = await this.prisma.$queryRaw`
    // SELECT
    // cp.id AS id,
    // cp.level AS level,
    // cp.regionId AS regionId,
    // cp.childId AS childId,
    // c.id AS childId,
    // c.firstName AS firstName,
    // c.lastName AS lastName,
    // CASE
    // WHEN COUNT(s.id ) = 0 THEN null
    // ELSE
    // JSON_ARRAYAGG(JSON_OBJECT(
    //   'id',s.id,
    //   'enName', s.enName,
    //   'arName', s.arName))
    // END AS sports
    // FROM ChildProfile AS cp
    // LEFT JOIN Child AS c ON cp.childId = c.id
    // LEFT JOIN ChildProfileSports AS cps ON cp.id = cps.childProfileId
    // LEFT JOIN Sport AS s ON cps.sportId = s.id
    // WHERE cp.childId = 5
    // GROUP BY cp.id
    // ;`;
    // return childProfileWithSports[0];
    // -----------------------------------------
    return this.userService.test();
    // return i18n.t(`test.welcome`);
  }
}
