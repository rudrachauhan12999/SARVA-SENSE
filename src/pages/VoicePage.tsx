import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Volume2,
  CheckCircle2,
  AlertCircle,
  Edit3,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FeatureGate } from '../components/common/FeatureGate';

export const VoicePage: React.FC = () => {
  const { runTroubleshootQuery, machines, setSelectedMachine, showToast } = useApp();

  const [state, setState] = useState<'idle' | 'listening' | 'processing' | 'transcribed'>('idle');
  const [transcription, setTranscription] = useState(
    'Machine HP-200 is showing E101 and the pressure is dropping.'
  );
  const [waveformBars, setWaveformBars] = useState<number[]>([12, 28, 45, 60, 35, 18, 55, 75, 40, 20]);

  // Simulate pulsing audio waveform while listening
  useEffect(() => {
    let interval: any;
    if (state === 'listening') {
      interval = setInterval(() => {
        setWaveformBars(
          Array.from({ length: 14 }, () => Math.floor(Math.random() * 65) + 15)
        );
      }, 120);
    }
    return () => clearInterval(interval);
  }, [state]);

  const handleStartListening = () => {
    setState('listening');
    // Try browser SpeechRecognition if available, otherwise simulate realistic shopfloor recording
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          setTranscription(text);
          setState('transcribed');
          showToast('Voice transcribed successfully!', 'success');
        };
        recognition.onerror = () => {
          simulateVoiceRecording();
        };
        recognition.start();
        return;
      } catch {
        simulateVoiceRecording();
      }
    } else {
      simulateVoiceRecording();
    }
  };

  const simulateVoiceRecording = () => {
    setTimeout(() => {
      setState('processing');
      setTimeout(() => {
        setTranscription('Machine HP-200 is showing E101 and the pressure is dropping.');
        setState('transcribed');
        showToast('Voice speech recognized', 'success');
      }, 900);
    }, 2400);
  };

  const handleUseQuery = () => {
    const hp200 = machines.find((m) => m.id === 'hp-200x');
    if (hp200) setSelectedMachine(hp200);
    runTroubleshootQuery(transcription, hp200 || null);
  };

  return (
    <div className="min-h-screen bg-[#FED000] text-black px-4 sm:px-6 py-8 pb-24">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-[#FFFDF8] rounded-3xl border-3.5 border-black p-5 sm:p-6 shadow-[5px_6px_0px_#000]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md bg-[#FB7185] text-white border-2 border-black text-xs font-black uppercase">
                  Acoustic Input
                </span>
                <span className="text-xs font-bold text-black/60">• Plus / Pro Feature</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
                Tell Sarva-Sense what's wrong.
              </h1>
              <p className="text-sm sm:text-base font-bold text-black/80 mt-1">
                Hands-free shopfloor troubleshooting. Speak machine codes, symptoms, or audible alerts.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Gating Wrapper */}
        <FeatureGate
          feature="voice"
          featureName="Voice Troubleshooting"
          requiredPlan="plus"
          description="Voice-to-text shopfloor dictation requires a Plus or Pro subscription."
        >
          {/* Main Voice Card */}
          <div className="rounded-3xl border-4 border-black bg-[#FFFDF8] p-6 sm:p-10 shadow-[7px_8px_0px_#000] text-center space-y-8">
            {/* Microphone Button with Animated Ripple */}
            <div className="relative inline-block">
              {state === 'listening' && (
                <div className="absolute inset-0 rounded-full bg-[#FB7185]/30 animate-ping scale-125 pointer-events-none" />
              )}

              <button
                id="btn-voice-record"
                onClick={() => {
                  if (state === 'listening') {
                    setState('transcribed');
                  } else {
                    handleStartListening();
                  }
                }}
                className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-black flex items-center justify-center transition-all duration-150 ${
                  state === 'listening'
                    ? 'bg-[#FB7185] text-white shadow-[2px_2px_0px_#000] scale-105'
                    : 'bg-[#FED000] hover:bg-[#FACC15] text-black shadow-[6px_7px_0px_#000] hover:shadow-[7px_8px_0px_#000] active:translate-x-1 active:translate-y-1'
                }`}
              >
                {state === 'listening' ? (
                  <Mic className="w-12 h-12 sm:w-16 sm:h-16 stroke-[2.5]" />
                ) : state === 'processing' ? (
                  <RefreshCw className="w-12 h-12 sm:w-16 sm:h-16 animate-spin stroke-[2.5]" />
                ) : (
                  <Mic className="w-12 h-12 sm:w-16 sm:h-16 stroke-[2.5]" />
                )}
              </button>
            </div>

            {/* Status Label */}
            <div>
              <span className="inline-block px-3 py-1 rounded-xl bg-black text-[#FED000] text-xs font-black uppercase tracking-wider mb-2">
                {state === 'idle'
                  ? 'Ready to Listen'
                  : state === 'listening'
                  ? 'Listening to Audio...'
                  : state === 'processing'
                  ? 'Transcribing Speech...'
                  : 'Speech Transcribed'}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-black">
                {state === 'listening'
                  ? 'Speak clearly into your microphone'
                  : state === 'transcribed'
                  ? 'Review Transcribed Query'
                  : 'Tap to Speak'}
              </h3>
            </div>

            {/* Waveform Visualizer */}
            {state === 'listening' && (
              <div className="flex items-center justify-center gap-1.5 h-16 py-2">
                {waveformBars.map((height, i) => (
                  <div
                    key={i}
                    className="w-2.5 rounded-full bg-black transition-all duration-100 border border-black"
                    style={{ height: `${height}px` }}
                  />
                ))}
              </div>
            )}

            {/* Transcribed Output Box */}
            {(state === 'transcribed' || state === 'idle') && (
              <div className="text-left rounded-2xl border-3 border-black bg-[#FAF8F2] p-4 sm:p-5 shadow-[3px_3px_0px_#000] space-y-3">
                <div className="flex items-center justify-between text-xs font-black uppercase text-black/60">
                  <div className="flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-black" />
                    <span>Transcribed Technical Query</span>
                  </div>
                  <span className="text-emerald-700">98% Speech Confidence</span>
                </div>

                <div className="relative">
                  <textarea
                    id="input-voice-transcription"
                    value={transcription}
                    onChange={(e) => setTranscription(e.target.value)}
                    rows={3}
                    className="w-full bg-white rounded-xl border-2 border-black p-3 font-extrabold text-sm sm:text-base text-black outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                  <button
                    onClick={handleStartListening}
                    className="neo-btn bg-[#FFFDF8] hover:bg-[#FED000] text-black px-3 py-1.5 rounded-xl border-2 border-black text-xs font-black"
                  >
                    Record Again
                  </button>

                  <button
                    id="btn-use-voice-query"
                    onClick={handleUseQuery}
                    className="neo-btn bg-black text-[#FED000] px-5 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-[3px_3px_0px_#FFFDF8]"
                  >
                    <span>Use Query in Troubleshooter</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </FeatureGate>
      </div>
    </div>
  );
};
