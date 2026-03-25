import { useState } from 'react';
import { Target, Plus, TrendingUp, CheckCircle2, Clock, Flame, ArrowRight, Activity, Droplets, Moon, Footprints } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { toast } from 'sonner';

const mockGoals = [
  {
    id: '1',
    name: 'Walk 10,000 steps daily',
    icon: Footprints,
    progress: 70,
    status: 'active',
    color: 'bg-blue-500',
  },
  {
    id: '2',
    name: 'Drink 2L water',
    icon: Droplets,
    progress: 50,
    status: 'active',
    color: 'bg-cyan-500',
  },
  {
    id: '3',
    name: 'Complete CBT session weekly',
    icon: Activity,
    progress: 100,
    status: 'completed',
    color: 'bg-primary',
  },
  {
    id: '4',
    name: 'Sleep 8 hours',
    icon: Moon,
    progress: 40,
    status: 'active',
    color: 'bg-indigo-500',
  },
];

export default function GoalDashboard() {
  const [isAdding, setIsAdding] = useState(false);

  const handleUpdateProgress = (goalName: string) => {
    toast.success(`Progress updated for ${goalName}! Keep going!`);
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-text-dark mb-2">My Goals</h1>
          <p className="text-muted-text text-lg">Visualize your progress and celebrate your health milestones.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-primary text-white px-8 py-4 rounded-full font-bold shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={20} /> Add New Goal
        </button>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-mint/20 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 bg-mint/20 rounded-2xl flex items-center justify-center text-primary">
            <Target size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-muted-text uppercase tracking-wider">Active Goals</p>
            <p className="text-2xl font-bold text-text-dark">3 Active</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-mint/20 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 bg-mint/20 rounded-2xl flex items-center justify-center text-primary">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-muted-text uppercase tracking-wider">Completed Today</p>
            <p className="text-2xl font-bold text-text-dark">1 Completed</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-mint/20 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 bg-mint/20 rounded-2xl flex items-center justify-center text-primary">
            <Flame size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-muted-text uppercase tracking-wider">Current Streak</p>
            <p className="text-2xl font-bold text-text-dark">🔥 5 Days</p>
          </div>
        </div>
      </div>

      {/* Goal Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {mockGoals.map((goal, i) => (
          <motion.div 
            key={goal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-10 rounded-[40px] border border-mint/20 shadow-sm hover:shadow-md transition-all flex flex-col gap-8 group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                <div className={cn(
                  "w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform",
                  goal.color
                )}>
                  <goal.icon size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-text-dark">{goal.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {goal.status === 'completed' ? (
                      <span className="text-primary font-bold text-sm flex items-center gap-1">
                        <CheckCircle2 size={16} /> Completed
                      </span>
                    ) : (
                      <span className="text-muted-text font-bold text-sm flex items-center gap-1">
                        <Clock size={16} /> In Progress
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-3xl font-bold text-text-dark">
                {goal.progress}%
              </div>
            </div>

            <div className="space-y-4">
              <div className="h-4 bg-warm-white rounded-full overflow-hidden border border-mint/10">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${goal.progress}%` }}
                  transition={{ duration: 1, delay: i * 0.2 }}
                  className={cn("h-full rounded-full", goal.color)}
                />
              </div>
              <div className="flex justify-between text-xs font-bold text-muted-text uppercase tracking-widest">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-mint/10">
              <button 
                onClick={() => handleUpdateProgress(goal.name)}
                className="text-primary font-bold hover:underline flex items-center gap-2"
              >
                Update Progress <ArrowRight size={18} />
              </button>
              <button className="text-muted-text hover:text-text-dark transition-colors">
                Edit Goal
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Motivation Section */}
      <div className="bg-primary text-white p-12 rounded-[48px] relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold mb-4">You're doing amazing!</h2>
            <p className="text-mint/80 text-lg leading-relaxed">
              You've completed 85% of your goals this week. Consistency is the key to long-term health. Keep pushing, you're closer than you think!
            </p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center border-4 border-mint/30 shadow-inner">
              <TrendingUp size={64} className="text-mint animate-bounce" />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest text-mint">Top 5% of Users</span>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-mint/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
      </div>
    </div>
  );
}
