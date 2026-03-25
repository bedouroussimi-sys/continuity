import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot, addDoc, doc, updateDoc, increment, getDocs } from 'firebase/firestore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell } from 'recharts';
import { Plus, TrendingDown, Calendar, Target, Zap, Smile, Frown, Meh, AlertCircle, CheckCircle2, Trophy } from 'lucide-react';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { WeightLog, DailyCheckIn, Badge } from '../types';
import { toast } from 'sonner';
import { cn, formatDate } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function PatientDashboard() {
  const { user, profile, refreshProfile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);

  const weeklyData = [
    { day: 'Mon', value: 82 },
    { day: 'Tue', value: 65 },
    { day: 'Wed', value: 98 },
    { day: 'Thu', value: 42 },
    { day: 'Fri', value: 76 },
    { day: 'Sat', value: 31 },
    { day: 'Sun', value: 10 },
  ];
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [checkInForm, setCheckInForm] = useState({
    mood: 3,
    hungerLevel: 3,
    cravings: false,
    notes: '',
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    startWeight: '',
    goalWeight: '',
  });

  useEffect(() => {
    if (profile && profile.role === 'patient' && (!profile.startWeight || !profile.goalWeight)) {
      setIsProfileModalOpen(true);
    }
  }, [profile]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        startWeight: parseFloat(profileForm.startWeight),
        goalWeight: parseFloat(profileForm.goalWeight),
      });
      refreshProfile();
      setIsProfileModalOpen(false);
      toast.success('Profile completed!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  useEffect(() => {
    if (!user) return;

    const weightQuery = query(
      collection(db, 'weightLogs'),
      where('uid', '==', user.uid),
      orderBy('timestamp', 'asc')
    );

    const checkInQuery = query(
      collection(db, 'checkIns'),
      where('uid', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(7)
    );

    const badgesQuery = query(
      collection(db, 'badges'),
      where('uid', '==', user.uid),
      orderBy('earnedAt', 'desc')
    );

    const unsubWeight = onSnapshot(weightQuery, (snapshot) => {
      setWeightLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WeightLog)));
      setLoading(false);
    });

    const unsubCheckIn = onSnapshot(checkInQuery, (snapshot) => {
      setCheckIns(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyCheckIn)));
    });

    const unsubBadges = onSnapshot(badgesQuery, (snapshot) => {
      setBadges(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Badge)));
    });

    return () => {
      unsubWeight();
      unsubCheckIn();
      unsubBadges();
    };
  }, [user]);

  const handleWeightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newWeight) return;

    try {
      await addDoc(collection(db, 'weightLogs'), {
        uid: user.uid,
        weight: parseFloat(newWeight),
        timestamp: new Date().toISOString(),
      });
      
      // Check for "First Log" badge
      if (weightLogs.length === 0) {
        await addBadge('First Log');
      }

      setIsWeightModalOpen(false);
      setNewWeight('');
      toast.success('Weight logged successfully!');
    } catch (error) {
      toast.error('Failed to log weight');
    }
  };

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const lastCheckIn = profile.lastCheckIn ? profile.lastCheckIn.split('T')[0] : null;
      
      let newStreak = profile.streak || 0;
      
      if (lastCheckIn !== today) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (lastCheckIn === yesterdayStr) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }
      }

      await addDoc(collection(db, 'checkIns'), {
        uid: user.uid,
        ...checkInForm,
        timestamp: now.toISOString(),
      });

      // Update points and streak
      await updateDoc(doc(db, 'users', user.uid), {
        points: increment(10),
        streak: newStreak,
        lastCheckIn: now.toISOString(),
      });
      refreshProfile();

      setIsCheckInModalOpen(false);
      setCheckInForm({ mood: 3, hungerLevel: 3, cravings: false, notes: '' });
      toast.success(`Daily check-in saved! +10 points. ${newStreak} day streak!`);
    } catch (error) {
      toast.error('Failed to save check-in');
    }
  };

  const addBadge = async (type: string) => {
    if (!user) return;
    const badgeExists = badges.some(b => b.type === type);
    if (!badgeExists) {
      await addDoc(collection(db, 'badges'), {
        uid: user.uid,
        type,
        earnedAt: new Date().toISOString(),
      });
      toast.success(`New Badge Earned: ${type}!`);
    }
  };

  const getAITip = () => {
    if (checkIns.length === 0) return "Start your first check-in to get personalised AI tips!";
    const last = checkIns[0];
    if (last.cravings) return "Cravings detected: Try the 'Urge Surfing' tool in the CBT section. Remember, cravings are like waves—they peak and then subside.";
    if (last.mood <= 2) return "It looks like you're feeling a bit low. Be kind to yourself today. A short walk in nature can help reset your mood.";
    if (last.hungerLevel >= 4) return "High hunger levels: Ensure you're prioritising protein and fibre in your next meal to stay fuller for longer.";
    return "You're doing great! Consistency is key to long-term maintenance. Keep logging your progress.";
  };

  const currentWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : profile?.startWeight || 0;
  const weightChange = weightLogs.length > 1 ? (weightLogs[weightLogs.length - 1].weight - weightLogs[0].weight).toFixed(1) : 0;
  const progressPercent = profile?.goalWeight && profile?.startWeight 
    ? Math.min(100, Math.max(0, ((profile.startWeight - currentWeight) / (profile.startWeight - profile.goalWeight)) * 100))
    : 0;

  if (authLoading || loading) return <div className="flex items-center justify-center h-64 text-primary">Loading your dashboard...</div>;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-dark">Hello, {profile?.displayName || 'User'}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-muted-text">Maintenance Phase</span>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsCheckInModalOpen(true)}
            className="flex-1 md:flex-none bg-mint text-primary px-6 py-3 rounded-2xl font-bold hover:opacity-80 transition-all flex items-center justify-center gap-2 border border-primary/10"
          >
            <Zap size={20} /> Daily Check-in
          </button>
          <button 
            onClick={() => setIsWeightModalOpen(true)}
            className="flex-1 md:flex-none bg-primary text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={20} /> Log Weight
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-[32px] border border-mint/30 shadow-sm relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="w-12 h-12 bg-mint rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <TrendingDown size={24} />
            </div>
            <span className={cn(
              "text-xs font-bold px-3 py-1 rounded-full",
              Number(weightChange) <= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            )}>
              {Number(weightChange) <= 0 ? 'Down' : 'Up'} {Math.abs(Number(weightChange))}kg
            </span>
          </div>
          <p className="text-sm text-muted-text mb-1 relative z-10">Current Weight</p>
          <p className="text-3xl font-bold text-text-dark relative z-10">{currentWeight} <span className="text-lg font-normal text-muted-text/60">kg</span></p>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-mint/10 rounded-full blur-2xl group-hover:bg-mint/20 transition-colors" />
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-[32px] border border-mint/30 shadow-sm relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="w-12 h-12 bg-mint rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <Target size={24} />
            </div>
            <span className="text-xs font-bold text-primary bg-mint px-3 py-1 rounded-full">
              {progressPercent.toFixed(0)}% to Goal
            </span>
          </div>
          <p className="text-sm text-muted-text mb-1 relative z-10">Goal Weight</p>
          <p className="text-3xl font-bold text-text-dark relative z-10">{profile?.goalWeight || '--'} <span className="text-lg font-normal text-muted-text/60">kg</span></p>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-mint/10 rounded-full blur-2xl group-hover:bg-mint/20 transition-colors" />
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-[32px] border border-mint/30 shadow-sm relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="w-12 h-12 bg-mint rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <Zap size={24} />
            </div>
            <span className="text-xs font-bold text-primary bg-mint px-3 py-1 rounded-full">
              {profile?.streak || 0} Day Streak
            </span>
          </div>
          <p className="text-sm text-muted-text mb-1 relative z-10">Current Streak</p>
          <p className="text-3xl font-bold text-text-dark relative z-10">{profile?.streak || 0} <span className="text-lg font-normal text-muted-text/60">days</span></p>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-mint/10 rounded-full blur-2xl group-hover:bg-mint/20 transition-colors" />
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-[32px] border border-mint/30 shadow-sm relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="w-12 h-12 bg-mint rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <Trophy size={24} />
            </div>
            <span className="text-xs font-bold text-primary bg-mint px-3 py-1 rounded-full">
              Level 1
            </span>
          </div>
          <p className="text-sm text-muted-text mb-1 relative z-10">Total Points</p>
          <p className="text-3xl font-bold text-text-dark relative z-10">{profile?.points || 0} <span className="text-lg font-normal text-muted-text/60">pts</span></p>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-mint/10 rounded-full blur-2xl group-hover:bg-mint/20 transition-colors" />
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[40px] border border-mint/30 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-text-dark">Weight Progress</h3>
                <p className="text-sm text-muted-text">Your journey over time</p>
              </div>
              <div className="flex gap-2">
                <button className="text-xs font-bold px-4 py-2 rounded-xl bg-mint text-primary">All Time</button>
              </div>
            </div>
            <div className="h-80 w-full">
              {weightLogs.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weightLogs}>
                    <defs>
                      <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1D6A4A" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#1D6A4A" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8F5EF" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(val) => new Date(val).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                    />
                    <YAxis 
                      domain={['dataMin - 2', 'dataMax + 2']}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                      labelFormatter={(val) => formatDate(val)}
                    />
                    <Area type="monotone" dataKey="weight" stroke="#1D6A4A" strokeWidth={4} fillOpacity={1} fill="url(#colorWeight)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-text bg-warm-white rounded-[32px] border-2 border-dashed border-mint/30">
                  <TrendingDown size={48} className="mb-4 opacity-20" />
                  <p className="font-medium">Log your first weight to see your progress chart</p>
                </div>
              )}
            </div>
          </div>

          {/* Weekly Activity Summary */}
          <div className="bg-white p-8 rounded-[40px] border border-mint/30 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-text-dark">Weekly Activity</h3>
                <p className="text-sm text-muted-text">Steps and habit consistency</p>
              </div>
              <div className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                +12% vs last week
              </div>
            </div>

            {/* Stat Pills */}
            <div className="flex flex-wrap gap-3 mb-8">
              <div className="bg-orange-50 text-orange-700 px-4 py-2 rounded-2xl text-sm font-bold flex items-center gap-2 border border-orange-100">
                <span className="text-lg">🔥</span> 5 Day Streak
              </div>
              <div className="bg-green-50 text-green-700 px-4 py-2 rounded-2xl text-sm font-bold flex items-center gap-2 border border-green-100">
                <span className="text-lg">👣</span> 8,432 Steps
              </div>
              <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-2xl text-sm font-bold flex items-center gap-2 border border-blue-100">
                <span className="text-lg">💧</span> 1.5L Water
              </div>
            </div>

            {/* Bar Chart */}
            <div className="h-[200px] w-full mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 600 }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar 
                    dataKey="value" 
                    radius={[8, 8, 0, 0]} 
                    barSize={32}
                  >
                    {weeklyData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={['Sat', 'Sun'].includes(entry.day) ? '#A8D5BA' : '#1D6A4A'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Habit Completion Bars */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-text-dark">
                  <span>Daily Check-in</span>
                  <span>5/7</span>
                </div>
                <div className="h-2 bg-warm-white rounded-full overflow-hidden border border-mint/10">
                  <div className="h-full bg-primary rounded-full" style={{ width: '71%' }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-text-dark">
                  <span>Water Goal</span>
                  <span>4/7</span>
                </div>
                <div className="h-2 bg-warm-white rounded-full overflow-hidden border border-mint/10">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '57%' }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-text-dark">
                  <span>CBT Exercise</span>
                  <span>2/7</span>
                </div>
                <div className="h-2 bg-warm-white rounded-full overflow-hidden border border-mint/10">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '28%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Section */}
        <div className="space-y-8">
          {/* AI Nudge Card */}
          <div className="bg-primary p-8 rounded-[40px] relative overflow-hidden text-white shadow-xl shadow-primary/20">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                  <Zap size={20} className="text-mint" />
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-mint">AI Coach Nudge</span>
              </div>
              <p className="text-xl font-medium leading-relaxed italic">
                "{getAITip()}"
              </p>
            </div>
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-mint/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
          </div>

          {/* Recent Check-ins Summary */}
          <div className="bg-white p-8 rounded-[40px] border border-mint/30 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-text-dark">Recent Activity</h3>
              <button className="text-xs font-bold text-primary hover:underline">View All</button>
            </div>
            <div className="space-y-4">
              {checkIns.length > 0 ? checkIns.map((ci, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="flex items-center gap-4 p-4 rounded-2xl bg-warm-white border border-mint/10 hover:border-primary/20 transition-colors cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    {ci.mood >= 4 ? <Smile className="text-green-500" /> : ci.mood <= 2 ? <Frown className="text-red-500" /> : <Meh className="text-orange-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-dark">{formatDate(ci.timestamp)}</p>
                    <p className="text-xs text-muted-text truncate">Hunger: {ci.hungerLevel}/5 • Cravings: {ci.cravings ? 'Yes' : 'No'}</p>
                  </div>
                </motion.div>
              )) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-text">No check-ins yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Appointment */}
          <div className="bg-white p-8 rounded-[40px] border border-mint/30 shadow-sm">
            <h3 className="text-lg font-bold text-text-dark mb-6">Next Appointment</h3>
            <div className="flex items-center gap-4 p-5 rounded-[24px] bg-mint/30 border border-mint/50">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-text-dark">Dietician Review</p>
                <p className="text-xs text-primary font-medium">Thursday, 2nd April • 10:30 AM</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button className="py-3 rounded-xl text-xs font-bold text-primary bg-mint hover:bg-mint/50 transition-colors">Reschedule</button>
              <button className="py-3 rounded-xl text-xs font-bold text-muted-text border border-mint/30 hover:bg-warm-white transition-colors">Details</button>
            </div>
          </div>
        </div>
      </div>

      {/* Weight Log Modal */}
      <AnimatePresence>
        {isWeightModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsWeightModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-text-dark mb-6">Log New Weight</h3>
              <form onSubmit={handleWeightSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-text-dark/80 mb-2">Current Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    autoFocus
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    className="w-full px-4 py-3 bg-warm-white border border-mint/30 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    placeholder="e.g. 72.5"
                  />
                </div>
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsWeightModalOpen(false)}
                    className="flex-1 px-6 py-3 rounded-xl font-bold text-muted-text hover:bg-warm-white"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all"
                  >
                    Save Log
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Daily Check-in Modal */}
      <AnimatePresence>
        {isCheckInModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckInModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <h3 className="text-2xl font-bold text-text-dark mb-6">Daily Check-in</h3>
              <form onSubmit={handleCheckInSubmit} className="space-y-8">
                {/* Mood Selector */}
                <div>
                  <label className="block text-sm font-bold text-text-dark/80 mb-4">How are you feeling today?</label>
                  <div className="flex justify-between gap-2">
                    {[1, 2, 3, 4, 5].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setCheckInForm({ ...checkInForm, mood: m })}
                        className={cn(
                          "flex-1 aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all",
                          checkInForm.mood === m ? "border-primary bg-mint text-primary" : "border-mint/30 text-muted-text/40"
                        )}
                      >
                        {m === 1 && <Frown size={24} />}
                        {m === 2 && <Frown size={24} />}
                        {m === 3 && <Meh size={24} />}
                        {m === 4 && <Smile size={24} />}
                        {m === 5 && <Smile size={24} />}
                        <span className="text-xs font-bold">{m}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hunger Level */}
                <div>
                  <label className="block text-sm font-bold text-text-dark/80 mb-4">Hunger Level (1 = Full, 5 = Starving)</label>
                  <div className="flex justify-between gap-2">
                    {[1, 2, 3, 4, 5].map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setCheckInForm({ ...checkInForm, hungerLevel: h })}
                        className={cn(
                          "flex-1 py-3 rounded-xl border-2 font-bold transition-all",
                          checkInForm.hungerLevel === h ? "border-primary bg-mint text-primary" : "border-mint/30 text-muted-text/40"
                        )}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cravings Toggle */}
                <div className="flex items-center justify-between p-4 bg-warm-white rounded-2xl border border-mint/30">
                  <div>
                    <p className="font-bold text-text-dark">Experiencing Cravings?</p>
                    <p className="text-xs text-muted-text">Any strong urges to eat specific foods?</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCheckInForm({ ...checkInForm, cravings: !checkInForm.cravings })}
                    className={cn(
                      "w-14 h-8 rounded-full transition-all relative",
                      checkInForm.cravings ? "bg-primary" : "bg-muted-text/30"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-6 h-6 bg-white rounded-full transition-all",
                      checkInForm.cravings ? "left-7" : "left-1"
                    )} />
                  </button>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-bold text-text-dark/80 mb-2">Notes (Optional)</label>
                  <textarea
                    value={checkInForm.notes}
                    onChange={(e) => setCheckInForm({ ...checkInForm, notes: e.target.value })}
                    className="w-full px-4 py-3 bg-warm-white border border-mint/30 rounded-xl focus:ring-2 focus:ring-primary outline-none min-h-[100px]"
                    placeholder="How was your day? Any specific triggers?"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsCheckInModalOpen(false)}
                    className="flex-1 px-6 py-3 rounded-xl font-bold text-muted-text hover:bg-warm-white"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    Complete <CheckCircle2 size={20} />
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Profile Completion Modal */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-text-dark mb-2">Complete Your Profile</h3>
              <p className="text-muted-text mb-6">To track your progress accurately, we need a few more details.</p>
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-text-dark/80 mb-2">Starting Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={profileForm.startWeight}
                    onChange={(e) => setProfileForm({ ...profileForm, startWeight: e.target.value })}
                    className="w-full px-4 py-3 bg-warm-white border border-mint/30 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    placeholder="e.g. 85.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-dark/80 mb-2">Goal Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={profileForm.goalWeight}
                    onChange={(e) => setProfileForm({ ...profileForm, goalWeight: e.target.value })}
                    className="w-full px-4 py-3 bg-warm-white border border-mint/30 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    placeholder="e.g. 70.0"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-primary text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all"
                >
                  Start My Journey
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
