import { 
  Home, FileUp, Clock, Bot, Brain, 
  Headphones, Zap, Globe, Users, 
  Settings, HelpCircle, MessageSquare,
  BarChart2
} from 'lucide-react';

export const routes = {
  passenger: [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/file-complaint', icon: FileUp, label: 'File Complaint' },
    { path: '/track-status', icon: Clock, label: 'Track Status' },
    { path: '/ai-assistance', icon: Bot, label: 'AI Assistance' },
    { path: '/real-time-support', icon: Headphones, label: 'Real-time Support' },
    { path: '/multi-lingual', icon: Globe, label: 'Multi-lingual' },
    { path: '/help', icon: HelpCircle, label: 'Help' },
    { path: '/feedback-form', icon: MessageSquare, label: 'Feedback' },
    { path: '/settings', icon: Settings, label: 'Settings' },
    { path: '/profile', icon: Users, label: 'Profile' }
  ],
  admin: [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/dashboard', icon: BarChart2, label: 'Dashboard' },
    { path: '/smart-classification', icon: Brain, label: 'Smart Classification' },
    { path: '/real-time-support', icon: Headphones, label: 'Real-time Support' },
    { path: '/quick-resolution', icon: Zap, label: 'Quick Resolution' },
    { path: '/multi-lingual', icon: Globe, label: 'Multi-lingual' },
    { path: '/staff', icon: Users, label: 'Staff Management' },
    { path: '/settings', icon: Settings, label: 'Settings' },
    { path: '/profile', icon: Users, label: 'Profile' }
  ]
};
