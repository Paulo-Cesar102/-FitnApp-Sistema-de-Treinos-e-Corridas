import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ExecutarTreino.css";
import CustomAlert from "./CustomAlert";
import { completeWorkout } from "../api/workoutService";
import { getExerciseSuggestion } from "../api/exerciseService";
import { socket } from "../service/socket";

// Ícones Vetorizados
const TimerIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const ActivityIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const PlayIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const PauseIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>;
const CheckIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const SkipIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>;
const RobotIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>;

export default function ExecutarTreino({ workout }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const treinoAtual = location.state?.workout || workout || {
    id: "sample-workout",
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
  
  const [activeTime, setActiveTime] = useState(0);
  const [restTime, setRestTime] = useState(0);
  const [alertConfig, setAlertConfig] = useState({ isOpen: false });
  
  const [coachSuggestion, setCoachSuggestion] = useState(null);
  const [actualWeight, setActualWeight] = useState("");
  const [actualRpe, setActualRpe] = useState(7);

  const showAlert = (title, message, type, onConfirm) => {
    setAlertConfig({
      isOpen: true, title, message, type,
      onConfirm: onConfirm || (() => setAlertConfig({ isOpen: false }))
    });
  };

  const currentItem = treinoAtual?.exercises?.[currentExerciseIdx];
  const exerciseData = currentItem?.exercise || currentItem;

  // Carregar sugestão do Coach ao carregar exercício
  useEffect(() => {
    if (exerciseData?.id) {
      loadSuggestion(exerciseData.id);
    }
  }, [currentExerciseIdx]);

  const loadSuggestion = async (exId) => {
    try {
      const data = await getExerciseSuggestion(exId);
      setCoachSuggestion(data);
      if (data.recommendedWeight) {
        setActualWeight(data.recommendedWeight.toString());
      }
    } catch (err) {
      console.error("Erro ao carregar sugestão:", err);
    }
  };

  const workoutName = typeof treinoAtual?.name === "object" ? treinoAtual?.name?.name : (treinoAtual?.name || treinoAtual?.title || "Treino sem Nome");
  const exerciseName = typeof exerciseData?.name === "object" ? exerciseData?.name?.name : (exerciseData?.name || "Exercício");
  const exerciseImage = exerciseData?.tutorial || "https://placehold.co/600x400/1a1a1a/ff4500?text=Sem+Foto";

  const totalSets = parseInt(currentItem?.sets) || 3;
  const reps = currentItem?.reps || 10;

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (error) {
      console.error("Áudio não suportado", error);
    }
  };

  useEffect(() => {
    if (isFinished) return;
    let interval;
    if (isResting) {
      if (restTime > 0) {
        interval = setInterval(() => setRestTime((prev) => prev - 1), 1000);
      } else {
        playBeep();
        avancarSerie();
      }
    } else if (isSetRunning) {
      interval = setInterval(() => setActiveTime((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restTime, isFinished, isSetRunning]);

  const avancarSerie = () => {
    setIsResting(false);
    setIsSetRunning(false);
    setActiveTime(0);
    if (currentSet < totalSets) {
      setCurrentSet((prev) => prev + 1);
    } else {
      if (currentExerciseIdx < treinoAtual.exercises.length - 1) {
        setCurrentExerciseIdx((prev) => prev + 1);
        setCurrentSet(1);
      } else {
        finalizarTreino();
      }
    }
  };

  const handleFinalizarSerie = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const defaultRest = user.defaultRest || 60;
    const tempoDescanso = parseInt(currentItem?.rest) || defaultRest; 
    setRestTime(tempoDescanso);
    setIsResting(true);
    setIsSetRunning(false);
  };

  const hasShownMessageToday = () => {
    const messages = JSON.parse(localStorage.getItem("shownMessages") || "{}");
    const today = new Date().toDateString();
    return messages[treinoAtual.id]?.date === today;
  };

  const markMessageAsShown = () => {
    const messages = JSON.parse(localStorage.getItem("shownMessages") || "{}");
    const today = new Date().toDateString();
    messages[treinoAtual.id] = { date: today };
    localStorage.setItem("shownMessages", JSON.stringify(messages));
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const personalId = user.personalSubscriptions?.[0] || localStorage.getItem("personalId");
    if (treinoAtual?.id && socket && user.id && personalId) {
      socket.emit("student_activity", {
        personalId,
        studentName: user.name,
        workoutName: workoutName,
        status: "started"
      });
    }
  }, [treinoAtual?.id]);

  const finalizarTreino = async () => {
    // Se for um treino de exemplo ou sem ID real, apenas sai com sucesso visual
    if (!treinoAtual?.id || treinoAtual.id === "sample-workout") {
      setIsFinished(true);
      showAlert("Treino Concluído", "Parabéns! Treino de exemplo finalizado com sucesso. 🏋️‍♂️", "success", () => {
        setAlertConfig({ isOpen: false });
        navigate("/home");
      });
      return;
    }

    try {
      const result = await completeWorkout(treinoAtual.id);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      // Atualiza dados do usuário localmente
      if (result.newXp) user.xp = result.newXp;
      if (result.newLevel) user.level = result.newLevel;
      if (result.streak) user.streak = result.streak;
      
      localStorage.setItem("user", JSON.stringify(user));
      window.dispatchEvent(new Event('userDataUpdated'));
      
      setIsFinished(true);
      showAlert("Treino Concluído", `Parabéns! Você ganhou ${result.xpGained || 0} XP. 🔥`, "success", () => {
        setAlertConfig({ isOpen: false });
        navigate("/home");
      });
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || "Erro ao completar treino.";
      if (errorMessage.includes("já concluiu esse treino hoje")) {
        if (!hasShownMessageToday()) {
          markMessageAsShown();
          showAlert("Treino Já Realizado", "Você já completou este treino hoje!", "warning", () => {
            setAlertConfig({ isOpen: false });
            navigate("/home");
          });
        } else {
          navigate("/home");
        }
      } else {
        showAlert("Erro", errorMessage, "error");
      }
    }
  };

  const handleFinishEarly = () => {
    setAlertConfig({
      isOpen: true,
      title: "Encerrar Treino",
      message: "Deseja finalizar o treino agora mesmo? O progresso será salvo.",
      type: "info",
      confirmText: "Sim, finalizar",
      cancelText: "Continuar",
      onConfirm: () => {
        setAlertConfig({ isOpen: false });
        finalizarTreino();
      },
      onCancel: () => setAlertConfig({ isOpen: false })
    });
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (!currentItem) return <div className="workout-execution-container">Carregando...</div>;

  const totalExercises = treinoAtual?.exercises?.length || 0;
  
  // Cálculo de progresso mais seguro
  const totalSetsWorkout = treinoAtual?.exercises?.reduce((acc, ex) => acc + (parseInt(ex.sets) || 1), 0) || 1;
  const currentStep = (treinoAtual?.exercises?.slice(0, currentExerciseIdx).reduce((acc, ex) => acc + (parseInt(ex.sets) || 1), 0) || 0) + currentSet;
  const progress = Math.min(100, (currentStep / totalSetsWorkout) * 100);
  
  const nextExercise = treinoAtual.exercises[currentExerciseIdx + 1]?.exercise?.name || treinoAtual.exercises[currentExerciseIdx + 1]?.name;

  const mudarExercicio = (direcao) => {
    setIsResting(false);
    setIsSetRunning(false);
    setActiveTime(0);
    setRestTime(0);
    setCurrentSet(1);
    setCurrentExerciseIdx(prev => direcao === "proximo" ? prev + 1 : prev - 1);
  };

  const strokeDasharray = 283;
  const tempoTotalDescanso = parseInt(currentItem?.rest) || 60;
  const strokeDashoffset = isResting ? (strokeDasharray - (strokeDasharray * restTime) / tempoTotalDescanso) : 0;

  return (
    <div className="workout-execution-container">
      <header className="execution-header">
        <button className="back-button" onClick={() => navigate(-1)}>✕</button>
        <div className="header-nav">
          <button className="nav-arrow" onClick={() => mudarExercicio("anterior")} disabled={currentExerciseIdx === 0}>←</button>
          <div className="header-info" onClick={handleFinishEarly} style={{ cursor: 'pointer' }} title="Clique para finalizar mais cedo">
            <span className="workout-label">{workoutName} (Sair)</span>
            <h3 className="exercise-name">{exerciseName}</h3>
          </div>
          <button className="nav-arrow" onClick={() => mudarExercicio("proximo")} disabled={currentExerciseIdx === totalExercises - 1}>→</button>
        </div>
        <button className="info-button" onClick={() => showAlert("Dica", exerciseData?.description || "Mantenha a postura e respiração constante.", "info")}>i</button>
      </header>

      <main className="execution-main">
        <section className="exercise-demonstration">
          <div className="media-container">
            <div className="gif-placeholder"><img src={exerciseImage} alt={exerciseName} /></div>
          </div>
        </section>

        <section className="sets-tracker">
          {[...Array(totalSets)].map((_, i) => (
            <div key={i} className={`set-dot ${i + 1 < currentSet ? "completed" : i + 1 === currentSet ? "active" : ""}`}>{i + 1}</div>
          ))}
        </section>

        <section className="timer-section">
          <div className={`timer-container ${isResting ? "resting" : ""} ${isSetRunning ? "running" : ""}`} onClick={() => !isResting && setIsSetRunning(!isSetRunning)}>
            <svg className="timer-svg" viewBox="0 0 100 100">
              <circle className="timer-bg" cx="50" cy="50" r="45" />
              <circle className="timer-progress" cx="50" cy="50" r="45" style={{ strokeDashoffset, stroke: isResting ? "#00ff88" : "var(--primary-color)", transition: isResting ? "stroke-dashoffset 1s linear" : "0.3s" }} />
            </svg>
            <div className="timer-content">
              <span className="timer-value">{formatTime(isResting ? restTime : activeTime)}</span>
              <span className="timer-status">{isResting ? <><TimerIcon /> Descanso</> : isSetRunning ? <><ActivityIcon /> Treinando</> : activeTime > 0 ? <><PauseIcon /> Pausado</> : <><PlayIcon /> Iniciar</>}</span>
            </div>
          </div>
        </section>

        {coachSuggestion && (
          <section className="smart-coach-panel fade-in">
            <div className="coach-card glass neon-border-blue">
              <div className="coach-header">
                <RobotIcon />
                <span>Coach IA Sugere:</span>
              </div>
              <div className="coach-body">
                <p className="coach-tip">"{coachSuggestion.aiCoachTip || coachSuggestion.reason}"</p>
                <div className="recommendation-badge">
                  {coachSuggestion.recommendedWeight ? (
                    <span>Meta: <strong>{coachSuggestion.recommendedWeight}kg</strong></span>
                  ) : (
                    <span>Meta: <strong>Adaptativa</strong></span>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="exercise-input-zone glass">
           <div className="input-row">
             <div className="input-group">
               <label>Peso (kg)</label>
               <input 
                type="number" 
                value={actualWeight} 
                onChange={(e) => setActualWeight(e.target.value)}
                placeholder="0"
               />
             </div>
             <div className="input-group">
               <label>Esforço (1-10)</label>
               <div className="rpe-selector">
                 <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={actualRpe} 
                  onChange={(e) => setActualRpe(parseInt(e.target.value))}
                 />
                 <span className="rpe-value">{actualRpe}</span>
               </div>
             </div>
           </div>
        </section>

        <section className="exercise-details">
          <div className="detail-card">
            <span className="detail-label">Série</span>
            <span className="detail-value">{currentSet}/{totalSets}</span>
          </div>
          <div className="detail-divider"></div>
          <div className="detail-card">
            <span className="detail-label">Repetições</span>
            <span className="detail-value">{reps}</span>
          </div>
          <div className="detail-divider"></div>
          <div className="detail-card">
            <span className="detail-label">Descanso</span>
            <span className="detail-value">{tempoTotalDescanso}s</span>
          </div>
        </section>

        <div className="action-zone">
          {isResting ? (
            <button className="main-action-btn skip-rest-mode" onClick={() => setRestTime(0)}><SkipIcon /> Pular Descanso ({restTime}s)</button>
          ) : isSetRunning ? (
            <button className="main-action-btn" onClick={handleFinalizarSerie}><CheckIcon /> Concluir Série {currentSet}</button>
          ) : (
            <button className="main-action-btn" onClick={() => setIsSetRunning(true)}><PlayIcon /> {activeTime > 0 ? "Retomar" : "Iniciar"} Série {currentSet}</button>
          )}
        </div>
      </main>

      <footer className="execution-footer">
        <div className="progress-bar-container"><div className="progress-bar-fill" style={{ width: `${progress}%` }}></div></div>
        <div className="next-info">
          {nextExercise ? <><span className="next-label">Próximo:</span><span className="next-name">{nextExercise}</span></> : <span className="next-label">Último exercício!</span>}
        </div>
      </footer>

      <CustomAlert config={alertConfig} />
    </div>
  );
}
