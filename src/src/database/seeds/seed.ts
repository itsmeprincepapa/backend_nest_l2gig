import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../users/entities/user.entity';

export async function seed(dataSource: DataSource) {
  const userRepo = dataSource.getRepository(User);

  const existingAdmin = await userRepo.findOne({
    where: { email: 'admin@demo.com' },
  });

  if (!existingAdmin) {
    await userRepo.save(
      userRepo.create({
        email: 'admin@demo.com',
        password: await bcrypt.hash('Admin123!', 10),
        fullName: 'Admin Démo',
        phone: '+221770000000',
        role: UserRole.ADMIN,
      }),
    );
  }

  const demoClients = [
    { email: 'client1@demo.com', fullName: 'Client Démo 1' },
    { email: 'client2@demo.com', fullName: 'Client Démo 2' },
  ];

  for (const c of demoClients) {
    const existing = await userRepo.findOne({ where: { email: c.email } });
    if (!existing) {
      await userRepo.save(
        userRepo.create({
          email: c.email,
          password: await bcrypt.hash('Client123!', 10),
          fullName: c.fullName,
          phone: '+221770000001',
          role: UserRole.CLIENT,
        }),
      );
    }
  }

  console.log('✅ Seed terminé');
}
