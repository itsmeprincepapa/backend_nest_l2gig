import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatus } from './entities/order-status.enum';
import { CreateOrderDto } from './dto/create-order.dto/create-order.dto';

const FREE_SHIPPING_THRESHOLD = 50000;
const STANDARD_SHIPPING_FEE = 2000;

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly ordersRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepo: Repository<OrderItem>,
  ) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    let totalAmount = 0;
    const items: OrderItem[] = [];

    for (const line of dto.items) {
      const unitPrice = 5000;
      const item = this.orderItemsRepo.create({
        productId: line.productId,
        size: line.size,
        quantity: line.quantity,
        unitPrice,
      });
      items.push(item);
      totalAmount += unitPrice * line.quantity;
    }

    const shippingFee =
      totalAmount >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;

    const order = this.ordersRepo.create({
      orderNumber: await this.generateOrderNumber(),
      items,
      totalAmount,
      shippingFee,
      status: OrderStatus.EN_ATTENTE,
    });

    return this.ordersRepo.save(order);
  }

  private async generateOrderNumber(): Promise<string> {
    const count = await this.ordersRepo.count();
    return `#${String(count + 1).padStart(4, '0')}`;
  }

  async findAll(): Promise<Order[]> {
    return this.ordersRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.ordersRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Commande introuvable');
    return order;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.ordersRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Commande introuvable');

    order.status = status;
    return this.ordersRepo.save(order);
  }

  async remove(id: string): Promise<void> {
    const result = await this.ordersRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Commande introuvable');
    }
  }
}