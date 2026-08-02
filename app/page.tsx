import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Rocket, Target, Brain, Zap, TrendingUp, Calendar, CheckCircle2, 
  ArrowRight, Star, Users, Clock, BarChart3, BookOpen, Lightbulb,
  Trophy, Sparkles, Shield, Infinity
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/30 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
          <div className="absolute top-0 -right-4 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="flex flex-col items-center text-center space-y-8 max-w-5xl mx-auto">
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-300 px-4 py-1.5 text-sm font-medium">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              AI-Powered Productivity Platform for Students
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-tight">
              <span className="block text-gray-900 dark:text-gray-100 mb-2">
                Achieve Your
              </span>
              <span className="block bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Lakshya
              </span>
              <span className="block text-gray-900 dark:text-gray-100 mt-2">
                With AI Guidance
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl leading-relaxed">
              From <strong className="text-gray-900 dark:text-gray-100">GATE preparation</strong> to <strong className="text-gray-900 dark:text-gray-100">dream placements</strong> - 
              get personalized AI roadmaps, smart task management, and achieve your goals faster.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/signup">
                <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-xl hover:shadow-2xl transition-all text-white">
                  Start Your Journey Free
                  <Rocket className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50">
                  See How It Works
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span>100% Free Forever</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span>AI-Powered Roadmaps</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span>All-in-One Platform</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-8 mt-20 max-w-5xl mx-auto">
            {[
              { icon: Users, value: '10K+', label: 'Active Students' },
              { icon: Target, value: '50K+', label: 'Goals Achieved' },
              { icon: Trophy, value: '95%', label: 'Success Rate' },
              { icon: Clock, value: '24/7', label: 'AI Support' },
            ].map((stat, i) => (
              <Card key={i} className="p-6 text-center border-emerald-100 hover:border-emerald-200 hover:shadow-lg transition-all">
                <stat.icon className="h-8 w-8 mx-auto mb-3 text-emerald-600" />
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-gradient-to-b from-white to-emerald-50/50 dark:from-gray-950 dark:to-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-emerald-100 text-emerald-700 mb-4">
              <Star className="w-3.5 h-3.5 mr-1.5" />
              Powerful Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Lakshya combines AI intelligence with productivity tools to help you achieve your goals efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: 'AI Roadmap Generator',
                description: 'Get personalized, step-by-step roadmaps powered by Google Gemini AI. From GATE to placements, we break down any goal into actionable milestones.',
                color: 'from-emerald-500 to-teal-500',
                bgColor: 'bg-emerald-50',
              },
              {
                icon: Target,
                title: 'Goal-Centric Dashboard',
                description: 'Your dashboard adapts to your selected goal. Whether it\'s exam prep or job hunting, see only what matters to you right now.',
                color: 'from-teal-500 to-cyan-500',
                bgColor: 'bg-teal-50',
              },
              {
                icon: CheckCircle2,
                title: 'Smart Task Management',
                description: 'Organize your tasks with priorities, tags, and deadlines. Track progress and never miss important milestones on your journey.',
                color: 'from-cyan-500 to-blue-500',
                bgColor: 'bg-cyan-50',
              },
              {
                icon: Calendar,
                title: 'Integrated Timetable',
                description: 'Schedule study sessions, classes, and deadlines in one place. Sync with your tasks and get reminders automatically.',
                color: 'from-blue-500 to-indigo-500',
                bgColor: 'bg-blue-50',
              },
              {
                icon: BookOpen,
                title: 'Notes & Documentation',
                description: 'Take notes during study sessions, document learnings, and link them to your tasks. Everything organized and searchable.',
                color: 'from-indigo-500 to-purple-500',
                bgColor: 'bg-indigo-50',
              },
              {
                icon: Clock,
                title: 'Pomodoro Timer',
                description: 'Stay focused with built-in Pomodoro timer. Track your focus time and build better study habits with analytics.',
                color: 'from-purple-500 to-pink-500',
                bgColor: 'bg-purple-50',
              },
              {
                icon: BarChart3,
                title: 'Progress Analytics',
                description: 'Visualize your progress with beautiful charts. See productivity patterns, identify bottlenecks, and optimize your workflow.',
                color: 'from-pink-500 to-rose-500',
                bgColor: 'bg-pink-50',
              },
              {
                icon: Lightbulb,
                title: 'Weekly AI Insights',
                description: 'Get personalized recommendations every week based on your activity. AI suggests what to focus on and how to improve.',
                color: 'from-rose-500 to-orange-500',
                bgColor: 'bg-rose-50',
              },
              {
                icon: Zap,
                title: 'All-in-One Platform',
                description: 'Replace 10 different apps with one unified platform. Everything you need for productivity in a single, beautiful interface.',
                color: 'from-orange-500 to-emerald-500',
                bgColor: 'bg-orange-50',
              },
            ].map((feature, i) => (
              <Card key={i} className="p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-gray-100 hover:border-emerald-200 group">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-teal-100 text-teal-700 mb-4">
              <Infinity className="w-3.5 h-3.5 mr-1.5" />
              Simple Process
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              How Lakshya Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Get started in minutes and achieve your goals with AI guidance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                step: '01',
                title: 'Choose Your Goal',
                description: 'Select from pre-configured templates like GATE, Placements, Startup, or create a custom goal. Tell us what you want to achieve.',
                icon: Target,
              },
              {
                step: '02',
                title: 'AI Generates Roadmap',
                description: 'Our AI analyzes your goal and creates a personalized roadmap with milestones, tasks, and timelines in seconds.',
                icon: Brain,
              },
              {
                step: '03',
                title: 'Execute & Achieve',
                description: 'Follow your roadmap, track progress, use Pomodoro timer, take notes, and get weekly AI recommendations to stay on track.',
                icon: TrendingUp,
              },
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-2xl font-bold mb-6 shadow-xl">
                    {step.step}
                  </div>
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                    <step.icon className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-emerald-300 to-teal-300 -translate-x-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Goals Templates */}
      <section id="goals" className="py-20 md:py-32 bg-gradient-to-b from-emerald-50/50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-emerald-100 text-emerald-700 mb-4">
              <Trophy className="w-3.5 h-3.5 mr-1.5" />
              Popular Goals
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Choose Your Path
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Select a goal template or create your own custom goal with AI assistance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { name: 'GATE 2025', emoji: '🎓', description: 'Complete preparation roadmap for GATE CS/EC/ME', users: '2.5K', color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-50' },
              { name: 'Campus Placements', emoji: '💼', description: 'DSA, projects, resume, and interview prep', users: '5.2K', color: 'from-purple-500 to-pink-500', bgColor: 'bg-purple-50' },
              { name: 'Startup Launch', emoji: '🚀', description: 'From idea validation to MVP launch', users: '1.8K', color: 'from-orange-500 to-red-500', bgColor: 'bg-orange-50' },
              { name: 'Higher Studies (MS/PhD)', emoji: '🎯', description: 'GRE, TOEFL, SOP, and university applications', users: '3.1K', color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-50' },
              { name: 'Skill Development', emoji: '💡', description: 'Learn new tech, languages, or frameworks', users: '4.7K', color: 'from-yellow-500 to-orange-500', bgColor: 'bg-yellow-50' },
              { name: 'Custom Goal', emoji: '✨', description: 'Create any goal with AI assistance', users: '∞', color: 'from-indigo-500 to-purple-500', bgColor: 'bg-indigo-50' },
            ].map((goal, i) => (
              <Card key={i} className="p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group border-2 border-gray-100 hover:border-emerald-200 relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${goal.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-5xl">{goal.emoji}</span>
                    <Badge variant="secondary" className="text-xs">
                      {goal.users} users
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{goal.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                    {goal.description}
                  </p>
                  <div className="flex items-center text-emerald-600 font-medium text-sm group-hover:gap-2 transition-all">
                    Get Started
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-emerald-100 text-emerald-700 mb-4">
              <Shield className="w-3.5 h-3.5 mr-1.5" />
              Simple Pricing
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Free Forever. Really.
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              We believe every student deserves access to powerful productivity tools without breaking the bank
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <Card className="p-12 border-2 border-emerald-200 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500 to-teal-500 opacity-10 rounded-bl-full" />
              <div className="relative">
                <Badge className="bg-emerald-600 text-white mb-6">Most Popular</Badge>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Free Plan</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-6xl font-bold text-gray-900 dark:text-gray-100">₹0</span>
                  <span className="text-gray-600 dark:text-gray-400">/forever</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {[
                    'Unlimited Goals & Tasks',
                    'AI Roadmap Generation',
                    'Smart Task Management',
                    'Integrated Timetable',
                    'Notes & Documentation',
                    'Pomodoro Timer',
                    'Progress Analytics',
                    'Weekly AI Insights',
                    'Mobile Responsive',
                    'Dark Mode',
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signup">
                  <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-6 text-lg">
                    Get Started Now
                    <Rocket className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Ready to Achieve Your Lakshya?
            </h2>
            <p className="text-xl md:text-2xl text-emerald-50 mb-10 leading-relaxed">
              Join thousands of students who are already achieving their goals with AI-powered guidance
            </p>
            <Link href="/signup">
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 shadow-2xl text-lg px-10 py-7">
                Start Your Free Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="text-emerald-100 mt-6">No credit card required • Free forever • Get started in 2 minutes</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
