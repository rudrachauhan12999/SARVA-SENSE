import { Machine, Manual, LanguageOption, StructuredAnswer, HMIScreenshotAnalysis, OCRPageAnalysis } from '../types';

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'hinglish', label: 'Hinglish', nativeName: 'Hinglish', flag: '🇮🇳' },
  { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', label: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'bn', label: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'mr', label: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', label: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn', label: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', label: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'pa', label: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'es', label: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', label: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
];

export const MOCK_MACHINES: Machine[] = [
  {
    id: 'hp-200x',
    name: 'Hydraulic Press HP-200X',
    model: 'HP-200X Heavy Duty',
    serialNumber: 'HPX-2023-8841',
    category: 'Forming & Stamping',
    status: 'FAULT_REPORTED',
    location: 'Bay 3 - Stamping Line A',
    manualCount: 3,
    caseCount: 14,
    lastFault: 'E101 - Pressure Sensor Fault',
    iconColor: '#22C55E', // vivid green
    tabColor: '#4ADE80',
  },
  {
    id: 'mx-40',
    name: 'CNC Milling MX-40',
    model: 'MX-40 5-Axis VMC',
    serialNumber: 'CNC-MX-9902',
    category: 'Precision Machining',
    status: 'WARNING',
    location: 'Bay 1 - Precision Cell',
    manualCount: 2,
    caseCount: 9,
    lastFault: 'E101 - Spindle Temp Warning',
    iconColor: '#A855F7', // purple
    tabColor: '#C084FC',
  },
  {
    id: 'ac-90',
    name: 'Industrial Compressor AC-90',
    model: 'AC-90 Rotary Screw',
    serialNumber: 'CMP-AC-4410',
    category: 'Pneumatics & Air',
    status: 'OPERATIONAL',
    location: 'Utility Room West',
    manualCount: 2,
    caseCount: 5,
    lastFault: 'E044 - Filter Differential Alert',
    iconColor: '#FB923C', // orange
    tabColor: '#FDBA74',
  },
  {
    id: 'pk-12',
    name: 'Packaging Machine PK-12',
    model: 'PK-12 High-Speed Packer',
    serialNumber: 'PKG-12-7011',
    category: 'Automated Packaging',
    status: 'MAINTENANCE',
    location: 'Packaging Concourse B',
    manualCount: 2,
    caseCount: 7,
    lastFault: 'E302 - Film Tension Jam',
    iconColor: '#FB7185', // pink
    tabColor: '#FDA4AF',
  },
];

export const MOCK_MANUALS: Manual[] = [
  {
    id: 'man-hp-1',
    title: 'HP-200 Service Manual',
    machineId: 'hp-200x',
    machineName: 'Hydraulic Press HP-200X',
    model: 'HP-200X',
    pages: 412,
    fileSize: '34.8 MB',
    ocrStatus: 'Completed',
    status: 'Indexed',
    uploadedDate: '2026-06-12',
    version: 'Rev 4.2 (2024)',
    tabColor: '#4ADE80',
  },
  {
    id: 'man-hp-2',
    title: 'Hydraulic System Guide & Circuitry',
    machineId: 'hp-200x',
    machineName: 'Hydraulic Press HP-200X',
    model: 'HP-200X',
    pages: 126,
    fileSize: '18.2 MB',
    ocrStatus: 'Completed',
    status: 'Indexed',
    uploadedDate: '2026-06-14',
    version: 'Rev 2.1',
    tabColor: '#FEF08A',
  },
  {
    id: 'man-mx-1',
    title: 'MX-40 CNC Operation & Maintenance Manual',
    machineId: 'mx-40',
    machineName: 'CNC Milling MX-40',
    model: 'MX-40',
    pages: 385,
    fileSize: '42.1 MB',
    ocrStatus: 'Completed',
    status: 'Indexed',
    uploadedDate: '2026-07-02',
    version: 'Rev 5.0',
    tabColor: '#C084FC',
  },
  {
    id: 'man-ac-1',
    title: 'AC-90 Rotary Screw Compressor Manual',
    machineId: 'ac-90',
    machineName: 'Industrial Compressor AC-90',
    model: 'AC-90',
    pages: 290,
    fileSize: '22.5 MB',
    ocrStatus: 'Completed',
    status: 'Indexed',
    uploadedDate: '2026-08-10',
    version: 'Rev 1.8',
    tabColor: '#FDBA74',
  },
];

