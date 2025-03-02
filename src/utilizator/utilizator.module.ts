import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma/prisma.module';
import { UtilizatorService } from './utilizator.service';
import { UtilizatorController } from './utilizator.controller';
import { JwtModule } from '@nestjs/jwt';
import { EmailModule } from '../common/email/email.module';

@Module({
  imports: [PrismaModule, JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    EmailModule
  ],
  providers: [UtilizatorService],
  controllers: [UtilizatorController]
})
export class UtilizatorModule {}
