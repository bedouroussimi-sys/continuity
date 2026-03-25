import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { toast } from 'sonner';
import { Mail, Lock, Chrome, ArrowRight, User, Stethoscope } from 'lucide-react';
import { cn } from '../lib/utils';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'patient' | 'clinician'>('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Welcome back!');
      } else {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          role,
          createdAt: new Date().toISOString(),
          points: 0,
          displayName: user.displayName || email.split('@')[0],
        });
        toast.success('Account created successfully!');
      }
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          uid: user.uid,
          email: user.email,
          role: 'patient', // Default to patient for Google sign-in
          createdAt: new Date().toISOString(),
          points: 0,
          displayName: user.displayName,
        });
      }
      toast.success('Signed in with Google!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-2xl">W</span>
            </div>
            <div className="text-left">
              <span className="block font-bold text-xl text-text-dark leading-none">Continuity</span>
              <span className="block font-light text-sm text-primary">Companion</span>
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-text-dark">
            {isLogin ? 'Welcome Back' : 'Join the Companion'}
          </h2>
          <p className="text-muted-text mt-2">
            {isLogin ? 'Sign in to continue your journey' : 'Start your maintenance journey today'}
          </p>
        </div>

        {!isLogin && (
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setRole('patient')}
              className={cn(
                "flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                role === 'patient' ? "border-primary bg-mint/20 text-primary" : "border-mint/10 bg-white text-muted-text"
              )}
            >
              <User size={24} />
              <span className="font-bold">Patient</span>
            </button>
            <button
              onClick={() => setRole('clinician')}
              className={cn(
                "flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                role === 'clinician' ? "border-primary bg-mint/20 text-primary" : "border-mint/10 bg-white text-muted-text"
              )}
            >
              <Stethoscope size={24} />
              <span className="font-bold">Clinician</span>
            </button>
          </div>
        )}

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-mint/10">
          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-text-dark/80 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-text" size={20} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-warm-white border border-mint/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  placeholder="name@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-text-dark/80 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-text" size={20} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-warm-white border border-mint/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-mint/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-muted-text">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full border-2 border-mint/20 text-text-dark/80 py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-warm-white transition-all disabled:opacity-50"
          >
            <Chrome size={20} />
            Google
          </button>
        </div>

        <p className="text-center mt-8 text-muted-text">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-bold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
}
