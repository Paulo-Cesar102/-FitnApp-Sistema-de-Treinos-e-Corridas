import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCatalogWorkouts, getUserWorkouts } from "../api/workoutService";
import { getUser } from "../api/userService";
import { StreakIcon } from "../Componentes/StreakIcon";
import "./home.css";
import CustomAlert from "../Componentes/CustomAlert";

// Ícones Minimalistas
const PlayIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="m7 3 14 9-14 9V3z"/></svg>;
const SearchIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;

export default function Home() {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [userWorkouts, setUserWorkouts] = useState([]);
  const [userData, setUserData] = useState(null);
  const [busca, setBusca] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alertConfig, setAlertConfig] = useState({ isOpen: false });

  useEffect(() => {
    async function loadData() {
      try {
        const userJson = localStorage.getItem("user");
        if (userJson) {
          const user = JSON.parse(userJson);
          const userDetails = await getUser(user.id);
          setUserData(userDetails);
        }
        const [catalogData, personalData] = await Promise.all([
          getCatalogWorkouts(),
          getUserWorkouts()
        ]);
        setWorkouts(catalogData);
        setUserWorkouts(personalData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const openWorkout = (workout) => {
    if (!workout?.exercises?.length) return;
    navigate("/executar-treino", { state: { workout: JSON.parse(JSON.stringify(workout)) } });
  };

  const treinosFiltrados = workouts.filter(t => 
    (typeof t.name === "object" ? t.name?.name : t.name)?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="home-zen-container">
      <header className="zen-header">
        <div className="zen-logo">Gym<span>Club</span></div>
        <div className="zen-header-right">
          <div className="zen-streak-pill">
            <StreakIcon streak={userData?.streak || 0} />
            <span>{userData?.streak || 0}</span>
          </div>
          <div className="zen-avatar" onClick={() => navigate("/perfil")}>
            {userData?.name?.charAt(0)}
          </div>
        </div>
      </header>

      <section className="zen-xp-section">
        <div className="zen-xp-info">
          <span>Nível {userData?.level || 1}</span>
          <span className="zen-xp-total">{userData?.xp || 0} XP</span>
        </div>
        <div className="zen-xp-bar-bg">
          <div className="zen-xp-bar-fill" style={{ width: `${(userData?.xp || 0) % 100}%` }}></div>
        </div>
      </section>

      {!loading && userWorkouts.length > 0 && (
        <section className="zen-section">
          <h3 className="zen-section-title">Meus Treinos</h3>
          <div className="zen-horizontal-scroll">
            {userWorkouts.map(treino => (
              <div key={treino.id} className="zen-mini-card" onClick={() => openWorkout(treino)}>
                <div className="zen-mini-img">
                  <img src={treino.exercises?.[0]?.exercise?.image || "https://placehold.co/100"} alt="" />
                  <div className="zen-play-hint"><PlayIcon /></div>
                </div>
                <h4>{treino.name}</h4>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="zen-section main-catalog">
        <div className="zen-section-header-inline">
          <h3 className="zen-section-title">Biblioteca <span>Oficial</span></h3>
          <div className="zen-search-wrapper-inline">
            <div className={`zen-search-input-field ${showSearch ? 'active' : ''}`}>
              <input 
                type="text" 
                placeholder="Buscar treino..." 
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                autoFocus={showSearch}
              />
            </div>
            <button className="zen-search-toggle" onClick={() => setShowSearch(!showSearch)}>
               <SearchIcon />
            </button>
          </div>
        </div>

        <div className="zen-grid">
          {loading ? (
            [1,2,3,4].map(n => <div key={n} className="zen-skeleton" />)
          ) : (
            treinosFiltrados.map(treino => {
              const name = typeof treino.name === "object" ? treino.name?.name : treino.name;
              const level = treino.exercises?.[0]?.exercise?.level || "BEGINNER";
              return (
                <div key={treino.id} className="zen-catalog-card" onClick={() => openWorkout(treino)}>
                  <div className="zen-card-media">
                    <img src={treino.exercises?.[0]?.exercise?.image || "https://placehold.co/300x200"} alt="" />
                    <div className={`zen-badge ${level.toLowerCase()}`}>
                       {level === "ADVANCED" ? "ELITE" : level === "INTERMEDIATE" ? "MÉDIO" : "INICIANTE"}
                    </div>
                  </div>
                  <div className="zen-card-info">
                    <h4>{name}</h4>
                    <p>{treino.exercises?.length || 0} exercícios</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <CustomAlert config={alertConfig} />
    </div>
  );
}
