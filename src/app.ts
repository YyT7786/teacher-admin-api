import path from 'path';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import apiRouter from './routes/api';
import errorHandler from './middleware/errorHandler';

const app = express();
const swaggerDoc = YAML.load(path.join(__dirname, 'swagger.yaml'));

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.use('/api', apiRouter);
app.use(errorHandler);

export default app;
