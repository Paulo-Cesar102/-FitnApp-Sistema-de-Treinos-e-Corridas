import { SmartCoachRepository } from "../repository/SmartCoachRepository";

export class SmartCoachService {
  private repository = new SmartCoachRepository();

  /**
   * Ponto de entrada para as perguntas do usuário
   */
  async askCoach(userId: string, question: string) {
    const user = await this.repository.getUserFitnessData(userId);
    if (!user) throw new Error("Usuário não encontrado");

    // Lógica de Processamento Local (Sistema Especialista)
    const result = await this.processLocalLogic(userId, user, question);
    
    // Opcional: Registrar uso
    await this.repository.incrementUsage(userId);

    return {
      ...result,
      userName: user.name,
      source: "LOCAL_SYSTEM_EXPERT"
    };
  }

  /**
   * Fornece uma sugestão rápida para um exercício específico durante a execução
   */
  async getSuggestion(userId: string, exerciseId: string) {
    const user = await this.repository.getUserFitnessData(userId);
    const exercise = await this.repository.getExercises(user?.experienceLevel || "BEGINNER"); // Busca rápida para validar
    
    const goalType = (user?.goalType || "SAÚDE").toUpperCase();
    
    // Lógica de Sugestão baseada no objetivo
    let sets = 3;
    let reps = "10-12";
    let rest = 60;
    let effort = "RPE 7-8";
    let tip = "Mantenha o controle na fase excêntrica (descida).";

    if (goalType.includes("EMAGRECER")) {
      sets = 3; reps = "15-20"; rest = 30; effort = "RPE 9";
    } else if (goalType.includes("FORÇA")) {
      sets = 5; reps = "5-8"; rest = 120; effort = "RPE 9-10";
    } else if (goalType.includes("HIPERTROFIA")) {
      sets = 4; reps = "8-12"; rest = 90; effort = "RPE 8-9";
    }

    return {
      sets,
      reps,
      rest,
      effort,
      aiCoachTip: tip,
      recommendedWeight: 0, // Pode ser calculado baseado no histórico se houver
      reason: "Sugestão baseada no seu nível e objetivo atual."
    };
  }

