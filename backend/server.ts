import express from 'express';
import cors from 'cors';
import { userRoutes } from "./src/routes/user.routes";
import { feedbackRoutes } from './src/routes/feedback.routes';
import authRoutes from "./src/routes/auth.routes";
import exerciseRoutes from "./src/routes/exercise.routes";
import { workoutRoutes } from "./src/routes/workout.routes";

const app = express();

// Middlewares Globais
app.use(cors()); // Libera o acesso para o seu front e o do seu amigo
app.use(express.json()); // Faz o Express entender JSON no corpo da requisição (body)

// Definição das Rotas (Organização por recurso)
app.use("/api", exerciseRoutes);
app.use("/users", userRoutes);
app.use("/feedbacks", feedbackRoutes);
app.use("/workouts", workoutRoutes);
app.use("/auth", authRoutes);

// Rota de Health Check (Verificar se o server está vivo)
app.get('/', (_req, res) => {
  res.json({ 
    status: 'online',
    message: 'Server deAcademia rodando a todo vapor! 🚀' 
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` Servidor ativo na porta: ${PORT}`);
  console.log(` Local: http://localhost:${PORT}`);
  console.log(`=========================================`);
});