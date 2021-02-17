import Express from 'express';
import cors from 'cors';

const { PORT = 5000 } = process.env;

const app = Express();

app.use(cors());
app.use(Express.json());

app.listen(PORT, () => {
  console.info(`Server listening on port ${PORT}`);
});
