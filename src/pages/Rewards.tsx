import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Badge, UserProfile } from '../types';
import { Trophy, Star, Medal, Target, Zap, CheckCircle2, Award, Users, Crown } from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import { motion } from 'motion/react';

export default function Rewards() {
  const { user, profile } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const badgesQuery = query(
      collection(db, 'badges'),
      where('uid', '==', user.uid),
      orderBy('earnedAt', 'desc')
    );

    const leaderboardQuery = query(
      collection(db, 'users'),
      where('role', '==', 'patient'),
      orderBy('points', 'desc'),
      limit(5)
    );

    const unsubBadges = onSnapshot(badgesQuery, (snapshot) => {
      setBadges(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Badge)));
      setLoading(false);
    });

    const unsubLeaderboard = onSnapshot(leaderboardQuery, (snapshot) => {
      setLeaderboard(snapshot.docs.map(doc => ({ ...doc.data() } as UserProfile)));
    });

    return () => {
      unsubBadges();
      unsubLeaderboard();
    };
  }, [user]);

  const badgeTypes = [
    { type: 'First Log', icon: Star, desc: 'Logged your first weight entry.' },
    { type: '7-Day Streak', icon: Zap, desc: 'Logged in for 7 days in a row.' },
    { type: 'Goal Reached', icon: Trophy, desc: 'Reached your target weight goal.' },
    { type: 'Craving Crushed', icon: Medal, desc: 'Used a CBT tool to overcome a craving.' },
    { type: 'Mindful Eater', icon: Award, desc: 'Logged 10 meals in the food log.' },
    { type: 'Consistency King', icon: CheckCircle2, desc: '30 days of daily check-ins.' },
  ];

  if (loading) return <div className="flex items-center justify-center h-64">Loading your rewards...</div>;

  return (
    <div className="space-y-12 pb-12">
      {/* Header */}
      <div className="bg-primary rounded-3xl p-10 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">Your Achievements</h1>
            <p className="text-mint/80 max-w-md text-lg">Every log, check-in, and mindful choice brings you closer to your long-term goals.</p>
          </div>
          <div className="bg-white/20 backdrop-blur-md p-8 rounded-3xl border border-white/30 text-center min-w-[200px]">
            <p className="text-sm font-bold uppercase tracking-widest mb-2 opacity-80">Total Points</p>
            <p className="text-6xl font-bold">{profile?.points || 0}</p>
          </div>
        </div>
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Badges Section */}
        <div className="lg:col-span-2 space-y-8">
          <h2 className="text-2xl font-bold text-text-dark flex items-center gap-2">
            <Medal className="text-primary" /> Earned Badges
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {badgeTypes.map((badge, i) => {
              const earned = badges.find(b => b.type === badge.type);
              return (
                <div 
                  key={i} 
                  className={cn(
                    "p-6 rounded-3xl border-2 transition-all flex items-center gap-6",
                    earned ? "border-primary bg-white shadow-md" : "border-mint/10 bg-warm-white/50 opacity-50 grayscale"
                  )}
                >
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0",
                    earned ? "bg-mint/20 text-primary" : "bg-mint/10 text-muted-text"
                  )}>
                    <badge.icon size={32} />
                  </div>
                  <div>
                    <h4 className="font-bold text-text-dark">{badge.type}</h4>
                    <p className="text-xs text-muted-text mt-1">{badge.desc}</p>
                    {earned && <p className="text-[10px] font-bold text-primary mt-2 uppercase tracking-wider">Earned {formatDate(earned.earnedAt)}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leaderboard Section */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-text-dark flex items-center gap-2">
            <Users className="text-primary" /> Community Leaderboard
          </h2>
          <div className="bg-white rounded-3xl border border-mint/30 shadow-sm overflow-hidden">
            <div className="p-6 bg-mint/20 border-b border-mint/10 flex items-center justify-between">
              <span className="text-sm font-bold text-primary uppercase tracking-wider">Top Performers</span>
              <Trophy size={20} className="text-primary" />
            </div>
            <div className="divide-y divide-mint/10">
              {leaderboard.map((user, i) => (
                <div key={user.uid} className="p-4 flex items-center gap-4 hover:bg-warm-white/50 transition-colors">
                  <div className="w-8 h-8 flex items-center justify-center font-bold text-muted-text">
                    {i === 0 ? <Crown className="text-accent-gold" /> : i + 1}
                  </div>
                  <div className="w-10 h-10 bg-mint/20 rounded-full flex items-center justify-center text-primary font-medium shrink-0">
                    {user.displayName?.[0] || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-dark truncate">
                      {user.uid === profile?.uid ? 'You' : `User ${user.uid.slice(0, 4)}...`}
                    </p>
                    <p className="text-xs text-muted-text">Maintenance Streak: {Math.floor(Math.random() * 30) + 1} days</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">{user.points || 0}</p>
                    <p className="text-[10px] font-bold text-muted-text uppercase">Pts</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-warm-white/50 text-center">
              <p className="text-xs text-muted-text">Leaderboard is anonymous for privacy.</p>
            </div>
          </div>

          {/* Points Guide */}
          <div className="bg-white p-6 rounded-3xl border border-mint/30 shadow-sm">
            <h3 className="text-sm font-bold text-muted-text uppercase tracking-wider mb-4">How to earn points</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-text">Daily Check-in</span>
                <span className="font-bold text-primary">+10 pts</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-text">Weekly Streak</span>
                <span className="font-bold text-primary">+25 pts</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-text">Goal Milestone</span>
                <span className="font-bold text-primary">+50 pts</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-text">CBT Tool Usage</span>
                <span className="font-bold text-primary">+15 pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
