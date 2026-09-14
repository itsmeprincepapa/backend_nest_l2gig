import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { ProductStatus } from '../common/enums';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async findAll(query: QueryProductDto) {
    const { category, search, page = 1, limit = 10 } = query;

    const where: any = {};
    if (category) where.category = category;
    if (search) where.name = Like(`%${search}%`);

    const [items, total] = await this.productsRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { items, total, page, limit };
  }

  async findOne(id: string) {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Produit introuvable');
    }
    return product;
  }

  create(dto: CreateProductDto) {
    const status = dto.stock > 0 ? ProductStatus.EN_VENTE : ProductStatus.RUPTURE;
    const product = this.productsRepository.create({ ...dto, status });
    return this.productsRepository.save(product);
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.findOne(id);
    Object.assign(product, dto);

    if (dto.stock !== undefined) {
      product.status = dto.stock > 0 ? ProductStatus.EN_VENTE : ProductStatus.RUPTURE;
    }

    return this.productsRepository.save(product);
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
    return { message: 'Produit supprime' };
  }

  /** Utilise par le module Orders pour decrementer le stock apres une commande */
  async decrementStock(id: string, quantity: number) {
    const product = await this.findOne(id);
    if (product.stock < quantity) {
      throw new NotFoundException(`Stock insuffisant pour ${product.name}`);
    }
    product.stock -= quantity;
    product.status = product.stock > 0 ? ProductStatus.EN_VENTE : ProductStatus.RUPTURE;
    return this.productsRepository.save(product);
  }
}
