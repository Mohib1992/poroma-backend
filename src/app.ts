import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';

import routes from './routes';
import { errorMiddleware } from './middleware/error.middleware';
import { config } from './config';
import { logger } from './utils/logger';

const app = express();

app.use(helmet());
app.use(cors({ origin: config.cors.origin }));
app.use(compression());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', routes);

app.use(errorMiddleware);

app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
});

export default app;
