import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import { Role } from '../common/enums/role.enum';
import { ProductCategory, ProductCondition } from '../common/enums';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  const productsService = app.get(ProductsService);

  const existingAdmin = await usersService.findByEmail('admin@phoneshop.sn');
  if (!existingAdmin) {
    await usersService.create({
      email: 'admin@phoneshop.sn',
      password: 'Admin123!',
      fullName: 'Admin PhoneShop',
      role: Role.ADMIN,
    });
    console.log('Compte Admin cree : admin@phoneshop.sn / Admin123!');
  }

  const existingClient = await usersService.findByEmail('client@phoneshop.sn');
  if (!existingClient) {
    await usersService.create({
      email: 'client@phoneshop.sn',
      password: 'Client123!',
      fullName: 'Client Demo',
      role: Role.CLIENT,
    });
    console.log('Compte Client cree : client@phoneshop.sn / Client123!');
  }

  const demoProducts = [
    {
      name: 'iPhone 15',
      reference: 'IP15-BASE',
      description: "iPhone 15 avec puce A16 Bionic et appareil photo principal 48 Mpx.",
      brand: 'Apple',
      model: 'iPhone 15',
      category: ProductCategory.IPHONE,
      price: 599000,
      storageOptions: ['128GB', '256GB', '512GB'],
      colors: ['Noir', 'Bleu', 'Rose', 'Jaune'],
      condition: ProductCondition.NEUF,
      stock: 15,
    },
    {
      name: 'iPhone 15 Pro Max',
      reference: 'IP15-PROMAX',
      description: "iPhone 15 Pro Max avec puce A17 Pro et contour en titane.",
      brand: 'Apple',
      model: 'iPhone 15 Pro Max',
      category: ProductCategory.IPHONE,
      price: 899000,
      storageOptions: ['256GB', '512GB', '1TB'],
      colors: ['Titane naturel', 'Titane bleu', 'Titane noir'],
      condition: ProductCondition.NEUF,
      stock: 8,
    },
    {
      name: 'iPhone 13 reconditionne',
      reference: 'IP13-RECOND',
      description: "iPhone 13 reconditionne, verifie et garanti.",
      brand: 'Apple',
      model: 'iPhone 13',
      category: ProductCategory.IPHONE,
      price: 349000,
      storageOptions: ['128GB', '256GB'],
      colors: ['Noir', 'Blanc', 'Bleu'],
      condition: ProductCondition.RECONDITIONNE,
      stock: 5,
    },
    {
      name: 'Chargeur MagSafe',
      reference: 'ACC-MAGSAFE',
      description: 'Chargeur sans fil MagSafe compatible iPhone.',
      brand: 'Apple',
      model: 'MagSafe Charger',
      category: ProductCategory.ACCESSOIRE,
      price: 25000,
      storageOptions: [],
      colors: ['Blanc'],
      condition: ProductCondition.NEUF,
      stock: 30,
    },
  ];

  for (const productData of demoProducts) {
    const existing = await productsService
      .findAll({ search: productData.reference, page: 1, limit: 1 } as any)
      .then((res) => res.items.find((p) => p.reference === productData.reference));

    if (!existing) {
      await productsService.create(productData as any);
      console.log(`Produit cree : ${productData.name}`);
    }
  }

  await app.close();
}

seed();
