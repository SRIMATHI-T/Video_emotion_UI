/**
 * API Service for Video Emotion Recognition
 * Communicates with the CNN-BiLSTM + Attention inference backend.
 */

export const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

export const MELD_CLASSES = [
  'Neutral',
  'Joy',
  'Surprise',
  'Anger',
  'Sadness',
  'Disgust',
  'Fear',
];

/**
 * Checks the health and availability of the backend server.
 * Expected endpoint: GET /health
 * @returns {Promise<{online: boolean, details?: object, error?: string}>}
 */
export async function checkBackendHealth() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        online: false,
        error: `Server responded with status ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      online: true,
      details: data,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    return {
      online: false,
      error:
        err.name === 'AbortError'
          ? 'Health check timed out'
          : err.message || 'Network error',
    };
  }
}

/**
 * Normalizes backend emotion probability responses across casing and common formats.
 * @param {object|Array} rawProbs
 * @returns {Record<string, number>}
 */
export function normalizeProbabilities(rawProbs) {
  const normalized = {};
  MELD_CLASSES.forEach((cls) => {
    normalized[cls] = 0;
  });

  if (!rawProbs) return normalized;

  if (Array.isArray(rawProbs)) {
    // Array format: [{ emotion: 'Joy', probability: 0.8 }, ...] or [{ label: 'Joy', score: 0.8 }, ...]
    rawProbs.forEach((item) => {
      const label = item.emotion || item.label || item.class;
      const value = item.probability ?? item.score ?? item.confidence ?? 0;
      if (label) {
        const matched = MELD_CLASSES.find(
          (c) => c.toLowerCase() === String(label).toLowerCase()
        );
        if (matched) {
          normalized[matched] = typeof value === 'number' ? value : parseFloat(value) || 0;
        }
      }
    });
  } else if (typeof rawProbs === 'object') {
    // Key-value format: { "Joy": 0.8, "Neutral": 0.1, ... } or lowercase
    Object.keys(rawProbs).forEach((key) => {
      const matched = MELD_CLASSES.find(
        (c) => c.toLowerCase() === key.toLowerCase()
      );
      if (matched) {
        const val = rawProbs[key];
        normalized[matched] = typeof val === 'number' ? val : parseFloat(val) || 0;
      }
    });
  }

  // Normalize percentages (if values are 0..100, convert to 0..1)
  const maxVal = Math.max(...Object.values(normalized));
  if (maxVal > 1) {
    MELD_CLASSES.forEach((cls) => {
      normalized[cls] = normalized[cls] / 100;
    });
  }

  return normalized;
}

/**
 * Submits a video file to the model prediction endpoint.
 * Expected endpoint: POST /predict
 * Accepts multipart/form-data with video file.
 * @param {File} videoFile
 * @returns {Promise<{
 *   emotion: string,
 *   confidence: number,
 *   probabilities: Record<string, number>,
 *   status: string,
 *   rawResponse: any
 * }>}
 */
export async function predictVideoEmotion(videoFile) {
  if (!videoFile) {
    throw new Error('No video file provided for analysis.');
  }

  const formData = new FormData();
  // Provide both 'video' and 'file' field keys to support standard FastAPI/Flask upload schemas
  formData.append('video', videoFile);
  formData.append('file', videoFile);

  const controller = new AbortController();
  // 60-second timeout for video frame extraction and deep learning inference
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(`${BACKEND_URL}/predict`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMsg = `Server error ${response.status}`;
      try {
        const errJson = await response.json();
        errorMsg = errJson.detail || errJson.message || errJson.error || errorMsg;
      } catch (_) {
        // Fallback to status text
        if (response.statusText) {
          errorMsg = `${response.status}: ${response.statusText}`;
        }
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();

    // Validate expected structure
    const detectedEmotion =
      data.emotion ||
      data.predicted_emotion ||
      data.dominant_emotion ||
      data.class ||
      'Unknown';

    let rawConf =
      data.confidence ??
      data.confidence_score ??
      data.score ??
      0;

    // Normalize confidence to 0..1 if it was supplied as 0..100
    if (typeof rawConf === 'number' && rawConf > 1) {
      rawConf = rawConf / 100;
    }

    const rawProbabilities =
      data.probabilities ||
      data.probability_distribution ||
      data.class_probabilities ||
      data.predictions ||
      {};

    const normalizedProbabilities = normalizeProbabilities(rawProbabilities);

    return {
      emotion: detectedEmotion,
      confidence: rawConf,
      probabilities: normalizedProbabilities,
      status: data.status || 'Completed',
      rawResponse: data,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Analysis timed out. The backend model inference took too long.');
    }
    throw err;
  }
}
