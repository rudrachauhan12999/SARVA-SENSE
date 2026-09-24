/**
 * SARVA-SENSE FRONTEND SERVICE LAYER
 *
 * Talks to the real FastAPI backend (see /backend). The exported shape of
 * every function here is unchanged from the original mock version so no
 * page/component needed to be restructured -- only the implementation
 * underneath now performs real HTTP calls instead of setTimeout-based
 * simulation.
 */

import { MOCK_AMBIGUITY_E101, MOCK_INSUFFICIENT_INFO } from '../data/mockData';
import {
  StructuredAnswer,
  HMIScreenshotAnalysis,
  OCRPageAnalysis,
  Machine,
  Manual,
  QueryType,
  LanguageCode,
  ChatSource,
} from '../types';

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API ${path} failed (${res.status}): ${body}`);
  }
  return res.json();
}

export interface HistoryTurn {
  sender: 'user' | 'assistant';
  text?: string;
  structuredAnswerSummary?: string;
}

export interface DiagnoseQueryOptions {
  query: string;
  machineId?: string;
  queryType?: QueryType;
  language?: LanguageCode;
  history?: HistoryTurn[];
  onProgress?: (stage: string) => void;
}

export interface DiagnoseQueryResult {
  type: 'STRUCTURED_ANSWER' | 'AMBIGUITY' | 'INSUFFICIENT_INFO';
  answer?: StructuredAnswer;
  ambiguity?: typeof MOCK_AMBIGUITY_E101;
  insufficient?: typeof MOCK_INSUFFICIENT_INFO;
}

// Progress stages shown to the user while the real backend pipeline
// (retrieval -> generation -> verification) runs. These describe the actual
// stages of the pipeline; they're just not driven by live per-stage
// callbacks from the backend, since the call is a single request/response
// round trip rather than a streaming connection.
const PIPELINE_STAGES = [
  'Understanding query intent & technical terms...',
  'Searching manual index with hybrid retrieval...',
  'Ranking evidence & matching alarm codes...',
  'Generating grounded answer with Groq...',
  'Verifying claims against retrieved evidence...',
];

export const troubleshootingService = {
  async diagnose(options: DiagnoseQueryOptions): Promise<DiagnoseQueryResult> {
    const { query, machineId, language, history, onProgress } = options;

    let stageIdx = 0;
    const progressTimer = onProgress
      ? setInterval(() => {
          if (stageIdx < PIPELINE_STAGES.length) {
            onProgress(PIPELINE_STAGES[stageIdx]);
            stageIdx++;
          }
        }, 300)
      : null;

    try {
      const result = await apiFetch<DiagnoseQueryResult>('/api/troubleshoot', {
        method: 'POST',
        body: JSON.stringify({
          query,
          machineId: machineId || null,
          language: language || 'en',
          history: history || null,
        }),
      });
      return result;
    } finally {
      if (progressTimer) clearInterval(progressTimer);
    }
  },
};

export const manualService = {
  async getManuals(): Promise<Manual[]> {
    return apiFetch<Manual[]>('/api/manuals');
  },

  async uploadManual(
    file: File,
    onProgress?: (percent: number, stage: string) => void
  ): Promise<Manual> {
    if (onProgress) onProgress(10, 'Uploading PDF to backend...');
    const formData = new FormData();
    formData.append('file', file);

    if (onProgress) onProgress(35, 'Parsing & section-aware chunking...');
    const res = await fetch(`${API_BASE_URL}/api/manuals/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Upload failed (${res.status}): ${body}`);
    }
    if (onProgress) onProgress(80, 'Embedding chunks & indexing in ChromaDB...');
    const manual: Manual = await res.json();
    if (onProgress) onProgress(100, 'Manual indexed and ready for grounded retrieval.');
    return manual;
  },
};

export const ocrService = {
  async processScannedPage(
    pageNumber: number,
    onProgress?: (stage: string) => void,
    manualId: string = 'man-hp-1'
  ): Promise<OCRPageAnalysis> {
    if (onProgress) onProgress('Rendering page with PyMuPDF & calling Gemini Vision...');
    return apiFetch<OCRPageAnalysis>('/api/ocr', {
      method: 'POST',
      body: JSON.stringify({ manualId, pageNumber }),
    });
  },
};

export const visionService = {
  async analyzeScreenshot(
    imageSrc: string,
    onProgress?: (stage: string) => void
  ): Promise<HMIScreenshotAnalysis> {
    if (onProgress) onProgress('Sending screenshot to Gemini Vision...');
    // imageSrc may be a data URL (real upload) or a bundled sample asset path;
    // the backend accepts either raw base64 or a data: URL.
    let imageBase64 = imageSrc;
    if (!imageSrc.startsWith('data:') && !isLikelyBase64(imageSrc)) {
      // it's a URL to a static asset (e.g. the bundled sample HMI image) -- fetch and convert
      imageBase64 = await urlToBase64(imageSrc);
    }
    return apiFetch<HMIScreenshotAnalysis>('/api/screenshot', {
      method: 'POST',
      body: JSON.stringify({ imageBase64 }),
    });
  },
};

function isLikelyBase64(s: string): boolean {
  return /^[A-Za-z0-9+/=]{100,}$/.test(s);
}

async function urlToBase64(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export interface ChatStreamOptions {
  query: string;
  machineId?: string | null;
  manualId?: string | null;
  language?: LanguageCode;
  history?: HistoryTurn[];
}

export interface ChatStreamHandlers {
  onToken: (text: string) => void;
  onSources?: (sources: ChatSource[]) => void;
  onError?: (message: string) => void;
  onDone?: () => void;
}

// Real-time streaming chatbot for open-ended questions over a manual/machine's
// indexed content (e.g. "list the top 10 problems in this manual"). Reads the
// backend's Server-Sent Events response and calls back token-by-token as text
// arrives, instead of waiting for the full response like troubleshootingService
// does -- this is what makes the chat UI feel like a real, live chatbot.
export const chatService = {
  async streamChat(options: ChatStreamOptions, handlers: ChatStreamHandlers): Promise<void> {
    const { query, machineId, manualId, language, history } = options;

    let res: Response;
    try {
      res = await fetch(`${API_BASE_URL}/api/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          machineId: machineId || null,
          manualId: manualId || null,
          language: language || 'en',
          history: history || null,
        }),
      });
    } catch {
      handlers.onError?.(`Could not reach the backend at ${API_BASE_URL}. Is it running?`);
      return;
    }

    if (!res.ok || !res.body) {
      const body = await res.text().catch(() => '');
      handlers.onError?.(`Chat request failed (${res.status}): ${body}`);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let sepIdx: number;
      while ((sepIdx = buffer.indexOf('\n\n')) !== -1) {
        const rawEvent = buffer.slice(0, sepIdx);
        buffer = buffer.slice(sepIdx + 2);

        const dataLine = rawEvent.split('\n').find((l) => l.startsWith('data:'));
        if (!dataLine) continue;
        const jsonStr = dataLine.slice(5).trim();
        if (!jsonStr) continue;

        try {
          const evt = JSON.parse(jsonStr);
          if (evt.type === 'token') handlers.onToken(evt.text);
          else if (evt.type === 'sources') handlers.onSources?.(evt.sources);
          else if (evt.type === 'error') handlers.onError?.(evt.message);
        } catch {
          // ignore a malformed SSE frame rather than breaking the whole stream
        }
      }
    }
    handlers.onDone?.();
  },
};

export const machineService = {
  async getMachines(): Promise<Machine[]> {
    return apiFetch<Machine[]>('/api/machines');
  },
};
