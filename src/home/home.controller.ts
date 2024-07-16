import { Body, Controller, Post, UseGuards, UsePipes, Version } from '@nestjs/common';
import { HomeService } from './home.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { SearchFiltersDto } from './dto/search-filters.dto';
import { JoiValidation } from 'src/pipes/joi-validaiton.pipe';
import { SearchFiltersValidation } from './validations/search-filters.validations';
import { AvailableRoles } from 'src/auth/dtos/available-roles.dto';
import { SearchResultsDto } from './dto/search-result.dto';
import { PaginationTransformPipe } from 'src/pipes/pagination-transform.pipe';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { SwaggerErrorResponse } from 'src/global/classes/swagger-error-response';
import { UserId } from 'src/decorators/user-id.decorator';
import { ChildHomeDto } from './dto/child-home.dto';
import { TrainerHomeDto } from './dto/trainer-home.dto';
import { PlayerHomeDto } from './dto/player-home.dto';

// @Roles(AvailableRoles.User)
// @UseGuards(AuthGuard, RoleGuard)
// @Controller({ path: 'home', version: '1' })
@Controller('home')
export class HomeController {
  constructor(private homeService: HomeService) {}

  @ApiBody({
    type: SearchFiltersDto,
  })
  @ApiCreatedResponse({
    type: SearchResultsDto,
  })
  @ApiBadRequestResponse(new SwaggerErrorResponse('WRONG_FILTER_TYPE').init())
  @ApiTags('Home: Search')
  @ApiBearerAuth()
  //
  @Post('search')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  @UsePipes(PaginationTransformPipe)
  async getSearchResults(
    @Body(new JoiValidation(SearchFiltersValidation)) filters: SearchFiltersDto,
  ): Promise<SearchResultsDto> {
    return this.homeService.getSearchResults(filters);
  }

  @ApiCreatedResponse({
    type: PlayerHomeDto,
  })
  // @ApiBadRequestResponse(new SwaggerErrorResponse('WRONG_FILTER_TYPE').init())
  @ApiTags('Home: Player')
  @ApiBearerAuth()
  //
  @Post('player')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async playerHome(@UserId() userId: number) {
    return this.homeService.getPlayerHome(userId);
  }

  @ApiCreatedResponse({
    type: TrainerHomeDto,
  })
  // @ApiBadRequestResponse(new SwaggerErrorResponse('WRONG_FILTER_TYPE').init())
  @ApiTags('Home: Trainer')
  @ApiBearerAuth()
  //
  @Post('trainer')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async trainerHome(@UserId() userId: number) {
    return this.homeService.getTrainerHome(userId);
  }

  // @ApiBody({
  //   type: SearchFiltersDto,
  // })
  @ApiCreatedResponse({
    type: ChildHomeDto,
  })
  // @ApiBadRequestResponse(new SwaggerErrorResponse('WRONG_FILTER_TYPE').init())
  @ApiTags('Home: Child')
  @ApiBearerAuth()
  //
  @Post('child')
  @Version('1')
  @Roles('user')
  @UseGuards(AuthGuard, RoleGuard)
  async childHome(@UserId() userId: number) {
    return this.homeService.getChildHome(userId);
  }
}
