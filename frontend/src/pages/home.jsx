import React, { useState, useEffect } from "react";
import { getCatalogWorkouts } from "../api/workoutService";
import "./home.css";

export default function Home() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getCatalogWorkouts();
        setWorkouts(data);
      } catch (err) {
        console.error("Erro ao carregar catálogo:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const openWorkout = (workout) => {
    if (!workout?.exercises?.length) {
      alert("⚠️ Este treino não possui exercícios.");
      return;
    }

    setSelectedWorkout(workout);
    setStep(0);
    setFinished(false);
  };

  const nextExercise = () => {
    if (step + 1 < selectedWorkout.exercises.length) {
      setStep((prev) => prev + 1);
    } else {
      setFinished(true);
    }
  };

  const closeModal = () => {
    setSelectedWorkout(null);
    setStep(0);
    setFinished(false);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Carregando catálogo oficial...</p>
      </div>
    );
  }

  const currentItem = selectedWorkout?.exercises?.[step];
  const currentExercise = currentItem?.exercise;

  const workoutName =
    typeof selectedWorkout?.name === "object"
      ? selectedWorkout?.name?.name
      : selectedWorkout?.name;

  const exerciseName =
    typeof currentExercise?.name === "object"
      ? currentExercise?.name?.name
      : currentExercise?.name;

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>
          GYM<span>PRO</span>
        </h1>
        <p>CATÁLOGO DE TREINOS</p>
      </header>

      {workouts.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum treino disponível 😢</p>
        </div>
      ) : (
        <main className="home-grid">
          {workouts.map((treino) => {
            const name =
              typeof treino.name === "object"
                ? treino.name?.name
                : treino.name;

            const thumb =
              treino.exercises?.[0]?.exercise?.image ||
              "https://placehold.co/300";

            return (
              <div
                key={treino.id}
                className="home-card"
                onClick={() => openWorkout(treino)}
              >
                <img
                  src={thumb}
                  onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/300";
                  }}
                  alt={name}
                />

                <div className="home-card-overlay">
                  <h2>{name}</h2>
                  <span>
                    {treino.exercises?.length || 0} EXERCÍCIOS
                  </span>
                </div>
              </div>
            );
          })}
        </main>
      )}

      {/* MODAL */}
      {selectedWorkout && (
        <div className="modal-overlay">
          <div className="modal-sheet">
            {!finished ? (
              <>
                <div className="progresso-track">
                  <div
                    className="progresso-fill"
                    style={{
                      width: `${
                        ((step + 1) /
                          selectedWorkout.exercises.length) *
                        100
                      }%`,
                    }}
                  />
                </div>

                <p className="step-count">
                  {workoutName} • {step + 1}/
                  {selectedWorkout.exercises.length}
                </p>

                <div className="container-foto-trava">
                  <img
                    src={
                      currentExercise?.image ||
                      "https://placehold.co/300"
                    }
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://placehold.co/300";
                    }}
                    alt={exerciseName}
                  />
                </div>

                <h2 className="nome-exercicio-foco">
                  {exerciseName}
                </h2>

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
                  {step + 1 ===
                  selectedWorkout.exercises.length
                    ? "FINALIZAR"
                    : "PRÓXIMO"}
                </button>

                <button
                  className="btn-secundario"
                  onClick={closeModal}
                >
                  CANCELAR
                </button>
              </>
            ) : (
              <div className="view-finalizado">
                <div className="icon-celebration">🏆</div>
                <h2>TREINO CONCLUÍDO!</h2>

                <button className="btn-main" onClick={closeModal}>
                  VOLTAR
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}