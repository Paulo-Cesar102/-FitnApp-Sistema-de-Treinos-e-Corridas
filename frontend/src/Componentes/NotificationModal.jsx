import React, { useEffect, useState } from "react";
import { notificationService } from "../api/notificationService";
import "./NotificationModal.css";

const BellIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>;
const CheckIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const TrashIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;

export default function NotificationModal({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
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

  if (!isOpen) return null;

  return (
    <div className="notif-overlay" onClick={onClose}>
      <div className="notif-modal" onClick={e => e.stopPropagation()}>
        <header className="notif-header">
          <div className="notif-title-row">
            <BellIcon />
            <h3>Notificações</h3>
          </div>
          <div className="notif-actions">
            {notifications.some(n => !n.isRead) && (
              <button className="btn-mark-all" onClick={handleMarkAllRead}>
                Lerm todas
              </button>
            )}
            <button className="btn-close-notif" onClick={onClose}>&times;</button>
          </div>
        </header>

        <main className="notif-body">
          {loading ? (
            <div className="notif-loading">Carregando...</div>
          ) : notifications.length === 0 ? (
            <div className="notif-empty">Nenhuma notificação por aqui.</div>
          ) : (
            notifications.map(notif => (
              <div 
                key={notif.id} 
                className={`notif-item ${notif.isRead ? 'read' : 'unread'}`}
                onClick={() => !notif.isRead && handleMarkRead(notif.id)}
              >
                <div className="notif-content">
                  <h4>{notif.title}</h4>
                  <p>{notif.message}</p>
                  <span className="notif-time">
                    {new Date(notif.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="notif-item-actions">
                   <button className="btn-del-notif" onClick={(e) => { e.stopPropagation(); handleDelete(notif.id); }}>
                     <TrashIcon />
                   </button>
                </div>
              </div>
            ))
          )}
        </main>
      </div>
    </div>
  );
}