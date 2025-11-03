import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import presentesRouter from './routes/presentes.js';
import contribuicoesRouter from './routes/contribuicoes.js';
import pixRouter from './routes/pix.js';

import pixWebhookRouter from './routes/pixWebhook.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/presentes', presentesRouter);
app.use('/api/contribuicoes', contribuicoesRouter);
app.use('/api/pix', pixRouter);
app.use('/api/pix', pixWebhookRouter);

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Servidor rodando em http://localhost:${port}`));
