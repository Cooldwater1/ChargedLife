'use client';

import { useState } from 'react';
import { Gift, HandHeart, Heart, UserX } from 'lucide-react';
import { useGameStore } from '@/game/state/store';
import { formatMoney } from '@/lib/format';
import { GameModal } from '@/components/ui/GameModal';
import { GameButton } from '@/components/ui/GameButton';
import { cn } from '@/lib/cn';
import type { GiftableAssetType, GiftRecipient } from '@/game/types';

interface GiftAssetModalProps {
  open: boolean;
  onClose: () => void;
  assetType: GiftableAssetType;
  assetId: string;
  assetName: string;
  assetValue: number;
}

type RecipientChoice = 'family' | 'charity' | 'stranger';

export function GiftAssetModal({ open, onClose, assetType, assetId, assetName, assetValue }: GiftAssetModalProps) {
  const family = useGameStore((s) => s.game?.player.family ?? []);
  const giftAsset = useGameStore((s) => s.giftAsset);

  const [choice, setChoice] = useState<RecipientChoice>('family');
  const [memberId, setMemberId] = useState<string>('');
  const [done, setDone] = useState<string | null>(null);

  const livingFamily = family.filter((f) => !f.deceased);

  const handleConfirm = () => {
    let recipient: GiftRecipient;
    let recipientLabel: string;
    if (choice === 'family') {
      if (!memberId) return;
      recipient = { kind: 'family', memberId };
      recipientLabel = livingFamily.find((f) => f.id === memberId)?.name ?? 'your family member';
    } else if (choice === 'charity') {
      recipient = { kind: 'charity' };
      recipientLabel = 'charity';
    } else {
      recipient = { kind: 'stranger' };
      recipientLabel = 'a stranger';
    }
    giftAsset(assetType, assetId, recipient);
    setDone(recipientLabel);
  };

  const handleClose = () => {
    setDone(null);
    setChoice('family');
    setMemberId('');
    onClose();
  };

  return (
    <GameModal open={open} onClose={handleClose} title={`Gift ${assetName}`} subtitle={`Worth ${formatMoney(assetValue, { abbreviate: true })} — ownership transfers permanently`}>
      {done ? (
        <div className="text-center py-6">
          <Gift size={32} className="text-cl-gold mx-auto mb-3" />
          <p className="text-sm text-cl-text-primary font-medium mb-1">Gift Given</p>
          <p className="text-xs text-cl-text-muted mb-6">You gave {assetName} to {done}.</p>
          <GameButton fullWidth onClick={handleClose}>Done</GameButton>
        </div>
      ) : (
        <>
          <p className="text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-3">Recipient</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <button
              onClick={() => setChoice('family')}
              className={cn('flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition-colors', choice === 'family' ? 'border-cl-accent bg-cl-accent/10 text-cl-accent' : 'border-cl-border-strong text-cl-text-secondary')}
            >
              <Heart size={16} /> Family
            </button>
            <button
              onClick={() => setChoice('charity')}
              className={cn('flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition-colors', choice === 'charity' ? 'border-cl-accent bg-cl-accent/10 text-cl-accent' : 'border-cl-border-strong text-cl-text-secondary')}
            >
              <HandHeart size={16} /> Charity
            </button>
            <button
              onClick={() => setChoice('stranger')}
              className={cn('flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition-colors', choice === 'stranger' ? 'border-cl-accent bg-cl-accent/10 text-cl-accent' : 'border-cl-border-strong text-cl-text-secondary')}
            >
              <UserX size={16} /> Stranger
            </button>
          </div>

          {choice === 'family' && (
            livingFamily.length === 0 ? (
              <p className="text-xs text-cl-text-muted mb-4">You have no living family members to gift this to.</p>
            ) : (
              <div className="space-y-2 mb-4 max-h-56 overflow-y-auto cl-scrollbar-thin">
                {livingFamily.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setMemberId(f.id)}
                    className={cn('w-full flex items-center justify-between rounded-lg border p-3 text-left transition-colors', memberId === f.id ? 'border-cl-accent bg-cl-accent/10' : 'border-cl-border-strong hover:bg-white/[0.03]')}
                  >
                    <div>
                      <p className="text-sm font-medium text-cl-text-primary">{f.name}</p>
                      <p className="text-xs text-cl-text-muted capitalize">{f.role} · Relationship {f.relationship}/100</p>
                    </div>
                  </button>
                ))}
              </div>
            )
          )}
          {choice === 'charity' && <p className="text-xs text-cl-text-muted mb-4">The asset is donated outright — no cash returns to you, but it counts toward your charitable giving.</p>}
          {choice === 'stranger' && <p className="text-xs text-cl-text-muted mb-4">A rare, memorable act — you&apos;ll never see it or its value again.</p>}

          <GameButton
            fullWidth
            disabledReason={choice === 'family' && (!memberId || livingFamily.length === 0) ? 'Choose a family member' : undefined}
            onClick={handleConfirm}
          >
            Confirm Gift
          </GameButton>
        </>
      )}
    </GameModal>
  );
}
