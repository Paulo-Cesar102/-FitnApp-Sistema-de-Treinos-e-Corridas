import React, { useState, useEffect } from "react";
import { getUserWorkouts, deleteWorkout } from "../api/workoutService";
import { useNavigate } from "react-router-dom";
import "./Treinos.css";
import CustomAlert from "../Componentes/CustomAlert";

// Ícones
const PlusIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const TrashIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>;
const PlayIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>;

export default function Treinos() {
  const [myWorkouts, setMyWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [alertConfig, setAlertConfig] = useState({ isOpen: false });

  const showAlert = (title, message, type) => {
    setAlertConfig({
      isOpen: true, title, message, type,
      onConfirm: () => setAlertConfig({ isOpen: false })
    });
  };

  const showConfirm = (title, message, onConfirm) => {
    setAlertConfig({
      isOpen: true, 
      title, 
      message, 
      type: "error", 
      confirmText: "Apagar", 
      cancelText: "Cancelar",
      onConfirm, 
      onCancel: () => setAlertConfig({ isOpen: false })
    });
  };

  const fetchMyData = async () => {
    try {
      const data = await getUserWorkouts();
      setMyWorkouts(data);
    } catch (err) {
      console.error("Erro ao carregar seus treinos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyData();
  }, []);

  const startTraining = (workout) => {
    if (workout?.exercises?.length > 0) {
      const workoutSeguro = JSON.parse(JSON.stringify(workout));
      navigate("/executar-treino", { state: { workout: workoutSeguro } });
    } else {
      showAlert("Atenção", "Adicione exercícios a este treino para poder iniciar a rotina.", "error");
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    
    showConfirm("Apagar Treino", "Tem certeza que deseja apagar este treino permanentemente?", async () => {
      setAlertConfig({ isOpen: false });
      try {
        await deleteWorkout(id);
        setMyWorkouts((prev) => prev.filter((w) => w.id !== id));
      } catch (err) {
        showAlert("Erro", "Erro ao excluir o treino. Tente novamente.", "error");
      }
    });
  };

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
          <PlusIcon />
          <span>NOVO</span>
        </button>
      </header>

      {loading ? (
        <div className="user-grid">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="user-card skeleton-card" style={{ height: "280px" }}></div>
          ))}
        </div>
      ) : myWorkouts.length === 0 ? (
        <div className="empty-state">
          <p>Você ainda não criou nenhum treino personalizado.</p>
        </div>
      ) : (
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
                    <TrashIcon />
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
                    <PlayIcon />
                    <span>INICIAR</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CustomAlert config={alertConfig} />
    </div>
  );
}