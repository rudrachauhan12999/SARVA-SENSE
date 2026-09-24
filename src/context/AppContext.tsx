import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  PlanType,
  LanguageCode,
  Machine,
  Manual,
  TroubleshootingSession,
  SourceCitation,
  Message,
} from '../types';
import {
  MOCK_MACHINES,
  MOCK_MANUALS,
  MOCK_ANSWER_E101_HP200X,
  MOCK_ANSWER_OVERHEATING_HP200X,
} from '../data/mockData';
import { troubleshootingService, machineService, manualService, HistoryTurn } from '../services/api';

export type AppRoute =
  | 'landing'
  | 'dashboard'
  | 'troubleshoot'
  | 'chat'
  | 'manuals'
  | 'upload-manual'
  | 'ocr'
  | 'screenshot'
  | 'voice'
  | 'reports'
  | 'machines'
  | 'history'
  | 'plans'
  | 'settings'
  | 'help';

interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface AppContextType {
  currentRoute: AppRoute;
  setCurrentRoute: (route: AppRoute) => void;
  currentPlan: PlanType;
  setCurrentPlan: (plan: PlanType) => void;
  selectedMachine: Machine | null;
  setSelectedMachine: (machine: Machine | null) => void;
  machines: Machine[];
  manuals: Manual[];
  addManual: (manual: Manual) => void;
  selectedLanguage: LanguageCode;
  setSelectedLanguage: (lang: LanguageCode) => void;
  responseLanguage: LanguageCode;
  setResponseLanguage: (lang: LanguageCode) => void;
  // Session & troubleshooting
  currentSession: TroubleshootingSession | null;
  setCurrentSession: React.Dispatch<React.SetStateAction<TroubleshootingSession | null>>;
  historySessions: TroubleshootingSession[];
  saveCurrentCase: () => void;
  deleteSavedCase: (id: string) => void;
  runTroubleshootQuery: (query: string, machineOverride?: Machine | null) => Promise<void>;
  sendFollowUpMessage: (text: string) => Promise<void>;
  // Active document modal viewer
  viewingSource: SourceCitation | null;
  setViewingSource: (source: SourceCitation | null) => void;
  // Pre-selects which manual the Chat page scopes to when navigated to from
  // "Chat with this Manual" (Upload/Manuals pages) rather than the nav bar.
  chatManualId: string | null;
  setChatManualId: (manualId: string | null) => void;
  // Demo scenarios quick launcher
  loadDemoScenario: (scenarioId: string) => void;
  // Toasts
  toasts: Toast[];
  showToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  // Gating check
  canAccessFeature: (feature: 'ocr' | 'screenshot' | 'voice' | 'advanced_reports' | 'unlimited_queries') => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_HISTORY: TroubleshootingSession[] = [
  {
    id: 'case-101',
    title: 'E101 Pressure Sensor Loop Fault',
    machineId: 'hp-200x',
    machineName: 'Hydraulic Press HP-200X',
    machineModel: 'HP-200X Heavy Duty',
    issueCode: 'E101',
    createdAt: '2026-09-03T14:32:00Z',
    updatedAt: '2026-09-03T14:38:00Z',
    verificationState: 'VERIFIED',
    sourceCount: 2,
    isSaved: true,
    messages: [
      {
        id: 'm1',
        sender: 'user',
        timestamp: '14:32',
        queryType: 'ERROR_CODE',
        text: 'E101 on HP-200X. What does it mean?',
      },
      {
        id: 'm2',
        sender: 'assistant',
        timestamp: '14:33',
        structuredAnswer: MOCK_ANSWER_E101_HP200X,
      },
    ],
  },
  {
    id: 'case-102',
    title: 'Hydraulic Fluid Overheating Alert',
    machineId: 'hp-200x',
    machineName: 'Hydraulic Press HP-200X',
    machineModel: 'HP-200X Heavy Duty',
    issueCode: 'OVERHEAT',
    createdAt: '2026-09-01T09:15:00Z',
    updatedAt: '2026-09-01T09:20:00Z',
    verificationState: 'VERIFIED',
    sourceCount: 1,
    isSaved: false,
    messages: [
      {
        id: 'm3',
        sender: 'user',
        timestamp: '09:15',
        queryType: 'SYMPTOM',
        text: 'Why is the HP-200X overheating during continuous cycle?',
      },
      {
        id: 'm4',
        sender: 'assistant',
        timestamp: '09:16',
        structuredAnswer: MOCK_ANSWER_OVERHEATING_HP200X,
      },
    ],
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('dashboard');
  const [currentPlan, setCurrentPlan] = useState<PlanType>('pro'); // Default to Pro for easiest hackathon exploration
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(MOCK_MACHINES[0]);
  const [machines, setMachines] = useState<Machine[]>(MOCK_MACHINES);
  const [manuals, setManuals] = useState<Manual[]>(MOCK_MANUALS);

  // Pull real machines/manuals from the FastAPI backend. Falls back to the
  // bundled mock data (already set above) if the backend isn't reachable,
  // so the UI still renders something sensible offline.
  useEffect(() => {
    machineService
      .getMachines()
      .then((real) => {
        if (real && real.length) setMachines(real);
      })
      .catch(() => {
        /* keep mock machines */
      });
    manualService
      .getManuals()
      .then((real) => {
        if (real && real.length) setManuals(real);
      })
      .catch(() => {
        /* keep mock manuals */
      });
  }, []);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('en');
  const [responseLanguage, setResponseLanguage] = useState<LanguageCode>('en');
  const [viewingSource, setViewingSource] = useState<SourceCitation | null>(null);
  const [chatManualId, setChatManualId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Sessions and History
  const [historySessions, setHistorySessions] = useState<TroubleshootingSession[]>(() => {
    try {
      const saved = localStorage.getItem('sarva_history');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_HISTORY;
  });

  const [currentSession, setCurrentSession] = useState<TroubleshootingSession | null>(() => {
    return INITIAL_HISTORY[0];
  });

  useEffect(() => {
    try {
      localStorage.setItem('sarva_history', JSON.stringify(historySessions));
    } catch {
      // ignore
    }
  }, [historySessions]);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const id = 'toast-' + Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addManual = (manual: Manual) => {
    setManuals((prev) => [manual, ...prev]);
    showToast(`Added manual: ${manual.title}`, 'success');
  };

  const saveCurrentCase = () => {
    if (!currentSession) return;
    const updated = { ...currentSession, isSaved: true };
    setCurrentSession(updated);
    setHistorySessions((prev) => {
      const index = prev.findIndex((s) => s.id === updated.id);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = updated;
        return copy;
      }
      return [updated, ...prev];
    });
    showToast('Troubleshooting case saved to My Cases!', 'success');
  };

  const deleteSavedCase = (id: string) => {
    setHistorySessions((prev) => prev.filter((s) => s.id !== id));
    if (currentSession?.id === id) {
      setCurrentSession(null);
    }
    showToast('Case removed from history.', 'info');
  };

  const canAccessFeature = (feature: 'ocr' | 'screenshot' | 'voice' | 'advanced_reports' | 'unlimited_queries'): boolean => {
    if (currentPlan === 'pro') return true;
    if (currentPlan === 'plus') {
      if (feature === 'unlimited_queries') return false;
      return true;
    }
    // 'free' plan restrictions
    if (feature === 'ocr' || feature === 'screenshot' || feature === 'voice' || feature === 'advanced_reports') {
      return false;
    }
    return true;
  };

  const runTroubleshootQuery = async (queryText: string, machineOverride?: Machine | null) => {
    const activeMachine = machineOverride !== undefined ? machineOverride : selectedMachine;
    const sessionId = 'case-' + Date.now();

    const userMessage: Message = {
      id: 'msg-u-' + Date.now(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: queryText,
      queryType: queryText.toUpperCase().includes('E101') ? 'ERROR_CODE' : 'SYMPTOM',
    };

    const loadingMessage: Message = {
      id: 'msg-a-' + Date.now(),
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isLoading: true,
      loadingStage: 'Understanding query intent & technical terms...',
    };

    const initialSession: TroubleshootingSession = {
      id: sessionId,
      title: `${queryText.slice(0, 35)} ${activeMachine ? `(${activeMachine.name})` : ''}`,
      machineId: activeMachine?.id,
      machineName: activeMachine?.name,
      machineModel: activeMachine?.model,
      issueCode: queryText.toUpperCase().includes('E101') ? 'E101' : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      verificationState: 'VERIFIED',
      sourceCount: 0,
      messages: [userMessage, loadingMessage],
    };

    setCurrentSession(initialSession);
    setCurrentRoute('troubleshoot');

    try {
      const result = await troubleshootingService.diagnose({
        query: queryText,
        machineId: activeMachine?.id,
        language: responseLanguage,
        onProgress: (stage) => {
          setCurrentSession((prev) => {
            if (!prev) return null;
            const updatedMessages = [...prev.messages];
            const lastIdx = updatedMessages.length - 1;
            if (lastIdx >= 0 && updatedMessages[lastIdx].isLoading) {
              updatedMessages[lastIdx] = {
                ...updatedMessages[lastIdx],
                loadingStage: stage,
              };
            }
            return { ...prev, messages: updatedMessages };
          });
        },
      });

      let assistantMessage: Message;
      let verificationState = initialSession.verificationState;
      let sourceCount = 0;

      if (result.type === 'AMBIGUITY' && result.ambiguity) {
        verificationState = 'PARTIALLY_VERIFIED';
        assistantMessage = {
          id: 'msg-a-ambig-' + Date.now(),
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: result.ambiguity.text,
          ambiguityOptions: result.ambiguity.options,
        };
      } else if (result.type === 'INSUFFICIENT_INFO' && result.insufficient) {
        verificationState = 'INSUFFICIENT_INFORMATION';
        assistantMessage = {
          id: 'msg-a-insuf-' + Date.now(),
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: result.insufficient.message,
          insufficientInfo: result.insufficient,
        };
      } else {
        const answer = result.answer || MOCK_ANSWER_E101_HP200X;
        verificationState = answer.verificationState;
        sourceCount = answer.sources.length;
        assistantMessage = {
          id: 'msg-a-ans-' + Date.now(),
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          structuredAnswer: answer,
        };
      }

      const finalSession: TroubleshootingSession = {
        ...initialSession,
        verificationState,
        sourceCount,
        messages: [userMessage, assistantMessage],
      };

      setCurrentSession(finalSession);
      setHistorySessions((prev) => [finalSession, ...prev.filter((s) => s.id !== finalSession.id)]);
    } catch {
      showToast('Error processing troubleshooting query', 'error');
    }
  };

  const sendFollowUpMessage = async (text: string) => {
    if (!currentSession) return;

    const userMessage: Message = {
      id: 'msg-u-' + Date.now(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
    };

    const loadingMessage: Message = {
      id: 'msg-a-' + Date.now(),
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isLoading: true,
      loadingStage: 'Continuing diagnosis with prior conversation context...',
    };

    setCurrentSession((prev) => {
      if (!prev) return null;
      return { ...prev, messages: [...prev.messages, userMessage, loadingMessage] };
    });

    // Build conversation history from the existing session so the backend
    // can answer follow-ups ("and what if that doesn't fix it?") without the
    // user repeating the machine/error context -- the frontend already has
    // the full transcript, so we just pass it along.
    const history: HistoryTurn[] = currentSession.messages
      .filter((m) => !m.isLoading)
      .map((m) => ({
        sender: m.sender === 'user' ? 'user' : 'assistant',
        text: m.text,
        structuredAnswerSummary: m.structuredAnswer
          ? `${m.structuredAnswer.errorMeaning} Causes: ${m.structuredAnswer.probableCauses.join('; ')}`
          : undefined,
      }));

    try {
      const result = await troubleshootingService.diagnose({
        query: text,
        machineId: currentSession.machineId,
        language: responseLanguage,
        history,
      });

      let assistantMessage: Message;
      let verificationState = currentSession.verificationState;
      let sourceCount = currentSession.sourceCount;

      if (result.type === 'AMBIGUITY' && result.ambiguity) {
        verificationState = 'PARTIALLY_VERIFIED';
        assistantMessage = {
          id: 'msg-a-ambig-' + Date.now(),
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: result.ambiguity.text,
          ambiguityOptions: result.ambiguity.options,
        };
      } else if (result.type === 'INSUFFICIENT_INFO' && result.insufficient) {
        verificationState = 'INSUFFICIENT_INFORMATION';
        assistantMessage = {
          id: 'msg-a-insuf-' + Date.now(),
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: result.insufficient.message,
          insufficientInfo: result.insufficient,
        };
      } else if (result.answer) {
        verificationState = result.answer.verificationState;
        sourceCount = result.answer.sources.length;
        assistantMessage = {
          id: 'msg-a-fu-' + Date.now(),
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          structuredAnswer: result.answer,
        };
      } else {
        throw new Error('Unexpected empty response');
      }

      setCurrentSession((prev) => {
        if (!prev) return null;
        const filtered = prev.messages.filter((m) => !m.isLoading);
        return {
          ...prev,
          verificationState,
          sourceCount,
          updatedAt: new Date().toISOString(),
          messages: [...filtered, assistantMessage],
        };
      });
    } catch {
      showToast('Error processing follow-up question', 'error');
      setCurrentSession((prev) => {
        if (!prev) return null;
        return { ...prev, messages: prev.messages.filter((m) => !m.isLoading) };
      });
    }
  };

  const loadDemoScenario = (scenarioId: string) => {
    switch (scenarioId) {
      case 'demo-1-e101':
        setSelectedMachine(MOCK_MACHINES[0]);
        runTroubleshootQuery('E101 on the HP-200X', MOCK_MACHINES[0]);
        showToast('Loaded Demo 1: Exact E101 on HP-200X', 'success');
        break;
      case 'demo-2-overheat':
        setSelectedMachine(MOCK_MACHINES[0]);
        runTroubleshootQuery('Why is the HP-200X overheating?', MOCK_MACHINES[0]);
        showToast('Loaded Demo 2: Natural Language Overheating Symptom', 'success');
        break;
      case 'demo-3-ambiguous':
        setSelectedMachine(null);
        runTroubleshootQuery('E101', null);
        showToast('Loaded Demo 3: Cross-Manual Ambiguous Error Code', 'warning');
        break;
      case 'demo-4-insufficient':
        setSelectedMachine(MOCK_MACHINES[0]);
        runTroubleshootQuery('Why is my machine making a strange high-pitched noise?', MOCK_MACHINES[0]);
        showToast('Loaded Demo 4: Insufficient Information Refusal', 'info');
        break;
      case 'demo-5-screenshot':
        setCurrentRoute('screenshot');
        showToast('Loaded Demo 5: HMI Screenshot Vision Analysis', 'success');
        break;
      case 'demo-6-ocr':
        setCurrentRoute('ocr');
        showToast('Loaded Demo 6: Scanned Manual OCR Workflow', 'success');
        break;
      case 'demo-7-voice':
        setCurrentRoute('voice');
        showToast('Loaded Demo 7: Voice Troubleshooting Query', 'success');
        break;
      default:
        setCurrentRoute('dashboard');
        break;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentRoute,
        setCurrentRoute,
        currentPlan,
        setCurrentPlan,
        selectedMachine,
        setSelectedMachine,
        machines,
        manuals,
        addManual,
        selectedLanguage,
        setSelectedLanguage,
        responseLanguage,
        setResponseLanguage,
        currentSession,
        setCurrentSession,
        historySessions,
        saveCurrentCase,
        deleteSavedCase,
        runTroubleshootQuery,
        sendFollowUpMessage,
        viewingSource,
        setViewingSource,
        chatManualId,
        setChatManualId,
        loadDemoScenario,
        toasts,
        showToast,
        removeToast,
        canAccessFeature,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
