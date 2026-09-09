import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  category_name!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsInt()
  @IsNotEmpty()
  parent_id!: number;
}
