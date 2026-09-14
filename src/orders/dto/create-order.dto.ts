import { Type } from 'class-transformer';
import {
  ArrayNotEmpty, IsArray, IsInt, IsOptional, IsPositive, IsString, ValidateNested,
} from 'class-validator';

class OrderItemInputDto {
  @IsString()
  productId: string;

  @IsOptional()
  @IsString()
  storage?: string;

  @IsOptional()
  @IsString()
  color?: string;

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
