import { IsNotEmpty, IsString } from 'class-validator';

export class ApplySellerDto {
  @IsNotEmpty()
  @IsString()
  gender!: string;

  @IsNotEmpty()
  @IsString()
  address!: string;
}
