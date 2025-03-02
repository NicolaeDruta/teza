import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './common/prisma/prisma.module';
import { UtilizatorModule } from './utilizator/utilizator.module';
import { TraseuModule } from './traseu/traseu.module';
import { VehiculModule } from './vehicul/vehicul.module';

@Module({
  imports: [PrismaModule, UtilizatorModule, TraseuModule, VehiculModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
