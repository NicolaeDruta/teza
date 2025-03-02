import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { UtilizatorService } from './utilizator.service';
import { CreateUserDto } from './dto/create-user.dto';
import {
  uploadCarDocumentInterceptor,
  uploadDriverDocumentInterceptor,
} from '../common/interceptors/file-upload.interceptor';

@Controller('utilizator')
export class UtilizatorController {
  constructor(private readonly userService: UtilizatorService) {}

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.userService.register(createUserDto);
  }

  @Post('upload-driver-document/:userId')
  @UseInterceptors(uploadDriverDocumentInterceptor)
  uploadDriverDocument(
    @Param('userId') userId: string,
    @UploadedFiles() files: { front?: Express.Multer.File[]; back?: Express.Multer.File[] }
  ) {
    return {
      message: 'Files uploaded and encrypted successfully',
      files,
    };
  }

  @Post('upload-car-document/:userId')
  @UseInterceptors(uploadCarDocumentInterceptor)
  async uploadCarDocument(
    @Param('userId') userId: string,
    @UploadedFiles() files: { front?: Express.Multer.File[]; back?: Express.Multer.File[] }
  ) {
    return {
      message: 'Files processed successfully: text extracted and encrypted',
      files,
    };
  }

  @Post('login')
  async login(@Body() body: { nume: string; parola: string }) {
    return this.userService.login(body.nume, body.parola);
  }

  @Get('/')
  async getUserByToken(
    @Query('token') token: string
  ) {
    return this.userService.getUserByToken(token);
  }

  @Post('share-feedback/:userId')
  async shareFeedback(
    @Param('userId') userId: string,
    @Query('token') token: string,
    @Body() body: { evaluare: string; descriere: string }
  ) {
    return this.userService.shareFeedback(userId, body.evaluare, body.descriere, token);
  }
}
