import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  User, 
  Stethoscope, 
  Activity, 
  Target, 
  Bell, 
  Sparkles,
  Heart,
  Leaf
} from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    role: (profile?.role as 'patient' | 'clinician') || 'patient',
    startWeight: '',
    goalWeight: '',
    focusAreas: [] as string[],
    clinicianRole: '',
    organisation: '',
    notifications: {
      morningReminder: true,
      weeklySummary: true,
      teamMessages: true,
      goalAlerts: true,
    },
    referralSource: '',
  });

  useEffect(() => {
    if (profile?.onboardingComplete) {
      navigate('/dashboard');
    }
  }, [profile, navigate]);

  const handleNext = () => {
    if (step < 3) setStep((step + 1) as Step);
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as Step);
  };

  const toggleFocusArea = (area: string) => {
    setFormData(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter(a => a !== area)
        : prev.focusAreas.length < 3 
          ? [...prev.focusAreas, area]
          : prev.focusAreas
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      const userRef = doc(db, 'users', user.uid);
      const updateData: any = {
        displayName: formData.displayName,
        role: formData.role,
        notifications: formData.notifications,
        referralSource: formData.referralSource,
        onboardingComplete: true,
        updatedAt: new Date().toISOString(),
      };

      if (formData.role === 'patient') {
        updateData.startWeight = parseFloat(formData.startWeight) || null;
        updateData.goalWeight = parseFloat(formData.goalWeight) || null;
        updateData.focusAreas = formData.focusAreas;
      } else {
        updateData.clinicianRole = formData.clinicianRole;
        updateData.organisation = formData.organisation;
      }

      await updateDoc(userRef, updateData);
      await refreshProfile();
      
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const focusAreasOptions = [
    { id: 'Nutrition', label: '🥗 Nutrition' },
    { id: 'Mental Wellbeing', label: '🧠 Mental Wellbeing' },
    { id: 'Fitness', label: '💪 Fitness' },
    { id: 'Sleep', label: '😴 Sleep' },
    { id: 'Craving Control', label: '🍫 Craving Control' },
    { id: 'Medication Management', label: '💊 Medication Management' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAF9] to-[#E8F5EF] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-mint/20 z-50">
        <motion.div 
          className="h-full bg-primary"
          initial={{ width: '0%' }}
          animate={{ width: `${(step / 3) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <button 
        onClick={() => navigate('/dashboard')}
        className="fixed top-8 right-8 text-sm font-medium text-muted-text hover:text-text-dark transition-colors"
      >
        Skip
      </button>

      <AnimatePresence mode="wait">
        {!showSuccess ? (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-[520px] bg-white rounded-[40px] p-10 shadow-2xl shadow-primary/5 border border-mint/10 relative"
          >
            <div className="text-center mb-8">
              <p className="text-xs font-bold text-muted-text uppercase tracking-widest mb-2">Step {step} of 3</p>
              
              {step === 1 && (
                <>
                  <h1 className="text-3xl font-bold text-text-dark mb-2">Welcome to Continuity 💚</h1>
                  <p className="text-muted-text">Let's set up your profile in 3 quick steps.</p>
                </>
              )}

              {step === 2 && (
                <>
                  <h1 className="text-3xl font-bold text-text-dark mb-2">
                    {formData.role === 'patient' ? 'Tell us about your health goals' : 'Set up your clinician profile'}
                  </h1>
                  <p className="text-muted-text">This helps us personalise your experience.</p>
                </>
              )}

              {step === 3 && (
                <>
                  <h1 className="text-3xl font-bold text-text-dark mb-2">Stay on track with reminders 🔔</h1>
                  <p className="text-muted-text">We'll send you gentle nudges to keep you consistent.</p>
                </>
              )}
            </div>

            {/* Step Content */}
            <div className="space-y-8 min-h-[320px]">
              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-text-dark/80 ml-1">What's your name?</label>
                    <input 
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      placeholder="Enter your name"
                      className="w-full px-5 py-4 bg-warm-white border border-mint/20 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-bold text-text-dark/80 ml-1">I am joining as a...</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setFormData({ ...formData, role: 'patient' })}
                        className={cn(
                          "p-6 rounded-3xl border-2 transition-all text-left flex flex-col gap-3 group",
                          formData.role === 'patient' ? "border-primary bg-mint/10" : "border-mint/10 bg-warm-white hover:border-primary/50"
                        )}
                      >
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all",
                          formData.role === 'patient' ? "bg-primary text-white" : "bg-white"
                        )}>
                          🧑‍⚕️
                        </div>
                        <div>
                          <p className="font-bold text-text-dark">Patient</p>
                          <p className="text-[10px] text-muted-text leading-tight mt-1">I want to track my health and get support</p>
                        </div>
                      </button>

                      <button
                        onClick={() => setFormData({ ...formData, role: 'clinician' })}
                        className={cn(
                          "p-6 rounded-3xl border-2 transition-all text-left flex flex-col gap-3 group",
                          formData.role === 'clinician' ? "border-primary bg-mint/10" : "border-mint/10 bg-warm-white hover:border-primary/50"
                        )}
                      >
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all",
                          formData.role === 'clinician' ? "bg-primary text-white" : "bg-white"
                        )}>
                          👨‍⚕️
                        </div>
                        <div>
                          <p className="font-bold text-text-dark">Clinician</p>
                          <p className="text-[10px] text-muted-text leading-tight mt-1">I support patients on their health journey</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && formData.role === 'patient' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-text-dark/80 ml-1">Current Weight</label>
                      <div className="relative">
                        <input 
                          type="number"
                          value={formData.startWeight}
                          onChange={(e) => setFormData({ ...formData, startWeight: e.target.value })}
                          placeholder="00"
                          className="w-full pl-5 pr-12 py-4 bg-warm-white border border-mint/20 rounded-2xl focus:ring-2 focus:ring-primary outline-none"
                        />
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-text">kg</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-text-dark/80 ml-1">Goal Weight</label>
                      <div className="relative">
                        <input 
                          type="number"
                          value={formData.goalWeight}
                          onChange={(e) => setFormData({ ...formData, goalWeight: e.target.value })}
                          placeholder="00"
                          className="w-full pl-5 pr-12 py-4 bg-warm-white border border-mint/20 rounded-2xl focus:ring-2 focus:ring-primary outline-none"
                        />
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-text">kg</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-bold text-text-dark/80 ml-1">What are you mainly focusing on? (Pick up to 3)</label>
                    <div className="flex flex-wrap gap-2">
                      {focusAreasOptions.map((area) => (
                        <button
                          key={area.id}
                          onClick={() => toggleFocusArea(area.id)}
                          className={cn(
                            "px-4 py-2.5 rounded-full text-sm font-medium transition-all border",
                            formData.focusAreas.includes(area.id)
                              ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                              : "bg-warm-white text-muted-text border-mint/20 hover:border-primary/50"
                          )}
                        >
                          {area.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && formData.role === 'clinician' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-text-dark/80 ml-1">What is your role?</label>
                    <select
                      value={formData.clinicianRole}
                      onChange={(e) => setFormData({ ...formData, clinicianRole: e.target.value })}
                      className="w-full px-5 py-4 bg-warm-white border border-mint/20 rounded-2xl focus:ring-2 focus:ring-primary outline-none appearance-none"
                    >
                      <option value="">Select your role</option>
                      <option value="GP">GP</option>
                      <option value="Dietician">Dietician</option>
                      <option value="CBT Therapist">CBT Therapist</option>
                      <option value="Personal Trainer">Personal Trainer</option>
                      <option value="Care Coordinator">Care Coordinator</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-text-dark/80 ml-1">Your clinic or organisation name</label>
                    <input 
                      type="text"
                      value={formData.organisation}
                      onChange={(e) => setFormData({ ...formData, organisation: e.target.value })}
                      placeholder="Enter organisation name"
                      className="w-full px-5 py-4 bg-warm-white border border-mint/20 rounded-2xl focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    {[
                      { id: 'morningReminder', label: '🌅 Daily morning check-in reminder' },
                      { id: 'weeklySummary', label: '🏆 Weekly progress summary' },
                      { id: 'teamMessages', label: '💬 Messages from your care team' },
                      { id: 'goalAlerts', label: '🎯 Goal milestone alerts' },
                    ].map((opt) => (
                      <div key={opt.id} className="flex items-center justify-between p-4 bg-warm-white rounded-2xl border border-mint/10">
                        <span className="text-sm font-medium text-text-dark">{opt.label}</span>
                        <button
                          onClick={() => setFormData({
                            ...formData,
                            notifications: {
                              ...formData.notifications,
                              [opt.id]: !formData.notifications[opt.id as keyof typeof formData.notifications]
                            }
                          })}
                          className={cn(
                            "w-12 h-6 rounded-full transition-all relative",
                            formData.notifications[opt.id as keyof typeof formData.notifications] ? "bg-primary" : "bg-muted-text/30"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                            formData.notifications[opt.id as keyof typeof formData.notifications] ? "left-7" : "left-1"
                          )} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-text-dark/80 ml-1">How did you hear about Continuity?</label>
                    <select
                      value={formData.referralSource}
                      onChange={(e) => setFormData({ ...formData, referralSource: e.target.value })}
                      className="w-full px-5 py-4 bg-warm-white border border-mint/20 rounded-2xl focus:ring-2 focus:ring-primary outline-none appearance-none"
                    >
                      <option value="">Select an option</option>
                      <option value="Social media">Social media</option>
                      <option value="Referred by a clinician">Referred by a clinician</option>
                      <option value="Friend or family">Friend or family</option>
                      <option value="Search engine">Search engine</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-12">
              {step > 1 ? (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 text-sm font-bold text-muted-text hover:text-text-dark transition-colors"
                >
                  <ArrowLeft size={18} /> Back
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  onClick={handleNext}
                  disabled={step === 1 && !formData.displayName}
                  className="bg-primary text-white px-8 py-4 rounded-full font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50 disabled:scale-100"
                >
                  Continue <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-primary text-white px-8 py-4 rounded-full font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
                >
                  {isSubmitting ? 'Setting up...' : 'Start My Journey 🚀'}
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/30">
              <Check size={48} strokeWidth={3} />
            </div>
            <h2 className="text-3xl font-bold text-text-dark mb-2">You're all set!</h2>
            <p className="text-xl text-primary font-medium">Welcome to Continuity 💚</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-mint/10 rounded-full blur-[120px] -z-10" />
    </div>
  );
}
