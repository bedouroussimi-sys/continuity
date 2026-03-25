import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../lib/firebase';
import { toast } from 'sonner';
import { Camera, Save, Loader2, Volume2, Play, Sliders, Mic } from 'lucide-react';
import { cn } from '../lib/utils';

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

export default function Settings() {
  const { user, profile, refreshProfile } = useAuth();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [voicePrefs, setVoicePrefs] = useState<VoicePrefs>(() => {
    const saved = localStorage.getItem('weightwise_voice_prefs');
    return saved ? JSON.parse(saved) : DEFAULT_PREFS;
  });
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices.filter(v => v.lang.startsWith('en')));
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const updateVoicePrefs = (updates: Partial<VoicePrefs>) => {
    const newPrefs = { ...voicePrefs, ...updates };
    setVoicePrefs(newPrefs);
    localStorage.setItem('weightwise_voice_prefs', JSON.stringify(newPrefs));
  };

  const testVoice = () => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance("Hi! I'm your Continuity AI Coach. This is how I'll sound when we talk.");
    utterance.rate = voicePrefs.rate;
    utterance.pitch = voicePrefs.pitch;
    
    if (voicePrefs.preferredVoice) {
      const voice = availableVoices.find(v => v.name === voicePrefs.preferredVoice);
      if (voice) utterance.voice = voice;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas to Blob failed'));
        }, 'image/jpeg', 0.8);
      };
      img.onerror = reject;
    });
  };

  const handleSave = async () => {
    if (!user || !selectedFile) return;

    setSaving(true);
    try {
      const compressedBlob = await compressImage(selectedFile);
      const storageRef = ref(storage, `profile-photos/${user.uid}/avatar.jpg`);
      await uploadBytes(storageRef, compressedBlob);
      const downloadURL = await getDownloadURL(storageRef);

      await updateDoc(doc(db, 'users', user.uid), {
        photoURL: downloadURL
      });

      await refreshProfile();
      toast.success('Profile photo updated! ✓');
      setSelectedFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed — please try again');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text-dark">Settings</h1>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-mint/30 shadow-sm">
        <h2 className="text-xl font-bold text-text-dark mb-6">Your Profile</h2>
        
        <div className="flex flex-col items-center">
          <div className="relative group">
            <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-4 border-mint/20 shadow-md">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : profile?.photoURL ? (
                <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full bg-primary flex items-center justify-center text-white font-bold text-4xl">
                  {getInitials(profile?.displayName || profile?.email || 'User')}
                </div>
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
            >
              <Camera size={20} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              accept="image/jpeg,image/png,image/webp" 
              className="hidden" 
            />
          </div>
          
          <div className="mt-6 flex flex-col items-center gap-4">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-primary font-semibold hover:underline"
            >
              Change photo
            </button>
            
            {selectedFile && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-md hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Voice & Audio Settings */}
      <div className="bg-white rounded-3xl p-8 border border-mint/30 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <Volume2 size={24} />
          </div>
          <h2 className="text-xl font-bold text-text-dark">Voice & Audio</h2>
        </div>

        <div className="space-y-10">
          {/* Voice Response Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-text-dark">AI Voice Responses</h3>
              <p className="text-sm text-muted-text">The AI Coach will read its responses aloud.</p>
            </div>
            <button 
              onClick={() => updateVoicePrefs({ voiceResponses: !voicePrefs.voiceResponses })}
              className={cn(
                "w-12 h-6 rounded-full transition-all relative",
                voicePrefs.voiceResponses ? "bg-primary" : "bg-muted-text/30"
              )}
            >
              <div className={cn(
                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                voicePrefs.voiceResponses ? "left-7" : "left-1"
              )} />
            </button>
          </div>

          {/* Auto-Listen Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-text-dark">Continuous Listening</h3>
              <p className="text-sm text-muted-text">Microphone stays active after AI finishes speaking.</p>
            </div>
            <button 
              onClick={() => updateVoicePrefs({ autoListen: !voicePrefs.autoListen })}
              className={cn(
                "w-12 h-6 rounded-full transition-all relative",
                voicePrefs.autoListen ? "bg-primary" : "bg-muted-text/30"
              )}
            >
              <div className={cn(
                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                voicePrefs.autoListen ? "left-7" : "left-1"
              )} />
            </button>
          </div>

          {/* Voice Selection */}
          <div className="space-y-4">
            <label className="block font-bold text-text-dark">Preferred Voice</label>
            <select 
              value={voicePrefs.preferredVoice || ''}
              onChange={(e) => updateVoicePrefs({ preferredVoice: e.target.value })}
              className="w-full px-4 py-3 bg-warm-white border border-mint/20 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm"
            >
              <option value="">Default System Voice</option>
              {availableVoices.map(voice => (
                <option key={voice.name} value={voice.name}>{voice.name} ({voice.lang})</option>
              ))}
            </select>
          </div>

          {/* Rate & Pitch */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="font-bold text-text-dark flex items-center gap-2">
                  <Sliders size={16} className="text-primary" /> Speech Rate
                </label>
                <span className="text-xs font-bold text-primary">{voicePrefs.rate.toFixed(2)}x</span>
              </div>
              <input 
                type="range" 
                min="0.5" 
                max="2" 
                step="0.05"
                value={voicePrefs.rate}
                onChange={(e) => updateVoicePrefs({ rate: parseFloat(e.target.value) })}
                className="w-full accent-primary h-1.5 bg-mint/30 rounded-full appearance-none cursor-pointer"
              />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="font-bold text-text-dark flex items-center gap-2">
                  <Sliders size={16} className="text-primary" /> Pitch
                </label>
                <span className="text-xs font-bold text-primary">{voicePrefs.pitch.toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="0.5" 
                max="2" 
                step="0.05"
                value={voicePrefs.pitch}
                onChange={(e) => updateVoicePrefs({ pitch: parseFloat(e.target.value) })}
                className="w-full accent-primary h-1.5 bg-mint/30 rounded-full appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Test Button */}
          <button 
            onClick={testVoice}
            className="w-full bg-mint text-primary py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-mint/30 transition-all border border-primary/10"
          >
            <Play size={20} fill="currentColor" /> Test AI Voice
          </button>
        </div>
      </div>
    </div>
  );
}
