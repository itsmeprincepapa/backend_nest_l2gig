import { IsInt, IsNotEmpty, IsString, IsUUID, Min } from 'class-validator';

export class CreateOrderItemDto {
  @IsUUID()
  productId: string;

  @IsString()
  @IsNotEmpty()
  size: string;

  @IsInt()
  @Min(1)
  quantity: number;
}