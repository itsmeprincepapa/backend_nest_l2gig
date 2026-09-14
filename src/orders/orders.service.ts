import {
  BadRequestException, ForbiddenException, Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ProductsService } from '../products/products.service';
import { Role } from '../common/enums/role.enum';
import { OrderStatus } from '../common/enums';

const FREE_SHIPPING_THRESHOLD = 50000; // FCFA - seuil de livraison gratuite

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    private productsService: ProductsService,
  ) {}

  async create(clientId: string, dto: CreateOrderDto) {
    let totalAmount = 0;
    const items: OrderItem[] = [];

    // Le total est TOUJOURS recalcule cote serveur, jamais recu du frontend.
    for (const itemDto of dto.items) {
      const product = await this.productsService.findOne(itemDto.productId);

      if (product.stock < itemDto.quantity) {
        throw new BadRequestException(
          `Stock insuffisant pour "${product.name}" (disponible : ${product.stock})`,
        );
      }

      const orderItem = this.orderItemsRepository.create({
        product,
        storage: itemDto.storage,
        color: itemDto.color,
        quantity: itemDto.quantity,
        unitPrice: product.price,
      });

      totalAmount += Number(product.price) * itemDto.quantity;
      items.push(orderItem);
    }

    const shippingFree = totalAmount >= FREE_SHIPPING_THRESHOLD;

    const order = this.ordersRepository.create({
      orderNumber: await this.generateOrderNumber(),
      client: { id: clientId } as any,
      items,
      totalAmount,
      status: OrderStatus.EN_ATTENTE,
    });

    const savedOrder = await this.ordersRepository.save(order);

    // Decremente le stock une fois la commande confirmee
    for (const itemDto of dto.items) {
      await this.productsService.decrementStock(itemDto.productId, itemDto.quantity);
    }

    return { ...savedOrder, shippingFree };
  }

  async findAll(currentUser: { id: string; role: Role }) {
    if (currentUser.role === Role.ADMIN) {
      return this.ordersRepository.find({
        relations: ['client', 'items', 'items.product'],
        order: { createdAt: 'DESC' },
      });
    }

    return this.ordersRepository.find({
      where: { client: { id: currentUser.id } },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, currentUser: { id: string; role: Role }) {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['client', 'items', 'items.product'],
    });

    if (!order) {
      throw new NotFoundException('Commande introuvable');
    }

    if (currentUser.role !== Role.ADMIN && order.client.id !== currentUser.id) {
      throw new ForbiddenException('Vous ne pouvez pas consulter cette commande');
    }

    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.ordersRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException('Commande introuvable');
    }
    order.status = dto.status;
    return this.ordersRepository.save(order);
  }

  async remove(id: string) {
    const order = await this.ordersRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException('Commande introuvable');
    }
    await this.ordersRepository.remove(order);
    return { message: 'Commande supprimee' };
  }

  private async generateOrderNumber(): Promise<string> {
    const count = await this.ordersRepository.count();
    return `#${String(count + 1).padStart(3, '0')}`; // ex: #001, #002...
  }
}
