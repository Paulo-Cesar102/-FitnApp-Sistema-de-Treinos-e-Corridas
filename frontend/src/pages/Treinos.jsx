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
        setMyWorkouts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchMyData();
  }, []);

  const startTraining = (workout) => {
    if (!workout?.exercises?.length) {
      alert("⚠️ Esse treino ainda não possui exercícios!");
      return;
    }

    setActiveWorkout(workout);
    setCurrentStep(0);
    setIsFinished(false);
  };

  const next = () => {
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
    } catch {
      alert("Erro ao excluir.");
    }
  };

  if (loading) return <div className="loading">Carregando...</div>;

  const currentItem = activeWorkout?.exercises?.[currentStep];
  const exData = currentItem?.exercise;

  return (
    <div className="user-workouts-container">
      <header className="user-header">
        <h1>MEUS <span>TREINOS</span></h1>
        <button className="add-btn" onClick={() => navigate("/criar-treino")}>
          + NOVO
        </button>
      </header>

      {myWorkouts.length === 0 ? (
        <div className="empty-state">
          <p>Você ainda não criou nenhum treino 😢</p>
        </div>
      ) : (
        <div className="user-grid">
          {myWorkouts.map((treino) => {
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
                  />

                  <button
                    className="delete-btn"
                    onClick={(e) => handleDelete(e, treino.id)}
                  >
                    🗑️
                  </button>
                </div>

                <div className="user-card-body">
                  <h3>{treino.name}</h3>
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
      )}

      {/* MODAL */}
      {activeWorkout && (
        <div className="modal-overlay">
          <div className="modal-sheet scrollable">

            {!isFinished ? (
              <>
                <div className="progresso-track">
                  <div
                    className="progresso-fill"
                    style={{
                      width: `${((currentStep + 1) / activeWorkout.exercises.length) * 100}%`,
                    }}
                  />
                </div>

                <p className="step-count">
                  {activeWorkout.name} • {currentStep + 1}/{activeWorkout.exercises.length}
                </p>

                <div className="container-foto-trava">
                  <img src={exData?.image || "https://placehold.co/300"} />
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