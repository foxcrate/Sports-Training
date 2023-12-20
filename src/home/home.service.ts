import { Injectable } from '@nestjs/common';
import { HomeModel } from './home.model';
import { SearchFiltersDto } from './dto/search-filters.dto';

@Injectable()
export class HomeService {
  constructor(private homeModel: HomeModel) {}

  async getSearchResults(filters: SearchFiltersDto) {}
}
