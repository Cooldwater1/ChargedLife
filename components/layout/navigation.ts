import type { LucideIcon } from 'lucide-react';
import {
  Award, BarChart3, BookOpen, Briefcase, Building2, Car, GraduationCap, Handshake, Heart,
  History, LayoutDashboard, Landmark, Layers, Plane, Settings, Ship, Sparkles, TrendingUp, User, Gem,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Life',
    items: [
      { href: '/', label: 'Overview', icon: LayoutDashboard },
      { href: '/profile', label: 'Profile', icon: User },
      { href: '/family', label: 'Family', icon: Heart },
      { href: '/education', label: 'Education', icon: GraduationCap },
      { href: '/career', label: 'Career', icon: Briefcase },
    ],
  },
  {
    label: 'Empire',
    items: [
      { href: '/businesses', label: 'Businesses', icon: Building2 },
      { href: '/holdings', label: 'Holdings', icon: Layers },
      { href: '/acquisitions', label: 'Acquisitions', icon: Handshake },
      { href: '/properties', label: 'Properties', icon: Landmark },
      { href: '/investments', label: 'Investments', icon: TrendingUp },
      { href: '/bank', label: 'Bank', icon: Landmark },
    ],
  },
  {
    label: 'Assets',
    items: [
      { href: '/lifestyle', label: 'Lifestyle', icon: Sparkles },
      { href: '/vehicles', label: 'Vehicles', icon: Car },
      { href: '/boats', label: 'Boats', icon: Ship },
      { href: '/aircraft', label: 'Aircraft', icon: Plane },
      { href: '/collection', label: 'Collection', icon: Gem },
    ],
  },
  {
    label: 'Progress',
    items: [
      { href: '/achievements', label: 'Achievements', icon: Award },
      { href: '/statistics', label: 'Statistics', icon: BarChart3 },
      { href: '/timeline', label: 'Timeline', icon: History },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/guide', label: 'Game Guide', icon: BookOpen },
      { href: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];
