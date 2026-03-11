import 'dotenv/config'; // carrega variáveis do .env automaticamente
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { userRoutes } from "./src/routes/user.routes";
import { feedbackRoutes } from './src/routes/feedback.routes';
import authRoutes from "./src/routes/auth.routes";
import exerciseRoutes from "./src/routes/exercise.routes";


const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.use("/api", exerciseRoutes);
app.use("/users", userRoutes);
app.use("/feedbacks", feedbackRoutes);
app.use("/auth", authRoutes);

app.get('/', (_req, res) => {
  res.json({ message: 'Servidor rodando!' });
});





const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));