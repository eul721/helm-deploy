import { app } from './app';
import { config } from './config';
import { info, warn } from './logger';
import { initializeDB } from './models/db/database';
import { SampleDatabase } from './tests/testutils';

async function reinitializeDummyData() {
  info('====================================\n       Generating Test Data\n====================================');
  const dbExample = new SampleDatabase();
  dbExample.initAll();
  info('====================================\n        Finished Test Data\n====================================');
}

initializeDB()
  .then(() => {
    app.listen(config.PORT, () => {
      info(`Server listening on port ${config.PORT}`);
    });

    info(`Env: ${config.NODE_ENVIRONMENT}`);
    // Build and nuke the database if develop
    if (config.DATABASE_DROP === 'true' && config.isDev()) {
      warn('Reinitializing database');
      reinitializeDummyData();
    }
  })
  .catch(initErr => {
    warn('Failed initializing database:', initErr);
  });
