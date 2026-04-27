import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCatalogWorkouts, getUserWorkouts } from "../api/workoutService";
import { getUser } from "../api/userService";
import { notificationService } from "../api/notificationService"; // 🔥 Adicionado
import { StreakIcon } from "../Componentes/StreakIcon";
import NotificationModal from "../Componentes/NotificationModal"; // 🔥 Adicionado
import "./home.css";
import "../Componentes/NotificationModal.css"; // 🔥 Para o estilo do botão do sino
import CustomAlert from "../Componentes/CustomAlert";

// Ícones Minimalistas
const PlayIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const SearchIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const DumbbellIcon = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"><path d="M6 15H4a2 2 0 0 1-2-2V11a2 2 0 0 1 2-2h2m12 6h2a2 2 0 0 0 2-2V11a2 2 0 0 0-2-2h-2M9 7v10m6-10v10m-6-5h6"/></svg>;
const BellIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>;

export default function Home() {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [userWorkouts, setUserWorkouts] = useState([]);
  const [userData, setUserData] = useState(null);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [alertConfig, setAlertConfig] = useState({ isOpen: false });
  const [isNotifOpen, setIsNotifOpen] = useState(false); // 🔥 Estado do Modal
  const [unreadCount, setUnreadCount] = useState(0); // 🔥 Contador de não lidas

  const DEFAULT_WORKOUT_IMAGE = "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80";

  useEffect(() => {
    async function loadData() {
      try {
        const userJson = localStorage.getItem("user");
        if (userJson) {
          const user = JSON.parse(userJson);
          const userDetails = await getUser(user.id);
          setUserData(userDetails);

          // Buscar notificações para o contador
          const notifs = await notificationService.getNotifications();
          setUnreadCount(notifs.filter(n => !n.isRead).length);
        }
        const [catalogData, personalData] = await Promise.all([
          getCatalogWorkouts(),
          getUserWorkouts()
        ]);
        setWorkouts(catalogData || []);
        setUserWorkouts(personalData || []);
      } catch (err) {
        console.error("Erro ao carregar dados da home:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const openWorkout = (workout) => {
    if (!workout?.exercises?.length) {
       setAlertConfig({
         isOpen: true,
         title: "Aviso",
         message: "Este treino ainda não possui exercícios.",
         type: "error",
         onConfirm: () => setAlertConfig({ isOpen: false })
       });
       return;
    }
    navigate("/executar-treino", { state: { workout: JSON.parse(JSON.stringify(workout)) } });
  };

  const treinosFiltrados = workouts.filter(t => {
    const nome = (typeof t.name === "object" ? t.name?.name : t.name) || "";
    return nome.toLowerCase().includes(busca.toLowerCase());
  });

  return (
    <div className="home-premium-container">
      {/* HEADER DE ALTO IMPACTO */}
      <header className="home-header-premium">
        <div className="header-left">
          <h1 className="app-logo">Gym<span>Club</span></h1>
        </div>
        <div className="header-right">
          <button className="bell-btn-premium" onClick={() => setIsNotifOpen(true)}>
             <BellIcon />
             {unreadCount > 0 && <span className="notification-badge-bell">{unreadCount}</span>}
          </button>

          <div className="streak-pill-premium">
            <StreakIcon streak={userData?.streak || 0} />
            <span>{userData?.streak || 0}</span>
          </div>
          <div className="avatar-premium" onClick={() => navigate("/perfil")}>
            {userData?.name ? userData.name.charAt(0) : "U"}
          </div>
        </div>
      </header>

      <NotificationModal 
        isOpen={isNotifOpen} 
        onClose={() => {
          setIsNotifOpen(false);
          // Recarregar contador ao fechar
          notificationService.getNotifications().then(data => {
            setUnreadCount(data.filter(n => !n.isRead).length);
          });
        }} 
      />

      {/* WIDGET DE XP ESTILO PREMIUM */}
      <section className="xp-widget-premium">
        <div className="xp-header">
          <span className="xp-level">Nível {userData?.level || 1}</span>
          <span className="xp-points">{userData?.xp || 0} XP</span>
        </div>
        <div className="xp-bar-container">
          <div className="xp-bar-fill" style={{ width: `${(userData?.xp || 0) % 100}%` }}></div>
        </div>
      </section>

      {/* MEUS TREINOS (SCROLL HORIZONTAL PREMIUM) */}
      {!loading && userWorkouts.length > 0 && (
        <section className="home-section">
          <div className="section-header">
            <h3>Meus <span>Planos</span></h3>
            <button className="btn-see-all" onClick={() => navigate("/exercicio")}>Ver todos</button>
          </div>
          <div className="horizontal-scroll-premium">
            {userWorkouts.map(treino => (
              <div key={treino.id} className="mini-card-premium" onClick={() => openWorkout(treino)}>
                <div className="mini-media">
                  <img 
                    src={treino.exercises?.[0]?.exercise?.image || DEFAULT_WORKOUT_IMAGE} 
                    alt="" 
                    loading="lazy"
                    onError={(e) => { e.currentTarget.src = DEFAULT_WORKOUT_IMAGE; }}
                  />
                  <div className="play-hint-premium">
                    <PlayIcon />
                  </div>
                </div>
                <h4>{typeof treino.name === "object" ? treino.name?.name : treino.name}</h4>
                <p>{treino.exercises?.length || 0} ex</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CATÁLOGO (MESMO PADRÃO DA PÁGINA DE TREINOS) */}
      <section className="home-section">
        <div className="section-header">
          <h3>Biblioteca <span>Oficial</span></h3>
        </div>
        
        <div className="search-wrapper-premium">
          <SearchIcon />
          <input 
            type="text" 
            placeholder="O que vamos treinar hoje?" 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="catalog-grid-premium">
          {loading ? (
            [1,2,3,4].map(n => <div key={n} className="skeleton-card" />)
          ) : treinosFiltrados.length === 0 ? (
            <div className="empty-catalog-premium">
              <DumbbellIcon />
              <p>Nenhum treino encontrado</p>
            </div>
          ) : (
            treinosFiltrados.map(treino => {
              const name = typeof treino.name === "object" ? treino.name?.name : treino.name;
              const level = treino.exercises?.[0]?.exercise?.level || "BEGINNER";
              const thumb = treino.exercises?.[0]?.exercise?.image || DEFAULT_WORKOUT_IMAGE;

              return (
                <div key={treino.id} className="catalog-card-premium" onClick={() => openWorkout(treino)}>
                  <div className="catalog-media">
                    <img 
                      src={thumb} 
                      alt={name} 
                      loading="lazy"
                      onError={(e) => { e.currentTarget.src = DEFAULT_WORKOUT_IMAGE; }}
                    />
                    <div className={`catalog-level-tag ${level.toLowerCase()}`}>
                       {level === "ADVANCED" ? "ELITE" : level === "INTERMEDIATE" ? "MÉDIO" : "INICIANTE"}
                    </div>
                  </div>
                  <div className="catalog-info">
                    <h4>{name}</h4>
                    <p><span>{treino.exercises?.length || 0}</span> exercícios</p>
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
