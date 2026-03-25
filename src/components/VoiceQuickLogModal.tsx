import { useState, useEffect, useRef } from 'react';
import { Mic, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from '@google/genai';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

interface VoiceQuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
}

export default function VoiceQuickLogModal({ isOpen, onClose, onSuccess }: VoiceQuickLogModalProps) {
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'success' | 'error'>('idle');
  const [transcript, setTranscript] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      startListening();
    } else {
      stopAll();
    }
  }, [isOpen]);

  const stopAll = () => {
    recognitionRef.current?.stop();
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    setStatus('idle');
    setTranscript('');
    setParsedData(null);
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice input requires Chrome or Safari');
      onClose();
      return;
    }

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
          silenceTimerRef.current = setTimeout(() => {
            parseCraving(final);
          }, 1500);
        }
      };

      recognitionRef.current.onend = () => {
        if (status === 'listening') {
          // recognition stopped but no final result yet?
        }
      };
    }

    setStatus('listening');
    recognitionRef.current.start();
  };

  const parseCraving = async (text: string) => {
    setStatus('processing');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const model = ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: `Parse this craving description and extract the following fields: trigger, intensity (1-10), and automaticThought. Description: "${text}"` }] }],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              trigger: { type: Type.STRING },
              intensity: { type: Type.INTEGER },
              automaticThought: { type: Type.STRING },
            },
            required: ['trigger', 'intensity', 'automaticThought']
          }
        }
      });

      const response = await model;
      const data = JSON.parse(response.text);
      setParsedData(data);
      setStatus('success');
      
      setTimeout(() => {
        onSuccess(data);
        onClose();
      }, 1500);
    } catch (error) {
      console.error('AI Parsing Error:', error);
      setStatus('error');
      toast.error('Failed to parse craving. Please try again or enter manually.');
    }
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
            className="relative bg-white w-full max-w-[400px] rounded-[32px] p-8 shadow-2xl overflow-hidden text-center"
          >
            <button onClick={onClose} className="absolute right-6 top-6 p-2 hover:bg-warm-white rounded-full transition-colors">
              <X size={20} className="text-muted-text" />
            </button>

            <h3 className="text-xl font-bold text-text-dark mb-2">Voice Quick Log</h3>
            <p className="text-sm text-muted-text mb-8">Tell me what's happening. I'll pre-fill the form for you.</p>

            <div className="flex flex-col items-center justify-center mb-8">
              <div className="relative w-[100px] h-[100px] flex items-center justify-center">
                <AnimatePresence>
                  {status === 'listening' && (
                    <motion.div
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 1.6, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="absolute inset-0 border-2 border-primary rounded-full"
                    />
                  )}
                </AnimatePresence>

                <div className={cn(
                  "w-full h-full rounded-full flex items-center justify-center transition-all duration-500 shadow-lg z-10",
                  status === 'idle' ? "bg-primary text-white" :
                  status === 'listening' ? "bg-red-500 text-white" :
                  status === 'processing' ? "bg-primary text-white" :
                  status === 'success' ? "bg-green-500 text-white" :
                  "bg-red-500 text-white"
                )}>
                  {status === 'processing' ? (
                    <Loader2 size={40} className="animate-spin" />
                  ) : status === 'success' ? (
                    <CheckCircle2 size={40} />
                  ) : status === 'error' ? (
                    <AlertCircle size={40} />
                  ) : (
                    <Mic size={40} />
                  )}
                </div>
              </div>
              
              <p className={cn(
                "mt-6 font-bold uppercase tracking-widest text-xs",
                status === 'listening' ? "text-red-500" : "text-primary"
              )}>
                {status === 'listening' ? "Listening..." :
                 status === 'processing' ? "Parsing..." :
                 status === 'success' ? "Done!" : "Ready"}
              </p>
            </div>

            <div className="bg-warm-white rounded-2xl p-4 min-h-[100px] flex items-center justify-center border border-mint/10">
              {transcript ? (
                <p className="text-sm text-text-dark italic">"{transcript}"</p>
              ) : (
                <p className="text-sm text-muted-text/40 italic">"I'm feeling stressed and really want some chocolate..."</p>
              )}
            </div>

            {status === 'success' && parsedData && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-xs text-green-600 font-medium"
              >
                Found: {parsedData.trigger} (Intensity: {parsedData.intensity}/10)
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
