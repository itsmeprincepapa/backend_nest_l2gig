import {
  IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, ArrayNotEmpty,
} from 'class-validator';
import { ProductCategory } from '../../common/enums';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  reference: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ProductCategory)
  category: ProductCategory;

  @IsNumber()
  @IsPositive()
  price: number;

  @ArrayNotEmpty()
  sizes: string[];

  @IsNumber()
  stock: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
