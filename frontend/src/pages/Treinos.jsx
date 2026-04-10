import React, { useState, useEffect } from "react";
import { getUserWorkouts, deleteWorkout } from "../api/workoutService";
import { useNavigate } from "react-router-dom";
import "./Treinos.css";

export default function Treinos() {
  const [myWorkouts, setMyWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [activeWorkout, setActiveWorkout] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    async function fetchMyData() {
      try {
        const data = await getUserWorkouts();
        console.log("MEUS TREINOS:", data);

        setMyWorkouts(data);
      } catch (err) {
        console.error("Erro ao carregar seus treinos:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMyData();
  }, []);

  const startTraining = (workout) => {
    if (workout?.exercises?.length > 0) {
      setActiveWorkout(workout);
      setCurrentStep(0);
      setIsFinished(false);
    } else {
      alert("Adicione exercícios a este treino para começar!");
    }
  };

  const next = () => {
    if (!activeWorkout?.exercises) return;

    if (currentStep + 1 < activeWorkout.exercises.length) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const close = () => {
    setActiveWorkout(null);
    setCurrentStep(0);
    setIsFinished(false);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();

    if (!window.confirm("Apagar este treino?")) return;

    try {
      await deleteWorkout(id);
      setMyWorkouts((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      alert("Erro ao excluir.");
    }
  };

  if (loading) {
    return <div className="loading">Carregando seus treinos...</div>;
  }

  const currentItem = activeWorkout?.exercises?.[currentStep];
  const exData = currentItem?.exercise;

  const workoutName =
    typeof activeWorkout?.name === "object"
      ? activeWorkout?.name?.name
      : activeWorkout?.name;

  return (
    <div className="user-workouts-container">
      <header className="user-header">
        <h1>
          MEUS <span>TREINOS</span>
        </h1>

        <button
          className="add-btn"
          onClick={() => navigate("/criar-treino")}
        >
          + NOVO
        </button>
      </header>

      <div className="user-grid">
        {myWorkouts.map((treino) => {
          const nameDisplay =
            typeof treino.name === "object"
              ? treino.name?.name
              : treino.name;

          const thumb =
            treino.exercises?.[0]?.exercise?.image ||
            "https://placehold.co/300";

          return (
            <div
              key={treino.id}
              className="user-card"
              onClick={() => startTraining(treino)}
            >
              <div className="user-card-top">
                <img
                  src={thumb}
                  onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/300";
                  }}
                  alt="Treino"
                />

                <button
                  className="delete-btn"
                  onClick={(e) => handleDelete(e, treino.id)}
                >
                  🗑️
                </button>
              </div>

              <div className="user-card-body">
                <h3>{nameDisplay || "Treino Sem Nome"}</h3>
                <p>{treino.exercises?.length || 0} EXERCÍCIOS</p>

                <button
                  className="start-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    startTraining(treino);
                  }}
                >
                  INICIAR
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL */}
      {activeWorkout && (
        <div className="modal-overlay">
          <div className="modal-sheet">
            {!isFinished ? (
              <>
                <div className="progresso-track">
                  <div
                    className="progresso-fill"
                    style={{
                      width: `${
                        activeWorkout?.exercises?.length
                          ? ((currentStep + 1) /
                              activeWorkout.exercises.length) *
                            100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>

                <p className="step-count">
                  {workoutName} • {currentStep + 1}/
                  {activeWorkout.exercises.length}
                </p>

                <div className="container-foto-trava">
                  <img
                    src={
                      exData?.image ||
                      "https://placehold.co/300"
                    }
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://placehold.co/300";
                    }}
                    alt="Exercício"
                  />
                </div>

                <h2 className="nome-exercicio-foco">
                  {exData?.name || "Exercício"}
                </h2>

                <div className="status-grid">
                  <div className="status-item">
                    <span>SÉRIES</span>
                    <p>{currentItem?.sets || 3}</p>
                  </div>

                  <div className="status-item">
                    <span>REPS</span>
                    <p>{currentItem?.reps || 12}</p>
                  </div>
                </div>

                <button className="btn-main" onClick={next}>
                  {currentStep + 1 === activeWorkout.exercises.length
                    ? "CONCLUIR"
                    : "PRÓXIMO"}
                </button>

                <button className="btn-secundario" onClick={close}>
                  SAIR
                </button>
              </>
            ) : (
              <div className="view-finalizado">
                <div className="icon-celebration">🔥</div>
                <h2>TREINO CONCLUÍDO!</h2>

                <p>
                  Você completou o{" "}
                  <strong>{workoutName}</strong>.
                </p>

                <button className="btn-main" onClick={close}>
                  FECHAR
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}