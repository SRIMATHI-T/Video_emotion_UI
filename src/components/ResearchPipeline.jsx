import React from 'react';
import {
  FileVideo,
  Film,
  ScanFace,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

const PIPELINE_STEPS = [
  {
    id: 1,
    title: 'Video Input',
    description: 'MP4 / WebM raw conversation clip',
    icon: FileVideo,
  },
  {
    id: 2,
    title: 'Frame Extraction',
    description: 'Uniform temporal sampling',
    icon: Film,
  },
  {
    id: 3,
    title: 'Face Detection',
    description: 'Facial ROI localization & alignment',
    icon: ScanFace,
  },
  {
    id: 4,
    title: 'CNN Features',
    description: 'Spatial representation extraction',
    icon: Cpu,
  },
  {
    id: 5,
    title: 'BiLSTM',
    description: 'Bidirectional temporal sequence modeling',
    icon: Layers,
  },
  {
    id: 6,
    title: 'Attention + Classification',
    description: 'Self-attention weighting & 7-class Softmax',
    icon: Sparkles,
  },
];

export default function ResearchPipeline() {
  return (
    <section className="pipeline-section">
      <div className="pipeline-header">
        <div className="pipeline-title-group">
          <h3 className="pipeline-title">Research Pipeline</h3>
          <span className="pipeline-badge">Proposed Architecture</span>
        </div>
        <p className="pipeline-subtitle">
          End-to-end spatial-temporal pipeline proposed for video-only emotion recognition on MELD.
        </p>
      </div>

      <div className="pipeline-steps-container">
        {PIPELINE_STEPS.map((step, index) => {
          const Icon = step.icon;
          const isLast = index === PIPELINE_STEPS.length - 1;

          return (
            <React.Fragment key={step.id}>
              <div className="pipeline-step-card">
                <div className="pipeline-step-number">{step.id}</div>
                <div className="pipeline-step-icon">
                  <Icon size={16} />
                </div>
                <div className="pipeline-step-info">
                  <h4 className="pipeline-step-title">{step.title}</h4>
                  <p className="pipeline-step-desc">{step.description}</p>
                </div>
              </div>

              {!isLast && (
                <div className="pipeline-arrow" aria-hidden="true">
                  <ArrowRight size={14} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
}
