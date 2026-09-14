import React from 'react';
import { ActiveTab, EcosystemMode } from '../types';
import { HaevyNotificationHub, HaevyNotificationHubProps } from './HaevyNotificationHub';

export interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: ActiveTab) => void;
  onSelectMode?: (mode: EcosystemMode, initialTab?: ActiveTab) => void;
  onOpenChatWithUser?: (uid: string) => void;
}

export type NotificationCategory = 
  | 'all' 
  | 'coins' 
  | 'audio' 
  | 'messages' 
  | 'couple' 
  | 'games' 
  | 'studio' 
  | 'system';

export interface EcosystemNotification {
  id: string;
  category: 'coins' | 'audio' | 'messages' | 'couple' | 'games' | 'studio' | 'system';
  ecosystemTitle: string;
  title: string;
  message: string;
  amount?: number;
  createdAt: any;
  isRead: boolean;
  iconType: string;
  badge?: string;
  badgeColor?: string;
  targetMode?: EcosystemMode;
  targetTab?: ActiveTab;
  actionText?: string;
  actionData?: any;
  senderPhoto?: string;
  senderName?: string;
}

/**
 * Persistent Haevy Notification Hub Wrapper
 * Fetches and displays real-time user-specific updates from Firestore:
 * - System Announcements
 * - Friend Activity & Requests
 * - Personalized Finance & Xu Alerts
 * - Family Tree & Lịch Giỗ Alerts
 */
export function NotificationsModal(props: NotificationsModalProps) {
  if (!props.isOpen) return null;

  return (
    <HaevyNotificationHub
      isOpen={props.isOpen}
      onClose={props.onClose}
      onSelectTab={props.onSelectTab}
      onSelectMode={props.onSelectMode}
      onOpenChatWithUser={props.onOpenChatWithUser}
    />
  );
}

export { HaevyNotificationHub };
