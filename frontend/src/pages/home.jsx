import React, { useState, useEffect } from "react";
import { getWorkouts } from "../api/workoutService"; // 🔥 Mudamos para puxar os grupos (workouts)
import "./home.css";

export default function Home() {
  const [workouts, setWorkouts] = useState([]); // 🔥 Agora armazenamos grupos de treinos
  const [loading, setLoading] = useState(true);

  // Estados do modal
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getWorkouts(); // 🔥 Puxa os treinos do banco
        setWorkouts(data);
      } catch (err) {
        console.error("Erro ao carregar treinos:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Carregando seus planos...</p>
      </div>
    );
  }

  // ✅ ABRIR O GRUPO DE TREINO
  const openWorkout = (workout) => {
    if (workout.exercises && workout.exercises.length > 0) {
      setSelectedWorkout(workout);
      setStep(0);
      setFinished(false);
    } else {
      alert("Este treino não possui exercícios cadastrados.");
    }
  };

  const nextExercise = () => {
    if (step + 1 < selectedWorkout.exercises.length) {
      setStep(step + 1);
    } else {
      setFinished(true);
    }
  };

  const closeModal = () => {
    setSelectedWorkout(null);
    setStep(0);
    setFinished(false);
  };

  // Dados do exercício atual dentro do grupo
  const currentItem = selectedWorkout?.exercises?.[step];
  const currentExercise = currentItem?.exercise;

  // Tratamento de nomes (caso venham como objeto)
  const workoutName = typeof selectedWorkout?.name === "object" ? selectedWorkout?.name?.name : selectedWorkout?.name;
  const exerciseName = typeof currentExercise?.name === "object" ? currentExercise?.name?.name : currentExercise?.name;

  return (
    <div className="app-container">
      <header className="header">
        <h1>GYM<span>PRO</span></h1>
        <p>SEUS GRUPOS DE TREINO</p>
      </header>

      {/* GRID DE GRUPOS */}
      <main className="lista-grid">
        {workouts.map((treino) => {
          const name = typeof treino.name === "object" ? treino.name?.name : treino.name;
          // Pega a imagem do primeiro exercício do grupo para o card
          const thumb = treino.exercises?.[0]?.exercise?.image || "https://via.placeholder.com/300";

          return (
            <div key={treino.id} className="card-pill" onClick={() => openWorkout(treino)}>
              <div className="card-pill-image">
                <img src={thumb} alt={name} />
              </div>
              <div className="card-pill-content">
                <h2>{name}</h2>
                <span className="count-tag">
                  {treino.exercises?.length || 0} EXERCÍCIOS
                </span>
              </div>
            </div>
          );
        })}
      </main>

      {/* 🔥 MODAL DE EXECUÇÃO DO GRUPO */}
      {selectedWorkout && (
        <div className="modal-overlay">
          <div className="modal-sheet">
            {!finished && (
              <>
                <div className="progresso-track">
                  <div
                    className="progresso-fill"
                    style={{
                      width: `${((step + 1) / selectedWorkout.exercises.length) * 100}%`,
                    }}
                  ></div>
                </div>

                <p className="step-count">
                  {workoutName} • {step + 1} DE {selectedWorkout.exercises.length}
                </p>

                <div className="container-foto-trava">
                  <img src={currentExercise?.image || "https://via.placeholder.com/300"} alt="" />
                </div>

                <h2 className="nome-exercicio-foco">{exerciseName}</h2>

                <div className="status-grid">
                  <div className="status-item">
                    <span>SÉRIES</span>
                    <p>{currentItem?.sets || 4}</p>
                  </div>
                  <div className="status-item">
                    <span>REPS</span>
                    <p>{currentItem?.reps || 10}</p>
                  </div>
                </div>

                <button className="btn-main" onClick={nextExercise}>
                  {step + 1 === selectedWorkout.exercises.length ? "FINALIZAR TREINO" : "PRÓXIMO EXERCÍCIO"}
                </button>

                <button className="btn-secundario" onClick={closeModal}>CANCELAR</button>
              </>
            )}

            {finished && (
              <div className="view-finalizado">
                <div className="icon-celebration">🏆</div>
                <h2>TREINO CONCLUÍDO!</h2>
                <p>Você finalizou o plano <strong>{workoutName}</strong>.</p>
                <button className="btn-main" onClick={closeModal}>VOLTAR</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}