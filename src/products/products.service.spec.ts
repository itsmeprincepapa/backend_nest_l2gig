import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { ProductCategory, ProductStatus } from '../common/enums';

describe('ProductsService', () => {
  let service: ProductsService;
  const mockRepo = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn((data) => data),
    save: jest.fn((data) => Promise.resolve({ id: '1', ...data })),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: mockRepo },
      ],
    }).compile();

    service = moduleRef.get(ProductsService);
  });

  it('filtre les produits par categorie', async () => {
    mockRepo.findAndCount.mockResolvedValue([[], 0]);
    await service.findAll({ category: ProductCategory.IPHONE, page: 1, limit: 10 } as any);
    expect(mockRepo.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({ where: { category: ProductCategory.IPHONE } }),
    );
  });

  it('passe le statut a RUPTURE quand le stock cree est a 0', async () => {
    const result = await service.create({
      name: 'iPhone 13', reference: 'REF001', model: 'iPhone 13', category: ProductCategory.IPHONE,
      price: 350000, storageOptions: ['128GB'], stock: 0,
    } as any);
    expect(result.status).toBe(ProductStatus.RUPTURE);
  });
});
