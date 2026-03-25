import { useState } from 'react';
import { ClipboardList, Plus, Search, Filter, Clock, AlertCircle, TrendingUp, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

const cravingTypes = [
  { id: 'sugar', name: 'Sugar / Sweets', emoji: '🍫' },
  { id: 'salty', name: 'Salty / Savory', emoji: '🥨' },
  { id: 'fatty', name: 'Fatty / Fried', emoji: '🍟' },
  { id: 'caffeine', name: 'Caffeine', emoji: '☕' },
  { id: 'emotional', name: 'Emotional / Stress', emoji: '🧘' },
];

const mockEntries = [
  {
    id: '1',
    type: 'sugar',
    intensity: 8,
    trigger: 'Stressful meeting at work',
    time: '2 hours ago',
    resolved: true,
  },
  {
    id: '2',
    type: 'salty',
    intensity: 5,
    trigger: 'Watching TV late at night',
    time: 'Yesterday, 9:30 PM',
    resolved: true,
  },
  {
    id: '3',
    type: 'emotional',
    intensity: 9,
    trigger: 'Feeling lonely after work',
    time: '2 days ago',
    resolved: false,
  },
];

export default function CravingsLog() {
  const [isAdding, setIsAdding] = useState(false);
  const [newEntry, setNewEntry] = useState({
    type: '',
    intensity: 5,
    trigger: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Craving logged successfully! You are taking control.');
    setIsAdding(false);
    setNewEntry({ type: '', intensity: 5, trigger: '' });
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-text-dark mb-2">Cravings Log</h1>
          <p className="text-muted-text text-lg">Track your cravings to understand your patterns and build resilience.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-primary text-white px-8 py-4 rounded-full font-bold shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={20} /> Log New Craving
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-mint/20 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 bg-mint/20 rounded-2xl flex items-center justify-center text-primary">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-muted-text uppercase tracking-wider">Weekly Average</p>
            <p className="text-2xl font-bold text-text-dark">6.4 Intensity</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-mint/20 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 bg-mint/20 rounded-2xl flex items-center justify-center text-primary">
            <AlertCircle size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-muted-text uppercase tracking-wider">Top Trigger</p>
            <p className="text-2xl font-bold text-text-dark">Work Stress</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-mint/20 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 bg-mint/20 rounded-2xl flex items-center justify-center text-primary">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-muted-text uppercase tracking-wider">Success Rate</p>
            <p className="text-2xl font-bold text-text-dark">85% Managed</p>
          </div>
        </div>
      </div>

      {/* Add Entry Form (Modal-like) */}
      {isAdding && (
        <div className="bg-mint/10 p-10 rounded-[40px] border border-primary/20 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-text-dark">Log a Craving</h2>
              <button onClick={() => setIsAdding(false)} className="text-muted-text hover:text-text-dark">
                Cancel
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-bold text-text-dark/80 mb-3">Craving Type</label>
                  <select 
                    required
                    value={newEntry.type}
                    onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value })}
                    className="w-full px-4 py-4 bg-white border border-mint/30 rounded-2xl focus:ring-2 focus:ring-primary outline-none text-sm"
                  >
                    <option value="">Select type...</option>
                    {cravingTypes.map(t => (
                      <option key={t.id} value={t.id}>{t.emoji} {t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-dark/80 mb-3">Intensity (1-10)</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      value={newEntry.intensity}
                      onChange={(e) => setNewEntry({ ...newEntry, intensity: parseInt(e.target.value) })}
                      className="flex-1 accent-primary"
                    />
                    <span className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-bold">
                      {newEntry.intensity}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-text-dark/80 mb-3">What triggered this?</label>
                <textarea 
                  required
                  value={newEntry.trigger}
                  onChange={(e) => setNewEntry({ ...newEntry, trigger: e.target.value })}
                  className="w-full px-4 py-4 bg-white border border-mint/30 rounded-2xl focus:ring-2 focus:ring-primary outline-none min-h-[100px] text-sm"
                  placeholder="e.g. Feeling stressed after a meeting, bored at home..."
                />
              </div>
              <button type="submit" className="w-full bg-primary text-white py-5 rounded-2xl font-bold text-lg shadow-lg hover:opacity-90 transition-all">
                Submit Craving Log
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Recent Entries */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-text-dark">Recent Entries</h2>
          <div className="flex items-center gap-4 text-sm text-muted-text">
            <button className="flex items-center gap-1 hover:text-primary transition-colors">
              <Filter size={16} /> Filter
            </button>
            <button className="flex items-center gap-1 hover:text-primary transition-colors">
              <Search size={16} /> Search
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {mockEntries.map((entry) => {
            const typeInfo = cravingTypes.find(t => t.id === entry.type);
            return (
              <div key={entry.id} className="bg-white p-8 rounded-[32px] border border-mint/20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-primary/30 transition-all">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-warm-white rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                    {typeInfo?.emoji}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-text-dark">{typeInfo?.name}</h3>
                    <p className="text-muted-text text-sm flex items-center gap-1.5 mt-1">
                      <Clock size={14} /> {entry.time}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-muted-text uppercase tracking-widest mb-1">Intensity</span>
                    <div className={cn(
                      "px-4 py-1.5 rounded-full text-sm font-bold",
                      entry.intensity >= 8 ? "bg-red-100 text-red-600" : 
                      entry.intensity >= 5 ? "bg-amber-100 text-amber-600" : 
                      "bg-green-100 text-green-600"
                    )}>
                      {entry.intensity}/10
                    </div>
                  </div>

                  <div className="flex flex-col max-w-[240px]">
                    <span className="text-[10px] font-bold text-muted-text uppercase tracking-widest mb-1">Trigger</span>
                    <p className="text-sm text-text-dark italic">"{entry.trigger}"</p>
                  </div>

                  <div className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2",
                    entry.resolved ? "bg-primary/10 text-primary" : "bg-muted-text/10 text-muted-text"
                  )}>
                    {entry.resolved ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                    {entry.resolved ? 'Managed Successfully' : 'Pending Review'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insight Section */}
      <div className="bg-primary text-white p-10 rounded-[40px] flex flex-col md:flex-row items-center gap-10 shadow-xl">
        <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center shrink-0">
          <TrendingUp size={48} className="text-mint" />
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-2">Pattern Insight</h3>
          <p className="text-mint/80 leading-relaxed">
            Your cravings are most intense on Tuesday afternoons, typically triggered by work stress. Try scheduling a 10-minute mindfulness break at 3 PM to proactively manage these urges.
          </p>
        </div>
      </div>
    </div>
  );
}
