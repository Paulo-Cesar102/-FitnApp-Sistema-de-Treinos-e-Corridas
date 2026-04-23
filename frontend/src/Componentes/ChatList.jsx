import "../Componentes/ChatList.css";

export default function ChatList({ chats, onSelect, selectedChat }) {
  return (
    <div className="chat-list-container">
      {chats.length > 0 && <div className="chat-list-title">Seus Grupos</div>}
      {chats.map((chat) => (
        <div
          key={chat.id}
          className={`chat-item ${
            selectedChat?.id === chat.id ? "active" : ""
          }`}
          onClick={() => onSelect(chat)}
        >
          {chat.name || "Grupo"}
        </div>
      ))}
      {chats.length === 0 && (
        <p style={{ textAlign: "center", color: "#666", marginTop: "20px" }}>
          Nenhum grupo ainda
        </p>
      )}
    </div>
  );
}