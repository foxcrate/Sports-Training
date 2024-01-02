import { Body, Controller, Post, UseGuards, UsePipes } from '@nestjs/common';
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

@Roles(AvailableRoles.User)
@UseGuards(AuthGuard, RoleGuard)
@Controller({ path: 'home', version: '1' })
export class HomeController {
  constructor(private homeService: HomeService) {}

  @Post('search')
  @UsePipes(PaginationTransformPipe)
  async getSearchResults(
    @Body(new JoiValidation(SearchFiltersValidation)) filters: SearchFiltersDto,
  ): Promise<SearchResultsDto> {
    return this.homeService.getSearchResults(filters);
  }
}
