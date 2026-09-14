import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ProductCategory } from '../../common/enums';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryProductDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @IsOptional()
  @IsString()
  search?: string;
}
