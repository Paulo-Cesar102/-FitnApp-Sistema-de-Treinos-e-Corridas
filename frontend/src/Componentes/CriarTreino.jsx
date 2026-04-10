import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getExercises, createPersonalWorkout } from "../api/workoutService";
import "./CriarTreino.css";

export default function CriarTreino() {
  const navigate = useNavigate();
  const [nomeTreino, setNomeTreino] = useState("");
  const [exerciciosBanco, setExerciciosBanco] = useState([]);
  const [selecionados, setSelecionados] = useState([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getExercises();
        setExerciciosBanco(data);
      } catch (err) {
        console.error("Erro ao carregar banco:", err);
      }
    }
    load();
  }, []);

  const toggleExercicio = (ex) => {
    const jaExiste = selecionados.find((s) => s.id === ex.id);
    if (jaExiste) {
      setSelecionados((prev) => prev.filter((s) => s.id !== ex.id));
    } else {
      setSelecionados((prev) => [...prev, { ...ex, sets: 3, reps: 12 }]);
    }
  };

  const handleSalvar = async () => {
    if (!nomeTreino.trim() || selecionados.length === 0) {
      return alert("Preencha o nome e escolha ao menos um exercício!");
    }
    try {
      const payload = {
        name: nomeTreino,
        exercises: selecionados.map((ex) => ({
          exerciseId: ex.id,
          sets: 3,
          reps: 12,
        })),
      };
      await createPersonalWorkout(payload);
      alert("Treino criado com sucesso! 🔥");
      navigate("/exercicio");
    } catch (err) {
      alert("Erro ao salvar o treino.");
    }
  };

  const exerciciosFiltrados = exerciciosBanco.filter((ex) => {
    const name = typeof ex.name === "object" ? ex.name?.name : ex.name;
    return name?.toLowerCase().includes(busca.toLowerCase());
  });

  return (
    <div className="criacao-container">
      <header className="header-mobile">
        <div className="top-bar">
          <button className="back-minimal" onClick={() => navigate(-1)}>
            ← <span>Voltar</span>
          </button>
          <h2 className="title-glow">NOVO <span>TREINO</span></h2>
          <div style={{ width: 45 }}></div> 
        </div>

        <div className="input-group-stack">
          <input
            className="input-custom"
            placeholder="Ex: Treino de Segunda"
            value={nomeTreino}
            onChange={(e) => setNomeTreino(e.target.value)}
          />
          <div className="search-box">
            <input
              className="input-custom search"
              placeholder="🔍 Buscar exercício..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="grid-mobile-stack">
        {exerciciosFiltrados.map((ex) => {
          const name = typeof ex.name === "object" ? ex.name?.name : ex.name;
          const isSelected = selecionados.some((s) => s.id === ex.id);

          return (
            <div
              key={ex.id}
              className={`exercise-card-minimal ${isSelected ? "selected" : ""}`}
              onClick={() => toggleExercicio(ex)}
            >
              <div className="image-wrapper">
                <img 
                  src={ex.image || "https://placehold.co/150x100/111/ff4500?text=GymPro"} 
                  alt={name}
                  onError={(e) => { e.currentTarget.src = "https://placehold.co/150x100/111/ff4500?text=GymPro"; }}
                />
                {isSelected && <div className="overlay-check">✓</div>}
              </div>
              <p className="exercise-name-label">{name}</p>
            </div>
          );
        })}
      </div>

      {selecionados.length > 0 && (
        <div className="save-footer-mobile">
          <button className="btn-confirm-save" onClick={handleSalvar}>
            SALVAR TREINO ({selecionados.length})
          </button>
        </div>
      )}
    </div>
  );
}