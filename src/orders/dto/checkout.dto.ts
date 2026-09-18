import { ArrayMinSize, IsArray, IsInt } from 'class-validator';

export class CheckoutDto {
  @IsArray()
  @IsInt({ each: true })
  @ArrayMinSize(1)
  cart_item_ids!: number[];
}
