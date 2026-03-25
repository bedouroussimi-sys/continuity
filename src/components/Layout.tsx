import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Utensils, Brain, Trophy, LogOut, Menu, X, Heart, Leaf, Settings as SettingsIcon, MessageSquare, Mic, Users, ClipboardList, Target, CreditCard, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { cn } from '../lib/utils';
import VoiceModal from './VoiceModal';
import { motion, AnimatePresence } from 'motion/react';

export default function Layout() {
  const { profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: "Hi! I'm your Continuity AI Coach. How are you feeling today? I'm here to help 💚" }
  ]);
  const [isMicActive, setIsMicActive] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsVoiceModalOpen(true);
    window.addEventListener('open-voice-modal', handleOpen);
    return () => window.removeEventListener('open-voice-modal', handleOpen);
  }, []);

  useEffect(() => {
    // Check if mic is active (this is a simplified check for the UI banner)
    const checkMic = setInterval(() => {
      // In a real app, we'd use navigator.mediaDevices.enumerateDevices() or similar
      // but for this UI requirement, we'll just track our modal state
    }, 1000);
    return () => clearInterval(checkMic);
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    ...(profile?.role === 'patient' ? [
      { name: 'MDT Team', path: '/mdt-team', icon: Users },
      { name: 'AI Coach', path: '/dashboard/ai-coach', icon: MessageSquare },
      { name: 'Food & Mood', path: '/food-log', icon: Utensils },
      { name: 'CBT Tools', path: '/cbt-tools', icon: Brain },
      { name: 'Cravings Log', path: '/cravings-log', icon: ClipboardList },
      { name: 'Goal Tracker', path: '/goals', icon: Target },
      { name: 'Rewards', path: '/rewards', icon: Trophy },
      { name: 'Pricing', path: '/pricing', icon: CreditCard },
    ] : []),
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-warm-white flex flex-col md:flex-row">
      {/* Mic Active Banner */}
      <AnimatePresence>
        {isVoiceModalOpen && (
          <motion.div 
            initial={{ y: -40 }}
            animate={{ y: 0 }}
            exit={{ y: -40 }}
            className="fixed top-0 left-0 right-0 z-[110] bg-red-500 text-white py-2 text-center text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <Mic size={14} className="animate-pulse" /> Microphone active
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-mint/30 p-4 flex items-center justify-between sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2">
          <div className="relative w-8 h-8 flex items-center justify-center">
            <Heart className="text-primary fill-primary/10 absolute inset-0" size={32} />
            <Leaf className="text-primary absolute -top-1 -right-1 rotate-12" size={16} />
          </div>
          <span className="font-semibold text-text-dark">Continuity</span>
        </Link>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="text-muted-text" /> : <Menu className="text-muted-text" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-0 z-40 bg-white border-r border-mint/30 w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        isMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 h-full flex flex-col">
          <Link to="/" className="hidden md:flex items-center gap-3 mb-8">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <Heart className="text-primary fill-primary/10 absolute inset-0" size={40} />
              <Leaf className="text-primary absolute -top-1 -right-1 rotate-12" size={20} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-xl text-text-dark tracking-tight">Continuity</span>
              <span className="text-xs font-light text-muted-text">Wellness Platform</span>
            </div>
          </Link>

          {/* Profile Section */}
          <Link 
            to="/settings" 
            onClick={() => setIsMenuOpen(false)}
            className="flex flex-col items-center mb-8 group"
          >
            <div className="w-[60px] h-[60px] rounded-full overflow-hidden mb-2 border-2 border-mint/30 group-hover:border-primary transition-all duration-200 shadow-sm">
              {profile?.photoURL ? (
                <img 
                  src={profile.photoURL} 
                  alt={profile.displayName} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-primary flex items-center justify-center text-white font-bold text-xl">
                  {getInitials(profile?.displayName || profile?.email || 'User')}
                </div>
              )}
            </div>
            <span className="text-[14px] font-semibold text-text-dark">
              {(profile?.displayName || 'User').split(' ')[0]}
            </span>
            {profile?.role === 'patient' && (
              <div className={cn(
                "mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                profile.phase === 'Phase 2' ? "bg-purple-600 text-white" :
                profile.phase === 'Maintenance' ? "bg-gold text-white" :
                "bg-primary text-white"
              )}>
                {profile.phase === 'Phase 2' ? "Phase 2 🤖" :
                 profile.phase === 'Maintenance' ? "Maintenance ⭐" :
                 "Phase 1 🌱"}
              </div>
            )}
          </Link>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  location.pathname === item.path
                    ? "bg-mint text-primary font-medium shadow-sm"
                    : "text-muted-text hover:bg-warm-white hover:text-text-dark"
                )}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="pt-6 border-t border-mint/30 mt-auto">
            <div className="flex items-center gap-3 px-4 py-3 mb-4">
              <div className="w-10 h-10 bg-mint rounded-full flex items-center justify-center text-primary font-medium">
                {profile?.displayName?.[0] || profile?.email?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-dark truncate">
                  {profile?.displayName || 'User'}
                </p>
                <p className="text-xs text-muted-text truncate capitalize">
                  {profile?.role}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Floating AI Chat Widget */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-4 z-50">
        {profile?.role === 'patient' && (
          <button
            onClick={() => setIsVoiceModalOpen(true)}
            className="w-12 h-12 bg-white text-primary border border-mint/30 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all group"
            aria-label="Start voice input"
          >
            <Mic size={24} />
            <div className="absolute right-full mr-3 bg-text-dark text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Speak to AI Coach
            </div>
          </button>
        )}
        
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all group relative"
          aria-label="Open AI Chat"
        >
          {isChatOpen ? <X size={28} /> : <MessageSquare size={28} />}
          {!isChatOpen && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full animate-pulse" />
          )}
        </button>
      </div>

      {/* Slide-in Chat Panel */}
      <AnimatePresence>
        {isChatOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChatOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-full max-w-[380px] h-full bg-white shadow-2xl z-[70] flex flex-col"
            >
              {/* Chat Header */}
              <div className="p-6 border-b border-mint/20 flex items-center justify-between bg-primary text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Heart size={20} className="fill-white" />
                  </div>
                  <div>
                    <h3 className="font-bold">Continuity AI</h3>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-mint rounded-full animate-pulse" />
                      <span className="text-[10px] uppercase tracking-wider font-bold opacity-80">Online</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setIsChatOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-warm-white/30">
                {chatHistory.map((msg, i) => (
                  <div key={i} className={cn(
                    "flex flex-col max-w-[85%]",
                    msg.role === 'ai' ? "items-start" : "items-end ml-auto"
                  )}>
                    <div className={cn(
                      "p-4 rounded-2xl text-sm leading-relaxed",
                      msg.role === 'ai' 
                        ? "bg-white border border-mint/20 text-text-dark shadow-sm rounded-tl-none" 
                        : "bg-primary text-white shadow-md rounded-tr-none"
                    )}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Replies */}
              <div className="px-6 py-3 border-t border-mint/10 flex gap-2 overflow-x-auto no-scrollbar">
                {["Log a craving 🍫", "I need motivation 💪", "Talk to my team 👥"].map((reply) => (
                  <button
                    key={reply}
                    onClick={() => {
                      setChatHistory([...chatHistory, { role: 'user', text: reply }]);
                      // Simulate AI response
                      setTimeout(() => {
                        setChatHistory(prev => [...prev, { role: 'ai', text: "I'm here to help with that! Let me get the right tools for you." }]);
                      }, 1000);
                    }}
                    className="whitespace-nowrap px-4 py-2 bg-mint/10 border border-primary/20 text-primary text-xs font-bold rounded-full hover:bg-primary hover:text-white transition-all"
                  >
                    {reply}
                  </button>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-6 border-t border-mint/20 bg-white">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!chatMessage.trim()) return;
                    setChatHistory([...chatHistory, { role: 'user', text: chatMessage }]);
                    setChatMessage('');
                    // Simulate AI response
                    setTimeout(() => {
                      setChatHistory(prev => [...prev, { role: 'ai', text: "That's a great point. How can I support you further with that?" }]);
                    }, 1000);
                  }}
                  className="relative"
                >
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full pl-4 pr-12 py-3 bg-warm-white border border-mint/20 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:scale-110 transition-transform"
                  >
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Voice Modal */}
      <VoiceModal 
        isOpen={isVoiceModalOpen} 
        onClose={() => setIsVoiceModalOpen(false)} 
      />
    </div>
  );
}
