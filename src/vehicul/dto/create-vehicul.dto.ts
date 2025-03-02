import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateVehiculDto {
  @IsString()
  @IsNotEmpty()
  nume: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsString()
  @IsNotEmpty()
  numar: string;

  @IsString()
  @IsNotEmpty()
  culoare: string;

  @IsInt()
  @Min(1)
  capacitate: number;

  @IsInt()
  soferId: number;
}
