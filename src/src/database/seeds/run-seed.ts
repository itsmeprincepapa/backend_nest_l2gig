import { AppDataSource } from '../data-source';
import { seed } from './seed';

AppDataSource.initialize()
  .then(async (dataSource) => {
    await seed(dataSource);
    await dataSource.destroy();
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Erreur pendant le seed :', err);
    process.exit(1);
  });
