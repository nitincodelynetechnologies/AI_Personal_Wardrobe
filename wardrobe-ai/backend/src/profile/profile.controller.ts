import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PublicUser } from '../users/interfaces/user.interface';
import {
  CombinedProfileResponseDto,
  UpdatePreferencesResponseDto,
} from './dto/profile-response.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileService } from './profile.service';

@ApiTags('profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Fetch combined profile and preferences' })
  @ApiResponse({ status: 200, type: CombinedProfileResponseDto })
  getProfile(@CurrentUser() user: PublicUser) {
    return this.profileService.getCombinedProfile(user.id);
  }

  @Put()
  @ApiOperation({ summary: 'Update demographic profile attributes' })
  @ApiResponse({ status: 200, type: CombinedProfileResponseDto })
  updateProfile(@CurrentUser() user: PublicUser, @Body() dto: UpdateProfileDto) {
    return this.profileService.updateProfile(user.id, dto);
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Update preferences and recalculate Fashion DNA' })
  @ApiResponse({ status: 200, type: UpdatePreferencesResponseDto })
  updatePreferences(
    @CurrentUser() user: PublicUser,
    @Body() dto: UpdatePreferencesDto,
  ) {
    return this.profileService.updatePreferences(user.id, dto);
  }
}
