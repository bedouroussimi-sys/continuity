import { useState, useEffect, useRef } from 'react';
import { Send, Mic, Volume2, VolumeX, Square, MessageSquare, Sparkles } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isVoice?: boolean;
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

export default function AICoach() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hi ${profile?.displayName?.split(' ')[0] || 'there'}! I'm your Continuity AI Coach. How can I support you today?`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voicePrefs, setVoicePrefs] = useState<VoicePrefs>(() => {
    const saved = localStorage.getItem('weightwise_voice_prefs');
    return saved ? JSON.parse(saved) : DEFAULT_PREFS;
  });

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(window.speechSynthesis);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimTranscript]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-GB';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        setInterimTranscript(interim);
        if (final) {
          setInput(prev => prev + ' ' + final);
          setInterimTranscript('');
          
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            handleSend(true);
          }, 1500);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. Please enable it in your browser settings.');
        }
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (!recognitionRef.current) {
        toast.error('Voice input requires Chrome or Safari');
        return;
      }
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const speak = (text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();

    let textToSpeak = text;
    const words = text.split(' ');
    if (words.length > 200) {
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
      textToSpeak = sentences.slice(0, 2).join(' ') + " ...tap the speaker icon to hear the full response.";
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
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

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const handleSend = async (fromVoice = false) => {
    const messageContent = input.trim();
    if (!messageContent && !fromVoice) return;
    
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date().toISOString(),
      isVoice: fromVoice,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const model = ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: messages.concat(userMsg).map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        })),
        config: {
          systemInstruction: `You are a warm, supportive Continuity AI Coach. You help patients build healthy habits, track progress, and stay motivated. 
          ${fromVoice ? `VOICE MODE INSTRUCTIONS: When responding to voice input, keep responses under 3 sentences. Be conversational, warm, and direct. No bullet points or markdown — plain spoken sentences only. Start responses with a brief acknowledgement of what the user said. Example: 'That sounds tough — here is what I'd suggest...'` : ''}`
        }
      });

      const response = await model;
      const aiContent = response.text || "I'm sorry, I couldn't process that. Could you try again?";
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiContent,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMsg]);
      
      if (voicePrefs.voiceResponses) {
        speak(aiContent);
      }
    } catch (error) {
      console.error('AI Error:', error);
      toast.error('Failed to get response from AI Coach');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-dark flex items-center gap-2">
            <Sparkles className="text-primary" /> AI Coach
          </h1>
          <p className="text-sm text-muted-text">Your 24/7 support for mindful weight maintenance.</p>
        </div>
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-full border border-mint/30 shadow-sm">
          <span className="text-xs font-bold text-muted-text uppercase tracking-wider">Voice Responses</span>
          <button 
            onClick={() => {
              const newPrefs = { ...voicePrefs, voiceResponses: !voicePrefs.voiceResponses };
              setVoicePrefs(newPrefs);
              localStorage.setItem('weightwise_voice_prefs', JSON.stringify(newPrefs));
            }}
            className={cn(
              "w-10 h-5 rounded-full transition-all relative",
              voicePrefs.voiceResponses ? "bg-primary" : "bg-muted-text/30"
            )}
          >
            <div className={cn(
              "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all",
              voicePrefs.voiceResponses ? "left-5.5" : "left-0.5"
            )} />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto mb-6 space-y-6 pr-2 custom-scrollbar">
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={cn(
              "flex flex-col max-w-[80%]",
              msg.role === 'user' ? "ml-auto items-end" : "items-start"
            )}
          >
            <div className={cn(
              "p-4 rounded-2xl shadow-sm relative group",
              msg.role === 'user' 
                ? "bg-primary text-white rounded-tr-none" 
                : "bg-white border border-mint/30 text-text-dark rounded-tl-none"
            )}>
              <p className="text-sm leading-relaxed">{msg.content}</p>
              
              {msg.role === 'assistant' && (
                <div className="absolute -right-10 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
                  <button 
                    onClick={() => speak(msg.content)}
                    className="p-2 bg-white rounded-full border border-mint/30 text-primary hover:bg-mint/10"
                    title="Read aloud"
                  >
                    <Volume2 size={16} />
                  </button>
                </div>
              )}

              {isSpeaking && msg.id === messages[messages.length - 1].id && msg.role === 'assistant' && (
                <div className="mt-2 flex items-end gap-0.5 h-4">
                  {[1, 2, 3].map(i => (
                    <motion.div
                      key={i}
                      animate={{ height: [4, 16, 4] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                      className="w-1 bg-primary rounded-full"
                    />
                  ))}
                </div>
              )}
            </div>
            <span className="text-[10px] text-muted-text mt-1 px-1">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        {isProcessing && (
          <div className="flex items-center gap-2 text-muted-text italic text-sm">
            <div className="flex gap-1">
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
            </div>
            AI Coach is thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white p-4 rounded-3xl border border-mint/30 shadow-lg">
        <div className="relative flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isListening ? "" : "Type your message..."}
              className="w-full pl-4 pr-12 py-3 bg-warm-white border border-mint/20 rounded-2xl focus:ring-2 focus:ring-primary outline-none text-sm"
            />
            {isListening && (
              <div className="absolute inset-0 flex items-center pl-4 pointer-events-none">
                <span className="text-sm italic text-muted-text/60">
                  {interimTranscript || "Listening..."}
                </span>
              </div>
            )}
            <button
              onClick={toggleListening}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all",
                isListening ? "bg-red-500 text-white animate-pulse" : "text-primary hover:bg-mint/20"
              )}
              aria-label="Start voice input"
            >
              <Mic size={20} />
              {isListening && (
                <div className="absolute inset-0 rounded-xl border-2 border-red-500 animate-ping opacity-20" />
              )}
            </button>
          </div>
          
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isProcessing}
            className="p-3 bg-primary text-white rounded-2xl shadow-md hover:opacity-90 disabled:opacity-50 transition-all"
          >
            <Send size={20} />
          </button>
        </div>
        
        <div className="mt-2 flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            {isListening && <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest animate-pulse">🎤 Listening...</span>}
            {isProcessing && <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Processing...</span>}
          </div>
          {isSpeaking && (
            <button 
              onClick={() => synthRef.current?.cancel()}
              className="flex items-center gap-1 text-[10px] font-bold text-red-500 uppercase tracking-widest hover:underline"
            >
              <Square size={10} fill="currentColor" /> Stop Speaking
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
