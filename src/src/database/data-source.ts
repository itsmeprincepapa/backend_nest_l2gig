import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * ⚠️ À ADAPTER si le projet a déjà un data-source.ts (ne pas dupliquer,
 * ajoute juste User dans le tableau "entities" existant).
 */
export const AppDataSource = new DataSource({
  type: 'postgres', // adapte si mysql / autre
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'nest_project',
  synchronize: true, // dev uniquement
  entities: [User],
});
