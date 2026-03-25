import { useState, useEffect, useRef } from 'react';
import { Mic, X, Square, Loader2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface VoicePrefs {
  voiceResponses: boolean;
  preferredVoice?: string;
  rate: number;
  pitch: number;
  autoListen: boolean;
}

const DEFAULT_PREFS: VoicePrefs = {
  voiceResponses: true,
  rate: 0.95,
  pitch: 1.0,
  autoListen: true,
};

export default function VoiceModal({ isOpen, onClose }: VoiceModalProps) {
  const { profile } = useAuth();
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [voicePrefs] = useState<VoicePrefs>(() => {
    const saved = localStorage.getItem('weightwise_voice_prefs');
    return saved ? JSON.parse(saved) : DEFAULT_PREFS;
  });

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(window.speechSynthesis);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      startListening();
    } else {
      stopAll();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [transcript, aiResponse]);

  const stopAll = () => {
    recognitionRef.current?.stop();
    synthRef.current?.cancel();
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    setStatus('idle');
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'en-GB';
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (interim) setTranscript(interim);
        if (final) {
          setTranscript(final);
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          
          const lowerFinal = final.toLowerCase();
          if (lowerFinal.includes('goodbye') || lowerFinal.includes('end')) {
            onClose();
            return;
          }

          silenceTimerRef.current = setTimeout(() => {
            processVoiceInput(final);
          }, 1500);
        }
      };

      recognitionRef.current.onend = () => {
        if (status === 'listening') {
          // If it ended unexpectedly, restart if still in listening mode
          // but usually it ends after final result
        }
      };
    }

    setStatus('listening');
    recognitionRef.current.start();
  };

  const processVoiceInput = async (text: string) => {
    setStatus('processing');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const model = ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text }] }],
        config: {
          systemInstruction: `You are a warm, supportive Continuity AI Coach. VOICE MODE INSTRUCTIONS: When responding to voice input, keep responses under 3 sentences. Be conversational, warm, and direct. No bullet points or markdown — plain spoken sentences only. Start responses with a brief acknowledgement of what the user said. Example: 'That sounds tough — here is what I'd suggest...'`
        }
      });

      const response = await model;
      const content = response.text || "I'm sorry, I couldn't hear that clearly.";
      setAiResponse(content);
      speakResponse(content);
    } catch (error) {
      console.error('AI Error:', error);
      setStatus('idle');
    }
  };

  const speakResponse = (text: string) => {
    if (!synthRef.current) return;
    setStatus('speaking');

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-GB';
    utterance.rate = voicePrefs.rate;
    utterance.pitch = voicePrefs.pitch;

    const voices = synthRef.current.getVoices();
    const preferred = voices.find(v => 
      v.name.includes('Google UK English Female') || 
      v.name.includes('Samantha') ||
      v.name.includes('Karen') ||
      (v.lang === 'en-GB' && v.localService === false)
    ) || voices.find(v => v.lang.startsWith('en'));
    
    if (preferred) utterance.voice = preferred;

    utterance.onend = () => {
      if (voicePrefs.autoListen) {
        setTranscript('');
        setAiResponse('');
        startListening();
      } else {
        setStatus('idle');
      }
    };

    synthRef.current.speak(utterance);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-[420px] rounded-[32px] p-8 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-text-dark">Continuity AI Coach</h3>
              <button onClick={onClose} className="p-2 hover:bg-warm-white rounded-full transition-colors">
                <X size={20} className="text-muted-text" />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center mb-8">
              <div className="relative w-[120px] h-[120px] flex items-center justify-center">
                {/* Animated Rings */}
                <AnimatePresence>
                  {status === 'listening' && (
                    <>
                      <motion.div
                        initial={{ scale: 1, opacity: 0.5 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="absolute inset-0 border-2 border-primary rounded-full"
                      />
                      <motion.div
                        initial={{ scale: 1, opacity: 0.5 }}
                        animate={{ scale: 1.8, opacity: 0 }}
                        transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
                        className="absolute inset-0 border-2 border-primary rounded-full"
                      />
                    </>
                  )}
                </AnimatePresence>

                <div className={cn(
                  "w-full h-full rounded-full flex items-center justify-center transition-all duration-500 shadow-lg z-10",
                  status === 'idle' ? "bg-primary text-white" :
                  status === 'listening' ? "bg-red-500 text-white" :
                  status === 'processing' ? "bg-primary text-white" :
                  "bg-primary text-white"
                )}>
                  {status === 'processing' ? (
                    <Loader2 size={48} className="animate-spin" />
                  ) : status === 'speaking' ? (
                    <div className="flex items-end gap-1 h-12">
                      {[1, 2, 3, 4, 5].map(i => (
                        <motion.div
                          key={i}
                          animate={{ height: [8, 48, 8] }}
                          transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                          className="w-1.5 bg-white rounded-full"
                        />
                      ))}
                    </div>
                  ) : (
                    <Mic size={48} />
                  )}
                </div>
              </div>
              
              <p className={cn(
                "mt-6 font-bold uppercase tracking-widest text-sm",
                status === 'listening' ? "text-red-500" : "text-primary"
              )}>
                {status === 'listening' ? "Listening..." :
                 status === 'processing' ? "Thinking..." :
                 status === 'speaking' ? "Speaking..." : "Ready"}
              </p>
            </div>

            <div 
              ref={scrollRef}
              className="bg-warm-white/50 rounded-2xl p-4 mb-8 h-[200px] overflow-y-auto border border-mint/10 custom-scrollbar"
            >
              {transcript && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-muted-text uppercase tracking-wider mb-1">You</p>
                  <p className="text-sm text-text-dark italic">"{transcript}"</p>
                </div>
              )}
              {aiResponse && (
                <div>
                  <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">AI Coach</p>
                  <p className="text-sm text-text-dark leading-relaxed">{aiResponse}</p>
                </div>
              )}
              {!transcript && !aiResponse && (
                <div className="h-full flex items-center justify-center text-muted-text/40 text-sm italic">
                  Start speaking to begin...
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button 
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-xl font-bold text-muted-text hover:bg-warm-white transition-all"
              >
                End conversation
              </button>
              <button 
                onClick={() => {
                  // Fallback or send as text logic
                  onClose();
                }}
                className="flex-1 bg-mint text-primary px-6 py-3 rounded-xl font-bold hover:opacity-80 transition-all flex items-center justify-center gap-2"
              >
                <Send size={18} /> Text mode
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
