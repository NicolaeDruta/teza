import { Module } from '@nestjs/common';
import { TraseuController } from './traseu.controller';
import { TraseuService } from './traseu.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { OpenRouteService } from '../common/openroute/openroute.service';
import { TraseuGateway } from './traseu.gateway';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule.register({
    secret: process.env.JWT_SECRET,
    signOptions: { expiresIn: '1h' },
  })],
  controllers: [TraseuController],
  providers: [TraseuService, PrismaService, OpenRouteService, TraseuGateway],
})
export class TraseuModule {}
