import React from "react";
import "./StreakIcon.css";

export const StreakIcon = ({ streak }) => {
  // Nível 3: Elite (10 ou mais dias)
  if (streak >= 10) {
    return (
      <div className="streak-icon-container level-3">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flame-elite">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
        </svg>
      </div>
    );
  }

  // Nível 2: Acesa (5 a 9 dias)
  if (streak >= 5) {
    return (
      <div className="streak-icon-container level-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="fire-logs">
           {/* Troncos */}
          <path d="M6 21l12-3M6 18l12 3" stroke="#5d4037" />
          {/* Chama Pequena */}
          <path d="M12 15c2 0 3-1.5 3-3.5S13 8 12 6c-1 2-3 3.5-3 5.5s1 3.5 3 3.5z" fill="#ffeb3b" className="small-flame" />
        </svg>
      </div>
    );
  }

  // Nível 1: Apagada (0 a 4 dias)
  return (
    <div className="streak-icon-container level-1">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="logs-only">
        <path d="M6 21l12-3M6 18l12 3" stroke="#444" />
        <path d="M9 16l6-1" stroke="#333" opacity="0.5" />
      </svg>
    </div>
  );
};
