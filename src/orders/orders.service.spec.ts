import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { ProductsService } from '../products/products.service';
import { Role } from '../common/enums/role.enum';

describe('OrdersService', () => {
  let service: OrdersService;
  const mockOrderRepo = {
    create: jest.fn((d) => d),
    save: jest.fn((d) => Promise.resolve({ id: 'o1', ...d })),
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
    remove: jest.fn(),
  };
  const mockOrderItemRepo = { create: jest.fn((d) => d) };
  const mockProductsService = {
    findOne: jest.fn().mockResolvedValue({ id: 'p1', name: 'Costume', price: 10000, stock: 5 }),
    decrementStock: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: mockOrderRepo },
        { provide: getRepositoryToken(OrderItem), useValue: mockOrderItemRepo },
        { provide: ProductsService, useValue: mockProductsService },
      ],
    }).compile();

    service = moduleRef.get(OrdersService);
  });

  it('calcule le total a partir du prix produit, pas du frontend', async () => {
    const dto = { items: [{ productId: 'p1', size: 'M', quantity: 2 }] };
    const order = await service.create('client1', dto as any);
    expect(order.totalAmount).toBe(20000); // 10000 * 2
  });

  it("bloque l'acces a la commande d'un autre client", async () => {
    mockOrderRepo.findOne.mockResolvedValue({
      id: 'o1', client: { id: 'autre-client' }, items: [],
    });

    await expect(
      service.findOne('o1', { id: 'client1', role: Role.CLIENT }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('autorise un admin a voir toutes les commandes', async () => {
    mockOrderRepo.findOne.mockResolvedValue({
      id: 'o1', client: { id: 'autre-client' }, items: [],
    });

    const result = await service.findOne('o1', { id: 'admin1', role: Role.ADMIN });
    expect(result).toBeDefined();
  });
});
