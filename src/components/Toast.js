import React, { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const icons = { success: 'check-circle-fill', danger: 'x-circle-fill', info: 'info-circle-fill' };

  return (
    <div
      className={`toast show align-items-center text-white bg-${type} border-0`}
      style={{ minWidth: 280, borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
    >
      <div className="d-flex">
        <div className="toast-body d-flex align-items-center gap-2">
          <i className={`bi bi-${icons[type] || 'info-circle-fill'}`}></i>
          {message}
        </div>
        <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={onClose}></button>
      </div>
    </div>
  );
}
