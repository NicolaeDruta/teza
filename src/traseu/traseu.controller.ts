import {
  Controller,
  Post,
  Body,
} from '@nestjs/common';
import { TraseuService } from './traseu.service';

@Controller('traseu')
export class TraseuController {
  constructor(private readonly traseuService: TraseuService) {}

  @Post('planifica')
  async planificaTraseu(
    @Body()
      data: {
      userId: number;
      vehiculId?: number;
      oraStart: string;
      coordonate: { lat: number; long: number }[];
    },
  ) {
    return this.traseuService.planificaTraseu(data);
  }
}
