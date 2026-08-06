import { FeatureRegistry } from './FeatureRegistry';
import { WidgetRegistry } from './WidgetRegistry';
import { HttpTransport } from '../transport';
import type { Transport } from '../transport';
import { QuerySDK } from '../sdk/QuerySDK';
import { ScreenSDK } from '../sdk/ScreenSDK';
import { StoreRegistry } from '../stores/StoreRegistry';
import { LiveClient } from '../sdk/LiveClient';
import { SelectionEngine } from './SelectionEngine';
import { CommandRegistry } from './CommandRegistry';
import { NotificationRuntime } from './NotificationRuntime';

import { DashboardFeature } from '../features/dashboard';
import { InventoryFeature } from '../features/inventory';
import { TopologyFeature } from '../features/topology';

class RuntimeContainer {
  public featureRegistry: FeatureRegistry;
  public widgetRegistry: WidgetRegistry;
  
  public transport: Transport;
  public querySdk: QuerySDK;
  public screenSdk: ScreenSDK;
  
  public storeRegistry: StoreRegistry;
  public liveClient: LiveClient;
  
  public selectionEngine: SelectionEngine;
  public commandRegistry: CommandRegistry;
  public notificationRuntime: NotificationRuntime;
  
  constructor() {
    this.featureRegistry = new FeatureRegistry();
    this.widgetRegistry = new WidgetRegistry();
    this.selectionEngine = new SelectionEngine();
    this.commandRegistry = new CommandRegistry();
    this.notificationRuntime = new NotificationRuntime();

    // Default transport
    // In production, this would be an env var
    this.transport = new HttpTransport('http://localhost:8000');
    this.querySdk = new QuerySDK(this.transport);
    this.screenSdk = new ScreenSDK(this.transport);

    this.storeRegistry = new StoreRegistry();

    this.liveClient = new LiveClient('ws://localhost:8000/ws/live', this.storeRegistry);

    // Register features
    this.featureRegistry.register(DashboardFeature);
    this.featureRegistry.register(InventoryFeature);
    this.featureRegistry.register(TopologyFeature);
  }

  // Boot sequence can be managed here
  async boot() {
    console.log("Booting NS3 Platform Runtime...");
    
    for (const feature of this.featureRegistry.getFeatures()) {
      if (feature.initialize) {
        await feature.initialize(this);
      }
    }
  }
}

// Global Singleton
export const runtime = new RuntimeContainer();
