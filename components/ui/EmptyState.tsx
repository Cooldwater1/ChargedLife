import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      {icon && <div className="text-cl-text-muted mb-4 opacity-70">{icon}</div>}
      <h3 className="text-base font-semibold text-cl-text-primary mb-1.5">{title}</h3>
      <p className="text-sm text-cl-text-secondary max-w-sm mb-5">{description}</p>
      {action}
    </div>
  );
}
