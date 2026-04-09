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
    const jaExiste = selecionados.find(s => s.id === ex.id);
    if (jaExiste) {
      setSelecionados(selecionados.filter(s => s.id !== ex.id));
    } else {
      setSelecionados([...selecionados, { ...ex, sets: 3, reps: 12 }]);
    }
  };

  const handleSalvar = async () => {
    if (!nomeTreino || selecionados.length === 0) {
      return alert("Preencha o nome e escolha ao menos um exercício!");
    }

    try {
      const payload = {
        name: nomeTreino,
        exercises: selecionados.map(ex => ({ 
          exerciseId: ex.id, 
          sets: 3, 
          reps: 12 
        }))
      };

      await createPersonalWorkout(payload);
      alert("Treino salvo com sucesso!");
      navigate("/exercicio"); // Nome da sua rota de listagem
    } catch (err) {
      console.error("Erro detalhado:", err);
      alert("Erro 404: Verifique se o servidor backend está rodando e se a rota /workouts/create existe.");
    }
  };

  return (
    <div className="criacao-full-container">
      <header className="header-voltar">
        <button onClick={() => navigate(-1)}>← Voltar</button>
        <h2>NOVO <span>CARD</span></h2>
        <input 
          className="input-nome" 
          placeholder="Dê um nome ao treino..." 
          onChange={(e) => setNomeTreino(e.target.value)} 
        />
        <input 
          className="input-busca" 
          placeholder="🔍 Buscar exercício..." 
          onChange={(e) => setBusca(e.target.value)} 
        />
      </header>

      <div className="grid-exercicios">
        {exerciciosBanco
          .filter(ex => ex.name.toLowerCase().includes(busca.toLowerCase()))
          .map(ex => (
            <div 
              key={ex.id} 
              className={`card-ex-mini ${selecionados.find(s => s.id === ex.id) ? 'active' : ''}`} 
              onClick={() => toggleExercicio(ex)}
            >
              <div className="img-holder">
                <img src={ex.image} alt="" />
                {selecionados.find(s => s.id === ex.id) && <div className="check">✓</div>}
              </div>
              <p>{ex.name}</p>
            </div>
          ))}
      </div>

      {selecionados.length > 0 && (
        <footer className="footer-save">
          <button onClick={handleSalvar}>SALVAR MEU TREINO</button>
        </footer>
      )}
    </div>
  );
}