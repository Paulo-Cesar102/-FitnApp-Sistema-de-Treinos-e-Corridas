import React from "react";
import "./CustomAlert.css";

const CheckIcon = () => <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const AlertIcon = () => <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="#ff4500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;

export default function CustomAlert({ config }) {
  if (!config.isOpen) return null;

  const { title, message, type, onConfirm, onCancel, confirmText = "OK", cancelText = "Cancelar" } = config;

  return (
    <div className="custom-alert-overlay">
      <div className="custom-alert-box">
        <div className="custom-alert-icon">
          {type === "success" ? <CheckIcon /> : <AlertIcon />}
        </div>
        
        {title && <h3 className="custom-alert-title">{title}</h3>}
        <p className="custom-alert-message">{message}</p>
        
        <div className="custom-alert-actions">
          {onCancel && (
            <button className="custom-alert-btn cancel" onClick={onCancel}>{cancelText}</button>
          )}
          <button className="custom-alert-btn confirm" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}