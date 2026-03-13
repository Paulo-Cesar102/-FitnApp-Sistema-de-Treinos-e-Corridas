const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {

  console.log("🌱 Iniciando seed...");

  await prisma.muscleGroup.createMany({
    data: [
      { name: "Peito" },
      { name: "Costas" },
      { name: "Pernas" },
      { name: "Ombros" },
      { name: "Biceps" },
      { name: "Triceps" },
      { name: "Abdomen" }
    ],
    skipDuplicates: true
  });


  await prisma.category.createMany({
    data: [
      { name: "Peito" },
      { name: "Costas" },
      { name: "Pernas" },
      { name: "Ombros" },
      { name: "Braços" },
      { name: "Abdomen" }
    ],
    skipDuplicates: true
  });


  const categories = await prisma.category.findMany();
  const muscles = await prisma.muscleGroup.findMany();

  const getCategory = (name) => categories.find(c => c.name === name);
  const getMuscle = (name) => muscles.find(m => m.name === name);


  const exercises = [

    // PEITO
    { name: "Supino reto", category: "Peito", muscle: "Peito" },
    { name: "Supino inclinado", category: "Peito", muscle: "Peito" },
    { name: "Supino declinado", category: "Peito", muscle: "Peito" },
    { name: "Crucifixo", category: "Peito", muscle: "Peito" },
    { name: "Crossover", category: "Peito", muscle: "Peito" },

    // COSTAS
    { name: "Puxada alta", category: "Costas", muscle: "Costas" },
    { name: "Remada curvada", category: "Costas", muscle: "Costas" },
    { name: "Remada baixa", category: "Costas", muscle: "Costas" },
    { name: "Pulldown", category: "Costas", muscle: "Costas" },
    { name: "Barra fixa", category: "Costas", muscle: "Costas" },

    // PERNAS
    { name: "Agachamento", category: "Pernas", muscle: "Pernas" },
    { name: "Leg press", category: "Pernas", muscle: "Pernas" },
    { name: "Cadeira extensora", category: "Pernas", muscle: "Pernas" },
    { name: "Cadeira flexora", category: "Pernas", muscle: "Pernas" },
    { name: "Stiff", category: "Pernas", muscle: "Pernas" },

    // OMBROS
    { name: "Desenvolvimento", category: "Ombros", muscle: "Ombros" },
    { name: "Elevação lateral", category: "Ombros", muscle: "Ombros" },
    { name: "Elevação frontal", category: "Ombros", muscle: "Ombros" },
    { name: "Arnold press", category: "Ombros", muscle: "Ombros" },
    { name: "Face pull", category: "Ombros", muscle: "Ombros" },

    // BICEPS
    { name: "Rosca direta", category: "Braços", muscle: "Biceps" },
    { name: "Rosca alternada", category: "Braços", muscle: "Biceps" },
    { name: "Rosca concentrada", category: "Braços", muscle: "Biceps" },
    { name: "Rosca martelo", category: "Braços", muscle: "Biceps" },

    // TRICEPS
    { name: "Triceps corda", category: "Braços", muscle: "Triceps" },
    { name: "Triceps testa", category: "Braços", muscle: "Triceps" },
    { name: "Mergulho", category: "Braços", muscle: "Triceps" },
    { name: "Triceps banco", category: "Braços", muscle: "Triceps" },

    // ABDOMEN
    { name: "Abdominal supra", category: "Abdomen", muscle: "Abdomen" },
    { name: "Abdominal infra", category: "Abdomen", muscle: "Abdomen" },
    { name: "Prancha", category: "Abdomen", muscle: "Abdomen" },
    { name: "Crunch", category: "Abdomen", muscle: "Abdomen" }

  ];



  for (const ex of exercises) {

    const category = getCategory(ex.category);
    const muscle = getMuscle(ex.muscle);

    if (!category || !muscle) continue;

    await prisma.exercise.create({
      data: {
        name: ex.name,
        categoryId: category.id,
        primaryMuscleId: muscle.id
      }
    });

  }

  console.log(" Exercícios inseridos!");
  console.log(" Seed finalizado!");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });