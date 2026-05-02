import { useState, useEffect } from "react";
import "../Componentes/MessageList.css";

export default function MessageList({ messages, onDeleteMessage, groupDetails }) {
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const userId = user.id; 
  const [hoveredMessageId, setHoveredMessageId] = useState(null);

  // Monitora a chegada dos dados para debug
  useEffect(() => {
    if (groupDetails) {
      console.log("✅ DADOS CHEGARAM:", groupDetails);
    } else {
      console.warn("⚠️ groupDetails continua vindo undefined!");
    }
  }, [groupDetails]);

  const getSenderName = (msg) => {
    const msgSenderId = String(msg.senderId);
    if (msgSenderId === String(userId)) return "Você";

    // Busca o participante na lista enviada pelo pai
    const participant = groupDetails?.participants?.find(p => 
      String(p.userId) === msgSenderId
    );

    // Tenta pegar o nome na hierarquia do Prisma: user -> name
    const nameFound = participant?.user?.name || participant?.name || msg.senderName;

    return nameFound || `Atleta (${msgSenderId.substring(0, 4)})`;
  };

  return (
    <div className="messages-container">
      {messages.map((msg) => {
        const isMe = String(msg.senderId) === String(userId);
        return (
          <div
            key={msg.id || Math.random()}
            className={`message ${isMe ? "sent" : "received"}`}
            onMouseEnter={() => setHoveredMessageId(msg.id)}
            onMouseLeave={() => setHoveredMessageId(null)}
          >
            <div className="message-header">
              <strong className="sender-name">{getSenderName(msg)}</strong>
              {isMe && hoveredMessageId === msg.id && (
                <button
                  className="btn-delete-message"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteMessage(msg.id);
                  }}
                  title="Apagar esta mensagem para todos"
                >
                  <span>Excluir</span>
                  <span className="delete-icon">🗑️</span>
                </button>
              )}
            </div>
            <p className="message-content">{msg.content}</p>
          </div>
        );
      })}
    </div>
  );
}