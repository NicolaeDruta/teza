import { Controller, Post, Body, UnauthorizedException, Query } from '@nestjs/common';
import { VehiculService } from './vehicul.service';
import { CreateVehiculDto } from './dto/create-vehicul.dto';

@Controller('vehicul')
export class VehiculController {
  constructor(private readonly vehiculService: VehiculService) {}

  @Post('')
  async createVehicul(
    @Query('id') id: string,
    @Body() createVehiculDto: CreateVehiculDto
  ) {
    if (!id) {
      throw new UnauthorizedException('Id utilizator lipsă');
    }

    return this.vehiculService.create(createVehiculDto, id);
  }
}
