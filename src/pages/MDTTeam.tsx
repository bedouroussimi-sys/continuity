import { Users, Mail, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

const teamMembers = [
  {
    name: 'Dr. Sarah Chen',
    role: 'GP / Medical Doctor',
    initials: 'SC',
    status: 'Available',
    description: 'Specializes in metabolic health and weight management.',
  },
  {
    name: 'Mark Thompson',
    role: 'CBT Therapist',
    initials: 'MT',
    status: 'Busy',
    description: 'Expert in cognitive behavioural therapy for eating behaviours.',
  },
  {
    name: 'Emma Wilson',
    role: 'Registered Dietician',
    initials: 'EW',
    status: 'Available',
    description: 'Personalized nutrition planning and gut health specialist.',
  },
  {
    name: 'James Rodriguez',
    role: 'Personal Trainer',
    initials: 'JR',
    status: 'Available',
    description: 'Focuses on functional movement and sustainable activity.',
  },
  {
    name: 'Sophie Taylor',
    role: 'Care Coordinator',
    initials: 'ST',
    status: 'Available',
    description: 'Your primary point of contact for all care needs.',
  },
];

export default function MDTTeam() {
  return (
    <div className="space-y-12 pb-12">
      {/* Header Banner */}
      <div className="bg-primary text-white p-12 rounded-[40px] relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl font-bold mb-4">Your Multi-Disciplinary Team</h1>
          <p className="text-mint/80 text-lg leading-relaxed">
            Your dedicated care team is here for you 24/7. We provide clinical-grade support tailored to your unique health journey.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-mint/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teamMembers.map((member, i) => (
          <div 
            key={i} 
            className="bg-white p-8 rounded-[32px] border border-mint/20 shadow-sm hover:shadow-md transition-all flex flex-col h-full group"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-16 h-16 bg-mint/20 rounded-full flex items-center justify-center text-primary font-bold text-xl border-2 border-white shadow-sm group-hover:scale-110 transition-transform">
                {member.initials}
              </div>
              <div className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5",
                member.status === 'Available' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
              )}>
                {member.status === 'Available' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                {member.status}
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl font-bold text-text-dark mb-1">{member.name}</h3>
              <p className="text-primary font-semibold text-sm mb-4">{member.role}</p>
              <p className="text-muted-text text-sm leading-relaxed mb-6">
                {member.description}
              </p>
            </div>

            <button className="w-full bg-warm-white text-text-dark border border-mint/30 py-4 rounded-2xl font-bold hover:bg-primary hover:text-white hover:border-primary transition-all flex items-center justify-center gap-2 group/btn">
              <Mail size={18} className="group-hover/btn:scale-110 transition-transform" />
              Message {member.name.split(' ')[0]}
            </button>
          </div>
        ))}
      </div>

      {/* Support Section */}
      <div className="bg-mint/10 p-10 rounded-[40px] border border-primary/10 text-center">
        <div className="max-w-xl mx-auto">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary mx-auto mb-6 shadow-sm">
            <Users size={32} />
          </div>
          <h2 className="text-2xl font-bold text-text-dark mb-4">Need urgent assistance?</h2>
          <p className="text-muted-text mb-8">
            Our care coordinators are available for immediate support. If you're experiencing a medical emergency, please contact local emergency services.
          </p>
          <button className="bg-primary text-white px-10 py-4 rounded-full font-bold shadow-lg hover:opacity-90 transition-all">
            Contact Care Coordinator
          </button>
        </div>
      </div>
    </div>
  );
}
