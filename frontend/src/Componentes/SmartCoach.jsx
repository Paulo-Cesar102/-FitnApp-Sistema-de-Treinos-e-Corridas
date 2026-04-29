import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPersonalWorkout } from "../api/workoutService";
import { askSmartCoach } from "../api/smartCoachService";
import "./SmartCoach.css";
import CustomAlert from "./CustomAlert";

// Ícones Minimalistas
const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const RobotIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>
  </svg>
);
const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);

export default function SmartCoach() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Olá! Eu sou o seu Smart Coach. Como posso te ajudar a atingir seus objetivos hoje?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ isOpen: false });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const data = await askSmartCoach(userMessage);
      setMessages((prev) => [...prev, { 
        role: "assistant", 
        content: data.answer,
        workoutData: data.workoutData 
      }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Ocorreu um erro técnico. Por favor, tente novamente em instantes." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWorkout = async (workoutData) => {
    try {
      await createPersonalWorkout(workoutData);
      setAlertConfig({
        isOpen: true,
        title: "Sucesso",
        message: "Treino salvo na sua biblioteca com sucesso.",
        type: "success",
        onConfirm: () => setAlertConfig({ isOpen: false })
      });
    } catch (error) {
      setAlertConfig({
        isOpen: true,
        title: "Erro",
        message: "Não foi possível salvar o treino. Tente novamente.",
        type: "error",
        onConfirm: () => setAlertConfig({ isOpen: false })
      });
    }
  };

  const handleExecuteWorkout = async (workoutData) => {
    navigate("/executar-treino", { state: { workout: workoutData } });
  };

  return (
    <div className="coach-page-container">
      <header className="coach-header-v3">
        <div className="header-content">
          <RobotIcon />
          <div className="header-text">
            <h2>SMART <span>COACH</span></h2>
            <p>Inteligência Artificial aplicada ao seu treino</p>
          </div>
        </div>
      </header>

      <main className="chat-container-v3">
        <div className="messages-list">
          {messages.map((msg, index) => (
            <div key={index} className={`message-wrapper ${msg.role}`}>
              <div className="message-bubble">
                <p>{msg.content}</p>
                
                {msg.workoutData && (
                  <div className="workout-card-ai">
                    <header>
                      <h4>{msg.workoutData.name}</h4>
                      <span>Sugerido pela IA</span>
                    </header>
                    <div className="ai-exercises-list">
                      {msg.workoutData.exercises.map((ex, i) => (
                        <div key={i} className="ai-ex-item">
                          <span className="ex-name">{ex.name}</span>
                          <span className="ex-reps">{ex.sets}x{ex.reps}</span>
                        </div>
                      ))}
                    </div>
                    <div className="ai-card-actions">
                      <button className="btn-ai-save" onClick={() => handleSaveWorkout(msg.workoutData)}>
                        Salvar Treino
                      </button>
                      <button className="btn-ai-play" onClick={() => handleExecuteWorkout(msg.workoutData)}>
                        <PlayIcon /> Começar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="message-wrapper assistant">
              <div className="message-bubble loading">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-row" onSubmit={handleSend}>
          <input
            type="text"
            placeholder="Pergunte algo ou peça um treino..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="send-btn" disabled={loading}>
            {loading ? <div className="loader-small" /> : <SendIcon />}
          </button>
        </form>
      </main>

      <CustomAlert config={alertConfig} />
    </div>
  );
}
