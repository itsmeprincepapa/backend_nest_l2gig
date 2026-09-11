import { Test, TestingModule } from '@nestjs/testing';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

describe('OrdersController', () => {
  let controller: OrdersController;
  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateStatus: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrdersService, useValue: mockService }],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('délègue la création au service', async () => {
    const dto: any = { items: [] };
    await controller.create(dto);
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });

  it('délègue le changement de statut au service', async () => {
    const dto: any = { status: 'VALIDEE' };
    await controller.updateStatus('order-1', dto);
    expect(mockService.updateStatus).toHaveBeenCalledWith('order-1', 'VALIDEE');
  });
});