export const MOCK_ANSWER_E101_HP200X: StructuredAnswer = {
  errorMeaning: 'Hydraulic pressure sensor fault (Circuit loop B open or out-of-range sensor feedback).',
  probableCauses: [
    'Sensor connector terminal loose or corroded due to fluid ingress (Pin 3/4).',
    'Main hydraulic manifold pressure transducer (PX-102) damaged or out of factory calibration.',
    'Hydraulic system pressure dropped below threshold (threshold minimum: 140 bar, current feedback: 0.0 bar).',
    'Wiring harness severed between intermediate junction box JB-2 and main PLC analog module.',
  ],
  correctiveActions: [
    {
      step: 1,
      title: 'Initiate Safe Maintenance Mode & De-energize',
      description: 'Engage Lock-Out / Tag-Out (LOTO) procedure on Main Isolator SW-1. Depressurize accumulator via manual bleed valve BV-01.',
      safetyCritical: true,
    },
    {
      step: 2,
      title: 'Inspect Pressure Transducer PX-102 Connector',
      description: 'Remove M12 connector on manifold block A. Check for bent pins, moisture, or thermal degradation. Clean contacts with electrical contact cleaner.',
      safetyCritical: false,
    },
    {
      step: 3,
      title: 'Check Analog Signal Loop (4-20mA)',
      description: 'Connect digital multimeter in series across terminals 31 (+) and 32 (-). Expected nominal loop current in standby is 4.02 mA ± 0.05 mA.',
      safetyCritical: false,
    },
    {
      step: 4,
      title: 'Verify Physical Line Pressure',
      description: 'Cross-check analog dial gauge G-101 against digital display. If manual gauge indicates normal pressure (>160 bar), replace transducer PX-102.',
      safetyCritical: false,
    },
  ],
  safetyWarning: 'HIGH PRESSURE HAZARD: Do not service the hydraulic manifold or loosen fittings while the accumulator is charged. Fluid injection injury can be fatal.',
  sources: [
    {
      id: 'src-1',
      manualTitle: 'HP-200 Service Manual',
      section: 'Section 8.3: Hydraulic Diagnostic & Alarm Matrix',
      page: 214,
      relevance: 96,
      matchedKeywords: ['E101', 'Pressure Sensor', 'PX-102', 'Loop Fault', 'Manifold A'],
      documentType: 'Service Manual',
      highlightedPhrase: 'E101 indicates an open circuit or analog signal loss on pressure transducer PX-102 located at Primary Manifold Block A.',
      snippet: 'ALARM CODE E101: Hydraulic pressure sensor circuit error. When PLC analog input 04 reads < 3.6mA or > 21.5mA for more than 450ms, alarm E101 activates and trips emergency ramp-down.',
    },
    {
      id: 'src-2',
      manualTitle: 'Hydraulic System Guide & Circuitry',
      section: 'Section 4.2: Transducers & Accumulator Bleed Procedure',
      page: 88,
      relevance: 91,
      matchedKeywords: ['PX-102', 'Bleed Valve BV-01', '4-20mA calibration', 'Accumulator safety'],
      documentType: 'Hydraulic Guide',
      highlightedPhrase: 'Always depressurize circuit via Bleed Valve BV-01 before disconnecting transducer PX-102.',
      snippet: 'Pressure Transducer PX-102: Calibration range 0-250 bar (4-20mA). Prior to removal or pin testing, open manual valve BV-01 until gauge reads 0 bar.',
    },
  ],
  confidence: 92,
  evidenceCoverage: 'High',
  machineMatch: 'Exact',
  claimsSupported: '4/4 claims verified against OEM documentation',
  verificationState: 'VERIFIED',
  explanationWhy: {
    retrievedManuals: ['HP-200 Service Manual (Rev 4.2)', 'Hydraulic System Guide & Circuitry (Rev 2.1)'],
    matchingSections: ['Section 8.3 (Diagnostic Matrix)', 'Section 4.2 (Transducer Replacement & Calibration)'],
    sourcePages: [214, 88],
    summary: 'Direct exact match found in HP-200 OEM service manual alarm registry with identical fault code E101 and specific transducer part designation PX-102.',
  },
};

