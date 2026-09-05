'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/cn';
import { NAV_SECTIONS } from './navigation';
import { GAME_VERSION } from '@/game/constants/balance';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 flex flex-col border-r border-cl-border bg-cl-bg-elevated/60 backdrop-blur-xl">
      <div className="flex items-center gap-2.5 px-5 h-16 shrink-0 border-b border-cl-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cl-accent to-cl-accent-strong shadow-[0_0_16px_-2px_var(--cl-accent-glow)]">
          <Zap size={17} className="text-white" fill="white" />
        </div>
        <div>
          <p className="text-sm font-bold text-cl-text-primary leading-none tracking-tight">ChargedLife</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto cl-scrollbar-thin py-4 px-3 space-y-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-cl-text-muted">{section.label}</p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-cl-accent/10 text-cl-accent border border-cl-accent/20'
                        : 'text-cl-text-secondary hover:text-cl-text-primary hover:bg-white/[0.04] border border-transparent',
                    )}
                  >
                    <Icon size={16} strokeWidth={2} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-5 py-3.5 border-t border-cl-border shrink-0">
        <p className="text-[10px] text-cl-text-muted tracking-wide">{GAME_VERSION}</p>
      </div>
    </aside>
  );
}
