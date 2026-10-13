import React from 'react';
import { Eye } from 'lucide-react';

export default function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-badge">
        <Eye size={12} className="hero-badge-icon" />
        <span>VIDEO-ONLY DEEP LEARNING</span>
      </div>
      <h2 className="hero-title">Understand emotions through facial expressions.</h2>
      <p className="hero-subtitle">
        Recognize emotions in video conversations using spatial and temporal deep learning.
      </p>
    </section>
  );
}
