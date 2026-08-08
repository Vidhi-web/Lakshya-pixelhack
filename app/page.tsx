'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Rocket, Target, Brain, Zap, TrendingUp, Calendar, CheckCircle2, 
  ArrowRight, Star, Trophy, Sparkles, Map, Flame, BookOpen, 
  Clock, Award, Users, ChevronDown
} from 'lucide-react';

const features = [
  { icon: Brain, title: 'AI Personalized Roadmap', desc: 'Exams, Placements, Startup MVP, or Skill Mastery — AI breaks any goal into daily achievable missions tailored to you.', span: 'md:col-span-2', size: 'large' },
  { icon: Zap, title: 'Gamified Learning', desc: 'XP, levels, streaks & rewards that keep you coming back.', span: '', size: 'small' },
  { icon: Target, title: 'AI Mentor — Saathi', desc: 'Your 24/7 AI companion that motivates, guides and adapts.', span: '', size: 'small' },
  { icon: TrendingUp, title: 'Smart Analytics', desc: 'Real-time readiness score, dream meter & AI insights on your progress.', span: '', size: 'small' },
  { icon: Clock, title: 'Focus Pomodoro', desc: 'Deep work sessions with ambient sounds & distraction-free mode.', span: '', size: 'small' },
  { icon: Map, title: 'Adaptive Planning', desc: 'Missed a day? AI auto-reschedules. Ahead of schedule? AI accelerates.', span: 'md:col-span-2', size: 'large' },
  { icon: Award, title: 'Streak System', desc: "Day-count badges, flame streaks, comeback mode — never feel guilty for pausing.", span: '', size: 'small' },
  { icon: Trophy, title: 'Rewards & Titles', desc: 'Earn badges, coins and titles: Consistency King, Revision Ninja, Focus Master.', span: '', size: 'small' },
  { icon: Calendar, title: 'Academic & Life Balance', desc: 'Auto-detects your college or work schedule and balances your goal workload intelligently.', span: 'md:col-span-2', size: 'large' },
];

const roadmapNodes = [
  { id: 1, title: 'Foundation', subtitle: 'Week 1-2', status: 'completed', x: 15, y: 75 },
  { id: 2, title: 'Core Skills', subtitle: 'Week 3-5', status: 'completed', x: 32, y: 30 },
  { id: 3, title: 'Practice Arena', subtitle: 'Week 6-8', status: 'active', x: 52, y: 65 },
  { id: 4, title: 'Boss Battle', subtitle: 'Week 9', status: 'locked', x: 70, y: 25 },
  { id: 5, title: 'Exam Master', subtitle: 'Week 10+', status: 'locked', x: 85, y: 62 },
];

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: 'var(--theme-background)' }}>
      
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)' }}>
              <Target className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold" style={{ color: 'var(--theme-accent)' }}>Lakshya</span>
            <span className="text-xs opacity-40" style={{ color: 'var(--theme-neutral-light)' }}>लक्ष्य</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold px-4 py-2 rounded-xl" style={{ color: 'var(--theme-neutral-light)', opacity: 0.7 }}>Sign In</Link>
            <Link href="/signup" className="text-sm font-bold px-5 py-2.5 rounded-xl text-white hover:scale-105 transition-transform inline-block" style={{ background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)' }}>Get Started</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <motion.div className="absolute top-20 -left-20 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: 'var(--theme-primary)' }}
            animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }} transition={{ duration: 8, repeat: Infinity }} />
          <motion.div className="absolute bottom-20 -right-20 w-80 h-80 rounded-full blur-3xl opacity-15" style={{ background: 'var(--theme-accent)' }}
            animate={{ scale: [1, 1.3, 1], y: [0, -40, 0] }} transition={{ duration: 10, repeat: Infinity, delay: 2 }} />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* LEFT: Headline + CTA */}
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="space-y-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border"
                style={{ borderColor: 'var(--theme-accent)', color: 'var(--theme-accent)', background: 'rgba(249,177,122,0.1)' }}
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-semibold">AI-Powered Goal Achievement Platform</span>
              </motion.div>

              <div className="space-y-2">
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="font-bold leading-tight" style={{ color: 'var(--theme-neutral-light)', fontSize: 'clamp(2.2rem, 5vw, 4rem)' }}>
                  Your Dream Career
                </motion.h1>
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="font-bold leading-tight" style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)' }}>
                  <span style={{ background: 'linear-gradient(135deg, var(--theme-accent) 0%, var(--theme-primary-alt) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    Starts With Today\'s Mission
                  </span>
                </motion.h1>
              </div>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="text-lg lg:text-xl leading-relaxed max-w-lg" style={{ color: 'var(--theme-neutral-light)', opacity: 0.75 }}>
                An AI mentor that{' '}
                <strong style={{ color: 'var(--theme-accent)' }}>plans</strong>,{' '}
                <strong style={{ color: 'var(--theme-accent)' }}>motivates</strong>,{' '}
                <strong style={{ color: 'var(--theme-accent)' }}>tracks</strong>, and{' '}
                <strong style={{ color: 'var(--theme-accent)' }}>adapts</strong>{' '}
                your entire learning journey.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 text-base font-bold px-8 py-4 rounded-2xl text-white w-full sm:w-auto justify-center"
                    style={{ background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)' }}>
                    Start Your Journey <Rocket className="w-5 h-5" />
                  </motion.button>
                </Link>
                <Link href="/login">
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 text-base font-bold px-8 py-4 rounded-2xl border-2 w-full sm:w-auto justify-center"
                    style={{ borderColor: 'var(--theme-accent)', color: 'var(--theme-accent)', background: 'transparent' }}>
                    Sign In <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="flex flex-wrap gap-5">
                {['Free Forever', 'No Credit Card', 'AI-Powered', 'Made for India'].map((badge) => (
                  <div key={badge} className="flex items-center gap-2 text-sm" style={{ color: 'var(--theme-neutral-light)', opacity: 0.55 }}>
                    <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--theme-accent)' }} />
                    {badge}
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* RIGHT: Animated Game Map Preview */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
              className="relative h-[480px] lg:h-[560px]">
              <div className="absolute inset-0 glass-card p-6 overflow-hidden" style={{ borderColor: 'rgba(249,177,122,0.25)', borderWidth: '1px' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Map className="w-5 h-5" style={{ color: 'var(--theme-accent)' }} />
                    <span className="text-sm font-bold" style={{ color: 'var(--theme-accent)' }}>Your AI Goal Roadmap</span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(249,177,122,0.15)', color: 'var(--theme-accent)' }}>Level 3/6</span>
                </div>

                <svg className="w-full" viewBox="0 0 400 300" style={{ height: '280px' }}>
                  <motion.path
                    d="M 60 220 C 90 220 90 100 120 100 C 150 100 150 190 200 190 C 250 190 250 80 268 80 C 286 80 286 175 332 175"
                    fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="3" strokeDasharray="8 4" />
                  <motion.path
                    d="M 60 220 C 90 220 90 100 120 100 C 150 100 150 190 200 190"
                    fill="none" stroke="var(--theme-accent)" strokeWidth="3" strokeLinecap="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 0.5 }} />
                  {roadmapNodes.map((node, i) => {
                    const cx = (node.x / 100) * 380 + 10;
                    const cy = (node.y / 100) * 260 + 20;
                    const isCompleted = node.status === 'completed';
                    const isActive = node.status === 'active';
                    const isLocked = node.status === 'locked';
                    return (
                      <motion.g key={node.id} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5 + i * 0.3, type: 'spring' }}>
                        {isActive && (
                          <motion.circle cx={cx} cy={cy} r="28" fill="none" stroke="var(--theme-accent)" strokeWidth="2" opacity={0.4}
                            animate={{ r: [24, 34, 24], opacity: [0.4, 0, 0.4] }} transition={{ duration: 2, repeat: Infinity }} />
                        )}
                        <circle cx={cx} cy={cy} r="20"
                          fill={isCompleted ? 'var(--theme-accent)' : isActive ? 'var(--theme-primary-alt)' : 'rgba(255,255,255,0.05)'}
                          stroke={isCompleted || isActive ? 'var(--theme-accent)' : 'rgba(255,255,255,0.15)'} strokeWidth="2" />
                        {isCompleted && <text x={cx} y={cy + 5} textAnchor="middle" fontSize="14" fill="white">✓</text>}
                        {isActive && <text x={cx} y={cy + 5} textAnchor="middle" fontSize="14" fill="white">🔥</text>}
                        {isLocked && <text x={cx} y={cy + 5} textAnchor="middle" fontSize="12" fill="rgba(255,255,255,0.25)">🔒</text>}
                        <text x={cx} y={cy + 35} textAnchor="middle" fontSize="10" fontWeight="600" fill={isLocked ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.85)'} fontFamily="Raleway, sans-serif">{node.title}</text>
                        <text x={cx} y={cy + 48} textAnchor="middle" fontSize="8" fill={isLocked ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.45)'} fontFamily="Raleway, sans-serif">{node.subtitle}</text>
                      </motion.g>
                    );
                  })}
                </svg>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Flame className="w-4 h-4" style={{ color: 'var(--theme-accent)' }} />
                      <span className="text-xs font-bold" style={{ color: 'var(--theme-accent)' }}>14 day streak</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4" style={{ color: 'var(--theme-secondary)' }} />
                      <span className="text-xs font-bold" style={{ color: 'var(--theme-secondary)' }}>1,450 XP</span>
                    </div>
                  </div>
                  <motion.div className="text-xs px-3 py-1.5 rounded-full font-bold"
                    style={{ background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)', color: 'white' }}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>
                    <Star className="w-3 h-3 inline mr-1" />AI generates this in 10s
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div className="flex flex-col items-center mt-16 pb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
            <span className="text-xs mb-2" style={{ color: 'var(--theme-neutral-light)', opacity: 0.4 }}>Scroll to explore</span>
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <ChevronDown className="w-5 h-5" style={{ color: 'var(--theme-neutral-light)', opacity: 0.4 }} />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FEATURE BENTO GRID */}
      <section className="py-24 md:py-32" style={{ background: 'var(--theme-background-alt)' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-4"
              style={{ borderColor: 'var(--theme-accent)', color: 'var(--theme-accent)', background: 'rgba(249,177,122,0.1)' }}>
              <Trophy className="w-4 h-4" />
              <span className="text-sm font-semibold">Everything You Need to Win</span>
            </motion.div>
            <h2 className="font-bold mb-4" style={{ color: 'var(--theme-neutral-light)' }}>One Platform, Infinite Possibilities</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--theme-neutral-light)', opacity: 0.6 }}>Built specifically for Indian students preparing for GATE, Placements, UPSC, NEET, CAT and more.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }} transition={{ delay: i * 0.08 }} whileHover={{ y: -6, scale: 1.02 }}
                  className={`glass-card p-7 group cursor-default ${feature.span}`}
                  style={{ borderColor: 'rgba(103,111,157,0.15)' }}>
                  <div className={`rounded-2xl flex items-center justify-center shadow-lg mb-5 group-hover:scale-110 transition-transform ${feature.size === 'large' ? 'w-16 h-16' : 'w-12 h-12'}`}
                    style={{ background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)' }}>
                    <Icon className={feature.size === 'large' ? 'w-8 h-8 text-white' : 'w-6 h-6 text-white'} />
                  </div>
                  <h3 className={`font-bold mb-2 ${feature.size === 'large' ? 'text-xl' : 'text-lg'}`} style={{ color: 'var(--theme-accent)' }}>{feature.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--theme-neutral-light)', opacity: 0.65 }}>{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-20" style={{ background: 'var(--theme-background)' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[{ value: '10,000+', label: 'Students', icon: Users }, { value: '95%', label: 'Goal Completion', icon: Target }, { value: '2M+', label: 'Study Hours', icon: Clock }, { value: '500+', label: 'Roadmaps', icon: Map }].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="space-y-2">
                  <Icon className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--theme-accent)' }} />
                  <div className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--theme-accent)' }}>{stat.value}</div>
                  <div className="text-sm" style={{ color: 'var(--theme-neutral-light)', opacity: 0.6 }}>{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24" style={{ background: 'var(--theme-background-alt)' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mx-auto">
            <h2 className="font-bold mb-6" style={{ color: 'var(--theme-neutral-light)' }}>Ready to Turn Your Dream into a Daily Mission?</h2>
            <p className="text-lg mb-10" style={{ color: 'var(--theme-neutral-light)', opacity: 0.65 }}>Join thousands of Indian students using Lakshya to crack their dream exam.</p>
            <Link href="/signup">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-3 text-lg font-bold px-10 py-5 rounded-2xl text-white"
                style={{ background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)' }}>
                <Sparkles className="w-5 h-5" />Start Your Journey — Free<Rocket className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 border-t" style={{ borderColor: 'rgba(103,111,157,0.15)', background: 'var(--theme-background)' }}>
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Target className="w-5 h-5" style={{ color: 'var(--theme-accent)' }} />
            <span className="font-bold text-lg" style={{ color: 'var(--theme-accent)' }}>Lakshya</span>
            <span className="text-sm opacity-40" style={{ color: 'var(--theme-neutral-light)' }}>लक्ष्य</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--theme-neutral-light)', opacity: 0.4 }}>Made with ❤️ for Indian students. Small progress beats no progress.</p>
        </div>
      </footer>
    </div>
  );
}
