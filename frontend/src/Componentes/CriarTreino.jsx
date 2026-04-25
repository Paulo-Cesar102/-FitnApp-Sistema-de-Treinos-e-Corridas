import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getExercises, createPersonalWorkout } from "../api/workoutService";
import "./CriarTreino.css";
import CustomAlert from "./CustomAlert";

// Premium Icons
const ArrowLeftIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>;
const SearchIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const CheckIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const DumbbellIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 15H4a2 2 0 0 1-2-2V11a2 2 0 0 1 2-2h2m12 6h2a2 2 0 0 0 2-2V11a2 2 0 0 0-2-2h-2M9 7v10m6-10v10m-6-5h6"/></svg>;

export default function CriarTreino({ onCreated, students = [] }) {
  const navigate = useNavigate();
  const [nomeTreino, setNomeTreino] = useState("");
  const [exerciciosBanco, setExerciciosBanco] = useState([]);
  const [selecionados, setSelecionados] = useState([]);
  const [busca, setBusca] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedMuscle, setSelectedMuscle] = useState("ALL");
  const [showNameModal, setShowNameModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ isOpen: false });
  const [targetUserId, setTargetUserId] = useState(localStorage.getItem("userId"));

  const isPersonal = localStorage.getItem("role") === "PERSONAL";

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
        setExerciciosBanco(data || []);
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
    if (!nomeTreino.trim()) return;
    try {
      const payload = {
        name: nomeTreino,
        userId: targetUserId,
        exercises: selecionados.map((ex) => ({
          exerciseId: ex.id,
          sets: 3,
          reps: 12,
        })),
      };
      await createPersonalWorkout(payload);
      setShowNameModal(false);
      showAlert("Sucesso", "Plano criado com sucesso!", "success", () => {
        setAlertConfig({ isOpen: false });
        if (onCreated) {
          onCreated();
        } else {
          navigate("/treinos");
        }
      });
    } catch (err) {
      showAlert("Erro", "Ocorreu um erro ao salvar o treino. Tente novamente.", "error");
    }
  };

  const categories = ["ALL", ...new Set(exerciciosBanco.map(ex => ex.category?.name).filter(Boolean))];
  const muscles = ["ALL", ...new Set(exerciciosBanco.map(ex => ex.primaryMuscle?.name).filter(Boolean))];

  const getDifficultyLabel = (level) => {
    switch(level) {
      case "BEGINNER": return "Iniciante";
      case "INTERMEDIATE": return "Intermediário";
      case "ADVANCED": return "Avançado";
      default: return "Geral";
    }
  };

  const exerciciosFiltrados = exerciciosBanco.filter((ex) => {
    const name = (typeof ex.name === "object" ? ex.name?.name : ex.name) || "";
    const matchesSearch = name.toLowerCase().includes(busca.toLowerCase());
    const matchesDifficulty = selectedDifficulty === "ALL" || ex.level === selectedDifficulty;
    const matchesCategory = selectedCategory === "ALL" || ex.category?.name === selectedCategory;
    const matchesMuscle = selectedMuscle === "ALL" || ex.primaryMuscle?.name === selectedMuscle;
    
    return matchesSearch && matchesDifficulty && matchesCategory && matchesMuscle;
  });

  return (
    <div className="criacao-container-v3">
      <header className="criacao-header-premium">
        <div className="top-nav">
          <button className="btn-back-v3" onClick={() => navigate(-1)}>
            <ArrowLeftIcon />
          </button>
          <div className="header-text">
            <h2>MONTAR <span>TREINO</span></h2>
            <p>Selecione os exercícios para sua ficha</p>
          </div>
          <div className="header-spacer"></div>
        </div>

        {isPersonal && students.length > 0 && (
          <div className="student-selector-premium">
            <span className="label-tiny">CRIAR PARA:</span>
            <select value={targetUserId} onChange={(e) => setTargetUserId(e.target.value)}>
              <option value={localStorage.getItem("userId")}>Meu Próprio Perfil</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} (Aluno)</option>
              ))}
            </select>
          </div>
        )}
      </header>

      <div className="filters-glass-v3">
        <div className="search-bar-v3">
          <SearchIcon />
          <input
            type="text"
            placeholder="Pesquisar exercício..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="filter-row">
          <span className="tiny-label">INTENSIDADE</span>
          <div className="chips-scroll-v3">
            {["ALL", "BEGINNER", "INTERMEDIATE", "ADVANCED"].map((diff) => (
              <button
                key={diff}
                className={`chip-v3 ${selectedDifficulty === diff ? 'active' : ''}`}
                onClick={() => setSelectedDifficulty(diff)}
              >
                {diff === "ALL" ? "Todos" : getDifficultyLabel(diff)}
              </button>
            ))}
          </div>
        </div>

        {categories.length > 1 && (
          <div className="filter-row">
            <span className="tiny-label">MODALIDADE</span>
            <div className="chips-scroll-v3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`chip-v3-small ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat === "ALL" ? "Todas" : cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {muscles.length > 1 && (
          <div className="filter-row">
            <span className="tiny-label">FOCO MUSCULAR</span>
            <div className="chips-scroll-v3">
              {muscles.map((m) => (
                <button
                  key={m}
                  className={`chip-v3-small ${selectedMuscle === m ? 'active' : ''}`}
                  onClick={() => setSelectedMuscle(m)}
                >
                  {m === "ALL" ? "Geral" : m}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="exercise-grid-v3">
        {exerciciosFiltrados.length === 0 ? (
          <div className="empty-search-v3">
            <DumbbellIcon />
            <p>Nenhum exercício encontrado</p>
          </div>
        ) : (
          exerciciosFiltrados.map((ex) => {
            const name = typeof ex.name === "object" ? ex.name?.name : ex.name;
            const isSelected = selecionados.some((s) => s.id === ex.id);

            return (
              <div
                key={ex.id}
                className={`exercise-card-v3 ${isSelected ? "selected" : ""}`}
                onClick={() => toggleExercicio(ex)}
              >
                <div className="card-media-v3">
                  <img 
                    src={ex.image || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300"} 
                    alt={name}
                    onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300"; }}
                  />
                  {isSelected && (
                    <div className="check-overlay-v3">
                      <div className="check-circle-v3">
                        <CheckIcon />
                      </div>
                    </div>
                  )}
                  <div className={`badge-lvl-v3 ${ex.level?.toLowerCase() || 'beginner'}`}>
                    {getDifficultyLabel(ex.level)}
                  </div>
                </div>
                <div className="card-info-v3">
                   <p className="ex-category-v3">{ex.category?.name || ex.primaryMuscle?.name || "Geral"}</p>
                   <h4 className="ex-name-v3">{name}</h4>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selecionados.length > 0 && (
        <div className="floating-footer-v3">
          <button className="btn-save-premium" onClick={() => setShowNameModal(true)}>
            FINALIZAR LISTA <span>({selecionados.length})</span>
          </button>
        </div>
      )}

      {/* MODAL DE REVISÃO E NOME */}
      {showNameModal && (
        <div className="modal-overlay-v3" onClick={() => setShowNameModal(false)}>
          <div className="modal-content-v3" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-v3">
              <h3>Revisar e Salvar</h3>
              <p>Dê um nome ao seu novo plano de treino.</p>
            </div>
            
            <div className="modal-body-v3">
              <input 
                type="text" 
                placeholder="Ex: Treino A - Superior" 
                value={nomeTreino} 
                onChange={(e) => setNomeTreino(e.target.value)}
                autoFocus
              />
              
              <div className="selection-preview-list">
                <span className="preview-label">EXERCÍCIOS SELECIONADOS</span>
                <div className="scrollable-preview">
                  {selecionados.map(ex => (
                    <div key={ex.id} className="preview-item">
                      <div className="preview-dot"></div>
                      <span>{ex.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer-v3">
              <button className="btn-cancel-v3" onClick={() => setShowNameModal(false)}>VOLTAR</button>
              <button 
                className="btn-confirm-v3" 
                onClick={handleSalvar}
                disabled={!nomeTreino.trim()}
              >
                SALVAR PLANO
              </button>
            </div>
          </div>
        </div>
      )}

      <CustomAlert config={alertConfig} />
    </div>
  );
}