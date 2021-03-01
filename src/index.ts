import { app } from './app';
import { initializeDB } from './models/database';
import { info, warn } from './logger';

const { PORT = 5000 } = process.env;

initializeDB()
  .then(() => {
    app.listen(PORT, () => {
      info(`Server listening on port ${PORT}`);
    });
  })
  .catch(initErr => {
    warn('Failed initializing database:', initErr);
  });
