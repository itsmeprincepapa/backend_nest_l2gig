import { Type } from 'class-transformer';
import {
  ArrayNotEmpty, IsArray, IsInt, IsPositive, IsString, ValidateNested,
} from 'class-validator';

class OrderItemInputDto {
  @IsString()
  productId: string;

  @IsString()
  size: string;

  @IsInt()
  @IsPositive()
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => OrderItemInputDto)
  items: OrderItemInputDto[];
}
