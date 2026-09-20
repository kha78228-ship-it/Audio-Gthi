import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { GiftCelebrationEffect } from '../types';
import { playGiftCelebrationSound, playGiftComboSound } from '../utils/giftSoundFX';
import { haptics } from '../utils/haptics';
import { HaevyGiftCelebrationOverlay } from '../components/gift/HaevyGiftCelebrationOverlay';

interface GiftEffectContextType {
  activeEffect: GiftCelebrationEffect | null;
  triggerGiftEffect: (payload: Partial<GiftCelebrationEffect> & {
    giftName: string;
    giftEmoji: string;
    recipientName: string;
  }) => void;
  dismissGiftEffect: () => void;
  isSoundEnabled: boolean;
  toggleSound: () => void;
}

const GiftEffectContext = createContext<GiftEffectContextType | undefined>(undefined);

export function GiftEffectProvider({ children }: { children: React.ReactNode }) {
  const [activeEffect, setActiveEffect] = useState<GiftCelebrationEffect | null>(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('haevy_gift_sound_enabled');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const queueRef = useRef<GiftCelebrationEffect[]>([]);
  const timerRef = useRef<any>(null);
  const lastGiftTimeRef = useRef<number>(0);
  const lastGiftKeyRef = useRef<string>('');
  const comboCountRef = useRef<number>(1);

  const toggleSound = useCallback(() => {
    setIsSoundEnabled(prev => {
      const next = !prev;
      try {
        localStorage.setItem('haevy_gift_sound_enabled', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const dismissGiftEffect = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setActiveEffect(null);

    // If there is another gift queued, display it after a small delay
    if (queueRef.current.length > 0) {
      const next = queueRef.current.shift()!;
      setTimeout(() => {
        displayGift(next);
      }, 150);
    }
  }, []);

  const displayGift = useCallback((effect: GiftCelebrationEffect) => {
    setActiveEffect(effect);

    // Audio SFX & Haptics
    if (isSoundEnabled) {
      if ((effect.comboCount || 1) > 1) {
        playGiftComboSound(effect.comboCount || 2);
      } else {
        playGiftCelebrationSound(effect.rarity || 'common');
      }
    }

    if (effect.rarity === 'legendary' || effect.rarity === 'epic') {
      haptics.rewardClaim();
    } else {
      haptics.success();
    }

    // Timer to auto dismiss: 4.5s for legendary/epic, 3.8s for others
    const duration = effect.rarity === 'legendary' ? 4600 : effect.rarity === 'epic' ? 4200 : 3800;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      dismissGiftEffect();
    }, duration);
  }, [isSoundEnabled, dismissGiftEffect]);

  const triggerGiftEffect = useCallback((payload: Partial<GiftCelebrationEffect> & {
    giftName: string;
    giftEmoji: string;
    recipientName: string;
  }) => {
    const now = Date.now();
    const giftKey = `${payload.giftId || payload.giftName}_${payload.recipientName}`;

    // Combo streak detection (within 5 seconds)
    let combo = 1;
    if (now - lastGiftTimeRef.current < 5000 && lastGiftKeyRef.current === giftKey) {
      comboCountRef.current += 1;
      combo = comboCountRef.current;
    } else {
      comboCountRef.current = 1;
      combo = 1;
    }
    lastGiftTimeRef.current = now;
    lastGiftKeyRef.current = giftKey;

    const fullEffect: GiftCelebrationEffect = {
      id: `gift_fx_${now}_${Math.random().toString(36).slice(2, 7)}`,
      giftId: payload.giftId || 'gift_custom',
      giftName: payload.giftName,
      giftEmoji: payload.giftEmoji,
      senderName: payload.senderName || 'Bạn',
      senderAvatar: payload.senderAvatar,
      recipientName: payload.recipientName,
      pointsCost: payload.pointsCost,
      rarity: payload.rarity || 'common',
      message: payload.message,
      trackTitle: payload.trackTitle,
      comboCount: payload.comboCount || combo,
      themeColor: payload.themeColor
    };

    if (activeEffect) {
      // If actively showing, and it's the exact same gift, update the current one with combo!
      if (activeEffect.giftName === fullEffect.giftName && activeEffect.recipientName === fullEffect.recipientName) {
        displayGift({
          ...fullEffect,
          comboCount: combo
        });
      } else {
        // Queue it
        queueRef.current.push(fullEffect);
      }
    } else {
      displayGift(fullEffect);
    }
  }, [activeEffect, displayGift]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <GiftEffectContext.Provider
      value={{
        activeEffect,
        triggerGiftEffect,
        dismissGiftEffect,
        isSoundEnabled,
        toggleSound
      }}
    >
      {children}
      <HaevyGiftCelebrationOverlay />
    </GiftEffectContext.Provider>
  );
}

export function useGiftEffect() {
  const ctx = useContext(GiftEffectContext);
  if (!ctx) {
    throw new Error('useGiftEffect must be used within a GiftEffectProvider');
  }
  return ctx;
}
