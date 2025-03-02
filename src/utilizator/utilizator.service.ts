import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { EmailService } from '../common/email/email.service';

@Injectable()
export class UtilizatorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService
  ) {}

  async register(createUserDto: CreateUserDto) {
    try {
      const hashedPassword = await bcrypt.hash(createUserDto.parola, 10);

      return await this.prisma.utilizator.create({
        data: {
          ...createUserDto,
          parola: hashedPassword,
          statut: createUserDto.tip === "Pasager" ? "Active" : "In Review",
        },
      });
    } catch (error) {
      throw new NotFoundException('Unable to create user');
    }
  }

  async login(nume: string, parola: string) {
    const user = await this.prisma.utilizator.findUnique(
      { where: { nume } }
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(parola, user.parola);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { userId: user.id, username: user.nume };

    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'yourSecretKeyHere',
      expiresIn: '1h',
    });

    await this.emailService.sendLoginNotification(user.email, user.nume);

    return { message: 'Login successful', token };
  }

  async getUserByToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token);

      const userId = decoded.userId;

      const user = await this.prisma.utilizator.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid token or user not found');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async shareFeedback(userId: string, evaluare: string, descriere: string, token: string) {
    const user = await this.prisma.utilizator.findUnique(
      { where: { id: parseInt(userId) } }
    );

    const decoded = this.jwtService.verify(token);
    const creator = decoded.username;

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const total_evaluare = user.total_evaluare + 1
    const rating = (user.evaluare * user.total_evaluare + parseInt(evaluare)) / total_evaluare;

    await this.prisma.utilizator.updateMany({
      data: {
        evaluare: rating,
        total_evaluare
      }
    })

    return this.prisma.feedback.create({
      data: {
        evaluare: parseFloat(evaluare),
        descriere,
        utilizatorId: parseInt(userId),
        creator: creator
      }
    })
  }
}
