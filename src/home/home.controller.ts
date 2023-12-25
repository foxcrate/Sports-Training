import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { HomeService } from './home.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import PageTransformPipe from 'src/pipes/page-transform.pipe';
import PageSizeTransformPipe from 'src/pipes/page-size-transform.pipe';
import { SearchFiltersDto } from './dto/search-filters.dto';
import { JoiValidation } from 'src/pipes/joi-validaiton.pipe';
import { SearchFiltersValidation } from './validations/search-filters.validations';
import { AvailableRoles } from 'src/auth/dtos/available-roles.dto';
import { SearchResultsDto } from './dto/search-result.dto';

@Roles(AvailableRoles.User)
@UseGuards(AuthGuard, RoleGuard)
@Controller({ path: 'home', version: '1' })
export class HomeController {
  constructor(private homeService: HomeService) {}

  @Post('search')
  async getSearchResults(
    @Body(new JoiValidation(SearchFiltersValidation)) filters: SearchFiltersDto,
    @Body('page', PageTransformPipe) page: number,
    @Body('pageSize', PageSizeTransformPipe) pageSize: number,
  ): Promise<SearchResultsDto> {
    return this.homeService.getSearchResults({
      ...filters,
      offset: page * pageSize,
      pageSize,
    });
  }
}
