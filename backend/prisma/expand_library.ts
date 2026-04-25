import { PrismaClient, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Expandindo Biblioteca de Treinos...");

  // 1. Garantir que a academia base existe
  const gym = await prisma.gym.findFirst({ where: { inviteCode: "GYMPRO2026" } });
  if (!gym) {
    console.log("❌ Academia base não encontrada. Rode o seed principal primeiro.");
    return;
  }

  // 2. Novas Categorias
  const novasCategorias = ["Cardio", "HIIT", "Funcional", "Mobilidade", "Calistenia"];
  const catMap: Record<string, string> = {};

  for (const name of novasCategorias) {
    const cat = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    catMap[name] = cat.id;
  }

  // 3. Grupos Musculares Extras
  const core = await prisma.muscleGroup.upsert({ where: { name: "Core" }, update: {}, create: { name: "Core" } });
  const fullBody = await prisma.muscleGroup.upsert({ where: { name: "Corpo Todo" }, update: {}, create: { name: "Corpo Todo" } });

  // 4. Novos Exercícios
  const novosExercicios = [
    { id: "ex-burpee", name: "Burpees", cat: "HIIT", muscle: fullBody.id, level: Difficulty.ADVANCED, img: "https://images.unsplash.com/photo-1599058917233-97f3941560dc?w=600" },
    { id: "ex-polichinelo", name: "Polichinelos", cat: "Cardio", muscle: fullBody.id, level: Difficulty.BEGINNER, img: "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=600" },
    { id: "ex-prancha", name: "Prancha Abdominal", cat: "Funcional", muscle: core.id, level: Difficulty.BEGINNER, img: "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=600" },
    { id: "ex-kettlebell", name: "Kettlebell Swing", cat: "Funcional", muscle: core.id, level: Difficulty.INTERMEDIATE, img: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=600" },
    { id: "ex-mountain-climber", name: "Mountain Climbers", cat: "HIIT", muscle: core.id, level: Difficulty.INTERMEDIATE, img: "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=600" },
    { id: "ex-stretch-cat", name: "Alongamento Gato-Vaca", cat: "Mobilidade", muscle: core.id, level: Difficulty.BEGINNER, img: "https://images.unsplash.com/photo-1552196564-972d4638c331?w=600" },
    { id: "ex-pushup", name: "Flexão de Braços", cat: "Calistenia", muscle: core.id, level: Difficulty.BEGINNER, img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600" },
  ];

  for (const ex of novosExercicios) {
    await prisma.exercise.upsert({
      where: { id: ex.id },
      update: { level: ex.level, categoryId: catMap[ex.cat] },
      create: {
        id: ex.id,
        name: ex.name,
        level: ex.level,
        categoryId: catMap[ex.cat],
        primaryMuscleId: ex.muscle,
        image: ex.img,
        description: `Exercício focado em ${ex.cat}.`
      }
    });
  }

  // 5. Novos Treinos de Catálogo (userId: null faz aparecer na Biblioteca)
  const treinosCatalogo = [
    {
      name: "Despertar do Corpo",
      level: Difficulty.BEGINNER,
      exercises: [
        { id: "ex-stretch-cat", sets: 3, reps: 10 },
        { id: "ex-polichinelo", sets: 3, reps: 30 },
        { id: "ex-prancha", sets: 3, reps: 30 }
      ]
    },
    {
      name: "Queima de Elite (HIIT)",
      level: Difficulty.ADVANCED,
      exercises: [
        { id: "ex-burpee", sets: 5, reps: 15 },
        { id: "ex-mountain-climber", sets: 5, reps: 40 },
        { id: "ex-polichinelo", sets: 5, reps: 50 }
      ]
    },
    {
      name: "Fortalecimento Funcional",
      level: Difficulty.INTERMEDIATE,
      exercises: [
        { id: "ex-kettlebell", sets: 4, reps: 15 },
        { id: "ex-pushup", sets: 4, reps: 20 },
        { id: "ex-prancha", sets: 4, reps: 60 }
      ]
    }
  ];

  for (const t of treinosCatalogo) {
    const exists = await prisma.userWorkout.findFirst({ where: { name: t.name, userId: null } });
    if (!exists) {
      await prisma.userWorkout.create({
        data: {
          name: t.name,
          userId: null, // Global
          gymId: gym.id,
          exercises: {
            create: t.exercises.map(e => ({
              exerciseId: e.id,
              sets: e.sets,
              reps: e.reps
            }))
          }
        }
      });
    }
  }

  console.log("✅ Biblioteca expandida com sucesso!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
