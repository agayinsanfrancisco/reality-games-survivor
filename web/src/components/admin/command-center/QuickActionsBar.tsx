import { Link } from 'react-router-dom';
import {
  LayoutGrid,
  Trophy,
  Users,
  FileText,
  Bell,
  BarChart3,
  Calendar,
  Palmtree,
  Mail,
  Briefcase,
  Activity,
  Sparkles,
  ExternalLink,
  HelpCircle,
  MessageSquare,
} from 'lucide-react';

interface QuickLink {
  path: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  external?: boolean;
}

const quickLinks: QuickLink[] = [
  {
    path: '/admin/scoring',
    label: 'Episode Scoring',
    icon: <Trophy className="h-5 w-5" />,
    description: 'Enter scores',
  },
  {
    path: '/admin/leagues',
    label: 'Leagues',
    icon: <Users className="h-5 w-5" />,
    description: 'Manage leagues',
  },
  {
    path: '/admin/content',
    label: 'CMS',
    icon: <FileText className="h-5 w-5" />,
    description: 'Edit content',
  },
  {
    path: '/admin/announcements',
    label: 'Announcements',
    icon: <Bell className="h-5 w-5" />,
    description: 'Send blasts',
  },
  {
    path: '/admin/stats',
    label: 'Analytics',
    icon: <BarChart3 className="h-5 w-5" />,
    description: 'View metrics',
  },
  {
    path: '/admin/seasons',
    label: 'Seasons',
    icon: <Calendar className="h-5 w-5" />,
    description: 'Season settings',
  },
  {
    path: '/admin/castaways',
    label: 'Castaways',
    icon: <Palmtree className="h-5 w-5" />,
    description: 'Manage cast',
  },
  {
    path: '/admin/email-queue',
    label: 'Email Queue',
    icon: <Mail className="h-5 w-5" />,
    description: 'Email status',
  },
  {
    path: '/admin/jobs',
    label: 'Jobs',
    icon: <Briefcase className="h-5 w-5" />,
    description: 'Scheduled tasks',
  },
  {
    path: '/admin/fun-stats',
    label: 'Fun Stats',
    icon: <Sparkles className="h-5 w-5" />,
    description: 'Player insights',
  },
  {
    path: '/admin/faq',
    label: 'FAQ',
    icon: <HelpCircle className="h-5 w-5" />,
    description: 'Manage FAQs',
  },
  {
    path: '/admin/campaigns',
    label: 'Campaigns',
    icon: <MessageSquare className="h-5 w-5" />,
    description: 'SMS & Email',
  },
];

const externalLinks: QuickLink[] = [
  {
    path: 'https://supabase.com/dashboard/project/qxrgejdfxcvsfktgysop',
    label: 'Supabase',
    icon: <LayoutGrid className="h-5 w-5" />,
    description: 'Database',
    external: true,
  },
  {
    path: 'https://railway.app',
    label: 'Railway',
    icon: <Activity className="h-5 w-5" />,
    description: 'Deployments',
    external: true,
  },
];

export function QuickActionsBar() {
  return (
    <div className="bg-neutral-800 rounded-xl p-4 border border-neutral-700">
      <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">
        Quick Links
      </h3>

      {/* Admin Links Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {quickLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className="flex flex-col items-center justify-center p-3 rounded-lg bg-neutral-700/50 hover:bg-neutral-700 transition-colors group"
          >
            <div className="text-neutral-400 group-hover:text-orange-400 transition-colors mb-1">
              {link.icon}
            </div>
            <span className="text-xs font-medium text-white text-center">{link.label}</span>
            <span className="text-[10px] text-neutral-500 text-center">{link.description}</span>
          </Link>
        ))}
      </div>

      {/* External Links */}
      <div className="mt-4 pt-3 border-t border-neutral-700">
        <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
          External Tools
        </h4>
        <div className="flex flex-wrap gap-2">
          {externalLinks.map((link) => (
            <a
              key={link.path}
              href={link.path}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-700/50 hover:bg-neutral-700 transition-colors text-sm text-neutral-300 hover:text-white"
            >
              {link.icon}
              <span>{link.label}</span>
              <ExternalLink className="h-3 w-3 text-neutral-500" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
