import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  parola: string;

  @IsString()
  @IsNotEmpty()
  nume: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsOptional()
  statut?: string;

  @IsString()
  @IsNotEmpty()
  tip: string;

  @IsNumber()
  @IsOptional()
  evalure?: number;
}
