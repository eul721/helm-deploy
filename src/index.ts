import { app } from './app';
import { envConfig } from './configuration/envconfig';
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
    app.listen(envConfig.PORT, () => {
      info(`Server listening on port ${envConfig.PORT}`);
    });

    info(`Env: ${envConfig.NODE_ENVIRONMENT}`);
    // Build and nuke the database if develop
    if (envConfig.DATABASE_DROP && envConfig.isDev()) {
      warn('Reinitializing database');
      reinitializeDummyData();
    }
  })
  .catch(initErr => {
    warn('Failed initializing database:', initErr);
  });
