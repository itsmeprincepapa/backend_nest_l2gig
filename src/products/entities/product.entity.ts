import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductCategory, ProductCondition, ProductStatus } from '../../common/enums';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  reference: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 'Apple' })
  brand: string;

  @Column()
  model: string; // ex: 'iPhone 15 Pro Max'

  @Column({ type: 'enum', enum: ProductCategory })
  category: ProductCategory;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ name: 'storage_options', type: 'simple-array', nullable: true })
  storageOptions: string[]; // ex: ['64GB','128GB','256GB'] (vide pour un accessoire)

  @Column({ type: 'simple-array', nullable: true })
  colors: string[]; // ex: ['Noir', 'Titane naturel', 'Bleu']

  @Column({
    type: 'enum',
    enum: ProductCondition,
    default: ProductCondition.NEUF,
  })
  condition: ProductCondition;

  @Column({ default: 0 })
  stock: number;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.EN_VENTE,
  })
  status: ProductStatus;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
