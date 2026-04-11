import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ExecutarTreino.css";
import CustomAlert from "./CustomAlert";

// Ícones Vetorizados
const TimerIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const ActivityIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;

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
  
  const [activeTime, setActiveTime] = useState(0); // Cronômetro da série
  const [restTime, setRestTime] = useState(0);     // Timer de descanso
  const [alertConfig, setAlertConfig] = useState({ isOpen: false });

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
    } else {
      // Progressiva do tempo de execução da série
      interval = setInterval(() => setActiveTime((prev) => prev + 1), 1000);
    }

    return () => clearInterval(interval);
  }, [isResting, restTime, isFinished]);

  const avancarSerie = () => {
    setIsResting(false);
    setActiveTime(0);

    if (currentSet < totalSets) {
      setCurrentSet((prev) => prev + 1);
    } else {
      if (currentExerciseIdx < treinoAtual.exercises.length - 1) {
        setCurrentExerciseIdx((prev) => prev + 1);
        setCurrentSet(1);
      } else {
        setIsFinished(true); // Trava o background do timer
        showAlert("Treino Concluído", "Parabéns! Você finalizou as atividades de hoje.", "success", () => {
          setAlertConfig({ isOpen: false });
          navigate("/home");
        });
      }
    }
  };

  const handleFinalizarSerie = () => {
    // Usamos parseInt para transformar "60 segundos" em apenas 60
    const tempoDescanso = parseInt(currentItem?.rest) || 60; 
    setRestTime(tempoDescanso);
    setIsResting(true);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
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
        <img src={exerciseImage} alt={exerciseName} className="exercise-image" />
        <h3 className="exercise-title">{exerciseName}</h3>
        <div className="exercise-stats">
          <p>Série: <span>{currentSet} / {totalSets}</span></p>
          <p>Repetições: <span>{reps}</span></p>
        </div>
      </div>

      <div className="timer-display">
        {isResting ? (
          <div className="timer-box rest">
            <h4 style={{ display: "flex", alignItems: "center", gap: "8px" }}><TimerIcon /> Descanso</h4>
            <h2 className="time-text glow-green">{formatTime(restTime)}</h2>
            <button className="btn-skip" onClick={() => setRestTime(0)}>Pular Descanso</button>
          </div>
        ) : (
          <div className="timer-box active">
            <h4 style={{ display: "flex", alignItems: "center", gap: "8px" }}><ActivityIcon /> Tempo da Série</h4>
            <h2 className="time-text glow-orange">{formatTime(activeTime)}</h2>
            <button className="btn-finish" onClick={handleFinalizarSerie}>Concluir Série</button>
          </div>
        )}
      </div>

      <CustomAlert config={alertConfig} />
    </div>
  );
}