import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getExercises, createPersonalWorkout } from "../api/workoutService";
import "./CriarTreino.css";
import CustomAlert from "./CustomAlert";

// Ícones
const ArrowLeftIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>;
const SearchIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const CheckIcon = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="#ff4500" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>;

export default function CriarTreino() {
  const navigate = useNavigate();
  const [nomeTreino, setNomeTreino] = useState("");
  const [exerciciosBanco, setExerciciosBanco] = useState([]);
  const [selecionados, setSelecionados] = useState([]);
  const [busca, setBusca] = useState("");
  const [alertConfig, setAlertConfig] = useState({ isOpen: false });

  const showAlert = (title, message, type, onConfirm) => {
    setAlertConfig({
      isOpen: true,
      title,
      message,
      type,
      onConfirm: onConfirm || (() => setAlertConfig({ isOpen: false }))
    });
  };

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
      return showAlert("Atenção", "Preencha o nome e escolha ao menos um exercício!", "error");
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
      showAlert("Sucesso", "Treino criado e salvo no seu perfil!", "success", () => {
        setAlertConfig({ isOpen: false });
        navigate("/exercicio");
      });
    } catch (err) {
      showAlert("Erro", "Ocorreu um erro ao salvar o treino. Tente novamente.", "error");
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
            <ArrowLeftIcon />
            <span>Voltar</span>
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
          <div className="search-wrapper" style={{ position: "relative", width: "100%" }}>
            <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <SearchIcon />
            </div>
            <input
              className="input-custom search"
              placeholder="Buscar exercício..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={{ paddingLeft: "42px" }}
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
                {isSelected && <div className="overlay-check"><CheckIcon /></div>}
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

      <CustomAlert config={alertConfig} />
    </div>
  );
}