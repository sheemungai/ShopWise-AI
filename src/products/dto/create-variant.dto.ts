import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateVariantDto {
  @IsString()
  @IsNotEmpty()
  size!: string;

  @IsString()
  @IsNotEmpty()
  color!: string;

  @IsInt()
  @Min(0)
  stock!: number;
}
