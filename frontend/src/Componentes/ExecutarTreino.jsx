import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ExecutarTreino.css";
import CustomAlert from "./CustomAlert";
import { completeWorkout } from "../api/workoutService";
import { askSmartCoach } from "../api/smartCoachService";
import { socket } from "../service/socket";

// Icones Vetorizados
const PlayIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const CheckIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const SkipIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>;
const RobotIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>;
const ChevronLeft = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const ChevronRight = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;

export default function ExecutarTreino({ workout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  
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
  
  const [aiInstruction, setAiInstruction] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const showAlert = (title, message, type, onConfirm) => {
    setAlertConfig({
      isOpen: true, title, message, type,
      onConfirm: onConfirm || (() => setAlertConfig({ isOpen: false }))
    });
  };

  const currentItem = treinoAtual?.exercises?.[currentExerciseIdx];
  const exerciseData = currentItem?.exercise || currentItem;

  useEffect(() => {
    setAiInstruction(""); 
    setShowInstructions(false);
    setIsResting(false);
    setIsSetRunning(false);
    setActiveTime(0);
    setRestTime(0);
    setCurrentSet(1);
  }, [currentExerciseIdx]);

  const workoutName = typeof treinoAtual?.name === "object" ? treinoAtual?.name?.name : (treinoAtual?.name || treinoAtual?.title || "Treino sem Nome");
  const exerciseName = typeof exerciseData?.name === "object" ? exerciseData?.name?.name : (exerciseData?.name || "Exercicio");
  const exerciseImage = exerciseData?.tutorial || "https://fetchpik.com/images/fetchpik.com-QGdm6CNuEU.gif";

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
      console.error("Audio nao suportado", error);
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
    if (!treinoAtual?.id || treinoAtual.id === "sample-workout") {
      setIsFinished(true);
      showAlert("Treino Concluido", "Parabens! Treino de exemplo finalizado com sucesso.", "success", () => {
        setAlertConfig({ isOpen: false });
        navigate("/home");
      });
      return;
    }

    try {
      const result = await completeWorkout(treinoAtual.id);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      if (result.newXp) user.xp = result.newXp;
      if (result.newLevel) user.level = result.newLevel;
      if (result.streak) user.streak = result.streak;
      
      localStorage.setItem("user", JSON.stringify(user));
      window.dispatchEvent(new Event('userDataUpdated'));
      
      setIsFinished(true);
      showAlert("Treino Concluido", `Parabens! Voce ganhou ${result.xpGained || 0} XP.`, "success", () => {
        setAlertConfig({ isOpen: false });
        navigate("/home");
      });
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || "Erro ao completar treino.";
      showAlert("Erro", errorMessage, "error");
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const mudarExercicio = (direcao) => {
    if (direcao === "proximo" && currentExerciseIdx < totalExercises - 1) {
      setCurrentExerciseIdx(prev => prev + 1);
    } else if (direcao === "anterior" && currentExerciseIdx > 0) {
      setCurrentExerciseIdx(prev => prev - 1);
    }
  };

  // Logica de Swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isSignificantSwipe = Math.abs(distance) > 70;

    if (isSignificantSwipe) {
      if (distance > 0) {
        mudarExercicio("proximo");
      } else {
        mudarExercicio("anterior");
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!currentItem) return <div className="workout-execution-container">Carregando...</div>;

  const totalExercises = treinoAtual?.exercises?.length || 0;
  const totalSetsWorkout = treinoAtual?.exercises?.reduce((acc, ex) => acc + (parseInt(ex.sets) || 1), 0) || 1;
  const currentStep = (treinoAtual?.exercises?.slice(0, currentExerciseIdx).reduce((acc, ex) => acc + (parseInt(ex.sets) || 1), 0) || 0) + currentSet;
  const progress = Math.min(100, (currentStep / totalSetsWorkout) * 100);
  
  const nextExercise = treinoAtual.exercises[currentExerciseIdx + 1]?.exercise?.name || treinoAtual.exercises[currentExerciseIdx + 1]?.name;

  const strokeDasharray = 339.29; 
  const tempoTotalDescanso = parseInt(currentItem?.rest) || 60;
  const strokeDashoffset = isResting ? (strokeDasharray - (strokeDasharray * restTime) / tempoTotalDescanso) : 0;

  const fetchAiInstruction = async () => {
    if (aiInstruction) return; 
    try {
      setLoadingAi(true);
      const prompt = `Como seu Smart Coach pessoal de alta performance, analise o exercicio "${exerciseName}". Com base na biomecanica correta, explique detalhadamente em PORTUGUES: 1. POSICIONAMENTO; 2. EXECUCAO; 3. SEGURANCA. Seja direto, tecnico e profissional. Nao use emojis.`;
      
      const response = await askSmartCoach(prompt);
      setAiInstruction(response.answer || "Mantenha a postura alinhada e o movimento controlado.");
    } catch (err) {
      setAiInstruction("Erro ao consultar o Coach. Verifique sua conexao e tente novamente.");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="workout-execution-container">
      <header className="execution-header glass">
        <button className="back-button-circle" onClick={() => navigate(-1)}>✕</button>
        <div className="header-center">
          <span className="workout-category">{workoutName}</span>
          <h3 className="exercise-title">{exerciseName}</h3>
        </div>
        <button className={`info-toggle-btn ${showInstructions ? "active" : ""}`} onClick={() => {
          const newShow = !showInstructions;
          setShowInstructions(newShow);
          if (newShow) fetchAiInstruction();
        }}>
          {showInstructions ? "✕" : <RobotIcon />}
        </button>
      </header>

      <main className="execution-content" 
            onTouchStart={handleTouchStart} 
            onTouchMove={handleTouchMove} 
            onTouchEnd={handleTouchEnd}>
        
        <section className="visual-section-mobile">
          <div className="main-media-card-v3">
            <img src={exerciseImage} alt={exerciseName} className="exercise-gif-v3" />
            
            {/* Indicadores de navegacao visual */}
            <div className="nav-hints">
              <button className="hint-btn prev" onClick={() => mudarExercicio("anterior")} disabled={currentExerciseIdx === 0}>
                <ChevronLeft />
              </button>
              <button className="hint-btn next" onClick={() => mudarExercicio("proximo")} disabled={currentExerciseIdx === totalExercises - 1}>
                <ChevronRight />
              </button>
            </div>
          </div>
        </section>

        {/* Smart Coach - Posicionado estrategicamente ENTRE a mídia e o cronômetro */}
        <section className="smart-coach-integration-v3">
          {!showInstructions && (
            <button className="coach-trigger-tab" onClick={() => {
              setShowInstructions(true);
              fetchAiInstruction();
            }}>
              <RobotIcon /> <span>Dicas do Coach</span>
            </button>
          )}

          <section className={`instruction-drawer-v3 ${showInstructions ? "is-open" : ""}`}>
            <div className="drawer-header-v3">
              <div className="handle-info-v3">
                <RobotIcon />
                <span>Smart Coach AI</span>
              </div>
              <button className="close-drawer-btn" onClick={() => setShowInstructions(false)}>✕</button>
            </div>
            
            <div className="drawer-content-v3">
              {loadingAi ? (
                <div className="ai-loading-container">
                  <div className="ai-loader-v3"></div>
                  <p>Analisando biomecânica...</p>
                </div>
              ) : (
                <div className="ai-instruction-box-v3">
                  <div className="ai-text-v3">
                    {aiInstruction.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </section>

        <section className="main-timer-zone-v3">
          <div className={`circular-timer-wrapper-v3 ${isResting ? "is-resting" : isSetRunning ? "is-running" : ""}`} onClick={() => !isResting && setIsSetRunning(!isSetRunning)}>
            <svg className="progress-ring-v3" viewBox="0 0 250 250">
              <circle className="ring-track-v3" cx="125" cy="125" r="110" />
              <circle className="ring-fill-v3" cx="125" cy="125" r="110" style={{ strokeDashoffset, stroke: isResting ? "#00ffa3" : "var(--primary-color)" }} />
            </svg>
            <div className="timer-display-v3">
              <div className="timer-meta-top-v3">SERIE {currentSet}/{totalSets}</div>
              <span className="time-digits-v3">{formatTime(isResting ? restTime : activeTime)}</span>
              <div className="timer-meta-bottom-v3">{reps} REPS</div>
            </div>
          </div>
        </section>

        <div className="primary-actions-v3">
          {isResting ? (
            <button className="btn-action-v3 pulse-green" onClick={() => setRestTime(0)}>
              <SkipIcon /> PULAR DESCANSO ({restTime}s)
            </button>
          ) : isSetRunning ? (
            <button className="btn-action-v3 btn-primary-v3" onClick={handleFinalizarSerie}>
              <CheckIcon /> CONCLUIR SERIE {currentSet}
            </button>
          ) : (
            <button className="btn-action-v3 btn-outline-v3" onClick={() => setIsSetRunning(true)}>
              <PlayIcon /> {activeTime > 0 ? "RETOMAR" : "INICIAR"} SERIE
            </button>
          )}
        </div>
      </main>

      <footer className="execution-footer-mobile glass">
        <div className="progress-tracker-v3">
          <div className="track-bg-v3"><div className="track-fill-v3" style={{ width: `${progress}%` }}></div></div>
        </div>
        <div className="footer-info-v3">
          {nextExercise ? (
            <div className="next-exercise-label" onClick={() => mudarExercicio("proximo")}>
              <span className="label-v3">PROXIMO</span>
              <span className="name-v3">{nextExercise}</span>
            </div>
          ) : (
            <span className="final-label-v3">ULTIMO EXERCICIO</span>
          )}
          <span className="progress-count-v3">{currentStep} / {totalSetsWorkout}</span>
        </div>
      </footer>

      <CustomAlert config={alertConfig} />
    </div>
  );
}
