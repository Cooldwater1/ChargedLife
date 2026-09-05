'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck } from 'lucide-react';
import { useGameStore } from '@/game/state/store';
import { cn } from '@/lib/cn';
import { NotificationItem } from './NotificationItem';

const PAGE_ROUTES: Record<string, string> = {
  overview: '/',
  career: '/career',
  businesses: '/businesses',
  bank: '/bank',
  properties: '/properties',
  achievements: '/achievements',
  statistics: '/statistics',
  settings: '/settings',
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const notifications = useGameStore((s) => s.game?.notifications ?? []);
  const markRead = useGameStore((s) => s.markNotificationRead);
  const markAllRead = useGameStore((s) => s.markAllNotificationsRead);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const sorted = [...notifications].sort((a, b) => b.timestamp - a.timestamp).slice(0, 30);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'relative flex items-center justify-center w-9 h-9 rounded-lg transition-colors',
          open ? 'bg-white/[0.08] text-cl-text-primary' : 'text-cl-text-secondary hover:text-cl-text-primary hover:bg-white/[0.05]',
        )}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-cl-negative text-white text-[10px] font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 cl-panel cl-animate-in !p-0 overflow-hidden z-40" style={{ background: 'rgba(14,22,40,0.98)' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-cl-border">
            <p className="text-sm font-semibold text-cl-text-primary">Notifications</p>
            {unreadCount > 0 && (
              <button onClick={() => markAllRead()} className="flex items-center gap-1 text-xs text-cl-text-secondary hover:text-cl-accent transition-colors">
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto cl-scrollbar-thin">
            {sorted.length === 0 ? (
              <p className="text-sm text-cl-text-muted text-center py-8">No notifications yet.</p>
            ) : (
              sorted.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onClick={() => {
                    markRead(n.id);
                    setOpen(false);
                    if (n.link) {
                      const base = PAGE_ROUTES[n.link.page] ?? '/';
                      router.push(n.link.businessId ? `/businesses/${n.link.businessId}` : base);
                    }
                  }}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
