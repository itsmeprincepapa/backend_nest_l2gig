import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { ProductCategory, ProductCondition } from '../../common/enums';

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

  @IsOptional()
  @IsString()
  brand?: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsEnum(ProductCategory)
  category: ProductCategory;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  storageOptions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  colors?: string[];

  @IsOptional()
  @IsEnum(ProductCondition)
  condition?: ProductCondition;

  @IsNumber()
  stock: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