export const MOCK_ANSWER_OVERHEATING_HP200X: StructuredAnswer = {
  errorMeaning: 'Hydraulic fluid over-temperature (Exceeds critical limit: 65°C / 149°F).',
  probableCauses: [
    'Oil-to-air heat exchanger fins clogged with airborne particulate and coolant mist.',
    'Hydraulic reservoir oil level dropped below min indicator, reducing thermal dissipation mass.',
    'System pressure relief valve RV-01 stuck partially unseated, generating continuous parasitic bypass friction.',
    'Circulation pump cooling fan motor relay failure.',
  ],
  correctiveActions: [
    {
      step: 1,
      title: 'Shut Down Cycle & Allow Cooldown',
      description: 'Stop press stroke cycle immediately. Leave circulation fans running for 10 minutes if operational.',
      safetyCritical: true,
    },
    {
      step: 2,
      title: 'Inspect Oil Sight Glass & Level Gauge',
      description: 'Check reservoir sight glass LG-01. Fluid must be between UPPER and LOWER index marks at 40°C.',
      safetyCritical: false,
    },
    {
      step: 3,
      title: 'Clean Radiator Core & Inspect Thermostat Valve',
      description: 'Blow compressed air (< 2 bar) from inside outward through heat exchanger HE-01 fins.',
      safetyCritical: false,
    },
    {
      step: 4,
      title: 'Verify Relief Valve RV-01 Thermal Profile',
      description: 'Use infrared thermal gun on RV-01 body. If temperature exceeds reservoir by >15°C, valve is leaking to tank.',
      safetyCritical: false,
    },
  ],
  safetyWarning: 'THERMAL BURN HAZARD: Hydraulic fluid and manifold surfaces exceed 75°C. Wear heat-resistant nitrile gloves and eye protection.',
  sources: [
    {
      id: 'src-oh-1',
      manualTitle: 'HP-200 Service Manual',
      section: 'Section 6.1: Thermal Management & Heat Exchangers',
      page: 168,
      relevance: 94,
      matchedKeywords: ['Overheating', 'Heat Exchanger HE-01', 'Relief Valve RV-01', 'Fluid Level'],
      documentType: 'Service Manual',
      highlightedPhrase: 'Continuous fluid temperatures exceeding 60°C rapidly degrade seals and accelerate oil oxidation.',
      snippet: 'Hydraulic Thermal Limits: Operating zone: 38°C - 55°C. Warning alarm triggers at 60°C; critical automatic machine shut-off trips at 68°C.',
    },
  ],
  confidence: 89,
  evidenceCoverage: 'High',
  machineMatch: 'Exact',
  claimsSupported: '3/3 claims verified against Section 6.1',
  verificationState: 'VERIFIED',
  explanationWhy: {
    retrievedManuals: ['HP-200 Service Manual'],
    matchingSections: ['Section 6.1 (Thermal Management)'],
    sourcePages: [168],
    summary: 'Symptoms match documented thermal runaway causes in HP-200 heavy duty hydraulic circuit.',
  },
};

export const MOCK_AMBIGUITY_E101 = {
  text: 'Error code E101 was detected in multiple equipment manuals with entirely different physical meanings and safety procedures. Please confirm which machine you are currently diagnosing:',
  options: [
    {
      machineId: 'hp-200x',
      machineName: 'Hydraulic Press HP-200X',
      model: 'HP-200X Heavy Duty',
      meaning: 'E101 = Hydraulic Pressure Sensor Loop Fault (PX-102 open circuit)',
      tabColor: '#4ADE80',
    },
    {
      machineId: 'mx-40',
      machineName: 'CNC Milling Machine MX-40',
      model: 'MX-40 5-Axis VMC',
      meaning: 'E101 = Spindle Bearing Thermal Excursion / Temperature Warning',
      tabColor: '#C084FC',
    },
    {
      machineId: 'unknown',
      machineName: 'Other / Unregistered Machine',
      model: 'Custom Equipment',
      meaning: 'Prompt Sarva-Sense to identify machine via serial plate, HMI photo, or manual upload',
      tabColor: '#FED000',
    },
  ],
};

