import { useState, useEffect } from "react";
import "./Exercicio.css";

export default function Treinos() {
  const [treinos, setTreinos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [grupo, setGrupo] = useState("todos");
  const [nivel, setNivel] = useState("todos");
  const [ativo, setAtivo] = useState(null);

  // 🔥 BUSCAR DA API
  useEffect(() => {
    fetch("http://localhost:3000/exercises")
      .then((res) => res.json())
      .then((data) => {
        setTreinos(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // 🔥 FILTRO ADAPTADO PRA API
  const filtrados = treinos.filter((t) => {
    return (
      (grupo === "todos" || t.category?.name === grupo) &&
      (nivel === "todos" || t.level === nivel)
    );
  });

  // 🔥 LOADING (IMPORTANTE)
  if (loading) {
    return <h2 style={{ color: "white" }}>Carregando...</h2>;
  }

  return (
    <div className="app">
      {/* HEADER */}
      <div className="header">
        <h1>
          GYM<span>PRO</span>
        </h1>
        <p>Transforme seu corpo com treinos personalizados</p>
      </div>

      {/* FILTROS */}
      <div className="filtros">
        <h3>Grupo muscular</h3>
        <div className="chips">
          {["todos", "biceps", "triceps", "peito", "costas", "ombros", "pernas", "abdomen"].map((g) => (
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
              <span className="badge">{t.level}</span>
              <h2>{t.name}</h2>
              <p>
                ⏱ {t.duration || "30 min"} • 🔥 {t.reps || 10} reps
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {ativo && (
        <div className="sheet" onClick={() => setAtivo(null)}>
          <div className="sheet-content" onClick={(e) => e.stopPropagation()}>
            <div className="handle" />

            <span className="badge">{ativo.level}</span>

            <h2>{ativo.name}</h2>
            <p>{ativo.duration}</p>

            <button className="start">Começar Treino</button>
          </div>
        </div>
      )}
    </div>
  );
}