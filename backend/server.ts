import 'dotenv/config'; // carrega variáveis do .env automaticamente
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { userRoutes } from "./src/routes/user.routes";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.use("/users", userRoutes);

app.get('/', (_req, res) => {
  res.json({ message: 'Servidor rodando!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));