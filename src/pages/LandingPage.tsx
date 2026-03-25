import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle2, 
  Star, 
  Users, 
  ShieldCheck, 
  Zap, 
  Heart, 
  Leaf, 
  Stethoscope, 
  Apple, 
  Brain, 
  Dumbbell, 
  UserPlus,
  Trophy,
  LineChart,
  MessageSquare,
  Bell,
  Sparkles,
  Check,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'MDT Team', path: '/mdt-team' },
    { name: 'CBT Tools', path: '/cbt-tools' },
    { name: 'Cravings Log', path: '/cravings-log' },
    { name: 'Goal Tracker', path: '/goals' },
    { name: 'AI Coach', path: '/dashboard/ai-coach' },
    { name: 'Rewards', path: '/rewards' },
    { name: 'Pricing', path: '#pricing' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-text-dark">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-mint/20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <Heart className="text-primary fill-primary/10 absolute inset-0" size={32} />
              <Leaf className="text-primary absolute -top-1 -right-1 rotate-12" size={16} />
            </div>
            <span className="font-bold text-2xl tracking-tight text-text-dark">Continuity</span>
          </Link>
          
          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link 
                key={item.name} 
                to={item.path} 
                onClick={(e) => {
                  if (item.path.startsWith('#')) {
                    e.preventDefault();
                    const element = document.getElementById(item.path.substring(1));
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="text-sm font-medium text-muted-text hover:text-primary transition-colors relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="hidden sm:block text-sm font-semibold text-text-dark hover:text-primary transition-colors"
            >
              Log In
            </Link>
            <Link 
              to="/login" 
              className="bg-primary text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all text-sm"
            >
              Get Started
            </Link>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-text-dark hover:text-primary"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-mint/20 overflow-hidden"
            >
              <div className="flex flex-col p-6 gap-4">
                {navItems.map((item) => (
                  <Link 
                    key={item.name} 
                    to={item.path} 
                    onClick={(e) => {
                      if (item.path.startsWith('#')) {
                        e.preventDefault();
                        const element = document.getElementById(item.path.substring(1));
                        element?.scrollIntoView({ behavior: 'smooth' });
                      }
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-lg font-medium text-text-dark hover:text-primary"
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="pt-4 border-t border-mint/20 flex flex-col gap-4">
                  <Link 
                    to="/login" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-bold text-text-dark"
                  >
                    Log In
                  </Link>
                  <Link 
                    to="/login" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="bg-primary text-white px-6 py-4 rounded-full font-bold text-center shadow-lg"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mint/30 text-primary text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles size={14} /> Your Wellness Companion
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] mb-6">
              Expert support for your <span className="text-primary">health journey</span>
            </h1>
            <p className="text-lg lg:text-xl text-muted-text mb-10 leading-relaxed max-w-xl">
              Continuity helps you build healthy habits, track progress, connect with experts, and stay motivated with rewards.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link 
                to="/login" 
                className="w-full sm:w-auto bg-primary text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                Get Started <ArrowRight size={20} />
              </Link>
              <a 
                href="#how-it-works" 
                className="w-full sm:w-auto border-2 border-mint text-text-dark px-8 py-4 rounded-full font-bold text-lg hover:bg-warm-white transition-all text-center"
              >
                Learn More
              </a>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 rounded-[40px] overflow-hidden shadow-2xl border-8 border-white">
              <img 
                src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1000" 
                alt="Wellness Lifestyle" 
                className="w-full h-full object-cover aspect-[4/3] max-h-[320px]"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Decorative Elements */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-mint/40 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-10" />
            
            {/* Floating Card */}
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-3xl shadow-xl z-20 border border-mint/20 hidden sm:block">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white">
                  <Trophy size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-text uppercase tracking-widest">Daily Goal</p>
                  <p className="font-bold text-text-dark">Almost there!</p>
                </div>
              </div>
              <div className="w-48 h-2 bg-mint/30 rounded-full overflow-hidden">
                <div className="w-[85%] h-full bg-primary rounded-full" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Priority Section */}
      <section className="py-24 bg-warm-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative">
            <div className="rounded-[40px] overflow-hidden shadow-xl border-4 border-white">
              <img 
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=1000" 
                alt="Health Priority" 
                className="w-full h-full object-cover aspect-video lg:aspect-square"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          
          <div className="order-1 lg:order-2">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">Your health is our priority</h2>
            <p className="text-lg text-muted-text mb-8 leading-relaxed">
              We believe in a holistic approach to wellness. Continuity supports you through expert guidance, personalized plans, and the motivation you need to succeed.
            </p>
            
            <div className="space-y-4 mb-10">
              {[
                { title: 'Personalized wellness plans', icon: Leaf },
                { title: 'Expert guidance and support', icon: Stethoscope },
                { title: 'Easy progress tracking', icon: LineChart },
                { title: 'Reward-based motivation', icon: Trophy },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-mint/20 shadow-sm">
                  <div className="w-10 h-10 bg-mint/30 rounded-xl flex items-center justify-center text-primary">
                    <item.icon size={20} />
                  </div>
                  <span className="font-bold text-text-dark">{item.title}</span>
                </div>
              ))}
            </div>
            
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:opacity-90 transition-all"
            >
              Start Your Journey <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* 3-Step Section */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-16">Three simple steps to start with Continuity</h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                step: '01',
                title: 'Create your profile',
                desc: 'Add your goals, preferences, and health interests to get started.',
                icon: UserPlus,
                color: 'bg-blue-50 text-blue-600'
              },
              {
                step: '02',
                title: 'Connect with an expert',
                desc: 'Get guidance, support, and a personalized action plan from qualified experts.',
                icon: Users,
                color: 'bg-purple-50 text-purple-600'
              },
              {
                step: '03',
                title: 'Track progress and earn rewards',
                desc: 'Monitor your journey, stay consistent, and unlock rewards as you reach milestones.',
                icon: Trophy,
                color: 'bg-amber-50 text-amber-600'
              }
            ].map((item, i) => (
              <div key={i} className="bg-warm-white p-10 rounded-[40px] border border-mint/20 shadow-sm hover:shadow-md transition-all text-left relative group">
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform", item.color)}>
                  <item.icon size={32} />
                </div>
                <span className="absolute top-10 right-10 text-4xl font-black text-primary/5">{item.step}</span>
                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                <p className="text-muted-text leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 bg-primary text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-all"
          >
            Join Continuity
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-warm-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything you need to thrive</h2>
            <p className="text-muted-text max-w-2xl mx-auto">Explore the features designed to keep you on track and motivated every single day.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Check progress', desc: 'Visualise your journey with detailed charts and metrics.', icon: LineChart },
              { title: 'Talk to experts', desc: 'Direct access to qualified health and wellness professionals.', icon: MessageSquare },
              { title: 'Earn rewards', desc: 'Get points and badges for hitting your daily and weekly goals.', icon: Trophy },
              { title: 'Personalized recommendations', desc: 'Tailored advice based on your unique health profile.', icon: Sparkles },
              { title: 'Stay motivated', desc: 'Smart reminders and notifications to keep you consistent.', icon: Bell },
              { title: 'Community support', desc: 'Connect with others on a similar health journey.', icon: Users },
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-mint/20 shadow-sm hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-lg font-bold mb-3">{feature.title}</h3>
                <p className="text-sm text-muted-text leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Progress Section */}
      <section id="progress" className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">Track your progress with confidence</h2>
            <p className="text-lg text-muted-text mb-10 leading-relaxed">
              See your habits, milestones, and improvements in one place. Our advanced tracking tools give you the clarity you need to stay committed.
            </p>
            
            <div className="space-y-6">
              {[
                'Daily habit streaks',
                'Weight and metric tracking',
                'Milestone achievements',
                'Personalized health insights'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white">
                    <Check size={14} />
                  </div>
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-mint/20 rounded-[40px] p-8 lg:p-12">
              <div className="bg-white rounded-3xl shadow-xl p-6 border border-mint/10">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="font-bold">Weekly Activity</h4>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <div className="w-2 h-2 rounded-full bg-mint" />
                  </div>
                </div>
                <div className="flex items-end gap-3 h-40 mb-6">
                  {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                    <div key={i} className="flex-1 bg-mint/30 rounded-t-lg relative group">
                      <motion.div 
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-lg group-hover:bg-primary/80 transition-all"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] font-bold text-muted-text uppercase tracking-widest">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expert Support Section */}
      <section id="experts" className="py-24 bg-primary text-white rounded-[60px] mx-6 my-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-8">Qualified experts at your fingertips</h2>
          <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
            Connect with qualified experts for support, feedback, and motivation. Get the professional guidance you need to navigate your health journey with ease.
          </p>
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 bg-white text-primary px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:scale-105 transition-all"
          >
            Talk to an Expert <MessageSquare size={20} />
          </Link>
          
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold mb-2">500+</span>
              <span className="text-xs uppercase tracking-widest font-bold">Experts</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold mb-2">24/7</span>
              <span className="text-xs uppercase tracking-widest font-bold">Support</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold mb-2">10k+</span>
              <span className="text-xs uppercase tracking-widest font-bold">Success Stories</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold mb-2">98%</span>
              <span className="text-xs uppercase tracking-widest font-bold">Satisfaction</span>
            </div>
          </div>
        </div>
      </section>

      {/* Rewards Section */}
      <section id="rewards" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-amber-50 p-8 rounded-3xl border border-amber-100 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-4">
                    <Trophy size={32} />
                  </div>
                  <h4 className="font-bold">Gold Badge</h4>
                  <p className="text-xs text-muted-text mt-2">30 Day Streak</p>
                </div>
                <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                    <Star size={32} />
                  </div>
                  <h4 className="font-bold">Rising Star</h4>
                  <p className="text-xs text-muted-text mt-2">First Milestone</p>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="bg-purple-50 p-8 rounded-3xl border border-purple-100 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-4">
                    <Heart size={32} />
                  </div>
                  <h4 className="font-bold">Health Hero</h4>
                  <p className="text-xs text-muted-text mt-2">Consistent Tracking</p>
                </div>
                <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4">
                    <Zap size={32} />
                  </div>
                  <h4 className="font-bold">Energy Master</h4>
                  <p className="text-xs text-muted-text mt-2">Weekly Goal Met</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="order-1 lg:order-2">
            <h2 className="text-4xl font-bold mb-6">Stay motivated with a rewarding journey</h2>
            <p className="text-lg text-muted-text mb-10 leading-relaxed">
              Earn points, badges, and achievements for completing your goals and staying active. Continuity makes wellness fun and engaging, so you never lose your spark.
            </p>
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:opacity-90 transition-all"
            >
              Explore Rewards <Trophy size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-[#0D1F2D] relative overflow-hidden text-white">
        {/* Glow Blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">Simple</h2>
            <p className="text-white/60 text-lg">Choose the plan that fits your health journey</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-center">
            {/* Basic Tier */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-white rounded-[40px] overflow-hidden flex flex-col h-full text-text-dark"
            >
              <div className="bg-primary h-4 w-full" />
              <div className="p-8 flex-1">
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-2">BASIC</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">£29</span>
                    <span className="text-muted-text">/mo</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  {[
                    'Progress dashboards',
                    'Daily monitoring + AI nudges',
                    '1× monthly dietician check-in',
                    'Access to CBT tools',
                    'Cravings log tracking',
                    'Goal dashboard'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 size={18} className="text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-8 pt-0">
                <Link 
                  to="/login" 
                  className="block w-full py-4 rounded-full border-2 border-primary text-primary font-bold text-center hover:bg-primary hover:text-white transition-all"
                >
                  Start Basic
                </Link>
              </div>
            </motion.div>

            {/* Enhanced Tier */}
            <motion.div 
              whileHover={{ y: -10 }}
              initial={{ scale: 1.05 }}
              animate={{ scale: 1.05 }}
              className="bg-primary rounded-[40px] overflow-hidden flex flex-col h-full text-white shadow-2xl shadow-primary/40 relative z-20"
            >
              <div className="bg-amber-400 py-2 text-center text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                ⭐ Most Popular
              </div>
              <div className="p-8 flex-1">
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-2">ENHANCED</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">£59</span>
                    <span className="text-white/80">/mo</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  {[
                    'Everything in Basic, plus:',
                    'MDT care team messaging',
                    'Weekly CBT-based support sessions',
                    'Priority clinician escalation',
                    'Personalised meal & activity plans',
                    'Weekly AI coaching check-ins'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 size={18} className="text-white shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-8 pt-0">
                <Link 
                  to="/login" 
                  className="block w-full py-4 rounded-full bg-white text-primary font-bold text-center hover:bg-white/90 transition-all"
                >
                  Start Enhanced
                </Link>
              </div>
            </motion.div>

            {/* Premium Tier */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-[#0D1F2D] rounded-[40px] overflow-hidden flex flex-col h-full text-white border border-white/10"
            >
              <div className="bg-gradient-to-r from-amber-400 to-amber-600 py-2 text-center text-[10px] font-black uppercase tracking-[0.2em] text-white">
                👑 Premium
              </div>
              <div className="p-8 flex-1">
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-2">PREMIUM</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-amber-400">£99</span>
                    <span className="text-white/60">/mo</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  {[
                    'Everything in Enhanced, plus:',
                    'Weekly 1:1 clinician consultations',
                    '2× personal trainer sessions/month',
                    'Full care team access',
                    'Dedicated care coordinator',
                    'Under 2-hour response guarantee',
                    'Platinum member rewards'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 size={18} className="text-amber-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-8 pt-0">
                <Link 
                  to="/login" 
                  className="block w-full py-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-white font-bold text-center hover:scale-[1.02] transition-all"
                >
                  Go Premium
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Trust Bar */}
          <div className="mt-20 text-center text-white/50 text-sm font-medium">
            🔒 Cancel anytime · No setup fees · NHS-aligned care · GDPR compliant · 7-day free trial
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-warm-white py-20 border-t border-mint/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-6">
                <div className="relative w-8 h-8 flex items-center justify-center">
                  <Heart className="text-primary fill-primary/10 absolute inset-0" size={32} />
                  <Leaf className="text-primary absolute -top-1 -right-1 rotate-12" size={16} />
                </div>
                <span className="font-bold text-2xl tracking-tight text-text-dark">Continuity</span>
              </Link>
              <p className="text-muted-text max-w-sm leading-relaxed">
                Empowering you to take control of your health journey with expert support, personalized plans, and a rewarding experience.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-6">Quick Links</h4>
              <ul className="space-y-4 text-sm text-muted-text">
                <li><a href="#" className="hover:text-primary transition-colors">Home</a></li>
                <li><a href="#progress" className="hover:text-primary transition-colors">Progress</a></li>
                <li><a href="#experts" className="hover:text-primary transition-colors">Experts</a></li>
                <li><a href="#rewards" className="hover:text-primary transition-colors">Rewards</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-muted-text">
                <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-12 border-t border-mint/20 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-muted-text">© 2026 Continuity. All rights reserved.</p>
            <div className="flex gap-6">
              {/* Social Icons Placeholder */}
              <div className="w-8 h-8 rounded-full bg-mint/30 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all cursor-pointer">
                <Heart size={16} />
              </div>
              <div className="w-8 h-8 rounded-full bg-mint/30 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all cursor-pointer">
                <Leaf size={16} />
              </div>
              <div className="w-8 h-8 rounded-full bg-mint/30 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all cursor-pointer">
                <Sparkles size={16} />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
