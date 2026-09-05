import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { GameNotification } from '@/game/types';

const SEVERITY_CONFIG = {
  info: { icon: Info, color: 'text-cl-accent' },
  success: { icon: CheckCircle2, color: 'text-cl-positive' },
  warning: { icon: AlertTriangle, color: 'text-cl-warning' },
  urgent: { icon: XCircle, color: 'text-cl-negative' },
};

interface NotificationItemProps {
  notification: GameNotification;
  onClick?: () => void;
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const { icon: Icon, color } = SEVERITY_CONFIG[notification.severity];
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-start gap-3 px-4 py-3 text-left border-b border-cl-border last:border-0 hover:bg-white/[0.03] transition-colors',
        !notification.read && 'bg-cl-accent/[0.03]',
      )}
    >
      <Icon size={16} className={cn('shrink-0 mt-0.5', color)} />
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm', notification.read ? 'text-cl-text-secondary' : 'text-cl-text-primary font-medium')}>{notification.title}</p>
        <p className="text-xs text-cl-text-muted mt-0.5 line-clamp-2">{notification.message}</p>
      </div>
      {!notification.read && <span className="w-1.5 h-1.5 rounded-full bg-cl-accent shrink-0 mt-1.5" />}
    </button>
  );
}
