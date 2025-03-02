import { Module } from '@nestjs/common';
import { VehiculService } from './vehicul.service';
import { VehiculController } from './vehicul.controller';
import { PrismaModule } from '../common/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { EmailModule } from '../common/email/email.module';
import { UtilizatorService } from '../utilizator/utilizator.service';

@Module({
  imports: [PrismaModule, JwtModule.register({
    secret: process.env.JWT_SECRET,
    signOptions: { expiresIn: '1h' },
  }),
    EmailModule
  ],
  providers: [VehiculService, UtilizatorService],
  controllers: [VehiculController]
})
export class VehiculModule {}
