import { Users, Target, Mail, Zap, BarChart3, Clock, Lock, Bolt, Check, Eye, TrendingUp, Activity, Sparkles } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: Users,
      title: 'Contact Management',
      description: 'Advanced contact database with CSV import, validation, and deduplication',
      status: 'Active'
    },
    {
      icon: Target,
      title: 'Smart Segmentation',
      description: 'Dynamic audience segmentation based on multiple criteria and behaviors',
      status: 'Active'
    },
    {
      icon: Mail,
      title: 'Email Campaign Builder',
      description: 'Rich HTML email editor with personalization and template library',
      status: 'Active'
    },
    {
      icon: Zap,
      title: 'Automated Delivery',
      description: 'Professional email delivery via Brevo API with 99.9% uptime',
      status: 'Active'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reporting',
      description: 'Comprehensive campaign analytics with delivery and engagement metrics',
      status: 'Active'
    },
    {
      icon: Clock,
      title: 'Campaign Scheduling',
      description: 'Advanced scheduling system with cron-based automation',
      status: 'Active'
    },
    {
      icon: Lock,
      title: 'Enterprise Security',
      description: 'API-key authentication and secure data handling',
      status: 'Active'
    },
    {
      icon: Bolt,
      title: 'Real-time Processing',
      description: 'Instant campaign deployment with background job processing',
      status: 'Active'
    },
    {
      icon: Eye,
      title: 'Email Tracking & Analytics',
      description: 'Pixel-based open tracking and click-through monitoring with detailed metrics',
      status: 'Active'
    },
    {
      icon: BarChart3,
      title: 'Campaign Performance Dashboard',
      description: 'Comprehensive analytics dashboard with campaign stats, engagement rates, and top links',
      status: 'Active'
    },
    {
      icon: Activity,
      title: 'Recipient Engagement Viewer',
      description: 'Track individual recipient behavior with engagement levels and interaction history',
      status: 'Active'
    },
    {
      icon: TrendingUp,
      title: 'Real-Time Dashboard',
      description: 'Live analytics dashboard showing contact growth, segments, campaigns, and delivery metrics',
      status: 'Active'
    },
    {
      icon: Sparkles,
      title: 'AI Email Composition',
      description: 'Intelligent email content generation powered by AI for faster campaign creation',
      status: 'Active'
    }
  ];

  return (
    <div className="ml-0 h-screen w-screen bg-zinc-950 overflow-x-auto">
      <div className="ml-64 h-screen overflow-y-auto flex flex-col gap-8 px-6 py-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white m-0 mb-2">Platform Features</h1>
          <p className="text-zinc-400 text-base m-0">Enterprise-grade email marketing capabilities</p>
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 shadow-xl hover:border-lime-500/50 transition-all duration-300 flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-lime-500/20 p-3 rounded-lg flex-shrink-0">
                    <IconComponent className="w-6 h-6 text-lime-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white m-0">{feature.title}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <Check className="w-3 h-3 text-lime-400" />
                      <span className="text-xs font-semibold text-lime-400 uppercase">{feature.status}</span>
                    </div>
                  </div>
                </div>
                <p className="text-zinc-400 text-sm m-0 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}