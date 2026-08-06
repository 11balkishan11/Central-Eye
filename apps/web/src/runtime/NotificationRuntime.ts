export interface Notification {
  id: string;
  title: string;
  message?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timeout?: number;
}

export type NotificationListener = (notifications: Notification[]) => void;

export class NotificationRuntime {
  private notifications: Notification[] = [];
  private listeners: NotificationListener[] = [];

  notify(notification: Omit<Notification, 'id'>) {
    const id = Math.random().toString(36).substring(2, 9);
    const fullNotification = { ...notification, id };
    this.notifications.push(fullNotification);
    this.emit();

    const timeout = notification.timeout || 5000;
    if (timeout > 0) {
      setTimeout(() => this.dismiss(id), timeout);
    }
  }

  dismiss(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.emit();
  }

  subscribe(listener: NotificationListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private emit() {
    this.listeners.forEach(l => l([...this.notifications]));
  }
}
