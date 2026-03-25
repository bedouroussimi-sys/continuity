import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, limit } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { FoodLog } from '../types';
import { Camera, Utensils, Smile, Frown, Meh, Plus, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn, formatDate } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function FoodMoodLog() {
  const { user } = useAuth();
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    mealName: '',
    moodRating: 3,
    hungerBefore: 3,
    hungerAfter: 3,
    photo: null as File | null,
  });

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'foodLogs'),
      where('uid', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setFoodLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FoodLog)));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.mealName) return;

    setUploading(true);
    try {
      let photoUrl = '';
      if (form.photo) {
        const storageRef = ref(storage, `food-logs/${user.uid}/${Date.now()}_${form.photo.name}`);
        const snapshot = await uploadBytes(storageRef, form.photo);
        photoUrl = await getDownloadURL(snapshot.ref);
      }

      await addDoc(collection(db, 'foodLogs'), {
        uid: user.uid,
        mealName: form.mealName,
        photoUrl,
        moodRating: form.moodRating,
        hungerBefore: form.hungerBefore,
        hungerAfter: form.hungerAfter,
        timestamp: new Date().toISOString(),
      });

      setIsModalOpen(false);
      setForm({ mealName: '', moodRating: 3, hungerBefore: 3, hungerAfter: 3, photo: null });
      toast.success('Meal logged successfully!');
    } catch (error) {
      toast.error('Failed to log meal');
    } finally {
      setUploading(false);
    }
  };

  const lastLogDate = foodLogs.length > 0 ? new Date(foodLogs[0].timestamp) : null;
  const isOverdue = lastLogDate ? (new Date().getTime() - lastLogDate.getTime()) > (1000 * 60 * 60 * 24) : true;

  if (loading) return <div className="flex items-center justify-center h-64">Loading your food logs...</div>;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-dark">Food & Mood Log</h1>
          <p className="text-muted-text">Connect what you eat with how you feel.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={20} /> Log a Meal
        </button>
      </div>

      {/* Reminder Banner */}
      {isOverdue && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-4 text-amber-800">
          <AlertCircle className="shrink-0" size={24} />
          <p className="text-sm font-medium">It's been over 24 hours since your last log. Consistency helps you stay mindful of your habits!</p>
        </div>
      )}

      {/* History List */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-text-dark">Recent Logs</h3>
        {foodLogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {foodLogs.map((log) => (
              <div key={log.id} className="bg-white rounded-3xl border border-mint/30 shadow-sm overflow-hidden flex flex-col">
                {log.photoUrl && (
                  <div className="aspect-video w-full overflow-hidden bg-mint/20">
                    <img 
                      src={log.photoUrl} 
                      alt={log.mealName} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                <div className="p-6 flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-text-dark text-lg">{log.mealName}</h4>
                    <span className="text-xs text-muted-text flex items-center gap-1">
                      <Clock size={12} /> {formatDate(log.timestamp)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-warm-white/50 p-2 rounded-xl border border-mint/10 text-center">
                      <p className="text-[10px] text-muted-text uppercase font-bold mb-1">Mood</p>
                      <div className="flex justify-center">
                        {log.moodRating >= 4 ? <Smile size={16} className="text-green-500" /> : log.moodRating <= 2 ? <Frown size={16} className="text-red-500" /> : <Meh size={16} className="text-orange-500" />}
                      </div>
                    </div>
                    <div className="bg-warm-white/50 p-2 rounded-xl border border-mint/10 text-center">
                      <p className="text-[10px] text-muted-text uppercase font-bold mb-1">Before</p>
                      <p className="text-sm font-bold text-text-dark">{log.hungerBefore}/5</p>
                    </div>
                    <div className="bg-warm-white/50 p-2 rounded-xl border border-mint/10 text-center">
                      <p className="text-[10px] text-muted-text uppercase font-bold mb-1">After</p>
                      <p className="text-sm font-bold text-text-dark">{log.hungerAfter}/5</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-mint/30">
            <Utensils size={48} className="mx-auto mb-4 text-muted-text opacity-20" />
            <p className="text-muted-text">No meals logged yet. Start by logging your next meal!</p>
          </div>
        )}
      </div>

      {/* Log Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <h3 className="text-2xl font-bold text-text-dark mb-6">Log a Meal</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-text-dark/80 mb-2">What did you eat?</label>
                  <input
                    type="text"
                    required
                    value={form.mealName}
                    onChange={(e) => setForm({ ...form, mealName: e.target.value })}
                    className="w-full px-4 py-3 bg-warm-white border border-mint/20 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    placeholder="e.g. Grilled Salmon with Quinoa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-text-dark/80 mb-2">Photo (Optional)</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setForm({ ...form, photo: e.target.files?.[0] || null })}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label 
                      htmlFor="photo-upload"
                      className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-mint/20 rounded-2xl hover:bg-warm-white transition-all cursor-pointer"
                    >
                      {form.photo ? (
                        <div className="flex items-center gap-2 text-primary font-bold">
                          <CheckCircle2 /> {form.photo.name}
                        </div>
                      ) : (
                        <>
                          <Camera className="text-muted-text mb-2" size={32} />
                          <span className="text-sm text-muted-text">Click to upload a photo</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-text-dark/80 mb-2 uppercase">Mood</label>
                    <div className="flex justify-between gap-1">
                      {[1, 3, 5].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setForm({ ...form, moodRating: m })}
                          className={cn(
                            "flex-1 py-2 rounded-lg border-2 transition-all flex items-center justify-center",
                            form.moodRating === m ? "border-primary bg-mint/20 text-primary" : "border-mint/10 text-muted-text"
                          )}
                        >
                          {m === 1 && <Frown size={18} />}
                          {m === 3 && <Meh size={18} />}
                          {m === 5 && <Smile size={18} />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-dark/80 mb-2 uppercase">Hunger (Before)</label>
                    <select 
                      value={form.hungerBefore}
                      onChange={(e) => setForm({ ...form, hungerBefore: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 bg-warm-white border border-mint/20 rounded-lg outline-none text-sm"
                    >
                      {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-dark/80 mb-2 uppercase">Hunger (After)</label>
                    <select 
                      value={form.hungerAfter}
                      onChange={(e) => setForm({ ...form, hungerAfter: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 bg-warm-white border border-mint/20 rounded-lg outline-none text-sm"
                    >
                      {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-3 rounded-xl font-bold text-muted-text hover:bg-warm-white"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={uploading}
                    className="flex-1 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Save Log'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
