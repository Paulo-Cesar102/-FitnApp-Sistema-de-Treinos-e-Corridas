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
        console.log("EXERCICIOS:", data);

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
      setSelecionados((prev) => [
        ...prev,
        {
          ...ex,
          sets: 3,
          reps: 12,
        },
      ]);
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
          sets: Number(ex.sets) || 3,
          reps: Number(ex.reps) || 12,
        })),
      };

      console.log("PAYLOAD:", payload);

      await createPersonalWorkout(payload);

      alert("Treino salvo com sucesso!");
      navigate("/exercicio");
    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert("Erro ao salvar o treino.");
    }
  };

  const exerciciosFiltrados = exerciciosBanco.filter((ex) => {
    const name =
      typeof ex.name === "object" ? ex.name?.name : ex.name;

    return name?.toLowerCase().includes(busca.toLowerCase());
  });

  return (
    <div className="criacao-full-container">
      <header className="header-voltar">
        <button className="btn-back" onClick={() => navigate(-1)}>
          ← Voltar
        </button>

        <h2>
          NOVO <span>TREINO</span>
        </h2>

        <input
          className="input-nome"
          placeholder="Dê um nome ao treino..."
          value={nomeTreino}
          onChange={(e) => setNomeTreino(e.target.value)}
        />

        <input
          className="input-busca"
          placeholder="🔍 Buscar exercício..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </header>

      <div className="grid-exercicios">
        {exerciciosFiltrados.map((ex) => {
          const name =
            typeof ex.name === "object" ? ex.name?.name : ex.name;

          const isSelected = selecionados.some(
            (s) => s.id === ex.id
          );

          return (
            <div
              key={ex.id}
              className={`card-ex-mini ${
                isSelected ? "active" : ""
              }`}
              onClick={() => toggleExercicio(ex)}
            >
              <div className="img-holder">
                <img
                  src={
                    ex.image ||
                    "https://via.placeholder.com/150"
                  }
                  alt={name}
                />

                {isSelected && (
                  <div className="check">✓</div>
                )}
              </div>

              <p>{name}</p>
            </div>
          );
        })}
      </div>

      {selecionados.length > 0 && (
        <footer className="footer-save">
          <button className="btn-save" onClick={handleSalvar}>
            SALVAR ({selecionados.length})
          </button>
        </footer>
      )}
    </div>
  );
}