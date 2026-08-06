export interface SelectionItem {
  id: string;
  type: string;
  data?: any;
}

export type SelectionListener = (selection: SelectionItem | null) => void;

export class SelectionEngine {
  private stack: SelectionItem[] = [];
  private listeners: SelectionListener[] = [];

  select(item: SelectionItem) {
    this.stack.push(item);
    this.notify();
  }

  back() {
    if (this.stack.length > 0) {
      this.stack.pop();
      this.notify();
    }
  }

  clear() {
    this.stack = [];
    this.notify();
  }

  getCurrent(): SelectionItem | null {
    return this.stack.length > 0 ? this.stack[this.stack.length - 1] : null;
  }
  
  getStack(): SelectionItem[] {
      return [...this.stack];
  }

  subscribe(listener: SelectionListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    const current = this.getCurrent();
    this.listeners.forEach(l => l(current));
  }
}
