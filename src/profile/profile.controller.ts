import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AvailableRoles } from 'src/auth/dtos/available-roles.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { ProfileService } from './profile.service';
import { JoiValidation } from 'src/pipes/joi-validaiton.pipe';
import { UserId } from 'src/decorators/user-id.decorator';
import { GetProfilesValidations } from './validations/get-profiles.validations';
import { GetProfilesFiltersDto } from './dto/get-profiles-filters.dto';
import { GetProfilesResultDto } from './dto/get-profiles-result.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PROFILE_TYPES_ENUM } from 'src/global/enums';

@Roles(AvailableRoles.User)
@UseGuards(AuthGuard, RoleGuard)
@Controller({ path: 'profile', version: '1' })
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @ApiQuery({
    name: 'type',
    enum: PROFILE_TYPES_ENUM,
    required: false,
  })
  @ApiQuery({
    name: 'childId',
    type: Number,
    required: false,
  })
  @ApiCreatedResponse({
    type: GetProfilesResultDto,
    isArray: true,
  })
  @ApiTags('Profile: Get Profiles')
  @ApiBearerAuth()
  //
  @Get('')
  async getProfiles(
    @Query(new JoiValidation(GetProfilesValidations)) filters: GetProfilesFiltersDto,
    @UserId() userId: number,
  ): Promise<GetProfilesResultDto[]> {
    return this.profileService.getProfiles(
      userId,
      filters.type,
      parseInt(filters.childId || '0', 10),
    );
  }
}
