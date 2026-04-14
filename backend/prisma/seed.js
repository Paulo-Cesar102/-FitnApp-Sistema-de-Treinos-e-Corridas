const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Iniciando Super Seed GymPro...");

  // 1. Usuário Master
  const user = await prisma.user.upsert({
    where: { email: "admin@gympro.com" },
    update: {},
    create: {
      name: "GymPro Master",
      email: "admin@gympro.com",
      password: "123",
      role: "ADMIN",
    },
  });

  // 2. Categoria
  let catMusculacao = await prisma.category.findFirst({
    where: { name: "Musculação" },
  });

  if (!catMusculacao) {
    catMusculacao = await prisma.category.create({
      data: { name: "Musculação" },
    });
  }

  // 3. Grupos Musculares
  const gruposMusculares = [
    "Peito",
    "Costas",
    "Pernas",
    "Ombros",
    "Braços",
    "Core",
  ];

  const mGroups = {};

  for (const nome of gruposMusculares) {
    let group = await prisma.muscleGroup.findFirst({
      where: { name: nome },
    });

    if (!group) {
      group = await prisma.muscleGroup.create({
        data: { name: nome },
      });
    }

    mGroups[nome] = group;
  }

  // 4. Exercícios
  const exerciciosData = [
    {
      id: "ex-supino-reto",
      name: "Supino Reto",
      mGroup: "Peito",
      img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600",
    },
    {
      id: "ex-supino-inc",
      name: "Supino Inclinado",
      mGroup: "Peito",
      img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600",
    },
    {
      id: "ex-crucifixo",
      name: "Crucifixo Reto",
      mGroup: "Peito",
      img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600",
    },
    {
      id: "ex-puxada",
      name: "Puxada Pulley",
      mGroup: "Costas",
      img: "https://images.unsplash.com/photo-1603287611630-d6455054202e?w=600",
    },
    {
      id: "ex-remada",
      name: "Remada Curvada",
      mGroup: "Costas",
      img: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600",
    },
    {
      id: "ex-agachamento",
      name: "Agachamento Livre",
      mGroup: "Pernas",
      img: "https://images.unsplash.com/photo-1574680096145-d05b474e2158?w=600",
    },
    {
      id: "ex-legpress",
      name: "Leg Press 45º",
      mGroup: "Pernas",
      img: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=600",
    },
    {
      id: "ex-rosca-direta",
      name: "Rosca Direta",
      mGroup: "Braços",
      img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600",
    },
    {
      id: "ex-triceps-corda",
      name: "Tríceps Corda",
      mGroup: "Braços",
      img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600",
    },
  ];

  for (const ex of exerciciosData) {
    await prisma.exercise.upsert({
      where: { id: ex.id },
      update: {
        name: ex.name,
        image: ex.img,
        primaryMuscleId: mGroups[ex.mGroup].id,
      },
      create: {
        id: ex.id,
        name: ex.name,
        description: `Exercício focado em ${ex.mGroup}`,
        image: ex.img,
        level: "INTERMEDIATE",
        duration: "10 min",
        categoryId: catMusculacao.id,
        primaryMuscleId: mGroups[ex.mGroup].id,
      },
    });
  }

  // 5. Treinos de exemplo sem apagar nada
  const treinos = [
    {
      name: "Peitoral de Ferro",
      exercises: [
        { id: "ex-supino-reto", sets: 4, reps: 10 },
        { id: "ex-supino-inc", sets: 3, reps: 12 },
      ],
    },
    {
      name: "Costas Largas",
      exercises: [
        { id: "ex-puxada", sets: 4, reps: 12 },
        { id: "ex-remada", sets: 4, reps: 10 },
      ],
    },
    {
      name: "Leg Day",
      exercises: [
        { id: "ex-agachamento", sets: 4, reps: 8 },
        { id: "ex-legpress", sets: 3, reps: 12 },
      ],
    },
    {
      name: "Braços Gigantes",
      exercises: [
        { id: "ex-rosca-direta", sets: 4, reps: 10 },
        { id: "ex-triceps-corda", sets: 4, reps: 10 },
      ],
    },
  ];

  for (const t of treinos) {
    const existingWorkout = await prisma.userWorkout.findFirst({
      where: {
        userId: user.id,
        name: t.name,
      },
    });

    if (!existingWorkout) {
      await prisma.userWorkout.create({
        data: {
          name: t.name,
          userId: user.id,
          exercises: {
            create: t.exercises.map((e) => ({
              exerciseId: e.id,
              sets: e.sets,
              reps: e.reps,
            })),
          },
        },
      });
    }
  }

  // 6. Conquistas
  const badges = [
    {
      name: "Frango Maromba",
      description: "Deu o primeiro passo… mesmo sendo um frango ainda.",
      levelRequired: 1,
    },
    {
      name: "Saiu do Sofá",
      description: "Milagre: começou a treinar de verdade.",
      levelRequired: 2,
    },
    {
      name: "Sobreviveu aos Primeiros Treinos",
      description: "Achou que ia morrer… mas voltou no dia seguinte.",
      levelRequired: 3,
    },
    {
      name: "Pegando o Jeito",
      description: "Agora já sabe pelo menos pra que serve o halter.",
      levelRequired: 4,
    },
    {
      name: "Disciplina > Motivação",
      description: "Parou de depender da vontade e começou a ter rotina.",
      levelRequired: 5,
    },
    {
      name: "Level Up de Verdade",
      description: "Agora o negócio ficou sério.",
      levelRequired: 6,
    },
    {
      name: "Viciado em Treino",
      description: "Treinar virou parte da sua vida.",
      levelRequired: 7,
    },
    {
      name: "Virou um Gorila",
      description: "Os pesos começaram a ter medo de você.",
      levelRequired: 8,
    },
    {
      name: "Monstro em Evolução",
      description: "Seu corpo já não é mais o mesmo.",
      levelRequired: 9,
    },
    {
      name: "Lenda da Academia",
      description: "Os frangos te admiram. Os monstros te respeitam.",
      levelRequired: 10,
    },
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

  console.log("✅ Seed finalizado com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });