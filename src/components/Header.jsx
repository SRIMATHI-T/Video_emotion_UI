import React from 'react';
import { Video } from 'lucide-react';

export default function Header({ backendStatus }) {
  const isOnline = backendStatus === 'online';

  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="header-icon-wrapper">
          <Video className="header-icon" size={20} />
        </div>
        <div className="header-titles">
          <h1 className="header-title">Video Emotion Recognition</h1>
          <p className="header-subtitle">MELD Dataset · CNN-BiLSTM + Attention</p>
        </div>
      </div>

      {isOnline && (
        <div className="header-status-area">
          <div
            className="status-pill status-online"
            title="Inference backend is connected and operational"
          >
            <span className="status-dot" />
            <span className="status-label">Backend Online</span>
          </div>
        </div>
      )}
    </header>
  );
}
