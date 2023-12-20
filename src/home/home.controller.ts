import { Controller, Get, Query, UseGuards } from '@nestjs/common';
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

@Roles(AvailableRoles.User)
@UseGuards(AuthGuard, RoleGuard)
@Controller({ path: 'home', version: '1' })
export class HomeController {
  constructor(private homeService: HomeService) {}

  @Get('search')
  async getSearchResults(
    @Query(new JoiValidation(SearchFiltersValidation)) filters: SearchFiltersDto,
    @Query('page', PageTransformPipe) page: number,
    @Query('pageSize', PageSizeTransformPipe) pageSize: number,
  ) /*: SearchResultDto[]*/ {
    return this.homeService.getSearchResults({
      ...filters,
      page,
      pageSize,
    });
  }
}
