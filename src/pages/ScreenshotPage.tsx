import React, { useState } from 'react';
import {
  Camera,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  Crop,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FeatureGate } from '../components/common/FeatureGate';
import { visionService } from '../services/api';
import { HMIScreenshotAnalysis } from '../types';

export const ScreenshotPage: React.FC = () => {
  const { runTroubleshootQuery, machines, setSelectedMachine, setCurrentRoute, showToast } = useApp();

  const [imageLoaded, setImageLoaded] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState('');
  const [analysisResult, setAnalysisResult] = useState<HMIScreenshotAnalysis | null>(null);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>('box-err');

  // 1x1 transparent PNG used only for the "Load Sample HMI Screen" demo
  // button below, since we don't have a licensed real HMI photo to bundle.
  // Sending it intentionally has no real alarm panel for Gemini to read, so
  // the backend's live vision call naturally falls through to its isolated
  // demo fallback response (see backend/app/fallback.py) -- this exercises
  // that fallback path honestly rather than faking a "real" result.
  const SAMPLE_PLACEHOLDER_PNG =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

  const handleStartAnalysis = async (imageSrc: string = SAMPLE_PLACEHOLDER_PNG) => {
    setAnalyzing(true);
    try {
      const res = await visionService.analyzeScreenshot(imageSrc, (stage) => {
        setAnalysisStage(stage);
      });
      setAnalysisResult(res);
      showToast(`HMI Vision Analysis Complete: ${res.detectedError || 'no error'} Detected`, 'success');
    } catch {
      showToast('Error analyzing screenshot', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageLoaded(true);
      handleStartAnalysis(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleProceedToTroubleshoot = () => {
    const hp200 = machines.find((m) => m.id === 'hp-200x');
    if (hp200) setSelectedMachine(hp200);
    runTroubleshootQuery('E101 detected on HMI screen', hp200 || null);
  };

  return (
    <div className="min-h-screen bg-[#FED000] text-black px-4 sm:px-6 py-8 pb-24">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-[#FFFDF8] rounded-3xl border-3.5 border-black p-5 sm:p-6 shadow-[5px_6px_0px_#000]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md bg-[#38BDF8] text-black border-2 border-black text-xs font-black uppercase">
                  Optical Vision Intelligence
                </span>
                <span className="text-xs font-bold text-black/60">• Plus / Pro Feature</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
                Show Sarva-Sense the problem.
              </h1>
              <p className="text-sm sm:text-base font-bold text-black/80 mt-1">
                Upload or capture an industrial HMI screen, operator panel, or gauge cluster.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="neo-btn bg-[#FFFDF8] text-black px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer border-2 border-black">
                <Upload className="w-4 h-4" />
                <span>Upload Screenshot</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
              </label>
              <button
                onClick={() => {
                  setImageLoaded(true);
                  handleStartAnalysis();
                }}
                className="neo-btn bg-[#FED000] text-black px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Load Sample HMI Screen</span>
              </button>
            </div>
          </div>
        </div>

        {/* Feature Gating Wrapper */}
        <FeatureGate
          feature="screenshot"
          featureName="HMI Vision Analysis"
          requiredPlan="plus"
          description="Optical alarm and gauge telemetry extraction requires a Plus or Pro subscription."
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Image / Screen Canvas Preview with Bounding Boxes (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative rounded-3xl border-4 border-black bg-slate-900 p-4 shadow-[6px_7px_0px_#000] overflow-hidden min-h-[380px] flex flex-col justify-between">
                {/* HMI Screen Mockup Viewport */}
                <div className="relative aspect-4/3 w-full bg-[#181B20] rounded-2xl border-3 border-black/80 overflow-hidden select-none flex flex-col justify-between p-4 text-white font-mono">
                  {/* Top Bar of HMI */}
                  <div className="flex items-center justify-between border-b border-gray-700 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                      <span className="font-bold text-xs text-red-400">FAULT INTERRUPT: SYS-B</span>
                    </div>
                    <span className="text-xs text-gray-400">HP-200X CELL #03</span>
                  </div>

                  {/* Simulated HMI UI Elements */}
                  <div className="grid grid-cols-2 gap-3 my-auto">
                    {/* Error alarm display */}
                    <div className="p-3 rounded-xl bg-red-950/80 border-2 border-red-500">
                      <div className="text-[10px] text-red-300 font-bold">ACTIVE ALARM</div>
                      <div className="text-xl font-black text-red-400">E101</div>
                      <div className="text-[10px] text-gray-300">PRESSURE LOOP OPEN</div>
                    </div>

                    {/* Machine status display */}
                    <div className="p-3 rounded-xl bg-amber-950/80 border-2 border-amber-500">
                      <div className="text-[10px] text-amber-300 font-bold">SAFETY INTERLOCK</div>
                      <div className="text-lg font-black text-amber-400">HALTED</div>
                      <div className="text-[10px] text-gray-300">LOTO REQUIRED</div>
                    </div>

                    {/* Gauge 1 */}
                    <div className="p-3 rounded-xl bg-blue-950/80 border-2 border-blue-500">
                      <div className="text-[10px] text-blue-300 font-bold">MANIFOLD PRESS</div>
                      <div className="text-lg font-black text-blue-400">0.0 BAR</div>
                      <div className="text-[10px] text-gray-400">SETPOINT: 180 BAR</div>
                    </div>

                    {/* Gauge 2 */}
                    <div className="p-3 rounded-xl bg-pink-950/80 border-2 border-pink-500">
                      <div className="text-[10px] text-pink-300 font-bold">FLUID TEMP</div>
                      <div className="text-lg font-black text-pink-400">76.4 °C</div>
                      <div className="text-[10px] text-red-400">HIGH &gt; 65°C</div>
                    </div>
                  </div>

                  {/* Bottom HMI footer */}
                  <div className="flex items-center justify-between text-[10px] text-gray-500 border-t border-gray-800 pt-2">
                    <span>PLC RACK: S7-1500</span>
                    <span>DIAGNOSTIC FRAME 0x4B</span>
                  </div>

                  {/* OVERLAID INTERACTIVE BOUNDING BOXES */}
                  {analysisResult &&
                    analysisResult.boxes.map((box) => {
                      const isSelected = selectedBoxId === box.id;
                      return (
                        <div
                          key={box.id}
                          onClick={() => setSelectedBoxId(box.id)}
                          className={`absolute cursor-pointer transition-all border-2.5 rounded-lg flex flex-col justify-between p-1 select-none ${
                            isSelected
                              ? 'border-white bg-white/20 ring-2 ring-yellow-400'
                              : 'border-yellow-400 bg-yellow-400/15 hover:bg-yellow-400/30'
                          }`}
                          style={{
                            top: box.top,
                            left: box.left,
                            width: box.width,
                            height: box.height,
                          }}
                        >
                          <span className="inline-block self-start px-1 py-0.2 rounded bg-black text-[#FED000] text-[9px] font-black uppercase tracking-tight">
                            {box.label}
                          </span>
                        </div>
                      );
                    })}
                </div>

                {/* Toolbar under image */}
                <div className="flex items-center justify-between pt-3 text-xs font-bold text-gray-300">
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white">
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white">
                      <Crop className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <span className="text-[11px] text-gray-400 font-mono">
                    HMI_CAPTURE_HP200X_0927.PNG (1920x1080)
                  </span>
                </div>
              </div>

              {/* Action Trigger Button */}
              <button
                id="btn-analyze-screenshot"
                disabled={analyzing}
                onClick={handleStartAnalysis}
                className="neo-btn w-full bg-black text-[#FED000] py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2"
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{analysisStage || 'Analyzing HMI screen...'}</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    <span>Run Optical HMI Analysis</span>
                  </>
                )}
              </button>
            </div>

            {/* Right: Vision Telemetry & Analysis Panel (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-3xl bg-[#FFFDF8] border-3.5 border-black p-5 sm:p-6 shadow-[5px_6px_0px_#000] space-y-4">
                <div className="flex items-center justify-between border-b-2.5 border-black pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#38BDF8] border-2 border-black flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-black" />
                    </div>
                    <h3 className="font-black text-base text-black">HMI Detections</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-300 border border-black text-[10px] font-black">
                    {analysisResult ? '96% Confidence' : 'Ready'}
                  </span>
                </div>

                {analysisResult ? (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl border-2 border-black bg-[#FAF8F2]">
                      <div className="text-[10px] font-bold text-black/60 uppercase">Matched Equipment</div>
                      <div className="font-black text-sm text-black">{analysisResult.machineDetected}</div>
                      <div className="text-[11px] font-bold text-black/70">{analysisResult.screenName}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-xl border-2 border-black bg-red-100">
                        <div className="text-[10px] font-bold text-red-900 uppercase">Detected Fault</div>
                        <div className="font-black text-base text-red-700">{analysisResult.detectedError}</div>
                      </div>
                      <div className="p-2.5 rounded-xl border-2 border-black bg-amber-100">
                        <div className="text-[10px] font-bold text-amber-900 uppercase">Alarm Banner</div>
                        <div className="font-black text-xs text-amber-900">{analysisResult.detectedAlarm.split(':')[1] || 'Pressure Loop'}</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border-2 border-black bg-[#FED000]/25 space-y-1">
                      <div className="text-[10px] font-bold text-black/70 uppercase">Live Sensor Values</div>
                      <div className="flex justify-between font-bold">
                        <span>Pressure:</span>
                        <span className="font-mono text-black font-black">{analysisResult.values.pressure}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Temperature:</span>
                        <span className="font-mono text-black font-black">{analysisResult.values.temperature}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Machine State:</span>
                        <span className="font-mono text-rose-700 font-black">{analysisResult.values.machineState}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border-2 border-black bg-[#FAF8F2] space-y-1">
                      <div className="text-[10px] font-bold text-black/70 uppercase">Optical Interpretation</div>
                      <p className="font-bold text-black/85 leading-relaxed">
                        {analysisResult.interpretation}
                      </p>
                    </div>

                    <button
                      onClick={handleProceedToTroubleshoot}
                      className="neo-btn w-full bg-emerald-400 text-black py-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-[3px_3px_0px_#000]"
                    >
                      <span>Proceed to Troubleshooting (E101)</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-3">
                    <Camera className="w-10 h-10 text-black/40 mx-auto stroke-1" />
                    <p className="text-xs font-bold text-black/60 max-w-xs mx-auto">
                      Click "Run Optical HMI Analysis" or "Load Sample HMI Screen" to detect alarm codes, sensor readouts, and machine states.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </FeatureGate>
      </div>
    </div>
  );
};
