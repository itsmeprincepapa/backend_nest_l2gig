import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { OrderStatus } from '../common/enums';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getStats() {
    const [totalOrders, deliveredOrders, pendingOrders, activeClients, revenueResult] =
      await Promise.all([
        this.ordersRepository.count(),
        this.ordersRepository.count({ where: { status: OrderStatus.TERMINEE } }),
        this.ordersRepository.count({ where: { status: OrderStatus.EN_ATTENTE } }),
        this.usersRepository.count({ where: { role: Role.CLIENT } }),
        this.ordersRepository
          .createQueryBuilder('order')
          .select('SUM(order.totalAmount)', 'total')
          .where('order.status = :status', { status: OrderStatus.TERMINEE })
          .getRawOne(),
      ]);

    return {
      revenue: Number(revenueResult?.total) || 0,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      activeClients,
    };
  }

  async getSalesChart(period: '7d' | '30d' = '7d') {
    const days = period === '30d' ? 30 : 7;

    return this.ordersRepository
      .createQueryBuilder('order')
      .select('DATE(order.createdAt)', 'date')
      .addSelect('SUM(order.totalAmount)', 'total')
      .where('order.status = :status', { status: OrderStatus.TERMINEE })
      .andWhere('order.createdAt >= DATE_SUB(NOW(), INTERVAL :days DAY)', { days })
      .groupBy('DATE(order.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();
  }
}