export const MOCK_INSUFFICIENT_INFO = {
  message: 'I cannot provide a safe, reliable diagnosis for this symptom.',
  subtext: 'The available manuals do not contain sufficient technical evidence or acoustic vibration matrices to diagnose this issue without guessing. Sarva-Sense adheres to strict hallucination reduction protocols.',
  found: [
    'HP-200 Service Manual (covers electrical, hydraulic, and structural faults)',
    'Hydraulic System Guide & Circuitry (covers pressure & valve diagnostics)',
  ],
  missing: [
    'HP-200X acoustic harmonic inspection guide or gearbox frequency spectrum',
    'Motor drive bearing diagnostic vibration analysis charts',
  ],
  recommendation: 'Upload the OEM Drive & Motor Vibration Manual or take an HMI alarm screenshot to pinpoint the sensor code.',
};

export const MOCK_HMI_ANALYSIS: HMIScreenshotAnalysis = {
  machineDetected: 'Hydraulic Press HP-200X',
  screenName: 'Hydraulic Master Control Panel (HMI v3.4)',
  detectedError: 'E101',
  detectedAlarm: 'CRITICAL: MANIFOLD A PRESSURE TRANSDUCER LOOP FAULT',
  values: {
    pressure: '0.0 bar (Set: 180.0 bar)',
    temperature: '76.4 °C (Over High Threshold)',
    machineState: 'EMERGENCY STOP (SAFETY INTERLOCK TRIPPED)',
    cycleTime: '00:00:00 (HALTED)',
  },
  interpretation: 'The press HMI has triggered an automatic protective cycle abort because analog transducer PX-102 signal dropped below 3.6mA, registering zero pressure while high pump thermal state was detected.',
  confidence: 96,
  boxes: [
    {
      id: 'box-err',
      label: 'FAULT CODE: E101',
      type: 'error',
      top: '18%',
      left: '12%',
      width: '32%',
      height: '14%',
      color: '#EF4444',
      detectedText: 'ALARM: E101 PRESSURE LOOP B OPEN',
    },
    {
      id: 'box-alarm',
      label: 'STATUS: HALTED',
      type: 'status',
      top: '18%',
      left: '52%',
      width: '36%',
      height: '14%',
      color: '#F59E0B',
      detectedText: 'INTERLOCK: SAFE SHUTDOWN ACTIVE',
    },
    {
      id: 'box-pressure',
      label: 'PRESSURE: 0.0 BAR',
      type: 'value',
      top: '42%',
      left: '14%',
      width: '32%',
      height: '24%',
      color: '#3B82F6',
      detectedText: 'ACTUAL: 0.0 BAR / SET: 180.0 BAR',
    },
    {
      id: 'box-temp',
      label: 'TEMP: 76.4 °C',
      type: 'value',
      top: '42%',
      left: '52%',
      width: '34%',
      height: '24%',
      color: '#EC4899',
      detectedText: 'OIL TEMP: 76.4°C (HIGH ALARM >65°C)',
    },
  ],
};

export const MOCK_OCR_PAGE: OCRPageAnalysis = {
  pageNumber: 214,
  confidence: 97.4,
  detectedEntities: {
    errorCodes: ['E101', 'E102', 'E105'],
    sections: ['Section 8.3: Hydraulic Diagnostic & Alarm Matrix'],
    warnings: ['HIGH PRESSURE HAZARD: Do not loosen fittings under pressure'],
    procedures: ['Transducer PX-102 Testing', 'Accumulator Bleed Procedure'],
    tables: ['Alarm Code Table 8.3-A (14 Rows, 5 Columns)'],
  },
  rawText: `SECTION 8.3 - HYDRAULIC DIAGNOSTIC & ALARM MATRIX
Page 214 | HP-200X Heavy Stamping Press Service Manual

[TABLE 8.3-A: ALARM CODES & ACTIONS]
Code: E101
Alarm: Hydraulic Pressure Sensor Fault
Sub-circuit: Primary Manifold Block A
Trigger: Analog loop current < 3.6 mA or > 21.5 mA for duration > 450 ms.
Severity: Critical - Automatic Protective Stop

Probable Root Causes:
1. Pressure transducer PX-102 connector unplugged or damaged.
2. Signal wire 31/32 open circuit between JB-2 and PLC module 04.
3. Transducer diaphragm mechanical blowout.

Corrective Action Procedure:
Step 1: Switch main disconnect SW-1 to OFF and apply LOTO padlock.
Step 2: Relieve residual hydraulic pressure via Bleed Valve BV-01.
Step 3: Measure loop resistance across pin 1 and pin 2 on M12 connector.
Step 4: If resistance reads infinite (open circuit), replace transducer PX-102 (Part No. HYD-TR-8821).`,
  structuredBlocks: [
    {
      type: 'heading',
      content: 'SECTION 8.3 - HYDRAULIC DIAGNOSTIC & ALARM MATRIX (Page 214)',
    },
    {
      type: 'warning',
      content: '⚠ CRITICAL HAZARD: Do not service manifold without completing Lock-Out / Tag-Out and relieving accumulator energy via Bleed Valve BV-01.',
    },
    {
      type: 'table',
      content: 'Alarm E101 | Sensor PX-102 | Analog Loop 4-20mA | Severity: Critical Stop',
    },
    {
      type: 'procedure',
      content: '1. De-energize SW-1 -> 2. Bleed BV-01 -> 3. Test loop current across pins 31/32 -> 4. Replace transducer if open loop.',
    },
  ],
};

export const MOCK_TRANSLATIONS: Record<string, {
  meaning: string;
  causes: string[];
  actions: string[];
  safety: string;
}> = {
  en: {
    meaning: 'Hydraulic pressure sensor fault (Circuit loop B open or out-of-range feedback).',
    causes: [
      'Sensor connector terminal loose or corroded due to fluid ingress.',
      'Main hydraulic manifold pressure transducer (PX-102) damaged or out of calibration.',
      'Hydraulic line pressure dropped below nominal threshold (0.0 bar detected).',
    ],
    actions: [
      'Initiate Safe Maintenance Mode and Lock-Out / Tag-Out (LOTO).',
      'Inspect Pressure Transducer PX-102 M12 connector for fluid contamination.',
      'Verify 4-20mA current loop across terminals 31 & 32 with multimeter.',
      'Cross-check analog dial gauge G-101 before replacing transducer PX-102.',
    ],
    safety: 'HIGH PRESSURE HAZARD: Relieve all accumulator pressure via manual bleed valve BV-01 before disconnecting fittings.',
  },
  hi: {
    meaning: 'हाइड्रोलिक प्रेशर सेंसर खराबी (सर्किट लूप B ओपन या सेंसर सिग्नल सीमा से बाहर)।',
    causes: [
      'सेंसर कनेक्टर टर्मिनल ढीला या तेल रिसाव के कारण खराब हो गया है।',
      'मुख्य मैनिफोल्ड प्रेशर ट्रांसड्यूसर (PX-102) क्षतिग्रस्त या कैलिब्रेशन से बाहर है।',
      'हाइड्रोलिक लाइन का दबाव न्यूनतम सीमा से नीचे गिर गया है (0.0 बार दर्ज)।',
    ],
    actions: [
      'मशीन को सेफ मेंटेनेंस मोड में डालें और लॉक-आउट/टैग-आउट (LOTO) करें।',
      'प्रेशर ट्रांसड्यूसर PX-102 कनेक्टर में तेल या नमी की जांच करें।',
      'मल्टीमीटर से टर्मिनल 31 और 32 पर 4-20mA करंट लूप की जांच करें।',
      'सेंसर बदलने से पहले एनालॉग प्रेशर गेज G-101 से वास्तविक दबाव जांचें।',
    ],
    safety: 'उच्च दबाव चेतावनी: हाइड्रोलिक सिस्टम पर काम करने से पहले वाल्व BV-01 खोलकर सारा दबाव पूरी तरह छोड़ें।',
  },
  hinglish: {
    meaning: 'Hydraulic pressure sensor fault (Loop B open ya out-of-range sensor feedback).',
    causes: [
      'Sensor connector loose hai ya fluid leakage ki wajah se corrode ho gaya hai.',
      'Main manifold pressure transducer PX-102 kharab ya de-calibrated hai.',
      'Hydraulic line pressure minimum threshold se neeche chala gaya hai (0.0 bar detected).',
    ],
    actions: [
      'Machine ko Safe Maintenance Mode me daalo aur LOTO lock lagao.',
      'Pressure transducer PX-102 ka M12 connector inspect karo.',
      'Multimeter se terminals 31 & 32 par 4-20mA loop test karo.',
      'Transducer replace karne se pehle analog dial gauge G-101 cross-check karo.',
    ],
    safety: 'HIGH PRESSURE SAFETY: Manifold open karne se pehle manual bleed valve BV-01 se saara pressure release karein.',
  },
  ta: {
    meaning: 'ஹைட்ராலிக் பிரஷர் சென்சார் பிழை (சுற்று லூப் B திறக்கப்பட்டுள்ளது அல்லது வரம்பிற்கு வெளியே உள்ளது).',
    causes: [
      'சென்சார் முனையம் தளர்வாக உள்ளது அல்லது எண்ணெய் கசிவு ஏற்பட்டுள்ளது.',
      'பிரதான பிரஷர் டிரான்ஸ்டியூசர் PX-102 சேதமடைந்துள்ளது.',
      'ஹைட்ராலிக் அழுத்தம் அனுமதிக்கப்பட்ட அளவை விட குறைந்துள்ளது (0.0 bar).',
    ],
    actions: [
      'இயந்திரத்தை பாதுகாப்பு பராமரிப்பு பயன்முறையில் வைக்கவும் (LOTO).',
      'பிரஷர் டிரான்ஸ்டியூசர் PX-102 இணைப்பியை ஆய்வு செய்யவும்.',
      'டெர்மினல்கள் 31 & 32 இல் 4-20mA லூப் மின்னோட்டத்தை சரிபார்க்கவும்.',
      'டிரான்ஸ்டியூசரை மாற்றுவதற்கு முன் அனலாக் கேஜ் G-101 ஐ சரிபார்க்கவும்.',
    ],
    safety: 'அதிவேக அழுத்தம் ஆபத்து: வால்வு BV-01 ஐ திறந்து அழுத்தத்தை விடுவித்த பின்னரே சரிசெய்யவும்.',
  },
  te: {
    meaning: 'హైడ్రాలిక్ ప్రెజర్ సెన్సార్ లోపం (సర్క్యూట్ లూప్ B ఓపెన్ లేదా పరిధి వెలుపల సిగ్నల్).',
    causes: [
      'సెన్సార్ కనెక్టర్ లూజ్ కావడం లేదా ఆయిల్ లీకేజీతో తుప్పు పట్టడం.',
      'మెయిన్ హైడ్రాలిక్ ట్రాన్స్‌డ్యూసర్ PX-102 పాడవడం లేదా క్యాలిబ్రేషన్ తప్పడం.',
      'హైడ్రాలిక్ లైన్ ప్రెజర్ కనిష్ట స్థాయి కంటే తగ్గింది (0.0 bar రికార్డ్ అయింది).',
    ],
    actions: [
      'మెషీన్‌ను సేఫ్ మెయింటెనెన్స్ మోడ్‌లో పెట్టి LOTO లాక్ చేయండి.',
      'ప్రెజర్ ట్రాన్స్‌డ్యూసర్ PX-102 M12 కనెక్టర్‌ను తనిఖీ చేయండి.',
      'టెర్మినల్స్ 31 & 32 వద్ద 4-20mA లూప్ కరెంట్‌ను మల్టీమీటర్‌తో చూడండి.',
      'సెన్సార్ మార్చే ముందు అనలాగ్ గేజ్ G-101 ప్రెజర్‌ను క్రాస్-చెక్ చేయండి.',
    ],
    safety: 'హై ప్రెజర్ ప్రమాదం: వాల్వ్ BV-01 ద్వారా ప్రెజర్ పూర్తిగా తగ్గించిన తర్వాత మాత్రమే సర్వీస్ చేయండి.',
  },
  bn: {
    meaning: 'হাইড্রোলিক প্রেসার সেন্সর ত্রুটি (সার্কিট লুপ B ওপেন বা সীমার বাইরে সিগন্যাল)।',
    causes: [
      'সেন্সর কানেক্টর ঢিলে বা তেলে ভিজে ক্ষতিগ্রস্ত হয়েছে।',
      'প্রধান প্রেসার ট্রান্সডিউসার PX-102 নষ্ট বা ক্যালিব্রেশনহীন।',
      'হাইড্রোলিক লাইনের চাপ নির্দিষ্ট সীমার নিচে নেমে গেছে (0.0 bar)।',
    ],
    actions: [
      'মেশিনটি নিরাপদ রক্ষণাবেক্ষণ মোডে সেট করুন এবং LOTO লক করুন।',
      'প্রেসার সেন্সর PX-102 কানেক্টর পরীক্ষা করুন।',
      'টার্মিনাল 31 এবং 32 তে 4-20mA কারেন্ট লুপ চেক করুন।',
      'সেন্সর বদলানোর আগে অ্যানালগ গেজ G-101 এর সাথে মিলিয়ে নিন।',
    ],
    safety: 'উচ্চ চাপ সতর্কতা: ব্লিড ভালভ BV-01 দিয়ে সম্পূর্ণ চাপ কমানোর পরেই কাজ শুরু করুন।',
  },
  es: {
    meaning: 'Fallo del sensor de presión hidráulica (bucle de circuito B abierto o fuera de rango).',
    causes: [
      'Conector del sensor flojo o corroído por ingreso de fluido hidráulico.',
      'Transductor de presión del colector principal (PX-102) dañado o descalibrado.',
      'Presión de línea cayó por debajo del límite seguro (0.0 bar registrado).',
    ],
    actions: [
      'Poner la máquina en Modo de Mantenimiento Seguro y aplicar LOTO.',
      'Inspeccionar el conector M12 del transductor de presión PX-102.',
      'Comprobar bucle de corriente de 4-20 mA en terminales 31 y 32 con multímetro.',
      'Comparar con el manómetro analógico G-101 antes de sustituir el transductor.',
    ],
    safety: 'PELIGRO DE ALTA PRESIÓN: Despresurizar el acumulador con la válvula manual BV-01 antes de desacoplar mangueras.',
  },
  de: {
    meaning: 'Fehler des Hydraulikdrucksensors (Schleife B unterbrochen oder Messwert außerhalb des Bereichs).',
    causes: [
      'Sensorstecker PX-102 lose oder durch Öleintritt korrodiert.',
      'Druckmessumformer PX-102 am Hauptventilblock beschädigt oder dekalibriert.',
      'Systemdruck unter Mindestgrenzwert gefallen (0.0 bar erfasst).',
    ],
    actions: [
      'Maschine in sicheren Wartungsmodus schalten und LOTO-Sperre anbringen.',
      'M12-Steckverbinder am Druckmessumformer PX-102 auf Verschmutzung prüfen.',
      'Stromschleife 4-20mA an den Klemmen 31 und 32 mit Multimeter messen.',
      'Analogen Manometer G-101 gegenprüfen, bevor der Sensor getauscht wird.',
    ],
    safety: 'HOCHDRUCKGEFAHR: Vor dem Lösen von Verschraubungen Akkumulator über Handablassventil BV-01 drucklos machen.',
  },
  ja: {
    meaning: '油圧圧力センサーの異常（回路ループBの断線または測定範囲外信号）。',
    causes: [
      'センサー端子の緩みまたは作動油の侵入による端子腐食。',
      'メインマニホールド圧力トランスデューサー (PX-102) の破損または校正ズレ。',
      '油圧ライン圧力が規定値を下回っています (実測値 0.0 bar)。',
    ],
    actions: [
      '装置を安全保守モードに切り替え、LOTO（施錠・標識）を実施してください。',
      '圧力センサー PX-102 の M12 コネクタ部を点検してください。',
      '端子 31 および 32 間で 4〜20mA の電流ループをテスターで測定します。',
      'センサー交換前にアナログ圧力計 G-101 との指示差を確認してください。',
    ],
    safety: '高圧危険：配管を外す前に、手動ブリードバルブ BV-01 を開いてアキュムレータの圧力を完全に抜いてください。',
  },
};
