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

      const user = await this.prisma.utilizator.create({
        data: {
          ...createUserDto,
          parola: hashedPassword,
          statut: createUserDto.tip === "Pasager" ? "Active" : "In Review",
        },
      });

      return { message: 'User created successfully', user };
    } catch (error) {
      console.error('Error creating user:', error); // Log the actual error
      // throw new InternalServerErrorException('Unable to create user');
    }
  }

  async login(nume: string, parola: string) {
    console.log(`[${new Date().toISOString()}] Starting login process for user: ${nume}`);

    // Find the user by username
    const user = await this.prisma.utilizator.findUnique({ where: { nume } });
    console.log(`[${new Date().toISOString()}] User lookup completed. User found: ${user ? 'Yes' : 'No'}`);

    if (!user) {
      console.log(`[${new Date().toISOString()}] User not found, throwing NotFoundException.`);
      throw new NotFoundException('User not found');
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(parola, user.parola);
    console.log(`[${new Date().toISOString()}] Password comparison result: ${isPasswordValid}`);

    if (!isPasswordValid) {
      console.log(`[${new Date().toISOString()}] Password invalid, throwing UnauthorizedException.`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Prepare payload for JWT
    const payload = { userId: user.id, username: user.nume };
    console.log(`[${new Date().toISOString()}] JWT payload prepared: ${JSON.stringify(payload)}`);

    // Sign the JWT token with the specified secret and expiry time
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'yourSecretKeyHere',
      expiresIn: '1h',
    });
    console.log(`[${new Date().toISOString()}] JWT token generated.`);

    // Send a login notification email
    this.emailService.sendLoginNotification(user.email, user.nume);
    console.log(`[${new Date().toISOString()}] Login notification email sent to ${user.email}.`);

    console.log(`[${new Date().toISOString()}] Login process completed successfully.`);
    return { message: 'Login successful', token, userType: user.tip };
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
