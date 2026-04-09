const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Iniciando Super Seed GymPro...");

  // 1. Usuário Master
  const user = await prisma.user.upsert({
    where: { email: 'admin@gympro.com' },
    update: {},
    create: {
      name: "GymPro Master",
      email: "admin@gympro.com",
      password: "123",
      role: "ADMIN"
    }
  });

  // 2. Categorias - Ajustado para evitar o erro de validação
  let catMusculacao = await prisma.category.findFirst({
    where: { name: "Musculação" }
  });

  if (!catMusculacao) {
    catMusculacao = await prisma.category.create({
      data: { name: "Musculação" }
    });
  }

  // 3. Grupos Musculares
  const gruposMusculares = ["Peito", "Costas", "Pernas", "Ombros", "Braços", "Core"];
  const mGroups = {};

  for (const nome of gruposMusculares) {
    // Se o MuscleGroup também não for unique no schema, usamos findFirst/create
    let group = await prisma.muscleGroup.findFirst({ where: { name: nome } });
    if (!group) {
      group = await prisma.muscleGroup.create({ data: { name: nome } });
    }
    mGroups[nome] = group;
  }

  // 4. Biblioteca de Exercícios
  const exerciciosData = [
    { id: 'ex-supino-reto', name: "Supino Reto", mGroup: "Peito", img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600" },
    { id: 'ex-supino-inc', name: "Supino Inclinado", mGroup: "Peito", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600" },
    { id: 'ex-crucifixo', name: "Crucifixo Reto", mGroup: "Peito", img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600" },
    { id: 'ex-puxada', name: "Puxada Pulley", mGroup: "Costas", img: "https://images.unsplash.com/photo-1603287611630-d6455054202e?w=600" },
    { id: 'ex-remada', name: "Remada Curvada", mGroup: "Costas", img: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600" },
    { id: 'ex-agachamento', name: "Agachamento Livre", mGroup: "Pernas", img: "https://images.unsplash.com/photo-1574680096145-d05b474e2158?w=600" },
    { id: 'ex-legpress', name: "Leg Press 45º", mGroup: "Pernas", img: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=600" },
    { id: 'ex-rosca-direta', name: "Rosca Direta", mGroup: "Braços", img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600" },
    { id: 'ex-triceps-corda', name: "Tríceps Corda", mGroup: "Braços", img: "https://www.google.com/imgres?q=triceps%20corda&imgurl=https%3A%2F%2Fpratiquefitness.com.br%2Fblog%2Fwp-content%2Fuploads%2F2023%2F11%2FComo-fazer-triceps-corda.jpg&imgrefurl=https%3A%2F%2Fpratiquefitness.com.br%2Fblog%2Fcomo-fazer-triceps-corda%2F&docid=-PW2V4_OQPiAlM&tbnid=wTxAkQqoT2nFbM&vet=12ahUKEwiT_s-Ih-GTAxXqs5UCHU5rL2MQnPAOegQIPxAB..i&w=600&h=400&hcb=2&ved=2ahUKEwiT_s-Ih-GTAxXqs5UCHU5rL2MQnPAOegQIPxAB?w=600" },
  ];

  for (const ex of exerciciosData) {
    await prisma.exercise.upsert({
      where: { id: ex.id },
      update: {
        name: ex.name,
        image: ex.img,
        primaryMuscleId: mGroups[ex.mGroup].id
      },
      create: {
        id: ex.id,
        name: ex.name,
        description: `Exercício focado em ${ex.mGroup}`,
        image: ex.img,
        level: "INTERMEDIATE",
        duration: "10 min",
        categoryId: catMusculacao.id,
        primaryMuscleId: mGroups[ex.mGroup].id
      }
    });
  }

  // 5. Treinos
  const treinos = [
    { name: "Peitoral de Ferro", exercises: [{ id: 'ex-supino-reto', sets: 4, reps: 10 }, { id: 'ex-supino-inc', sets: 3, reps: 12 }] },
    { name: "Costas Largas", exercises: [{ id: 'ex-puxada', sets: 4, reps: 12 }, { id: 'ex-remada', sets: 4, reps: 10 }] },
    { name: "Leg Day", exercises: [{ id: 'ex-agachamento', sets: 4, reps: 8 }, { id: 'ex-legpress', sets: 3, reps: 12 }] },
    { name: "Braços Gigantes", exercises: [{ id: 'ex-rosca-direta', sets: 4, reps: 10 }, { id: 'ex-triceps-corda', sets: 4, reps: 10 }] }
  ];

  // Limpa treinos antigos do admin para renovar
  await prisma.userWorkoutExercise.deleteMany({ where: { userWorkout: { userId: user.id } } });
  await prisma.userWorkout.deleteMany({ where: { userId: user.id } });

  for (const t of treinos) {
    await prisma.userWorkout.create({
      data: {
        name: t.name,
        userId: user.id,
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

  console.log(`✅ Seed finalizado com sucesso!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });