"""
Demo fallback content -- ISOLATED from the normal query path.

Per the spec: "Always attempt the real Groq/Gemini call first. Only use the
fallback when the real call fails due to rate limits/API/network issues."
Every entry below is written using ONLY facts that genuinely exist in the
bundled sample manuals (see backend/scripts/generate_sample_manuals.py), so
even in fallback mode nothing is invented -- it's just pre-written instead of
freshly generated. Fallback is keyed narrowly (exact query+machine scenarios
used in the hackathon demo) so it is never silently used for normal queries;
pipeline.py only reaches for it inside an `except` block around the live
Groq/Gemini calls.
"""

FALLBACK_E101_HP200X = {
    "errorMeaning": "Hydraulic pressure sensor fault on Primary Manifold Block A (analog loop open or "
                     "out-of-range on transducer PX-102).",
    "probableCauses": [
        "Pressure transducer PX-102 M12 connector unplugged, bent, corroded, or damaged by fluid ingress.",
        "Signal wiring 31/32 open circuit between junction box JB-2 and PLC analog module 04.",
        "Transducer diaphragm mechanical blowout.",
        "Hydraulic system pressure genuinely dropped below the 140 bar minimum threshold.",
    ],
    "correctiveActions": [
        {"step": 1, "title": "Lock-Out / Tag-Out & Depressurize",
         "description": "Engage LOTO on main isolator SW-1 and depressurize the accumulator via manual "
                         "bleed valve BV-01 before touching the manifold. High pressure fluid injection "
                         "injury can be fatal.", "safetyCritical": True},
        {"step": 2, "title": "Inspect PX-102 Connector",
         "description": "Remove the M12 connector on manifold block A; check for bent pins, moisture, or "
                         "thermal degradation; clean with electrical contact cleaner.", "safetyCritical": False},
        {"step": 3, "title": "Check the 4-20mA Loop",
         "description": "Connect a digital multimeter in series across terminals 31 (+) and 32 (-); "
                         "expected nominal loop current in standby is 4.02 mA +/- 0.05 mA.", "safetyCritical": False},
        {"step": 4, "title": "Cross-check Physical Pressure",
         "description": "Compare analog dial gauge G-101 against the digital display; if the manual gauge "
                         "reads above 160 bar, replace transducer PX-102 (part no. HYD-TR-8821).", "safetyCritical": False},
    ],
    "safetyWarning": "HIGH PRESSURE HAZARD: never loosen manifold fittings while the accumulator is charged.",
    "groundingNote": "Demo fallback answer assembled directly from HP-200 Service Manual Section 8.3 and "
                      "Hydraulic System Guide Section 4.2.",
}

FALLBACK_OVERHEAT_HP200X = {
    "errorMeaning": "Hydraulic fluid over-temperature: exceeds the 60 degC warning threshold and can trip "
                     "the 68 degC critical automatic shut-off.",
    "probableCauses": [
        "Oil-to-air heat exchanger HE-01 fins clogged with airborne particulate and coolant mist.",
        "Hydraulic reservoir oil level dropped below the minimum indicator, reducing thermal dissipation mass.",
        "Pressure relief valve RV-01 stuck partially unseated, generating continuous parasitic bypass friction.",
    ],
    "correctiveActions": [
        {"step": 1, "title": "Stop the Cycle & Allow Cooldown",
         "description": "Stop the press stroke cycle immediately; leave circulation fans running for 10 "
                         "minutes if operational. Surfaces may exceed 75 degC.", "safetyCritical": True},
        {"step": 2, "title": "Check Oil Level",
         "description": "Inspect sight glass LG-01; fluid must sit between the upper and lower index marks "
                         "at 40 degC.", "safetyCritical": False},
        {"step": 3, "title": "Clean the Heat Exchanger",
         "description": "Blow compressed air (below 2 bar) from inside outward through heat exchanger HE-01 "
                         "fins to clear debris.", "safetyCritical": False},
        {"step": 4, "title": "Check Relief Valve RV-01",
         "description": "Use an infrared thermal gun on RV-01; if it reads more than 15 degC above "
                         "reservoir temperature, it is leaking internally and needs rebuild/replacement.",
         "safetyCritical": False},
    ],
    "safetyWarning": "THERMAL BURN HAZARD: hydraulic fluid and manifold surfaces may exceed 75 degC.",
    "groundingNote": "Demo fallback answer assembled directly from HP-200 Service Manual Section 6.1.",
}

FALLBACK_OCR_PAGE_214 = {
    "pageNumber": 214,
    "confidence": 96.0,
    "detectedEntities": {
        "errorCodes": ["E101", "E102", "E105"],
        "sections": ["SECTION 8.3 - HYDRAULIC DIAGNOSTIC & ALARM MATRIX"],
        "warnings": ["HIGH PRESSURE HAZARD: never loosen manifold fittings while the accumulator is charged."],
        "procedures": ["PX-102 replacement procedure", "LOTO & accumulator bleed procedure"],
        "tables": ["Alarm code table (E101/E102/E105)"],
    },
    "rawText": (
        "SECTION 8.3 - HYDRAULIC DIAGNOSTIC & ALARM MATRIX\n"
        "ALARM CODE E101: Hydraulic Pressure Sensor Fault, sub-circuit Primary Manifold Block A.\n"
        "ALARM CODE E102: Hydraulic Return Line Filter Clogged.\n"
        "ALARM CODE E105: Accumulator Pre-charge Low."
    ),
    "structuredBlocks": [
        {"type": "heading", "content": "SECTION 8.3 - HYDRAULIC DIAGNOSTIC & ALARM MATRIX (Page 214)"},
        {"type": "warning", "content": "HIGH PRESSURE HAZARD: complete LOTO and bleed valve BV-01 before servicing."},
        {"type": "table", "content": "E101 | PX-102 loop fault | Critical | E102 | Return filter clogged | Warning | E105 | Accumulator pre-charge low | Warning"},
        {"type": "procedure", "content": "1. LOTO SW-1 -> 2. Bleed BV-01 -> 3. Test loop 31/32 -> 4. Replace PX-102 if open loop."},
    ],
}

FALLBACK_HMI_ANALYSIS = {
    "machineDetected": "Hydraulic Press HP-200X",
    "screenName": "Hydraulic Master Control Panel (HMI)",
    "detectedError": "E101",
    "detectedAlarm": "CRITICAL: MANIFOLD A PRESSURE TRANSDUCER LOOP FAULT",
    "values": {
        "pressure": "0.0 bar (Set: 180.0 bar)",
        "temperature": "76.4 degC (Over High Threshold)",
        "machineState": "EMERGENCY STOP (SAFETY INTERLOCK TRIPPED)",
        "cycleTime": "00:00:00 (HALTED)",
    },
    "interpretation": "The press HMI triggered an automatic protective abort because transducer PX-102 "
                       "signal dropped below 3.6 mA, registering zero pressure while a high thermal state "
                       "was also present.",
    "confidence": 93.0,
    "boxes": [
        {"id": "box-err", "label": "FAULT CODE: E101", "type": "error", "top": "18%", "left": "12%",
         "width": "32%", "height": "14%", "color": "#EF4444", "detectedText": "ALARM: E101 PRESSURE LOOP B OPEN"},
        {"id": "box-alarm", "label": "STATUS: HALTED", "type": "status", "top": "18%", "left": "52%",
         "width": "36%", "height": "14%", "color": "#F59E0B", "detectedText": "INTERLOCK: SAFE SHUTDOWN ACTIVE"},
        {"id": "box-pressure", "label": "PRESSURE: 0.0 BAR", "type": "value", "top": "42%", "left": "14%",
         "width": "32%", "height": "24%", "color": "#3B82F6", "detectedText": "ACTUAL: 0.0 BAR / SET: 180.0 BAR"},
        {"id": "box-temp", "label": "TEMP: 76.4 C", "type": "value", "top": "42%", "left": "52%",
         "width": "34%", "height": "24%", "color": "#EC4899", "detectedText": "OIL TEMP: 76.4C (HIGH ALARM >65C)"},
    ],
}
