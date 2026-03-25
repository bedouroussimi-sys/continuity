import { Check, ShieldCheck, Zap, Star, Award, CreditCard, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

const tiers = [
  {
    name: 'Basic',
    price: '29',
    color: 'bg-teal-500',
    features: [
      'Progress dashboards',
      'Daily monitoring + AI nudges',
      '1x monthly dietician check-in',
      'CBT tools',
      'Cravings log',
      'Goal dashboard',
    ],
    cta: 'Start Basic',
    popular: false,
  },
  {
    name: 'Enhanced',
    price: '59',
    color: 'bg-primary',
    features: [
      'All Basic features',
      'MDT team access',
      'Weekly CBT sessions',
      'Priority clinician escalation',
      'Personalized meal/activity plans',
      'Weekly AI coaching check-ins',
    ],
    cta: 'Start Enhanced',
    popular: true,
  },
  {
    name: 'Premium',
    price: '99',
    color: 'bg-amber-500',
    features: [
      'All Enhanced features',
      'Weekly 1:1 clinician consultations',
      '2x monthly PT sessions',
      'Full care team access',
      'Dedicated care coordinator',
      '<2 hour response times',
      'Platinum Member rewards',
    ],
    cta: 'Go Premium',
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0D1F2D] text-white py-24 px-6 md:px-12 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-mint/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-24 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-mint text-xs font-bold uppercase tracking-widest mb-8"
          >
            <Star size={14} className="fill-mint" /> Premium Health Plans
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-8 tracking-tight"
          >
            Invest in your <span className="text-mint">well-being</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/60 leading-relaxed"
          >
            Choose a plan that fits your health goals. All plans include clinical-grade support and personalized AI coaching.
          </motion.p>
        </div>

        {/* Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 + 0.3 }}
              className={cn(
                "relative bg-white/5 border border-white/10 rounded-[48px] p-10 flex flex-col h-full transition-all duration-500 hover:bg-white/[0.08] hover:border-white/20 group",
                tier.popular && "border-primary/50 bg-white/[0.08] shadow-[0_0_50px_rgba(29,106,74,0.2)]"
              )}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-xl flex items-center gap-2">
                  <Zap size={14} className="fill-white" /> Most Popular
                </div>
              )}

              <div className="mb-10">
                <div className={cn("w-16 h-1 bg-mint rounded-full mb-8", tier.color)} />
                <h3 className="text-2xl font-bold mb-4">{tier.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold tracking-tight">£{tier.price}</span>
                  <span className="text-white/40 font-medium">/month</span>
                </div>
              </div>

              <div className="flex-1 space-y-5 mb-12">
                {tier.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-4">
                    <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={12} className="text-primary" />
                    </div>
                    <span className="text-sm text-white/80 leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>

              <button className={cn(
                "w-full py-5 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 group/btn shadow-xl",
                tier.popular 
                  ? "bg-primary text-white hover:opacity-90" 
                  : "bg-white/10 text-white hover:bg-white/20"
              )}>
                {tier.cta} <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Trust Bar */}
        <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
              <ShieldCheck size={28} />
            </div>
            <div>
              <p className="font-bold text-white">Secure & Compliant</p>
              <p className="text-xs text-white/40 uppercase tracking-widest font-bold">GDPR · NHS-Aligned · Encrypted</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm font-bold text-white/60 uppercase tracking-widest">
            <span>🔒 Cancel anytime</span>
            <span>·</span>
            <span>No setup fees</span>
            <span>·</span>
            <span>24/7 Support</span>
          </div>
          <button className="text-mint font-bold hover:underline flex items-center gap-2">
            Compare all features <ArrowRight size={18} />
          </button>
        </div>

        {/* Rewards Teaser */}
        <div className="mt-24 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gold/10 border border-gold/20 rounded-full text-gold text-sm font-bold mb-8">
            <Award size={20} /> Platinum Member Rewards Included
          </div>
          <p className="text-white/40 text-sm max-w-2xl mx-auto">
            All plans contribute to your Continuity Rewards points. Redeem points for health products, fitness gear, and exclusive wellness experiences.
          </p>
        </div>
      </div>
    </div>
  );
}
