import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateVehiculDto } from './dto/create-vehicul.dto';
import { UtilizatorService } from '../utilizator/utilizator.service';

@Injectable()
export class VehiculService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly utilizator: UtilizatorService
  ) {}

  async create(data: CreateVehiculDto, soferId: string) {
    const existingVehicul = await this.prisma.vehicul.findFirst({
      where: { soferId: Number(soferId) },
    });

    if (existingVehicul) {
      throw new UnauthorizedException('Acest șofer are deja un vehicul asociat');
    }

    return this.prisma.vehicul.create({
      data: { ...data, soferId: Number(soferId) },
    });
  }
}
