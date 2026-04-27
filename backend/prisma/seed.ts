import { PrismaClient, Difficulty, Sex, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Iniciando Super Seed GymPro...");

  // 1. Criar Academia Base (Necessário para os usuários e treinos)
  const gym = await prisma.gym.upsert({
    where: { inviteCode: "GYMPRO2026" },
    update: {},
    create: {
      name: "Academia GymPro Central",
      inviteCode: "GYMPRO2026",
      email: "contato@gympro.com",
      pixKey: "gympro-cnpj-fake",
      pixType: "CNPJ",
      address: "Rua Fitness, 123",
    },
  });
  console.log("✅ Academia base pronta.");

  // 2. Usuário Master (Admin)
  const hashedAdminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@gympro.com" },
    update: {
      gymId: gym.id,
    },
    create: {
      name: "GymPro Master",
      email: "admin@gympro.com",
      password: hashedAdminPassword,
      role: Role.ADMIN,
      sex: Sex.M,
      level: 10,
      xp: 1000,
      gymId: gym.id,
    },
  });
  console.log("✅ Usuário Admin pronto.");

  // 3. Categorias (Requer @unique no campo 'name' no schema.prisma)
  const categoriesData = ["Musculação", "Cardio", "Crossfit", "Yoga", "Funcional", "Lutas", "Mobilidade", "Costas", "Pernas"];
  const categories: Record<string, any> = {};

  for (const name of categoriesData) {
    const cat = await prisma.category.upsert({
      where: { name: name },
      update: {},
      create: { name },
    });
    categories[name] = cat;
  }
  console.log("✅ Categorias sincronizadas.");

  // 4. Grupos Musculares
  const gruposMusculares = ["Peito", "Costas", "Pernas", "Ombros", "Braços", "Core", "Corpo Todo"];
  const mGroups: Record<string, any> = {};

  for (const nome of gruposMusculares) {
    const group = await prisma.muscleGroup.upsert({
      where: { name: nome },
      update: {},
      create: { name: nome },
    });
    mGroups[nome] = group;
  }
  console.log("✅ Grupos musculares sincronizados.");

  // 5. Exercícios
  const exerciciosData = [
    // Peito
    { id: "ex-supino-reto", name: "Supino Reto", mGroup: "Peito", img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600", cat: "Musculação" },
    { id: "ex-supino-inc", name: "Supino Inclinado", mGroup: "Peito", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600", cat: "Musculação" },
    { id: "ex-crucifixo", name: "Crucifixo Máquina", mGroup: "Peito", img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600", cat: "Musculação" },
    
    // Costas
    { id: "ex-puxada", name: "Puxada Pulley", mGroup: "Costas", img: "https://images.unsplash.com/photo-1603287611630-d6455054202e?w=600", cat: "Musculação" },
    { id: "ex-remada", name: "Remada Curvada", mGroup: "Costas", img: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600", cat: "Musculação" },
    { id: "ex-remada-unilat", name: "Remada Unilateral", mGroup: "Costas", img: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600", cat: "Musculação" },
    { id: "ex-pull-down", name: "Pull Down", mGroup: "Costas", img: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600", cat: "Musculação" },
    
    // Pernas
    { id: "ex-agachamento", name: "Agachamento Livre", mGroup: "Pernas", img: "https://images.unsplash.com/photo-1574680096145-d05b474e2158?w=600", cat: "Musculação" },
    { id: "ex-legpress", name: "Leg Press 45º", mGroup: "Pernas", img: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=600", cat: "Musculação" },
    { id: "ex-extensora", name: "Cadeira Extensora", mGroup: "Pernas", img: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=600", cat: "Musculação" },
    { id: "ex-flexora", name: "Mesa Flexora", mGroup: "Pernas", img: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=600", cat: "Musculação" },
    { id: "ex-afundo", name: "Afundo com Halteres", mGroup: "Pernas", img: "https://images.unsplash.com/photo-1574680096145-d05b474e2158?w=600", cat: "Musculação" },
    
    // Braços
    { id: "ex-rosca-direta", name: "Rosca Direta", mGroup: "Braços", img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600", cat: "Musculação" },
    { id: "ex-triceps-corda", name: "Tríceps Corda", mGroup: "Braços", img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600", cat: "Musculação" },
    { id: "ex-rosca-martelo", name: "Rosca Martelo", mGroup: "Braços", img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600", cat: "Musculação" },
    { id: "ex-triceps-frances", name: "Tríceps Francês", mGroup: "Braços", img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600", cat: "Musculação" },

    // Ombros
    { id: "ex-desenv-halteres", name: "Desenvolvimento Halteres", mGroup: "Ombros", img: "https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?w=600", cat: "Musculação" },
    { id: "ex-elev-lateral", name: "Elevação Lateral", mGroup: "Ombros", img: "https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?w=600", cat: "Musculação" },

    // Core
    { id: "ex-abdominal-infra", name: "Abdominal Infra", mGroup: "Core", img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600", cat: "Mobilidade" },
    { id: "ex-plancha", name: "Prancha Abdominal", mGroup: "Core", img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600", cat: "Funcional" },

    // Cardio
    { id: "ex-corrida", name: "Corrida Esteira", mGroup: "Pernas", img: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=600", cat: "Cardio" },
    { id: "ex-bike", name: "Bike Ergométrica", mGroup: "Pernas", img: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=600", cat: "Cardio" },
  ];

  for (const ex of exerciciosData) {
    await prisma.exercise.upsert({
      where: { id: ex.id },
      update: {
        name: ex.name,
        image: ex.img,
        primaryMuscleId: mGroups[ex.mGroup].id,
        categoryId: categories[ex.cat].id,
      },
      create: {
        id: ex.id,
        name: ex.name,
        description: `Exercício fundamental para ${ex.mGroup}.`,
        image: ex.img,
        level: Difficulty.INTERMEDIATE,
        duration: "10 min",
        categoryId: categories[ex.cat].id,
        primaryMuscleId: mGroups[ex.mGroup].id,
      },
    });
  }
  console.log("✅ Exercícios sincronizados.");

  // 6. Treinos de Exemplo (Associados ao Admin e à Academia)
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
    const existingWorkout = await prisma.userWorkout.findFirst({
      where: { name: t.name, userId: admin.id }
    });

    if (!existingWorkout) {
      await prisma.userWorkout.create({
        data: {
          name: t.name,
          userId: admin.id,
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
  console.log("✅ Treinos de exemplo vinculados.");

  // 7. Conquistas (Badges)
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