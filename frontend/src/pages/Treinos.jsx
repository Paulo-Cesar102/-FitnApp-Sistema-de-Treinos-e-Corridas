import React, { useState, useEffect } from "react";
import { getUserWorkouts, deleteWorkout, getCatalogWorkouts } from "../api/workoutService";
import { useNavigate } from "react-router-dom";
import "./Treinos.css";
import CustomAlert from "../Componentes/CustomAlert";

// Premium Minimalist Icons
const PlusIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>;
const TrashIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>;
const PlayIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m7 3 14 9-14 9V3z"/></svg>;
const SearchIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const DumbbellIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 15H4a2 2 0 0 1-2-2V11a2 2 0 0 1 2-2h2m12 6h2a2 2 0 0 0 2-2V11a2 2 0 0 0-2-2h-2M9 7v10m6-10v10m-6-5h6"/></svg>;
const ChevronRight = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;

export default function Treinos({ isPersonalView = false }) {
  const [myWorkouts, setMyWorkouts] = useState([]);
  const [catalogWorkouts, setCatalogWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("my"); 
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  
  const navigate = useNavigate();
  const [alertConfig, setAlertConfig] = useState({ isOpen: false });

  const DEFAULT_WORKOUT_IMAGE = "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80";

  const fetchData = async () => {
    setLoading(true);
    try {
      const [userData, catalogData] = await Promise.all([
        getUserWorkouts(),
        getCatalogWorkouts()
      ]);
      setMyWorkouts(userData || []);
      setCatalogWorkouts(catalogData || []);
    } catch (err) {
      console.error("Erro ao carregar treinos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const startTraining = (workout) => {
    if (isPersonalView) return;
    if (workout?.exercises?.length > 0) {
      const workoutSeguro = JSON.parse(JSON.stringify(workout));
      navigate("/executar-treino", { state: { workout: workoutSeguro } });
    } else {
      setAlertConfig({
        isOpen: true,
        title: "Atenção",
        message: "Adicione exercícios a este treino para poder iniciar a rotina.",
        type: "error",
        onConfirm: () => setAlertConfig({ isOpen: false })
      });
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    setAlertConfig({
      isOpen: true,
      title: "Apagar Treino",
      message: "Tem certeza que deseja apagar este treino permanentemente?",
      type: "error",
      confirmText: "Apagar",
      cancelText: "Cancelar",
      onConfirm: async () => {
        setAlertConfig({ isOpen: false });
        try {
          await deleteWorkout(id);
          setMyWorkouts((prev) => prev.filter((w) => w.id !== id));
        } catch (err) {
          console.error(err);
        }
      },
      onCancel: () => setAlertConfig({ isOpen: false })
    });
  };

  const calculateWorkoutLevel = (workout) => {
    if (!workout.exercises || workout.exercises.length === 0) return "BEGINNER";
    const levels = workout.exercises.map(ex => ex.exercise?.level || "BEGINNER");
    if (levels.includes("ADVANCED")) return "ADVANCED";
    if (levels.includes("INTERMEDIATE")) return "INTERMEDIATE";
    return "BEGINNER";
  };

  const getDifficultyLabel = (level) => {
    switch(level) {
      case "BEGINNER": return "Iniciante";
      case "INTERMEDIATE": return "Intermediário";
      case "ADVANCED": return "Avançado";
      default: return "Iniciante";
    }
  };

  const currentList = activeTab === "my" ? myWorkouts : catalogWorkouts;

  // Extract unique categories from ALL workouts to keep filters stable across tabs
  const allAvailableWorkouts = [...myWorkouts, ...catalogWorkouts];
  const categories = ["ALL", ...new Set(allAvailableWorkouts.flatMap(w => 
    w.exercises?.map(ex => ex.exercise?.category?.name).filter(Boolean) || []
  ))];

  const filteredWorkouts = currentList.filter(workout => {
    const name = (typeof workout.name === "object" ? workout.name?.name : workout.name) || "";
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const level = calculateWorkoutLevel(workout);
    const matchesDifficulty = selectedDifficulty === "ALL" || level === selectedDifficulty;
    
    const workoutCategories = workout.exercises?.map(ex => ex.exercise?.category?.name) || [];
    const matchesCategory = selectedCategory === "ALL" || workoutCategories.includes(selectedCategory);
    
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  return (
    <div className="treinos-page-container">
      <header className="treinos-header-v3">
        <div className="header-top">
          <div className="app-logo">
            Gym<span>Club</span>
          </div>
          {!isPersonalView && (
            <button className="btn-add-circle" onClick={() => navigate("/criar-treino")} title="Novo Treino">
              <PlusIcon />
            </button>
          )}
        </div>

        <nav className="tab-navigation-premium">
          <button 
            className={activeTab === "my" ? "active" : ""} 
            onClick={() => { setActiveTab("my"); setSelectedCategory("ALL"); }}
          >
            Meus Planos
          </button>
          <button 
            className={activeTab === "explore" ? "active" : ""} 
            onClick={() => { setActiveTab("explore"); setSelectedCategory("ALL"); }}
          >
            Biblioteca
          </button>
        </nav>
      </header>

      <div className="filters-glass-container">
        <div className="search-input-wrapper">
          <SearchIcon />
          <input 
            type="text" 
            placeholder="Pesquisar nos meus planos..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <main className="treinos-grid-v3">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="skeleton-premium-card" />
          ))
        ) : filteredWorkouts.length === 0 ? (
          <div className="empty-state-premium">
            <div className="empty-visual">
              <div className="circle-bg"></div>
              <DumbbellIcon />
            </div>
            <h3>Nada por aqui</h3>
            <p>Ajuste os filtros ou crie um plano exclusivo agora mesmo.</p>
            {(searchTerm || selectedDifficulty !== "ALL" || selectedCategory !== "ALL") && (
              <button className="btn-reset-filters" onClick={() => { setSearchTerm(""); setSelectedDifficulty("ALL"); setSelectedCategory("ALL"); }}>
                Limpar Busca
              </button>
            )}
          </div>
        ) : (
          filteredWorkouts.map((treino) => {
            const nameDisplay = typeof treino.name === "object" ? treino.name?.name : treino.name;
            const level = calculateWorkoutLevel(treino);
            const thumb = treino.exercises?.[0]?.exercise?.image || DEFAULT_WORKOUT_IMAGE;
  
            return (
              <div key={treino.id} className="card-premium-v3" onClick={() => startTraining(treino)}>
                <div className="card-media">
                  <img 
                    src={thumb} 
                    alt={nameDisplay} 
                    loading="lazy"
                    onError={(e) => { e.currentTarget.src = DEFAULT_WORKOUT_IMAGE; }}
                  />
                  
                  <div className={`level-tag-v3 ${level.toLowerCase()}`}>
                    {getDifficultyLabel(level)}
                  </div>
                  
                  {activeTab === 'my' && (
                    <button className="action-btn-trash" onClick={(e) => handleDelete(e, treino.id)}>
                      <TrashIcon />
                    </button>
                  )}
                  <div className="media-overlay"></div>
                </div>

                <div className="card-info-premium">
                  <div className="card-header-main">
                    <h4>{nameDisplay || "Treino Personalizado"}</h4>
                    <div className="exercise-count-badge">
                      <span>{treino.exercises?.length || 0}</span> EXERCÍCIOS
                    </div>
                  </div>
                  
                  <div className="card-footer-tags">
                    <div className="tags-row">
                      {Array.from(new Set(treino.exercises?.map(ex => ex.exercise?.category?.name).filter(Boolean))).slice(0, 2).map((cat, index) => (
                        <span key={`${treino.id}-${cat}-${index}`} className="minimal-tag">{cat}</span>
                      ))}
                    </div>
                    
                    {!isPersonalView && (
                       <div className="btn-start-mini">
                          <span>INICIAR</span>
                          <ChevronRight />
                       </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </main>

      <CustomAlert config={alertConfig} />
    </div>
  );
}