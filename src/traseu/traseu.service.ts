import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { OpenRouteService } from '../common/openroute/openroute.service';

@Injectable()
export class TraseuService {
  constructor(
      private readonly prisma: PrismaService,
      private readonly openRoute: OpenRouteService
  ) {}

  async planificaTraseu(data: { userId: number; vehiculId?: number, oraStart: string; coordonate: { lat: number; long: number }[] }) {
    const sofer = await this.prisma.utilizator.findUnique(
      { where: { id: data.userId } }
    );

    if (!sofer) {
      throw new NotFoundException('User not found');
    }

    const durata = await this.openRoute.getRouteDuration(data.coordonate);
    console.log(new Date(data.oraStart))

    return this.prisma.traseu.create({
      data: {
        durata,
        oraStart: new Date(data.oraStart),
        coordonate: {
          create: data.coordonate,
        },
        vehiculId: data.vehiculId
      },
      include: { coordonate: true },
    });
  }
}
