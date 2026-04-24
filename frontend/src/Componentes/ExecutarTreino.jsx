import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ExecutarTreino.css";
import CustomAlert from "./CustomAlert";
import { completeWorkout } from "../api/workoutService";
import { addWeightLog } from "../api/weightService";

// Ícones Vetorizados
const TimerIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const ActivityIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const PlayIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const PauseIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>;
const CheckIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const SkipIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>;

export default function ExecutarTreino({ workout }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Tenta pegar o treino do location.state (navegação), depois das props, e por fim o mock
  const treinoAtual = location.state?.workout || workout || {
    name: "Treino do Dia",
    exercises: [
      { name: "Supino Reto", sets: 3, reps: "10-12", rest: 60 },
      { name: "Crucifixo", sets: 3, reps: "12", rest: 60 }
    ]
  };

  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isSetRunning, setIsSetRunning] = useState(false);
  
  const [activeTime, setActiveTime] = useState(0); // Cronômetro da série
  const [restTime, setRestTime] = useState(0);     // Timer de descanso
  const [alertConfig, setAlertConfig] = useState({ isOpen: false });
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weightInput, setWeightInput] = useState("");
  const [weightLoading, setWeightLoading] = useState(false);

  const showAlert = (title, message, type, onConfirm) => {
    setAlertConfig({
      isOpen: true, title, message, type,
      onConfirm: onConfirm || (() => setAlertConfig({ isOpen: false }))
    });
  };

  const currentItem = treinoAtual?.exercises?.[currentExerciseIdx];
  const exerciseData = currentItem?.exercise || currentItem; // Para lidar com DB e Mocks

  // Adicionado suporte para 'title' caso o treino venha de arquivos JSON
  const workoutName = typeof treinoAtual?.name === "object" ? treinoAtual?.name?.name : (treinoAtual?.name || treinoAtual?.title || "Treino sem Nome");
  const exerciseName = typeof exerciseData?.name === "object" ? exerciseData?.name?.name : (exerciseData?.name || "Exercício");

  // Tenta pegar a imagem do banco, se não tiver, usa um placeholder escuro com laranja
  const exerciseImage = exerciseData?.tutorial || "https://placehold.co/600x400/1a1a1a/ff4500?text=Sem+Foto";

  const totalSets = parseInt(currentItem?.sets) || 3;
  const reps = currentItem?.reps || 10;

  // Função para emitir um "beep" usando a Web Audio API nativa do navegador
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = "sine"; // Tipo de onda sonora
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // Frequência (800Hz é um bom tom de beep)
      
      // Suaviza o som no final para não dar "estalos"
      gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5); // O beep dura meio segundo
    } catch (error) {
      console.error("Áudio não suportado no navegador", error);
    }
  };

  // Efeito principal que controla os cronômetros
  useEffect(() => {
    if (isFinished) return; // Trava o relógio se o treino já terminou

    let interval;
    
    if (isResting) {
      // Regressiva do descanso
      if (restTime > 0) {
        interval = setInterval(() => setRestTime((prev) => prev - 1), 1000);
      } else {
        // Acabou o descanso, vai para a próxima série ou exercício
        playBeep();
        avancarSerie();
      }
    } else if (isSetRunning) {
      // Progressiva do tempo de execução da série
      interval = setInterval(() => setActiveTime((prev) => prev + 1), 1000);
    }

    return () => clearInterval(interval);
  }, [isResting, restTime, isFinished, isSetRunning]);

  const avancarSerie = () => {
    setIsResting(false);
    setIsSetRunning(false); // Aguarda o usuário iniciar a nova série manualmente
    setActiveTime(0);

    if (currentSet < totalSets) {
      setCurrentSet((prev) => prev + 1);
    } else {
      if (currentExerciseIdx < treinoAtual.exercises.length - 1) {
        setCurrentExerciseIdx((prev) => prev + 1);
        setCurrentSet(1);
      } else {
        // Finalizar treino e atualizar XP
        finalizarTreino();
      }
    }
  };

  const handleFinalizarSerie = () => {
    // Usamos parseInt para transformar "60 segundos" em apenas 60
    const tempoDescanso = parseInt(currentItem?.rest) || 60; 
    setRestTime(tempoDescanso);
    setIsResting(true);
    setIsSetRunning(false);
  };

  // Verifica se a mensagem de aviso já foi mostrada hoje para este treino
  const hasShownMessageToday = () => {
    const messages = JSON.parse(localStorage.getItem("shownMessages") || "{}");
    const today = new Date().toDateString();
    return messages[treinoAtual.id]?.date === today;
  };

  // Marca que a mensagem foi mostrada para este treino hoje
  const markMessageAsShown = () => {
    const messages = JSON.parse(localStorage.getItem("shownMessages") || "{}");
    const today = new Date().toDateString();
    messages[treinoAtual.id] = { date: today };
    localStorage.setItem("shownMessages", JSON.stringify(messages));
  };

  const finalizarTreino = async () => {
    if (!treinoAtual?.id) {
      showAlert("Erro", "Não foi possível identificar o treino para concluir.", "error");
      return;
    }

    try {
      const result = await completeWorkout(treinoAtual.id);
      console.log("Treino completado:", result);

      // Atualizar localStorage com novo XP, level e total de treinos completados
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      user.xp = result.newXp;
      user.level = result.newLevel;
      user.streak = result.streak;
      user.totalCompleted = result.totalCompleted;
      localStorage.setItem("user", JSON.stringify(user));

      // Emitir evento para atualizar outros componentes
      window.dispatchEvent(new Event('userDataUpdated'));

      setIsFinished(true);
      showAlert("Treino Concluído", `Parabéns! Você ganhou ${result.xpGained} XP. Novo nível: ${result.newLevel}`, "success", () => {
        setAlertConfig({ isOpen: false });
        setShowWeightModal(true); // Mostrar modal de peso em vez de navegar
      });
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || "Erro ao completar treino.";
      console.error("Erro ao completar treino:", errorMessage, error);

      if (errorMessage.includes("já concluiu esse treino hoje")) {
        if (!hasShownMessageToday()) {
          markMessageAsShown();
          showAlert("Treino Já Realizado", "Você já completou este treino hoje! Volta amanhã para ganhar mais XP.", "warning", () => {
            setAlertConfig({ isOpen: false });
            navigate("/home");
          });
        } else {
          navigate("/home");
        }
      } else if (errorMessage.includes("Treino não encontrado") || errorMessage.includes("Usuário não encontrado") || errorMessage.includes("workoutId é obrigatório")) {
        showAlert("Erro", errorMessage, "error", () => {
          setAlertConfig({ isOpen: false });
          navigate("/home");
        });
      } else if (error?.response && error.response.status >= 500) {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        user.totalCompleted = (user.totalCompleted || 0) + 1;
        localStorage.setItem("user", JSON.stringify(user));
        window.dispatchEvent(new Event('userDataUpdated'));

        showAlert("Treino Simulado", "Treino completado localmente (backend indisponível).", "info", () => {
          setAlertConfig({ isOpen: false });
          navigate("/home");
        });
      } else {
        showAlert("Erro", errorMessage, "error");
      }
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleWeightSubmit = async () => {
    if (!weightInput || isNaN(parseFloat(weightInput))) {
      showAlert("Erro", "Por favor, insira um peso válido.", "error");
      return;
    }

    setWeightLoading(true);
    try {
      await addWeightLog(parseFloat(weightInput));
      showAlert("Peso Registrado", "Seu peso foi registrado com sucesso!", "success", () => {
        setAlertConfig({ isOpen: false });
        navigate("/home");
      });
    } catch (error) {
      console.error("Erro ao registrar peso:", error);
      showAlert("Erro", "Não foi possível registrar o peso. Tente novamente.", "error");
    } finally {
      setWeightLoading(false);
    }
  };

  const skipWeightRegistration = () => {
    navigate("/home");
  };

  if (!currentItem) return <div className="execucao-container">Carregando...</div>;

  return (
    <div className="execucao-container">
      <header className="execucao-header">
        <button className="btn-exit" onClick={() => navigate(-1)} title="Sair do Treino">
          ✕
        </button>
        <h2>{workoutName}</h2>
      </header>

      <div className="exercise-card">
        <div className="exercise-image-wrapper">
          <img src={exerciseImage} alt={exerciseName} className="exercise-image" />
          <div className="exercise-info-overlay">
            <h3 className="exercise-title">{exerciseName}</h3>
            <div className="exercise-stats-pills">
              <span className="stat-pill">Série {currentSet}/{totalSets}</span>
              <span className="stat-pill">{reps} Reps</span>
            </div>
          </div>
        </div>
      </div>

      <div className="timer-display">
        {isResting ? (
          <div className="timer-box rest">
            <h4 style={{ display: "flex", alignItems: "center", gap: "8px" }}><TimerIcon /> Descanso</h4>
            <h2 className="time-text glow-green">{formatTime(restTime)}</h2>
            <button className="btn-skip" onClick={() => setRestTime(0)}><SkipIcon /> Pular</button>
          </div>
        ) : (
          <div className={`timer-box ${isSetRunning ? "running" : ""}`}>
            <h4 style={{ display: "flex", alignItems: "center", gap: "8px" }}><ActivityIcon /> Tempo da Série</h4>
            <h2 className={`time-text ${isSetRunning ? "glow-orange" : ""}`}>{formatTime(activeTime)}</h2>
            {!isSetRunning && activeTime === 0 ? (
              <button className="btn-start" onClick={() => setIsSetRunning(true)}><PlayIcon /> Iniciar</button>
            ) : !isSetRunning && activeTime > 0 ? (
              <div style={{ display: "flex", gap: "10px", width: "100%" }}>
                <button className="btn-start" style={{ flex: 1 }} onClick={() => setIsSetRunning(true)}><PlayIcon /> Retomar</button>
                <button className="btn-finish" style={{ flex: 1 }} onClick={handleFinalizarSerie}><CheckIcon /> Concluir</button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "10px", width: "100%" }}>
                <button className="btn-skip" style={{ flex: 1 }} onClick={() => setIsSetRunning(false)}><PauseIcon /> Pausar</button>
                <button className="btn-finish" style={{ flex: 2 }} onClick={handleFinalizarSerie}><CheckIcon /> Concluir</button>
              </div>
            )}
          </div>
        )}
      </div>

      <CustomAlert config={alertConfig} />

      {/* Modal de Registro de Peso */}
      {showWeightModal && (
        <div className="weight-modal-overlay" onClick={skipWeightRegistration}>
          <div className="weight-modal" onClick={(e) => e.stopPropagation()}>
            <div className="weight-modal-header">
              <h3>Registrar Peso</h3>
              <p>Acompanhe sua evolução registrando seu peso atual</p>
            </div>

            <div className="weight-input-section">
              <label htmlFor="weight-input">Peso Atual (kg)</label>
              <input
                id="weight-input"
                type="number"
                step="0.1"
                placeholder="Ex: 75.5"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                className="weight-input"
                autoFocus
              />
            </div>

            <div className="weight-modal-actions">
              <button
                className="btn-skip-weight"
                onClick={skipWeightRegistration}
                disabled={weightLoading}
              >
                Pular
              </button>
              <button
                className="btn-submit-weight"
                onClick={handleWeightSubmit}
                disabled={weightLoading || !weightInput}
              >
                {weightLoading ? "Registrando..." : "Registrar Peso"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}