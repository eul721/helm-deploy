import { app } from './app';
import { info, warn } from './logger';
import { initializeDB } from './models/db/database';
import { SampleDatabase } from './models/tests/testutils';

const { NODE_ENVIRONMENT = 'development', PORT = 5000, DATABASE_DROP } = process.env;

async function reinitializeDummyData() {
  info('====================================\n       Generating Test Data\n====================================');
  const dbExample = new SampleDatabase();
  dbExample.initAll();
  info('====================================\n        Finished Test Data\n====================================');
}

initializeDB()
  .then(() => {
    app.listen(PORT, () => {
      info(`Server listening on port ${PORT}`);
    });

    info(`Env: ${NODE_ENVIRONMENT}`);
    // Build and nuke the database if develop
    if (DATABASE_DROP === 'true' && NODE_ENVIRONMENT === 'development') {
      warn('Reinitializing database');
      reinitializeDummyData();
    }
  })
  .catch(initErr => {
    warn('Failed initializing database:', initErr);
  });
