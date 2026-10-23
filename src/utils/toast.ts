import { haptics } from './haptics';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

type ToastListener = (toasts: ToastItem[]) => void;

class ToastManager {
  private toasts: ToastItem[] = [];
  private listeners: Set<ToastListener> = new Set();

  subscribe(listener: ToastListener) {
    this.listeners.add(listener);
    listener([...this.toasts]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener([...this.toasts]));
  }

  show(message: string, type: ToastType = 'info', duration: number = 3200) {
    if (!message || typeof message !== 'string') return;
    
    // Play subtle haptic feedback
    if (type === 'error') {
      haptics.error();
    } else if (type === 'success') {
      haptics.success();
    } else {
      haptics.light();
    }

    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastItem = { id, message, type, duration };
    
    // Keep max 3 toasts at a time to prevent screen flooding
    this.toasts = [...this.toasts.slice(-2), newToast];
    this.notify();

    setTimeout(() => {
      this.dismiss(id);
    }, duration);
  }

  dismiss(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }

  success(message: string, duration?: number) {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number) {
    this.show(message, 'error', duration);
  }

  warning(message: string, duration?: number) {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration?: number) {
    this.show(message, 'info', duration);
  }
}

export const toast = new ToastManager();

// Polyfill window.alert to prevent iframe security crashes and eliminate jarring browser alert modals
if (typeof window !== 'undefined') {
  window.alert = (message?: any) => {
    const text = typeof message === 'string' ? message : JSON.stringify(message || '');
    if (!text) return;
    if (text.toLowerCase().includes('lỗi') || text.toLowerCase().includes('thất bại') || text.toLowerCase().includes('không thể')) {
      toast.error(text);
    } else if (text.toLowerCase().includes('thành công') || text.toLowerCase().includes('đã lưu') || text.toLowerCase().includes('hoàn tất')) {
      toast.success(text);
    } else if (text.toLowerCase().includes('vui lòng') || text.toLowerCase().includes('cảnh báo')) {
      toast.warning(text);
    } else {
      toast.info(text);
    }
  };
}
