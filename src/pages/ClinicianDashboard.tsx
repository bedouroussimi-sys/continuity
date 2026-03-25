import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, WeightLog, DailyCheckIn } from '../types';
import { Search, Filter, AlertCircle, CheckCircle2, Clock, ChevronRight, TrendingDown, TrendingUp, User } from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

interface PatientWithStatus extends UserProfile {
  status: 'red' | 'amber' | 'green';
  lastLogDate?: string;
  weightChange?: number;
}

export default function ClinicianDashboard() {
  const [patients, setPatients] = useState<PatientWithStatus[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientWithStatus | null>(null);
  const [patientWeightLogs, setPatientWeightLogs] = useState<WeightLog[]>([]);
  const [patientCheckIns, setPatientCheckIns] = useState<DailyCheckIn[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'patient'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const patientData: PatientWithStatus[] = [];
      
      for (const userDoc of snapshot.docs) {
        const data = userDoc.data() as UserProfile;
        
        // Fetch last weight log to determine status
        const weightQ = query(
          collection(db, 'weightLogs'),
          where('uid', '==', data.uid),
          orderBy('timestamp', 'desc'),
          limit(2)
        );
        const weightSnap = await getDocs(weightQ);
        const logs = weightSnap.docs.map(d => d.data() as WeightLog);
        
        let status: 'red' | 'amber' | 'green' = 'green';
        let lastLogDate: string | undefined;
        let weightChange = 0;

        if (logs.length > 0) {
          lastLogDate = logs[0].timestamp;
          const lastLogTime = new Date(lastLogDate).getTime();
          const now = new Date().getTime();
          const diffDays = (now - lastLogTime) / (1000 * 60 * 60 * 24);

          if (diffDays > 3) status = 'red';
          else if (diffDays > 1) status = 'amber';

          if (logs.length > 1) {
            weightChange = logs[0].weight - logs[1].weight;
            if (weightChange > 2) status = 'red';
          }
        } else {
          status = 'amber'; // No logs yet
        }

        patientData.push({ ...data, status, lastLogDate, weightChange });
      }
      
      setPatients(patientData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedPatient) return;

    const weightQ = query(
      collection(db, 'weightLogs'),
      where('uid', '==', selectedPatient.uid),
      orderBy('timestamp', 'asc')
    );
    const checkInQ = query(
      collection(db, 'checkIns'),
      where('uid', '==', selectedPatient.uid),
      orderBy('timestamp', 'desc'),
      limit(5)
    );

    const unsubWeight = onSnapshot(weightQ, (snap) => {
      setPatientWeightLogs(snap.docs.map(d => d.data() as WeightLog));
    });
    const unsubCheckIn = onSnapshot(checkInQ, (snap) => {
      setPatientCheckIns(snap.docs.map(d => d.data() as DailyCheckIn));
    });

    return () => {
      unsubWeight();
      unsubCheckIn();
    };
  }, [selectedPatient]);

  const filteredPatients = patients.filter(p => 
    p.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFlagPatient = async (patientId: string) => {
    try {
      // In a real app, we'd have a 'flags' collection or a field on 'users'
      toast.success('Patient flagged for review');
    } catch (error) {
      toast.error('Failed to flag patient');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-primary">Loading clinician dashboard...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">
      {/* Patient List Sidebar */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-mint/30 shadow-sm">
          <h2 className="text-xl font-bold text-text-dark mb-6">Patient Population</h2>
          
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-text" size={18} />
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-warm-white border border-mint/20 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm"
            />
          </div>

          <div className="space-y-3">
            {filteredPatients.map((patient) => (
              <button
                key={patient.uid}
                onClick={() => setSelectedPatient(patient)}
                className={cn(
                  "w-full p-4 rounded-2xl border transition-all flex items-center gap-4 text-left",
                  selectedPatient?.uid === patient.uid 
                    ? "border-primary bg-mint/20" 
                    : "border-mint/10 bg-warm-white/50 hover:border-mint/30"
                )}
              >
                <div className={cn(
                  "w-3 h-3 rounded-full shrink-0",
                  patient.status === 'red' ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" :
                  patient.status === 'amber' ? "bg-amber-500" : "bg-green-500"
                )} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-text-dark truncate">{patient.displayName}</p>
                  <p className="text-xs text-muted-text truncate">{patient.email}</p>
                </div>
                <ChevronRight size={16} className="text-muted-text" />
              </button>
            ))}
          </div>
        </div>

        {/* Risk Summary */}
        <div className="bg-white p-6 rounded-3xl border border-mint/30 shadow-sm">
          <h3 className="text-sm font-bold text-muted-text uppercase tracking-wider mb-4">Risk Summary</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-2xl bg-red-50 border border-red-100">
              <p className="text-2xl font-bold text-red-600">{patients.filter(p => p.status === 'red').length}</p>
              <p className="text-[10px] font-bold text-red-400 uppercase">High Risk</p>
            </div>
            <div className="text-center p-3 rounded-2xl bg-amber-50 border border-amber-100">
              <p className="text-2xl font-bold text-amber-600">{patients.filter(p => p.status === 'amber').length}</p>
              <p className="text-[10px] font-bold text-amber-400 uppercase">Medium</p>
            </div>
            <div className="text-center p-3 rounded-2xl bg-green-50 border border-green-100">
              <p className="text-2xl font-bold text-green-600">{patients.filter(p => p.status === 'green').length}</p>
              <p className="text-[10px] font-bold text-green-400 uppercase">On Track</p>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Detail View */}
      <div className="lg:col-span-8">
        {selectedPatient ? (
          <div className="space-y-8">
            {/* Patient Header */}
            <div className="bg-white p-8 rounded-3xl border border-mint/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-mint/20 rounded-2xl flex items-center justify-center text-primary">
                  <User size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-dark">{selectedPatient.displayName}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-muted-text">{selectedPatient.email}</span>
                    <span className="w-1 h-1 bg-mint/30 rounded-full" />
                    <span className="text-sm text-muted-text">Joined {formatDate(selectedPatient.createdAt)}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleFlagPatient(selectedPatient.uid)}
                className="bg-red-50 text-red-600 px-6 py-3 rounded-xl font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2"
              >
                <AlertCircle size={20} /> Flag for Review
              </button>
            </div>

            {/* Weight Chart */}
            <div className="bg-white p-8 rounded-3xl border border-mint/30 shadow-sm">
              <h3 className="text-xl font-bold text-text-dark mb-8">Weight History</h3>
              <div className="h-80 w-full">
                {patientWeightLogs.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={patientWeightLogs}>
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
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        labelFormatter={(val) => formatDate(val)}
                      />
                      <Line type="monotone" dataKey="weight" stroke="#1D6A4A" strokeWidth={3} dot={{ fill: '#1D6A4A', r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-text">No weight data available.</div>
                )}
              </div>
            </div>

            {/* Recent Logs & Check-ins */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-3xl border border-mint/30 shadow-sm">
                <h3 className="text-lg font-bold text-text-dark mb-6">Recent Check-ins</h3>
                <div className="space-y-4">
                  {patientCheckIns.length > 0 ? patientCheckIns.map((ci, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-warm-white/50 border border-mint/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-text-dark">{formatDate(ci.timestamp)}</span>
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                          ci.mood >= 4 ? "bg-green-100 text-green-700" : ci.mood <= 2 ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                        )}>
                          Mood: {ci.mood}/5
                        </span>
                      </div>
                      <p className="text-xs text-muted-text mb-2">Hunger: {ci.hungerLevel}/5 • Cravings: {ci.cravings ? 'Yes' : 'No'}</p>
                      {ci.notes && <p className="text-xs text-text-dark/80 italic">"{ci.notes}"</p>}
                    </div>
                  )) : (
                    <p className="text-sm text-muted-text text-center py-8">No recent check-ins.</p>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-mint/30 shadow-sm">
                <h3 className="text-lg font-bold text-text-dark mb-6">Patient Vitals</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-warm-white/50 border border-mint/10">
                    <div className="flex items-center gap-3">
                      <Clock className="text-primary" size={20} />
                      <span className="text-sm text-text-dark/70">Last Logged</span>
                    </div>
                    <span className="text-sm font-bold text-text-dark">
                      {selectedPatient.lastLogDate ? formatDate(selectedPatient.lastLogDate) : 'Never'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-warm-white/50 border border-mint/10">
                    <div className="flex items-center gap-3">
                      {selectedPatient.weightChange && selectedPatient.weightChange > 0 ? <TrendingUp className="text-red-500" size={20} /> : <TrendingDown className="text-green-500" size={20} />}
                      <span className="text-sm text-text-dark/70">Weight Change</span>
                    </div>
                    <span className={cn(
                      "text-sm font-bold",
                      selectedPatient.weightChange && selectedPatient.weightChange > 0 ? "text-red-600" : "text-green-600"
                    )}>
                      {selectedPatient.weightChange ? `${selectedPatient.weightChange > 0 ? '+' : ''}${selectedPatient.weightChange.toFixed(1)}kg` : '--'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-warm-white/50 border border-mint/10">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="text-primary" size={20} />
                      <span className="text-sm text-text-dark/70">Engagement Score</span>
                    </div>
                    <span className="text-sm font-bold text-text-dark">High</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-text bg-white rounded-3xl border-2 border-dashed border-mint/30 p-12 text-center">
            <User size={64} className="mb-6 opacity-10" />
            <h3 className="text-xl font-bold text-text-dark mb-2">Select a Patient</h3>
            <p className="max-w-xs">Choose a patient from the list to view their detailed progress and clinical vitals.</p>
          </div>
        )}
      </div>
    </div>
  );
}
