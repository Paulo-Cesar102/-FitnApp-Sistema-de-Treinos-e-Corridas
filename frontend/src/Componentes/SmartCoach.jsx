import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { askSmartCoach } from "../api/smartCoachService";
import { createPersonalWorkout } from "../api/exerciseService";
import CustomAlert from "./CustomAlert";
import "./SmartCoach.css";

const RobotIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>
  </svg>
);

const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const SaveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v13a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
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
      content: "Olá! Eu sou o seu Smart Coach. Como posso te ajudar a atingir seus objetivos hoje? 🏋️‍♂️",
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
        workoutData: data.workoutData // Armazena os dados estruturados do treino
      }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Ops, tive um problema técnico. Tente novamente em instantes! ⚡" },
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
        title: "Sucesso!",
        message: "Treino salvo na sua biblioteca! 🏋️‍♂️",
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
    try {
      setLoading(true);
      // Salva o treino primeiro para ganhar um ID real
      const savedWorkout = await createPersonalWorkout(workoutData);
      
      setAlertConfig({
        isOpen: true,
        title: "Tudo Pronto!",
        message: "Treino salvo e pronto para começar. Vamos nessa?",
        type: "success",
        confirmText: "Bora!",
        onConfirm: () => {
          setAlertConfig({ isOpen: false });
          navigate("/executar-treino", { state: { workout: savedWorkout } });
        }
      });
    } catch (error) {
      setAlertConfig({
        isOpen: true,
        title: "Erro",
        message: "Não foi possível iniciar o treino. Tente salvá-lo primeiro.",
        type: "error",
        onConfirm: () => setAlertConfig({ isOpen: false })
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="smart-coach-container">
      <CustomAlert config={alertConfig} />
      <header className="coach-chat-header">
        <div className="coach-info">
          <div className="coach-avatar">
            <RobotIcon />
          </div>
          <div>
            <h2>Smart Coach</h2>
            <span className="status-online">Online e pronto para o treino</span>
          </div>
        </div>
      </header>

      <div className="messages-container">
        {messages.map((msg, index) => (
          <div key={index} className={`message-wrapper ${msg.role}`}>
            <div className="message-bubble">
              <div className="message-text">{msg.content}</div>
              {msg.workoutData && (
                <div className="coach-actions">
                  <button 
                    className="save-workout-btn"
                    onClick={() => handleSaveWorkout(msg.workoutData)}
                  >
                    <SaveIcon /> Salvar
                  </button>
                  <button 
                    className="execute-workout-btn"
                    onClick={() => handleExecuteWorkout(msg.workoutData)}
                  >
                    <PlayIcon /> Iniciar Agora
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="message-wrapper assistant">
            <div className="message-bubble typing">
              <span>.</span><span>.</span><span>.</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="coach-input-area" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Peça um treino ou tire dúvidas..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={!input.trim() || loading}>
          <SendIcon />
        </button>
      </form>
    </div>
  );
}
