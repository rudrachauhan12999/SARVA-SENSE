"""
Pydantic models that mirror src/types/index.ts field-for-field (names, casing,
nesting). Python attribute names are written in camelCase on purpose so that
`model_dump()` / `model_dump_json()` produce JSON that matches the frontend
TypeScript contract with zero aliasing tricks.
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel


# ---------- Machines & Manuals ----------

class Machine(BaseModel):
    id: str
    name: str
    model: str
    serialNumber: str
    category: str
    status: str  # OPERATIONAL | FAULT_REPORTED | WARNING | MAINTENANCE
    location: str
    manualCount: int
    caseCount: int
    lastFault: Optional[str] = None
    iconColor: str
    tabColor: str


class Manual(BaseModel):
    id: str
    title: str
    machineId: str
    machineName: str
    model: str
    pages: int
    fileSize: str
    ocrStatus: str  # Completed | Processing | Pending
    status: str  # Indexed | Ready | Draft
    uploadedDate: str
    version: str
    tabColor: str


# ---------- Structured Answer ----------

class SourceCitation(BaseModel):
    id: str
    manualTitle: str
    section: str
    page: int
    relevance: int
    matchedKeywords: List[str]
    snippet: str
    highlightedPhrase: str
    documentType: str  # Service Manual | Hydraulic Guide | Electrical Schematic | Quick Guide


class CorrectiveAction(BaseModel):
    step: int
    title: str
    description: str
    safetyCritical: Optional[bool] = None


class ExplanationWhy(BaseModel):
    retrievedManuals: List[str]
    matchingSections: List[str]
    sourcePages: List[int]
    summary: str


class StructuredAnswer(BaseModel):
    errorMeaning: str
    probableCauses: List[str]
    correctiveActions: List[CorrectiveAction]
    safetyWarning: str
    sources: List[SourceCitation]
    confidence: int
    evidenceCoverage: str  # High | Medium | Low
    machineMatch: str  # Exact | Partial | Ambiguous | None
    claimsSupported: str
    verificationState: str  # VERIFIED | PARTIALLY_VERIFIED | INSUFFICIENT_INFORMATION
    explanationWhy: ExplanationWhy


class AmbiguityOption(BaseModel):
    machineId: str
    machineName: str
    model: str
    meaning: str
    tabColor: str


class Ambiguity(BaseModel):
    text: str
    options: List[AmbiguityOption]


class InsufficientInfo(BaseModel):
    message: str
    subtext: str
    found: List[str]
    missing: List[str]
    recommendation: str


# ---------- Troubleshoot request/response ----------

class HistoryTurn(BaseModel):
    sender: str  # 'user' | 'assistant'
    text: Optional[str] = None
    structuredAnswerSummary: Optional[str] = None
    chatText: Optional[str] = None


class DiagnoseRequest(BaseModel):
    query: str
    machineId: Optional[str] = None
    queryType: Optional[str] = None
    language: Optional[str] = "en"
    history: Optional[List[HistoryTurn]] = None
    sessionId: Optional[str] = None


class DiagnoseResponse(BaseModel):
    type: str  # STRUCTURED_ANSWER | AMBIGUITY | INSUFFICIENT_INFO
    answer: Optional[StructuredAnswer] = None
    ambiguity: Optional[Ambiguity] = None
    insufficient: Optional[InsufficientInfo] = None


# ---------- Open-ended streaming chat ----------

class ChatRequest(BaseModel):
    query: str
    machineId: Optional[str] = None
    manualId: Optional[str] = None
    language: Optional[str] = "en"
    history: Optional[List[HistoryTurn]] = None


# ---------- OCR ----------

class StructuredBlock(BaseModel):
    type: str  # heading | paragraph | warning | table | procedure
    content: str


class DetectedEntities(BaseModel):
    errorCodes: List[str]
    sections: List[str]
    warnings: List[str]
    procedures: List[str]
    tables: List[str]


class OCRPageAnalysis(BaseModel):
    pageNumber: int
    confidence: float
    detectedEntities: DetectedEntities
    rawText: str
    structuredBlocks: List[StructuredBlock]


class OCRRequest(BaseModel):
    manualId: str
    pageNumber: int


# ---------- HMI Screenshot ----------

class HMIBoundingBox(BaseModel):
    id: str
    label: str
    type: str  # error | alarm | value | status
    top: str
    left: str
    width: str
    height: str
    color: str
    detectedText: str


class HMIValues(BaseModel):
    pressure: str
    temperature: str
    machineState: str
    cycleTime: Optional[str] = None


class HMIScreenshotAnalysis(BaseModel):
    machineDetected: str
    screenName: str
    detectedError: str
    detectedAlarm: str
    values: HMIValues
    interpretation: str
    confidence: float
    boxes: List[HMIBoundingBox]


class ScreenshotRequest(BaseModel):
    imageBase64: str  # data URL or raw base64
