import { Controller, Post, Body, UnauthorizedException, Query } from '@nestjs/common';
import { VehiculService } from './vehicul.service';
import { CreateVehiculDto } from './dto/create-vehicul.dto';

@Controller('vehicul')
export class VehiculController {
  constructor(private readonly vehiculService: VehiculService) {}

  @Post('')
  async createVehicul(
    @Query('token') token: string,
    @Body() createVehiculDto: CreateVehiculDto
  ) {
    if (!token) {
      throw new UnauthorizedException('Token lipsă');
    }

    return this.vehiculService.create(createVehiculDto, token);
  }
}
