import { useState } from "react";
import "./Exercicio.css";

// 🔥 MOCK no formato da API
const treinosMock = [
  {
    id: "1",
    name: "Abdominal Iniciante",
    level: "iniciante",
    duration: "30 min",
    reps: 10,
    image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e",
    category: { name: "abdomen" }
  },
  {
    id: "2",
    name: "Bíceps Intermediário",
    level: "intermediario",
    duration: "40 min",
    reps: 12,
    image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61",
    category: { name: "biceps" }
  }
];

export default function Exercicio() {
  const [treinos] = useState(treinosMock);
  const [grupo, setGrupo] = useState("todos");
  const [nivel, setNivel] = useState("todos");
  const [ativo, setAtivo] = useState(null);

  const filtrados = treinos.filter((t) => {
    return (
      (grupo === "todos" || t.category.name === grupo) &&
      (nivel === "todos" || t.level === nivel)
    );
  });

  return (
    <div className="app">
      {/* HEADER */}
      <div className="header">
        <h1>GYM<span>PRO</span></h1>
        <p>Transforme seu corpo com treinos personalizados</p>
      </div>

      {/* FILTROS */}
      <div className="filtros">
        <h3>Grupo muscular</h3>
        <div className="chips">
          {["todos", "biceps", "abdomen"].map((g) => (
            <button
              key={g}
              className={grupo === g ? "chip ativo" : "chip"}
              onClick={() => setGrupo(g)}
            >
              {g}
            </button>
          ))}
        </div>

        <h3>Nível</h3>
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

      {/* LISTA */}
      <div className="lista">
        {filtrados.map((t) => (
          <div key={t.id} className="card" onClick={() => setAtivo(t)}>
            <img src={t.image} alt="" />
            <div className="overlay" />

            <div className="card-info">
              <span className={`badge ${t.level}`}>{t.level}</span>
              <h2>{t.name}</h2>
              <p>⏱ {t.duration} • 🔥 {t.reps} reps</p>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {ativo && (
        <div className="sheet" onClick={() => setAtivo(null)}>
          <div className="sheet-content" onClick={(e) => e.stopPropagation()}>
            <div className="handle" />

            <span className={`badge ${ativo.level}`}>
              {ativo.level}
            </span>

            <h2>{ativo.name}</h2>
            <p>{ativo.duration}</p>

            <button className="start">Começar Treino</button>
          </div>
        </div>
      )}
    </div>
  );
}