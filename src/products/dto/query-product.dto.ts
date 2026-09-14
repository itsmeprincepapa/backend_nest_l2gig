import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ProductCategory, ProductCondition } from '../../common/enums';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryProductDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @IsOptional()
  @IsEnum(ProductCondition)
  condition?: ProductCondition;

  @IsOptional()
  @IsString()
  search?: string;
}
