import { useState, useEffect } from "react";
import "./Exercicio.css";
import { getExercises } from "../api/exerciseService";

export default function Treinos() {
  const [treinos, setTreinos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [grupo, setGrupo] = useState("todos");
  const [nivel, setNivel] = useState("todos");
  const [ativo, setAtivo] = useState(null);

  useEffect(() => {
    async function loadExercises() {
      try {
        const data = await getExercises();
        setTreinos(data);
      } catch (err) {
        console.error("Erro ao carregar treinos:", err);
      } finally {
        setLoading(false);
      }
    }
    loadExercises();
  }, []);

  // LÓGICA DE FILTRO CORRIGIDA
  const filtrados = treinos.filter((t) => {
    // 1. Filtro de Grupo Muscular (compara o nome que vem do banco)
    const grupoNoBanco = t.primaryMuscle?.name?.toLowerCase() || "";
    const matchGrupo = grupo === "todos" || grupoNoBanco === grupo.toLowerCase();

    // 2. Filtro de Nível (Mapeia o label do botão para o ENUM do Prisma)
    const niveisMap = {
      todos: "todos",
      iniciante: "BEGINNER",
      intermediario: "INTERMEDIATE",
      avancado: "ADVANCED",
    };
    const matchNivel = nivel === "todos" || t.level === niveisMap[nivel];

    return matchGrupo && matchNivel;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <h2>🔥 Preparando sua ficha...</h2>
      </div>
    );
  }

  return (
    <div className="app">
      {/* HEADER */}
      <header className="header">
        <h1>GYM<span>PRO</span></h1>
        <p>TRANSFORME SEU CORPO COM TREINOS PERSONALIZADOS</p>
      </header>

      {/* FILTROS */}
      <section className="filtros">
        <div className="filtro-secao">
          <h3>Grupo muscular</h3>
          <div className="chips">
            {["todos", "peito", "costas", "ombros", "biceps", "triceps", "pernas", "abdomen"].map((g) => (
              <button
                key={g}
                className={grupo === g ? "chip ativo" : "chip"}
                onClick={() => setGrupo(g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="filtro-secao">
          <h3>Nível de dificuldade</h3>
          <div className="chips">
            {["todos", "iniciante", "intermediario", "avancado"].map((n) => (
              <button
                key={n}
                className={nivel === n ? "chip ativo" : "chip"}
                onClick={() => setNivel(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="contagem">
        {filtrados.length} exercícios encontrados
      </div>

      {/* LISTA DE EXERCÍCIOS */}
      <main className="lista">
        {filtrados.length > 0 ? (
          filtrados.map((t) => (
            <div key={t.id} className="card" onClick={() => setAtivo(t)}>
              <div className="card-thumb">
                <img src={t.image} alt={t.name} />
                <div className="card-overlay" />
                <span className={`badge-nivel ${t.level.toLowerCase()}`}>
                  {t.level === "BEGINNER" ? "Iniciante" : t.level === "INTERMEDIATE" ? "Intermediário" : "Avançado"}
                </span>
              </div>
              <div className="card-content">
                <h2>{t.name}</h2>
                <div className="card-details">
                  <span>⏱ {t.duration}</span>
                  <span>🔥 {t.reps} reps</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="vazio">
            <p>Nenhum treino encontrado para esses filtros 😕</p>
          </div>
        )}
      </main>

      {/* MODAL DETALHES */}
      {ativo && (
        <div className="modal-overlay" onClick={() => setAtivo(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-bar" />
            <span className={`badge-nivel ${ativo.level.toLowerCase()}`}>{ativo.level}</span>
            <h2>{ativo.name}</h2>
            <p className="modal-desc">{ativo.description}</p>
            <div className="modal-stats">
              <div className="stat">
                <small>Tempo</small>
                <strong>{ativo.duration}</strong>
              </div>
              <div className="stat">
                <small>Séries/Reps</small>
                <strong>{ativo.reps}x</strong>
              </div>
            </div>
            <button className="btn-start" onClick={() => setAtivo(null)}>
              COMEÇAR TREINO
            </button>
          </div>
        </div>
      )}
    </div>
  );
}