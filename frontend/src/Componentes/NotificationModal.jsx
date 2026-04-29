import React, { useEffect, useState } from "react";
import { notificationService } from "../api/notificationService";
import "./NotificationModal.css";

// Ícones Minimalistas
const BellIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>;
const TrashIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const UserIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>;
const TrophyIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-2.34"/><path d="M12 2v12.66"/></svg>;
const CheckCircleIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;

export default function NotificationModal({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data || []);
    } catch (error) {
      console.error("Erro ao carregar notificacoes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "FRIEND_REQUEST": return <UserIcon />;
      case "BADGE_EARNED": return <TrophyIcon />;
      case "WORKOUT_COMPLETED": return <CheckCircleIcon />;
      default: return <BellIcon />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="notif-overlay-v3 fade-in" onClick={onClose}>
      <div className="notif-modal-v3" onClick={e => e.stopPropagation()}>
        <div className="notif-modal-handle"></div>
        
        <header className="notif-header-v3">
          <div className="notif-title-group">
            <h3>Centro de Avisos</h3>
            <p>Gerencie suas atualizacoes e conquistas</p>
          </div>
          <div className="notif-header-actions">
            {notifications.some(n => !n.isRead) && (
              <button className="btn-clean-all" onClick={handleMarkAllRead}>
                LIMPAR TUDO
              </button>
            )}
            <button className="btn-close-v3" onClick={onClose}>&times;</button>
          </div>
        </header>

        <main className="notif-body-v3">
          {loading ? (
            <div className="notif-loader">
               <div className="spinner"></div>
               <span>Sincronizando...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="notif-empty-v3">
              <div className="empty-icon-v3"><BellIcon /></div>
              <h4>Tudo em ordem por aqui</h4>
              <p>Voce nao possui novas notificacoes no momento.</p>
            </div>
          ) : (
            <div className="notif-list-v3">
              {notifications.map(notif => (
                <div 
                  key={notif.id} 
                  className={`notif-item-v3 ${notif.isRead ? 'read' : 'unread'}`}
                  onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                >
                  <div className={`notif-type-icon ${notif.type?.toLowerCase()}`}>
                    {getTypeIcon(notif.type)}
                  </div>
                  
                  <div className="notif-content-v3">
                    <div className="notif-main-row">
                      <h4>{notif.title}</h4>
                      {!notif.isRead && <span className="unread-dot"></span>}
                    </div>
                    <p>{notif.message}</p>
                    <span className="notif-timestamp">
                      {new Date(notif.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <button className="btn-remove-notif" onClick={(e) => { e.stopPropagation(); handleDelete(notif.id); }}>
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