  /**
   * O "Cérebro" do sistema: Decide o que responder baseado em palavras-chave
   */
  private async processLocalLogic(userId: string, user: any, question: string) {
    const q = question.toLowerCase();
    const name = user.name || "Atleta";
    const goalType = (user.goalType || "SAÚDE").toUpperCase();
    const weight = user.weightLogs?.[0]?.weight || 70;

    // 1. DICAS DO COACH
    const coachTips = [
      "Dica: Foque na cadência, controle a descida do peso para máximo rompimento de fibras! ⚡",
      "Dica: A hidratação é a chave para o rendimento. Beba água antes de sentir sede!",
      "Dica: Não ignore o descanso. É no sono que o músculo realmente cresce.",
      "Dica: A execução perfeita vence a carga alta. Menos ego, mais técnica!",
      "Dica: Tente progredir carga ou repetições a cada duas semanas para evitar o platô.",
      "Dica: O aquecimento específico previne lesões e prepara o sistema nervoso.",
    ];
    const randomTip = coachTips[Math.floor(Math.random() * coachTips.length)];

    // 2. CONFIGURAÇÃO DE SÉRIES/REPS POR OBJETIVO
    let sets = 3;
    let repsLabel = "10-12";
    let repsValue = 12; 
    let rest = 60;
    let effort = "Moderado (RPE 7-8)";

    if (goalType.includes("EMAGRECER") || goalType.includes("PERDA") || goalType.includes("DEFINIÇÃO")) {
      sets = 3; repsLabel = "15-20"; repsValue = 20; rest = 30; effort = "Intenso (RPE 9)";
    } else if (goalType.includes("FORÇA") || goalType.includes("POWER")) {
      sets = 5; repsLabel = "5-8"; repsValue = 6; rest = 120; effort = "Máximo (RPE 9-10)";
    } else if (goalType.includes("HIPERTROFIA") || goalType.includes("MASSA")) {
      sets = 4; repsLabel = "8-12"; repsValue = 10; rest = 90; effort = "Controlado (RPE 8-9)";
    }

    // Cenário 1: Pedido de Treino
    if (q.includes("treino") || q.includes("montar") || q.includes("exercício") || q.includes("cardio")) {
      let muscleGroups: string[] = [];
      let isCardio = q.includes("cardio") || q.includes("correr") || q.includes("pedalar");
      
      if (q.includes("costa")) muscleGroups.push("Costas");
      if (q.includes("perna")) muscleGroups.push("Pernas");
      if (q.includes("peito")) muscleGroups.push("Peito");
      if (q.includes("bíceps") || q.includes("biceps") || q.includes("braço")) muscleGroups.push("Braços");
      if (q.includes("tríceps") || q.includes("triceps")) muscleGroups.push("Braços");
      if (q.includes("ombro")) muscleGroups.push("Ombros");
      if (q.includes("core") || q.includes("abdômen") || q.includes("abdomen")) muscleGroups.push("Core");

      const lastWorkout = await this.repository.getLastWorkout(userId);
      let contextMsg = "";
      if (lastWorkout && muscleGroups.length === 0 && !isCardio) {
        const lastGroup = lastWorkout.exercises[0]?.exercise?.primaryMuscle?.name;
        if (lastGroup) {
          contextMsg = `\n*(Notei que seu último treino foi de **${lastGroup}**, então vamos variar hoje!)*\n`;
        }
      }

      if (isCardio && muscleGroups.length === 0) {
        const water = (weight * 0.035).toFixed(1);
        return {
          answer: `Certo ${name}! Para cardio focado em **${goalType}**, recomendo:\n\n1. **Corrida:** 30 min (Trote moderado)\n2. **Bike:** 40 min (Ritmo constante)\n3. **HIIT:** 15 min (30s explosão / 30s descanso)\n\nLembre-se de beber pelo menos **${water}L** de água hoje! 🏃💨`,
        };
      }

      let allExercises: any[] = [];
      const prefixes = ["Explosão de", "Foco Total:", "Desafio", "Protocolo", "Power", "Missão", "Intensidade", "Evolution"];
      const suffixes = ["Monstro", "Elite", "Pro", "Advanced", "300", "Hardcore", "Inabalável"];
      const randomName = (base: string) => {
        const p = prefixes[Math.floor(Math.random() * prefixes.length)];
        const s = suffixes[Math.floor(Math.random() * suffixes.length)];
        return `${p} ${base} ${s}`;
      };

      let workoutName = "";
      if (muscleGroups.length > 0) {
        for (const group of muscleGroups) {
          const exercises = await this.repository.getExercises(user.experienceLevel, group, 4);
          allExercises.push(...exercises);
        }
        workoutName = randomName(muscleGroups.join(" & "));
      } else {
        allExercises = await this.repository.getRandomExercisesByLevel(user.experienceLevel, 4);
        workoutName = randomName(goalType);
      }

      if (allExercises.length === 0) {
        return {
          answer: `Fala ${name}! Não encontrei exercícios específicos no momento. Tente pedir por um grupo muscular como 'Peito' ou 'Pernas'!`,
        };
      }

      const workoutData = {
        name: workoutName,
        exercises: allExercises.map(ex => ({
          exerciseId: ex.id,
          sets: sets,
          reps: repsValue
        }))
      };

      let table = `\n| Exercício | Séries | Reps | Descanso | Esforço |\n| :--- | :--- | :--- | :--- | :--- |\n`;
      allExercises.forEach(ex => { 
        const link = ex.tutorial ? ` [🔗](${ex.tutorial})` : "";
        table += `| ${ex.name}${link} | ${sets} | ${repsLabel} | ${rest}s | ${effort} |\n`; 
      });

      return {
        answer: `Fala ${name}! ${contextMsg}Para seu objetivo de **${goalType}**, montei este treino:\n${table}\n\n${randomTip}\n\nBora esmagar? 💪🔥`,
        workoutData
      };
    }

    if (q.includes("dieta") || q.includes("comer") || q.includes("caloria")) {
      const protein = (weight * 2).toFixed(0);
      const fat = (weight * 0.8).toFixed(0);
      const carbs = (weight * 3).toFixed(0);
      const water = (weight * 35 / 1000).toFixed(1);

      return {
        answer: `Certo ${name}! Para **${goalType}** com ${weight}kg, aqui está sua base nutricional:\n\n1. **Proteína:** ~${protein}g (Construção muscular)\n2. **Carbo:** ~${carbs}g (Energia para o treino)\n3. **Gordura:** ~${fat}g (Saúde hormonal)\n4. **Água:** Mínimo de **${water} Litros/dia**.\n\n**Dica Nutri:** Priorize comida de verdade e evite ultraprocessados! 🥩🍎`
      };
    }

    return {
      answer: `Olá ${name}! Sou seu Smart Coach Elite. 🤖\n\nPosso te ajudar a **montar um treino**, calcular sua **dieta** ou dar dicas de execução.\n\n${randomTip}`
    };
  }
}
