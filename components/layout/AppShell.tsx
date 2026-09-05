'use client';

import { useState, type ReactNode } from 'react';
import { useGameStore } from '@/game/state/store';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { StartScreen } from './StartScreen';
import { HomePage } from './HomePage';
import { AccessGate, hasStoredAccess } from './AccessGate';
import { GameOverScreen } from './GameOverScreen';
import { DaySummaryModal } from './DaySummaryModal';
import { LifeEventModal } from './LifeEventModal';
import { Zap } from 'lucide-react';

type BootStage = 'homepage' | 'access-gate' | 'app';

export function AppShell({ children }: { children: ReactNode }) {
  const game = useGameStore((s) => s.game);
  const hasHydrated = useGameStore((s) => s.hasHydrated);
  const [stage, setStage] = useState<BootStage>('homepage');

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-cl-accent to-cl-accent-strong animate-pulse">
          <Zap size={22} className="text-white" fill="white" />
        </div>
      </div>
    );
  }

  if (stage === 'homepage') {
    return <HomePage onPlay={() => setStage(hasStoredAccess() ? 'app' : 'access-gate')} />;
  }

  if (stage === 'access-gate') {
    return <AccessGate onSuccess={() => setStage('app')} />;
  }

  if (!game) {
    return <StartScreen />;
  }

  if (game.gameOver.isOver) {
    return <GameOverScreen />;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 max-w-[1800px] w-full mx-auto">{children}</main>
      </div>
      <LifeEventModal />
      <DaySummaryModal />
    </div>
  );
}
