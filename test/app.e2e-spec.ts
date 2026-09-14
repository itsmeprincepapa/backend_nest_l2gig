import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('WonderShop E2E', () => {
  let app: INestApplication;
  let adminToken: string;
  let clientToken: string;
  let createdProductId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api');
    await app.init();
  });

  it('Admin se connecte', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@wondershop.sn', password: 'Admin123!' });

    expect(res.status).toBe(200);
    adminToken = res.body.access_token;
  });

  it('Client se connecte', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'client@wondershop.sn', password: 'Client123!' });

    expect(res.status).toBe(200);
    clientToken = res.body.access_token;
  });

  it("L'admin cree un produit", async () => {
    const res = await request(app.getHttpServer())
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Costume Test', reference: 'TEST-001', category: 'MEN',
        price: 15000, sizes: ['M', 'L'], stock: 10,
      });

    expect(res.status).toBe(201);
    createdProductId = res.body.id;
  });

  it('Le client consulte le catalogue', async () => {
    const res = await request(app.getHttpServer()).get('/api/products');
    expect(res.status).toBe(200);
  });

  it('Le client passe une commande', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/orders')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ items: [{ productId: createdProductId, size: 'M', quantity: 1 }] });

    expect(res.status).toBe(201);
    expect(res.body.totalAmount).toBe(15000);
  });

  it('La commande apparait dans les stats admin', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/dashboard/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.totalOrders).toBeGreaterThan(0);
  });

  it('Un client ne peut pas acceder au dashboard admin', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/dashboard/stats')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.status).toBe(403);
  });

  afterAll(async () => {
    await app.close();
  });
});
