import { useState } from "react";
import "../Componentes/MessageInput.css";

export default function MessageInput({ onSend }) {
  const [text, setText] = useState("");

  function handleSend() {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  }

  return (
    <div className="message-input">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Digite uma mensagem..."
      />

      <button onClick={handleSend}>Enviar</button>
    </div>
  );
}