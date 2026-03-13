import express from 'express';
import cors from 'cors';
import { userRoutes } from "./src/routes/user.routes";
import { feedbackRoutes } from './src/routes/feedback.routes';
import authRoutes from "./src/routes/auth.routes";
import exerciseRoutes from "./src/routes/exercise.routes";
import { workoutRoutes } from "./src/routes/workout.routes";

const app = express();

app.use(cors()); 
app.use(express.json()); 

app.use(exerciseRoutes);
app.use("/api", exerciseRoutes);
app.use("/users", userRoutes);
app.use("/feedbacks", feedbackRoutes);
app.use("/workouts", workoutRoutes);
app.use("/auth", authRoutes);


app.get('/', (_req, res) => {
  res.json({ 
    status: 'online',
    message: 'Server conectado com sucesso!' 
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` Servidor ativo na porta: ${PORT}`);
  console.log(` Local: http://localhost:${PORT}`);
  console.log(`=========================================`);
});