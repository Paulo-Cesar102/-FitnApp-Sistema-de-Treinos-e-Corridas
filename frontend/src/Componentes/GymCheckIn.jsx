import React, { useState, useEffect } from "react";
import { gymService } from "../api/gymService";
import "./GymCheckIn.css";

// --- Ícones Minimalistas ---
const MapPinIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const CheckIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const ZapIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const CalendarIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;

export default function GymCheckIn() {
  const [loading, setLoading] = useState(false);
  const [checkInDone, setCheckInDone] = useState(false);
  const [todayCount, setTodayCount] = useState(0);
  const [monthlyCount, setMonthlyCount] = useState(0);
  const [message, setMessage] = useState("");

  const userId = sessionStorage.getItem("userId");
  const gymId = sessionStorage.getItem("gymId");

  useEffect(() => {
    async function loadStats() {
      if (!gymId || !userId) return;
      try {
        const [today, monthly] = await Promise.all([
          gymService.getTodayCheckInCount(gymId),
          gymService.getMonthlyCheckInCount(userId, gymId)
        ]);
        setTodayCount(today.count || 0);
        setMonthlyCount(monthly.count || 0);
      } catch (err) {
        console.error(err);
      }
    }
    loadStats();
  }, [gymId, userId]);

  const handleCheckIn = async () => {
    if (!gymId) return;
    setLoading(true);
    try {
      await gymService.performCheckIn(gymId);
      setCheckInDone(true);
      setMessage("Presença confirmada!");
      setTodayCount(prev => prev + 1);
      setMonthlyCount(prev => prev + 1);
    } catch (err) {
      setMessage("Limite de check-in diário atingido.");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className="checkin-section-v4">
      <div className="checkin-main-card glass">
         <div className="checkin-info">
            <div className="icon-box-checkin">
               <MapPinIcon />
            </div>
            <div className="text-box-checkin">
               <h4>Presença na Unidade</h4>
               <p>Confirme sua frequência diária para ganhar XP e manter sua sequência.</p>
            </div>
         </div>

         <div className="checkin-action">
            {checkInDone ? (
              <div className="check-success-badge">
                 <CheckIcon />
                 <span>CONFIRMADO HOJE</span>
              </div>
            ) : (
              <button 
                className="btn-perform-checkin" 
                onClick={handleCheckIn}
                disabled={loading}
              >
                {loading ? "PROCESSANDO..." : "CONFIRMAR PRESENÇA"}
              </button>
            )}
         </div>
         
         {message && <div className="checkin-toast">{message}</div>}
      </div>

      <div className="checkin-stats-grid">
         <div className="stat-pill-v4">
            <ZapIcon />
            <div className="stat-data">
               <span className="val">{todayCount}</span>
               <span className="lab">ATLETAS HOJE</span>
            </div>
         </div>
         <div className="stat-pill-v4">
            <CalendarIcon />
            <div className="stat-data">
               <span className="val">{monthlyCount}</span>
               <span className="lab">CHECK-INS NO MÊS</span>
            </div>
         </div>
      </div>
    </div>
  );
}
