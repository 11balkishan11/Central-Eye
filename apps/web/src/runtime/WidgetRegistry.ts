import type { WidgetConfig } from './FeatureRegistry';

export class WidgetRegistry {
  private widgets: Map<string, WidgetConfig> = new Map();

  register(widget: WidgetConfig) {
    if (this.widgets.has(widget.id)) {
      console.warn(`Widget ${widget.id} is already registered.`);
      return;
    }
    this.widgets.set(widget.id, widget);
  }

  getWidget(id: string): WidgetConfig | undefined {
    return this.widgets.get(id);
  }

  getAll(): WidgetConfig[] {
    return Array.from(this.widgets.values());
  }
}
