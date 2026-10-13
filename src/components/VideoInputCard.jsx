import React, { useState, useRef } from 'react';
import {
  Upload,
  Film,
  Trash2,
  Play,
  RotateCcw,
  AlertTriangle,
  Clock,
  Maximize2,
  FileVideo,
  Sparkles,
} from 'lucide-react';

const SUPPORTED_EXTENSIONS = ['.mp4', '.webm'];
const SUPPORTED_MIME_TYPES = ['video/mp4', 'video/webm'];
const MAX_FILE_SIZE_MB = 100;

export default function VideoInputCard({
  videoFile,
  videoUrl,
  videoMetadata,
  isAnalyzing,
  backendStatus,
  errorMessage,
  onVideoSelected,
  onRemoveVideo,
  onAnalyze,
  onResetAll,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState('');
  const fileInputRef = useRef(null);
  const videoPlayerRef = useRef(null);

  const isBackendOnline = backendStatus === 'online';

  const validateAndProcessFile = (file) => {
    setValidationError('');

    if (!file) return;

    const fileName = file.name.toLowerCase();
    const hasValidExt = SUPPORTED_EXTENSIONS.some((ext) =>
      fileName.endsWith(ext)
    );
    const hasValidMime =
      SUPPORTED_MIME_TYPES.includes(file.type) || file.type === '';

    if (!hasValidExt && !hasValidMime) {
      setValidationError(
        'Unsupported file format. Please upload an MP4 or WebM video.'
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setValidationError(
        `File is too large (${(file.size / (1024 * 1024)).toFixed(
          1
        )} MB). Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`
      );
      return;
    }

    onVideoSelected(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndProcessFile(droppedFile);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleVideoMetadataLoaded = (e) => {
    const video = e.target;
    if (video) {
      const duration = video.duration;
      const width = video.videoWidth;
      const height = video.videoHeight;
      if (videoMetadata?.updateDetails) {
        videoMetadata.updateDetails({
          duration: !isNaN(duration) ? `${duration.toFixed(1)}s` : 'Unknown',
          dimensions: width && height ? `${width} × ${height}` : 'Unknown',
          size: `${(videoFile.size / (1024 * 1024)).toFixed(2)} MB`,
        });
      }
    }
  };

  const handleVideoError = () => {
    setValidationError(
      'Unable to decode video preview. The video codec may not be supported by your browser.'
    );
  };

  const displayError = validationError || errorMessage;

  return (
    <div className="card dashboard-card">
      <div className="card-header">
        <div className="card-header-title">
          <Film size={16} className="card-icon" />
          <h3>Video Input</h3>
        </div>
        {videoFile && (
          <button
            className="card-action-btn"
            onClick={onResetAll}
            title="Clear and start new analysis"
          >
            <RotateCcw size={13} />
            <span>New Analysis</span>
          </button>
        )}
      </div>

      <div className="card-body">
        {!videoFile ? (
          /* Dropzone Area */
          <div
            className={`dropzone ${isDragging ? 'dropzone-active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp4,.webm,video/mp4,video/webm"
              className="file-input-hidden"
              onChange={handleFileInputChange}
            />

            <div className="dropzone-icon-box">
              <Upload size={24} className="dropzone-icon" />
            </div>

            <div className="dropzone-content">
              <p className="dropzone-text-primary">
                Drag and drop your video file here, or{' '}
                <span className="dropzone-browse">browse</span>
              </p>
              <p className="dropzone-text-secondary">
                Supported formats: <strong>MP4</strong>, <strong>WebM</strong> (Max {MAX_FILE_SIZE_MB}MB)
              </p>
            </div>

            <button
              type="button"
              className="btn btn-secondary upload-btn-cta"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <FileVideo size={14} />
              Upload Video
            </button>
          </div>
        ) : (
          /* Video Preview & File Details */
          <div className="video-preview-container">
            <div className="video-player-wrapper">
              <video
                ref={videoPlayerRef}
                src={videoUrl}
                controls
                playsInline
                className="video-player"
                onLoadedMetadata={handleVideoMetadataLoaded}
                onError={handleVideoError}
              />
            </div>

            <div className="video-meta-bar">
              <div className="video-name-wrapper">
                <Film size={14} className="video-meta-icon" />
                <span className="video-filename" title={videoFile.name}>
                  {videoFile.name}
                </span>
              </div>

              <div className="video-stats">
                {videoMetadata?.duration && (
                  <span className="video-stat-item" title="Duration">
                    <Clock size={12} />
                    {videoMetadata.duration}
                  </span>
                )}
                {videoMetadata?.dimensions && (
                  <span className="video-stat-item" title="Resolution">
                    <Maximize2 size={12} />
                    {videoMetadata.dimensions}
                  </span>
                )}
                {videoMetadata?.size && (
                  <span className="video-stat-item" title="File Size">
                    {videoMetadata.size}
                  </span>
                )}
              </div>
            </div>

            <div className="video-actions">
              <button
                type="button"
                className="btn btn-danger-outline"
                onClick={onRemoveVideo}
                disabled={isAnalyzing}
              >
                <Trash2 size={14} />
                Remove Video
              </button>

              <button
                type="button"
                className={`btn btn-primary ${
                  !isBackendOnline ? 'btn-disabled' : ''
                }`}
                onClick={onAnalyze}
                disabled={!isBackendOnline || isAnalyzing}
                title={
                  !isBackendOnline
                    ? 'Backend prediction endpoint is not reachable'
                    : 'Run Emotion Analysis'
                }
              >
                {isAnalyzing ? (
                  <>
                    <span className="btn-spinner" />
                    Analyzing Video...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Analyze Emotion
                  </>
                )}
              </button>
            </div>

            {!isBackendOnline && (
              <div className="integration-notice">
                <AlertTriangle size={13} className="notice-icon" />
                <span>
                  Model Integration Pending: Prediction backend awaiting connection.
                </span>
              </div>
            )}
          </div>
        )}

        {displayError && (
          <div className="error-banner">
            <AlertTriangle size={14} className="error-icon" />
            <span>{displayError}</span>
          </div>
        )}
      </div>
    </div>
  );
}
