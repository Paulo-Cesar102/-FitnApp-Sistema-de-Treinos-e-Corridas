import 'dotenv/config'; // carrega variáveis do .env automaticamente
import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ message: 'Servidor rodando!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));