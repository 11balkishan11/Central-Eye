export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  title?: string;
  icon?: any;
}

export interface WidgetConfig {
  id: string;
  component: React.ComponentType<any>;
  permissions?: string[];
  supportedSizes?: ('sm' | 'md' | 'lg' | 'xl')[];
}

export interface CommandConfig {
  id: string;
  title: string;
  shortcut?: string;
  action: () => void;
  icon?: any;
}

export interface Feature {
  id: string;
  name: string;
  routes?: RouteConfig[];
  widgets?: WidgetConfig[];
  commands?: CommandConfig[];
  initialize?: (runtime: any) => void | Promise<void>;
}

export class FeatureRegistry {
  private features: Map<string, Feature> = new Map();

  register(feature: Feature) {
    if (this.features.has(feature.id)) {
      console.warn(`Feature ${feature.id} is already registered.`);
      return;
    }
    this.features.set(feature.id, feature);
  }

  getFeatures(): Feature[] {
    return Array.from(this.features.values());
  }

  getFeature(id: string): Feature | undefined {
    return this.features.get(id);
  }
}
