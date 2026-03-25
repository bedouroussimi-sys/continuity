import { useState, useEffect } from 'react';
import { Brain, Timer, FileText, Pause, Play, RotateCcw, CheckCircle2, ArrowRight, Lightbulb, Zap, Mic, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import VoiceQuickLogModal from '../components/VoiceQuickLogModal';

export default function CBTTools() {
  const [activeTool, setActiveTool] = useState<'surfing' | 'thought' | 'pause' | null>(null);
  const [isVoiceLogOpen, setIsVoiceLogOpen] = useState(false);
  const [timer, setTimer] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [thoughtRecord, setThoughtRecord] = useState({
    trigger: '',
    thought: '',
    reframe: '',
  });

  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0) {
      setIsTimerRunning(false);
      toast.success('Urge Surfing Complete! You did it.');
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);

  const handleThoughtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Thought record saved! Great job reframing.');
    setThoughtRecord({ trigger: '', thought: '', reframe: '' });
    setActiveTool(null);
  };

  const tips = [
    { title: 'The 5-Minute Rule', desc: 'When a craving hits, wait 5 minutes before acting. Most urges pass quickly.' },
    { title: 'Hydration First', desc: 'Thirst is often mistaken for hunger. Drink a glass of water first.' },
    { title: 'Mindful Bites', desc: 'Chew slowly and put your fork down between bites to allow satiety signals to reach your brain.' },
    { title: 'Environment Check', desc: 'Keep trigger foods out of sight. Out of sight, out of mind really works.' },
    { title: 'Sleep Matters', desc: 'Lack of sleep increases ghrelin (hunger hormone). Aim for 7-9 hours.' },
    { title: 'Protein Priority', desc: 'Start your day with protein to stabilise blood sugar and reduce afternoon cravings.' },
  ];

  return (
    <div className="space-y-12 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-text-dark">CBT Toolkit</h1>
          <p className="text-muted-text">Evidence-based tools to help you navigate cravings and change habits.</p>
        </div>
      </div>

      {/* Daily CBT Check-In Section */}
      <div className="bg-white p-10 rounded-[40px] border border-mint/30 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg">
              <Brain size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-dark">Daily CBT Check-In</h2>
              <p className="text-sm text-muted-text">Take a moment to reflect on your thoughts and feelings today.</p>
            </div>
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              toast.success('Great job! Your check-in has been recorded.');
            }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <div className="space-y-4">
              <label className="block text-sm font-bold text-text-dark/80">How are you feeling?</label>
              <div className="flex items-center justify-between px-2">
                {['😔', '😐', '🙂', '😊', '🤩'].map((emoji, i) => (
                  <button 
                    key={i} 
                    type="button"
                    className="text-3xl hover:scale-125 transition-transform grayscale hover:grayscale-0 focus:grayscale-0 focus:scale-125"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <input type="range" min="1" max="5" defaultValue="3" className="w-full accent-primary" />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-bold text-text-dark/80">Current Thoughts</label>
              <textarea 
                className="w-full px-4 py-3 bg-warm-white border border-mint/20 rounded-xl focus:ring-2 focus:ring-primary outline-none min-h-[100px] text-sm"
                placeholder="What's on your mind?..."
              />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-bold text-text-dark/80">Anxiety Level (1-10)</label>
              <div className="flex items-center gap-4">
                <input type="range" min="1" max="10" defaultValue="5" className="flex-1 accent-primary" />
                <span className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-bold">5</span>
              </div>
              <button 
                type="submit"
                className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg hover:opacity-90 transition-all mt-4"
              >
                Submit Check-In
              </button>
            </div>
          </form>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-mint/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      </div>

      {/* Voice Assistant Section */}
      <div className="bg-primary/5 p-8 rounded-[32px] border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shrink-0">
            <Mic size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-dark">Feeling a craving?</h2>
            <p className="text-sm text-muted-text">Talk it through with your AI Coach right now.</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('open-voice-modal'))}
            className="flex-1 sm:flex-none bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-3"
          >
            <MessageSquare size={20} /> Talk to AI Coach
          </button>
          <button 
            onClick={() => setIsVoiceLogOpen(true)}
            className="flex-1 sm:flex-none bg-white text-primary border border-primary/20 px-8 py-4 rounded-2xl font-bold hover:bg-mint/10 transition-all flex items-center justify-center gap-3"
          >
            <FileText size={20} /> Voice Quick Log
          </button>
        </div>
      </div>

      {/* Interactive Tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => setActiveTool('surfing')}
          className={cn(
            "p-8 rounded-3xl border-2 transition-all text-left flex flex-col gap-4 group",
            activeTool === 'surfing' ? "border-primary bg-mint/20" : "border-mint/10 bg-white hover:border-primary"
          )}
        >
          <div className="w-12 h-12 bg-mint/20 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <Timer size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-text-dark">Urge Surfing</h3>
            <p className="text-sm text-muted-text mt-1">Ride out intense cravings with a 60-second breathing exercise.</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTool('thought')}
          className={cn(
            "p-8 rounded-3xl border-2 transition-all text-left flex flex-col gap-4 group",
            activeTool === 'thought' ? "border-primary bg-mint/20" : "border-mint/10 bg-white hover:border-primary"
          )}
        >
          <div className="w-12 h-12 bg-mint/20 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-text-dark">Thought Record</h3>
            <p className="text-sm text-muted-text mt-1">Identify triggers and reframe negative thoughts about food.</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTool('pause')}
          className={cn(
            "p-8 rounded-3xl border-2 transition-all text-left flex flex-col gap-4 group",
            activeTool === 'pause' ? "border-primary bg-mint/20" : "border-mint/10 bg-white hover:border-primary"
          )}
        >
          <div className="w-12 h-12 bg-mint/20 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <Pause size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-text-dark">Pause & Reflect</h3>
            <p className="text-sm text-muted-text mt-1">A quick 5-second rule to stop impulsive eating decisions.</p>
          </div>
        </button>
      </div>

      {/* Tool Content */}
      <AnimatePresence mode="wait">
        {activeTool === 'surfing' && (
          <motion.div
            key="surfing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-12 rounded-3xl border border-mint/30 shadow-xl text-center"
          >
            <div className="max-w-md mx-auto">
              <h3 className="text-2xl font-bold text-text-dark mb-4">Urge Surfing</h3>
              <p className="text-muted-text mb-12">Focus on your breath. Imagine the craving as a wave that will eventually break and subside.</p>
              
              <div className="relative w-48 h-48 mx-auto mb-12">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    fill="none"
                    stroke="#E8F5EF"
                    strokeWidth="12"
                  />
                  <motion.circle
                    cx="96"
                    cy="96"
                    r="88"
                    fill="none"
                    stroke="#1D6A4A"
                    strokeWidth="12"
                    strokeDasharray={553}
                    animate={{ strokeDashoffset: 553 - (553 * timer) / 60 }}
                    transition={{ duration: 1, ease: "linear" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold text-text-dark">{timer}</span>
                  <span className="text-xs font-bold text-muted-text uppercase tracking-widest">Seconds</span>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-md hover:opacity-90 transition-all flex items-center gap-2"
                >
                  {isTimerRunning ? <Pause size={20} /> : <Play size={20} />}
                  {isTimerRunning ? 'Pause' : 'Start'}
                </button>
                <button
                  onClick={() => { setTimer(60); setIsTimerRunning(false); }}
                  className="bg-mint/20 text-primary px-8 py-3 rounded-xl font-bold hover:bg-mint/30 transition-all flex items-center gap-2"
                >
                  <RotateCcw size={20} /> Reset
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTool === 'thought' && (
          <motion.div
            key="thought"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-12 rounded-3xl border border-mint/30 shadow-xl"
          >
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-text-dark mb-8 text-center">Thought Record</h3>
              <form onSubmit={handleThoughtSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-text-dark/80 mb-2">1. The Trigger</label>
                  <p className="text-xs text-muted-text mb-3">What was happening just before the thought occurred?</p>
                  <textarea
                    required
                    value={thoughtRecord.trigger}
                    onChange={(e) => setThoughtRecord({ ...thoughtRecord, trigger: e.target.value })}
                    className="w-full px-4 py-3 bg-warm-white border border-mint/20 rounded-xl focus:ring-2 focus:ring-primary outline-none min-h-[80px]"
                    placeholder="e.g. Stressful meeting at work..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-dark/80 mb-2">2. The Automatic Thought</label>
                  <p className="text-xs text-muted-text mb-3">What went through your mind? (e.g. "I need sugar to cope")</p>
                  <textarea
                    required
                    value={thoughtRecord.thought}
                    onChange={(e) => setThoughtRecord({ ...thoughtRecord, thought: e.target.value })}
                    className="w-full px-4 py-3 bg-warm-white border border-mint/20 rounded-xl focus:ring-2 focus:ring-primary outline-none min-h-[80px]"
                    placeholder="e.g. I've had a bad day, I deserve this cake..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-dark/80 mb-2">3. The Reframe</label>
                  <p className="text-xs text-muted-text mb-3">Is there a more balanced way to look at this?</p>
                  <textarea
                    required
                    value={thoughtRecord.reframe}
                    onChange={(e) => setThoughtRecord({ ...thoughtRecord, reframe: e.target.value })}
                    className="w-full px-4 py-3 bg-mint/10 border border-primary/30 rounded-xl focus:ring-2 focus:ring-primary outline-none min-h-[80px]"
                    placeholder="e.g. Food won't solve my stress. A 5-minute walk will help more..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:opacity-90 transition-all"
                >
                  Save Thought Record
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {activeTool === 'pause' && (
          <motion.div
            key="pause"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-mint/20 p-12 rounded-3xl border border-primary/30 shadow-xl text-center"
          >
            <div className="max-w-md mx-auto">
              <h3 className="text-2xl font-bold text-primary mb-8">The 5-Second Pause</h3>
              <div className="space-y-6 text-left">
                {[
                  { step: '1', text: 'Stop what you are doing.' },
                  { step: '2', text: 'Take one deep, slow breath.' },
                  { step: '3', text: 'Ask: "Am I physically hungry, or emotionally hungry?"' },
                  { step: '4', text: 'Ask: "How will I feel in 20 minutes if I eat this?"' },
                  { step: '5', text: 'Make a conscious choice.' },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm">
                    <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold shrink-0">{s.step}</span>
                    <p className="font-medium text-text-dark">{s.text}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setActiveTool(null)}
                className="mt-12 bg-primary text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:opacity-90 transition-all"
              >
                I've Reflected
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips Library */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-text-dark flex items-center gap-2">
          <Lightbulb className="text-primary" /> Behaviour Change Library
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tips.map((tip, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-mint/30 shadow-sm hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-mint/20 rounded-xl flex items-center justify-center text-primary mb-4">
                <Zap size={20} />
              </div>
              <h4 className="font-bold text-text-dark mb-2">{tip.title}</h4>
              <p className="text-sm text-muted-text leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Voice Quick Log Modal */}
      <VoiceQuickLogModal 
        isOpen={isVoiceLogOpen} 
        onClose={() => setIsVoiceLogOpen(false)} 
        onSuccess={(data) => {
          setThoughtRecord({
            trigger: data.trigger || '',
            thought: data.automaticThought || '',
            reframe: '',
          });
          setActiveTool('thought');
          toast.success('Craving details parsed! Just add your reframe.');
        }}
      />
    </div>
  );
}
