import { Test, TestingModule } from '@nestjs/testing';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatus } from './entities/order-status.enum';

describe('OrdersService', () => {
  let service: OrdersService;
  let ordersRepo: any;
  let orderItemsRepo: any;

  beforeEach(async () => {
    ordersRepo = {
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve({ id: 'order-1', ...data })),
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
    };

    orderItemsRepo = {
      create: jest.fn((data) => data),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: ordersRepo },
        { provide: getRepositoryToken(OrderItem), useValue: orderItemsRepo },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('calcule correctement le total à partir des items', async () => {
      const dto = {
        items: [{ productId: 'p1', size: 'M', quantity: 2 }],
      } as any;

      const order = await service.create(dto);

      expect(order.totalAmount).toBe(10000);
    });

    it('applique des frais de livraison si le total est sous le seuil', async () => {
      const dto = {
        items: [{ productId: 'p1', size: 'M', quantity: 1 }],
      } as any;

      const order = await service.create(dto);

      expect(order.shippingFee).toBe(2000);
    });

    it('applique la livraison gratuite au-dessus du seuil', async () => {
      const dto = {
        items: [{ productId: 'p1', size: 'M', quantity: 15 }],
      } as any;

      const order = await service.create(dto);

      expect(order.totalAmount).toBe(75000);
      expect(order.shippingFee).toBe(0);
    });

    it('initialise le statut à EN_ATTENTE', async () => {
      const dto = {
        items: [{ productId: 'p1', size: 'M', quantity: 1 }],
      } as any;

      const order = await service.create(dto);

      expect(order.status).toBe(OrderStatus.EN_ATTENTE);
    });
  });

  describe('findOne', () => {
    it('retourne la commande si elle existe', async () => {
      ordersRepo.findOne.mockResolvedValue({ id: 'order-1' });

      const order = await service.findOne('order-1');

      expect(order.id).toBe('order-1');
    });

    it("lève une erreur si la commande n'existe pas", async () => {
      ordersRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateStatus', () => {
    it('met à jour le statut de EN_ATTENTE à VALIDEE', async () => {
      ordersRepo.findOne.mockResolvedValue({
        id: 'order-1',
        status: OrderStatus.EN_ATTENTE,
      });
      ordersRepo.save.mockImplementation((o: any) => Promise.resolve(o));

      const updated = await service.updateStatus(
        'order-1',
        OrderStatus.VALIDEE,
      );

      expect(updated.status).toBe(OrderStatus.VALIDEE);
    });

    it("lève une erreur si la commande n'existe pas", async () => {
      ordersRepo.findOne.mockResolvedValue(null);

      await expect(
        service.updateStatus('unknown', OrderStatus.VALIDEE),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('supprime la commande si elle existe', async () => {
      ordersRepo.delete.mockResolvedValue({ affected: 1 });

      await expect(service.remove('order-1')).resolves.toBeUndefined();
    });

    it("lève une erreur si la commande n'existe pas", async () => {
      ordersRepo.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
