import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCatalogWorkouts } from "../api/workoutService";
import "./home.css";
import CustomAlert from "../Componentes/CustomAlert";

const DumbbellIcon = () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3"><path d="M14.4 14.4 9.6 9.6"/><path d="M18.65 21.35a2 2 0 0 1-2.83 0l-5.66-5.66a2 2 0 0 1 0-2.83l.06-.06a2 2 0 0 1 2.83 0l5.66 5.66a2 2 0 0 1 0 2.83Z"/><path d="m2 2 2.83 2.83"/><path d="M4 4l-2 2"/><path d="m4 4 2-2"/><path d="m4 4 5.66 5.66a2 2 0 0 0 2.83 0l.06-.06a2 2 0 0 0 0-2.83L6.89 1.11a2 2 0 0 0-2.83 0l-2.83 2.83Z"/><path d="m22 22-2.83-2.83"/><path d="M20 20l2-2"/><path d="m20 20-2 2"/></svg>;
const ListIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
const PlayCircleIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const SearchIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;

export default function Home() {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [alertConfig, setAlertConfig] = useState({ isOpen: false });

  const showAlert = (title, message, type) => {
    setAlertConfig({
      isOpen: true, title, message, type,
      onConfirm: () => setAlertConfig({ isOpen: false })
    });
  };

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
      showAlert("Atenção", "Este treino do catálogo ainda não possui exercícios cadastrados.", "error");
      return;
    }
    
    const workoutSeguro = JSON.parse(JSON.stringify(workout));
    navigate("/executar-treino", { state: { workout: workoutSeguro } });
  };

  const treinosFiltrados = workouts.filter((treino) => {
    const name = typeof treino.name === "object" ? treino.name?.name : treino.name;
    return name?.toLowerCase().includes(busca.toLowerCase());
  });

  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="app-logo">
          GYM<span>PRO</span>
        </h1>
        <p className="greeting">Pronto para treinar?</p>
        <h2>
          Catálogo <span>Oficial</span>
        </h2>
      </header>

      <div className="home-search-wrapper">
        <div className="home-search-icon">
          <SearchIcon />
        </div>
        <input
          type="text"
          className="home-search-input"
          placeholder="Buscar no catálogo..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {loading ? (
        <main className="home-grid">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="home-card skeleton-card"></div>
          ))}
        </main>
      ) : treinosFiltrados.length === 0 ? (
        <div className="empty-state">
          <DumbbellIcon />
          <p style={{ marginTop: "1rem" }}>Nenhum treino encontrado.</p>
        </div>
      ) : (
        <main className="home-grid">
          {treinosFiltrados.map((treino) => {
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

                <div className="card-play-btn">
                  <PlayCircleIcon />
                </div>

                <div className="home-card-overlay">
                  <h2>{name}</h2>
                  <span>
                    <ListIcon />
                    {treino.exercises?.length || 0} EXERCÍCIOS
                  </span>
                </div>
              </div>
            );
          })}
        </main>
      )}

      <CustomAlert config={alertConfig} />
    </div>
  );
}