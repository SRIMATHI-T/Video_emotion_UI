import React from 'react';
import {
  BarChart2,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Activity,
  Layers,
} from 'lucide-react';
import { MELD_CLASSES } from '../services/api';

export default function EmotionAnalysisCard({
  hasVideo,
  predictionResult,
  isAnalyzing,
  backendStatus,
}) {
  const isBackendOnline = backendStatus === 'online';
  const hasResult = Boolean(predictionResult);

  // Map 7 classes to their probabilities
  const probabilities = predictionResult?.probabilities || {};
  const dominantEmotion = predictionResult?.emotion;
  const confidenceScore = predictionResult?.confidence;
  const predictionStatus = predictionResult?.status || 'Completed';

  // Format confidence as percentage string
  const formatConfidence = (val) => {
    if (typeof val !== 'number' || isNaN(val)) return '—';
    return `${(val * 100).toFixed(1)}%`;
  };

  return (
    <div className="card dashboard-card">
      <div className="card-header">
        <div className="card-header-title">
          <BarChart2 size={16} className="card-icon" />
          <h3>Emotion Analysis</h3>
        </div>
        {hasResult ? (
          <span className="badge badge-success">
            <CheckCircle2 size={11} />
            {predictionStatus}
          </span>
        ) : (
          <span className="badge badge-muted">
            <Layers size={11} />
            7-Class MELD
          </span>
        )}
      </div>

      <div className="card-body">
        {isAnalyzing ? (
          /* Loading State */
          <div className="analysis-loading-state">
            <div className="loading-spinner-ring" />
            <h4 className="loading-heading">Extracting & Analyzing Video Features</h4>
            <p className="loading-subtext">
              Running spatial CNN feature extraction, BiLSTM sequence modeling, and temporal attention classification...
            </p>
          </div>
        ) : hasResult ? (
          /* Real Prediction Results */
          <div className="analysis-results">
            <div className="summary-result-row">
              <div className="result-stat-box">
                <span className="result-stat-label">Detected Emotion</span>
                <span className="result-stat-value emotion-highlight">
                  {dominantEmotion}
                </span>
              </div>

              <div className="result-stat-box">
                <span className="result-stat-label">Actual Confidence</span>
                <span className="result-stat-value confidence-highlight">
                  {formatConfidence(confidenceScore)}
                </span>
              </div>

              <div className="result-stat-box">
                <span className="result-stat-label">Model Status</span>
                <span className="result-stat-value status-highlight">
                  {predictionStatus}
                </span>
              </div>
            </div>

            <div className="distribution-section">
              <div className="distribution-header">
                <h4 className="distribution-title">Emotion Probability Distribution</h4>
                <span className="distribution-caption">MELD Categorical Classes</span>
              </div>

              <div className="probability-bars-list">
                {MELD_CLASSES.map((cls) => {
                  const prob = probabilities[cls] ?? 0;
                  const isTop =
                    dominantEmotion &&
                    dominantEmotion.toLowerCase() === cls.toLowerCase();
                  const pct = Math.min(Math.max(prob * 100, 0), 100).toFixed(1);

                  return (
                    <div
                      key={cls}
                      className={`prob-bar-row ${isTop ? 'prob-bar-top' : ''}`}
                    >
                      <div className="prob-bar-labels">
                        <span className="prob-class-name">
                          {cls}
                          {isTop && <span className="top-indicator"> (Primary)</span>}
                        </span>
                        <span className="prob-class-pct">{pct}%</span>
                      </div>
                      <div className="prob-bar-track">
                        <div
                          className={`prob-bar-fill ${
                            isTop ? 'prob-bar-fill-dominant' : ''
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Empty State Before Analysis */
          <div className="analysis-empty-state">
            <div className="empty-state-icon-box">
              <Activity size={24} className="empty-icon" />
            </div>

            <h4 className="empty-state-heading">
              {hasVideo ? 'Video Ready for Analysis' : 'Waiting for video'}
            </h4>
            <p className="empty-state-description">
              {hasVideo
                ? 'Click "Analyze Emotion" on the left card to run spatial-temporal inference.'
                : 'Upload a video to prepare for emotion analysis.'}
            </p>

            <div className="model-integration-badge-box">
              <span className="pending-badge">
                <HelpCircle size={12} />
                Model Integration Pending
              </span>
              <p className="pending-badge-caption">
                {!isBackendOnline
                  ? 'Awaiting model inference connection. No simulated predictions are generated.'
                  : 'Backend connected. Ready for inference requests.'}
              </p>
            </div>

            {/* Seven-Class Distribution Placeholder */}
            <div className="distribution-section placeholder-distribution">
              <div className="distribution-header">
                <h4 className="distribution-title">Seven MELD Emotion Classes</h4>
                <span className="distribution-caption">Awaiting inference</span>
              </div>

              <div className="probability-bars-list">
                {MELD_CLASSES.map((cls) => (
                  <div key={cls} className="prob-bar-row prob-bar-row-placeholder">
                    <div className="prob-bar-labels">
                      <span className="prob-class-name">{cls}</span>
                      <span className="prob-class-pct">0.0%</span>
                    </div>
                    <div className="prob-bar-track">
                      <div className="prob-bar-fill" style={{ width: '0%' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
