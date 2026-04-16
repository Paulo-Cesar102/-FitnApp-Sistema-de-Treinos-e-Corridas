import { PrismaClient, Difficulty, Sex, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Iniciando Super Seed GymPro...");

  // 1. Usuário Master (Admin)
  const hashedAdminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@gympro.com" },
    update: {},
    create: {
      name: "GymPro Master",
      email: "admin@gympro.com",
      password: hashedAdminPassword,
      role: Role.ADMIN,
      sex: Sex.M,
      level: 10,
    },
  });

  // 2. Categorias
  const categoriesData = ["Musculação", "Cardio", "Crossfit", "Yoga"];
  const categories: Record<string, any> = {};

  for (const name of categoriesData) {
    const cat = await prisma.category.create({
      data: { name },
    });
    categories[name] = cat;
  }
  console.log("✅ Categorias criadas.");

  // 3. Grupos Musculares
  const gruposMusculares = ["Peito", "Costas", "Pernas", "Ombros", "Braços", "Core"];
  const mGroups: Record<string, any> = {};

  for (const nome of gruposMusculares) {
    const group = await prisma.muscleGroup.upsert({
      where: { name: nome },
      update: {},
      create: { name: nome },
    });
    mGroups[nome] = group;
  }
  console.log("✅ Grupos musculares criados.");

  // 4. Exercícios
  const exerciciosData = [
    { id: "ex-supino-reto", name: "Supino Reto", mGroup: "Peito", img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600" },
    { id: "ex-supino-inc", name: "Supino Inclinado", mGroup: "Peito", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600" },
    { id: "ex-puxada", name: "Puxada Pulley", mGroup: "Costas", img: "https://images.unsplash.com/photo-1603287611630-d6455054202e?w=600" },
    { id: "ex-remada", name: "Remada Curvada", mGroup: "Costas", img: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600" },
    { id: "ex-agachamento", name: "Agachamento Livre", mGroup: "Pernas", img: "https://images.unsplash.com/photo-1574680096145-d05b474e2158?w=600" },
    { id: "ex-legpress", name: "Leg Press 45º", mGroup: "Pernas", img: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=600" },
    { id: "ex-rosca-direta", name: "Rosca Direta", mGroup: "Braços", img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600" },
    { id: "ex-triceps-corda", name: "Tríceps Corda", mGroup: "Braços", img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600" },
  ];

  for (const ex of exerciciosData) {
    await prisma.exercise.upsert({
      where: { id: ex.id },
      update: {},
      create: {
        id: ex.id,
        name: ex.name,
        description: `Exercício fundamental para ${ex.mGroup}.`,
        image: ex.img,
        level: Difficulty.INTERMEDIATE,
        duration: "10 min",
        categoryId: categories["Musculação"].id,
        primaryMuscleId: mGroups[ex.mGroup].id,
      },
    });
  }
  console.log("✅ Exercícios criados.");

  // 5. Treinos de Exemplo (Associados ao Admin)
  const treinos = [
    {
      name: "Peitoral de Ferro",
      exercises: [
        { id: "ex-supino-reto", sets: 4, reps: 10 },
        { id: "ex-supino-inc", sets: 3, reps: 12 },
      ],
    },
    {
      name: "Leg Day Monstro",
      exercises: [
        { id: "ex-agachamento", sets: 4, reps: 8 },
        { id: "ex-legpress", sets: 3, reps: 12 },
      ],
    },
  ];

  for (const t of treinos) {
    const workout = await prisma.userWorkout.create({
      data: {
        name: t.name,
        userId: admin.id,
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
  console.log("✅ Treinos de exemplo vinculados ao admin.");

  // 6. Conquistas (Badges)
  const badges = [
    { name: "Frango Maromba", description: "Deu o primeiro passo… mesmo sendo um frango ainda.", levelRequired: 1 },
    { name: "Saiu do Sofá", description: "Milagre: começou a treinar de verdade.", levelRequired: 2 },
    { name: "Monstro em Evolução", description: "Seu corpo já não é mais o mesmo.", levelRequired: 9 },
    { name: "Lenda da Academia", description: "Os frangos te admiram. Os monstros te respeitam.", levelRequired: 10 },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: {
        description: badge.description,
        levelRequired: badge.levelRequired,
      },
      create: badge,
    });
  }

  console.log("✅ Seed finalizado com sucesso! 🚀");
}

main()
  .catch((e) => {
    console.error("❌ Erro ao rodar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });