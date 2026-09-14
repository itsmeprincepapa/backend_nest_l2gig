import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { Role } from '../common/enums/role.enum';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const existingAdmin = await usersService.findByEmail('admin@wondershop.sn');
  if (!existingAdmin) {
    await usersService.create({
      email: 'admin@wondershop.sn',
      password: 'Admin123!',
      fullName: 'Admin Wondershop',
      role: Role.ADMIN,
    });
    console.log('Compte Admin cree : admin@wondershop.sn / Admin123!');
  }

  const existingClient = await usersService.findByEmail('client@wondershop.sn');
  if (!existingClient) {
    await usersService.create({
      email: 'client@wondershop.sn',
      password: 'Client123!',
      fullName: 'Client Demo',
      role: Role.CLIENT,
    });
    console.log('Compte Client cree : client@wondershop.sn / Client123!');
  }

  await app.close();
}

seed();
