import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import VideoInputCard from './components/VideoInputCard';
import EmotionAnalysisCard from './components/EmotionAnalysisCard';
import ResearchPipeline from './components/ResearchPipeline';
import Footer from './components/Footer';
import { checkBackendHealth, predictVideoEmotion } from './services/api';
import './App.css';

export default function App() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoMetadata, setVideoMetadata] = useState(null);

  const [backendStatus, setBackendStatus] = useState('checking');
  const [isCheckingBackend, setIsCheckingBackend] = useState(true);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Check backend health on initial load
  const runHealthCheck = useCallback(async () => {
    setIsCheckingBackend(true);
    try {
      const res = await checkBackendHealth();
      setBackendStatus(res.online ? 'online' : 'offline');
    } catch (_) {
      setBackendStatus('offline');
    } finally {
      setIsCheckingBackend(false);
    }
  }, []);

  useEffect(() => {
    runHealthCheck();
  }, [runHealthCheck]);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  const handleVideoSelected = (file) => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    const newUrl = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoUrl(newUrl);
    setVideoMetadata({
      duration: '',
      dimensions: '',
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      updateDetails: (details) => {
        setVideoMetadata((prev) => ({ ...prev, ...details }));
      },
    });
    setPredictionResult(null);
    setErrorMessage('');
  };

  const handleRemoveVideo = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoFile(null);
    setVideoUrl(null);
    setVideoMetadata(null);
    setPredictionResult(null);
    setErrorMessage('');
  };

  const handleResetAll = () => {
    handleRemoveVideo();
  };

  const handleAnalyze = async () => {
    if (!videoFile) return;

    if (backendStatus !== 'online') {
      setErrorMessage(
        'Backend server is not reachable. Please ensure the inference backend is running.'
      );
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage('');

    try {
      const result = await predictVideoEmotion(videoFile);
      setPredictionResult(result);
    } catch (err) {
      setErrorMessage(
        err.message || 'An error occurred during emotion analysis. Check backend logs.'
      );
      setPredictionResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="app-container">
      <Header
        backendStatus={backendStatus}
        onRefreshStatus={runHealthCheck}
        isChecking={isCheckingBackend}
      />

      <main className="main-content">
        <Hero />

        <div className="dashboard-grid">
          <VideoInputCard
            videoFile={videoFile}
            videoUrl={videoUrl}
            videoMetadata={videoMetadata}
            isAnalyzing={isAnalyzing}
            backendStatus={backendStatus}
            errorMessage={errorMessage}
            onVideoSelected={handleVideoSelected}
            onRemoveVideo={handleRemoveVideo}
            onAnalyze={handleAnalyze}
            onResetAll={handleResetAll}
          />

          <EmotionAnalysisCard
            hasVideo={Boolean(videoFile)}
            predictionResult={predictionResult}
            isAnalyzing={isAnalyzing}
            backendStatus={backendStatus}
          />
        </div>

        <ResearchPipeline />
      </main>

      <Footer />
    </div>
  );
}
