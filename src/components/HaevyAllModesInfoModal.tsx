import React from 'react';
import { EcosystemMode, ActiveTab } from '../types';
import { HaevyEcosystemQuickSwitcherModal } from './HaevyEcosystemQuickSwitcherModal';

export interface HaevyAllModesInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode?: EcosystemMode;
  onSelectMode?: (mode: EcosystemMode, initialTab?: ActiveTab) => void;
  onSelectDemoModal?: (demoKey: string) => void;
  onClaimGift?: () => void;
}

/**
 * HaevyAllModesInfoModal is now completely unified with HaevyEcosystemQuickSwitcherModal.
 * It provides a synchronized, comprehensive modal with both Quick and Detailed views.
 */
export function HaevyAllModesInfoModal({
  isOpen,
  onClose,
  currentMode,
  onSelectMode,
  onSelectDemoModal,
  onClaimGift,
}: HaevyAllModesInfoModalProps) {
  return (
    <HaevyEcosystemQuickSwitcherModal
      isOpen={isOpen}
      onClose={onClose}
      currentMode={currentMode}
      onSelectMode={onSelectMode}
      onSelectDemoModal={onSelectDemoModal}
      onClaimGift={onClaimGift}
      initialViewMode="detailed"
    />
  );
}

export default HaevyAllModesInfoModal;
