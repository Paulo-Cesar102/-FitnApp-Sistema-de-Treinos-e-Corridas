import biceps from "./src/data/biceps.json";
import costas from "./src/data/costas.json";
import pernas from "./src/data/pernas.json";
import peito from "./src/data/peito.json";
import triceps from "./src/data/triceps.json";
import ombros from "./src/data/ombros.json";
import abdomen from "./src/data/abdomen.json";

import express from 'express';
import cors from 'cors';
import { userRoutes } from "./src/routes/user.routes";
import { feedbackRoutes } from './src/routes/feedback.routes';
import authRoutes from "./src/routes/auth.routes";
import exerciseRoutes from "./src/routes/exercise.routes";
import { workoutRoutes } from "./src/routes/workout.routes";
import categoryRoutes from "./src/routes/category.routes";          


const app = express();

app.use(cors()); 
app.use(express.json()); 

app.use(exerciseRoutes);
app.use("/api", exerciseRoutes);
app.use("/users", userRoutes);
app.use("/feedbacks", feedbackRoutes);
app.use("/workouts", workoutRoutes);
app.use("/auth", authRoutes);
app.use( categoryRoutes);

app.get("/api/workouts-json", (_req, res) => {
  const todos = [
    ...biceps,
    ...costas,
    ...pernas,
    ...peito,
    ...triceps,
    ...ombros,
    ...abdomen
  ];

  res.json(todos);
});

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

