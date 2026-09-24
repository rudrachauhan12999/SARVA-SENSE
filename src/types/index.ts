export type PlanType = 'free' | 'plus' | 'pro';

export type LanguageCode =
  | 'en'
  | 'hi'
  | 'hinglish'
  | 'ta'
  | 'te'
  | 'bn'
  | 'mr'
  | 'gu'
  | 'kn'
  | 'ml'
  | 'pa'
  | 'es'
  | 'fr'
  | 'de'
  | 'ja';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeName: string;
  flag?: string;
}

export type VerificationState = 'VERIFIED' | 'PARTIALLY_VERIFIED' | 'INSUFFICIENT_INFORMATION';

export type QueryType = 'ERROR_CODE' | 'SYMPTOM' | 'MACHINE_SCOPED' | 'SCREENSHOT' | 'VOICE';

export interface Machine {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  category: string;
  status: 'OPERATIONAL' | 'FAULT_REPORTED' | 'WARNING' | 'MAINTENANCE';
  location: string;
  manualCount: number;
  caseCount: number;
  lastFault?: string;
  iconColor: string;
  tabColor: string;
}

export interface Manual {
  id: string;
  title: string;
  machineId: string;
  machineName: string;
  model: string;
  pages: number;
  fileSize: string;
  ocrStatus: 'Completed' | 'Processing' | 'Pending';
  status: 'Indexed' | 'Ready' | 'Draft';
  uploadedDate: string;
  version: string;
  tabColor: string;
}

export interface SourceCitation {
  id: string;
  manualTitle: string;
  section: string;
  page: number;
  relevance: number; // percentage, e.g. 96
  matchedKeywords: string[];
  snippet: string;
  highlightedPhrase: string;
  documentType: 'Service Manual' | 'Hydraulic Guide' | 'Electrical Schematic' | 'Quick Guide';
}

export interface StructuredAnswer {
  errorMeaning: string;
  probableCauses: string[];
  correctiveActions: {
    step: number;
    title: string;
    description: string;
    safetyCritical?: boolean;
  }[];
  safetyWarning: string;
  sources: SourceCitation[];
  confidence: number; // e.g. 92
  evidenceCoverage: 'High' | 'Medium' | 'Low';
  machineMatch: 'Exact' | 'Partial' | 'Ambiguous' | 'None';
  claimsSupported: string; // e.g. '3/3 claims supported'
  verificationState: VerificationState;
  explanationWhy: {
    retrievedManuals: string[];
    matchingSections: string[];
    sourcePages: number[];
    summary: string;
  };
}

export interface Message {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  timestamp: string;
  queryType?: QueryType;
  text?: string;
  structuredAnswer?: StructuredAnswer;
  ambiguityOptions?: {
    machineId: string;
    machineName: string;
    model: string;
    meaning: string;
    tabColor: string;
  }[];
  insufficientInfo?: {
    found: string[];
    missing: string[];
    recommendation: string;
  };
  isLoading?: boolean;
  loadingStage?: string;
}

export interface TroubleshootingSession {
  id: string;
  title: string;
  machineId?: string;
  machineName?: string;
  machineModel?: string;
  issueCode?: string;
  createdAt: string;
  updatedAt: string;
  verificationState: VerificationState;
  sourceCount: number;
  messages: Message[];
  isSaved?: boolean;
}

export interface HMIBoundingBox {
  id: string;
  label: string;
  type: 'error' | 'alarm' | 'value' | 'status';
  top: string; // percentage
  left: string;
  width: string;
  height: string;
  color: string;
  detectedText: string;
}

export interface HMIScreenshotAnalysis {
  machineDetected: string;
  screenName: string;
  detectedError: string;
  detectedAlarm: string;
  values: {
    pressure: string;
    temperature: string;
    machineState: string;
    cycleTime?: string;
  };
  interpretation: string;
  confidence: number;
  boxes: HMIBoundingBox[];
}

export interface ChatSource {
  manualTitle: string;
  section: string;
  page: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  isStreaming?: boolean;
  sources?: ChatSource[];
  error?: boolean;
}

export interface OCRPageAnalysis {
  pageNumber: number;
  confidence: number;
  detectedEntities: {
    errorCodes: string[];
    sections: string[];
    warnings: string[];
    procedures: string[];
    tables: string[];
  };
  rawText: string;
  structuredBlocks: {
    type: 'heading' | 'paragraph' | 'warning' | 'table' | 'procedure';
    content: string;
  }[];
}
