import { StoreRegistry } from '../stores/StoreRegistry';

export class LiveClient {
  ws: WebSocket | null = null;
  isConnecting = false;
  reconnectAttempts = 0;
  wsUrl: string;
  storeRegistry: StoreRegistry;
  
  constructor(wsUrl: string, storeRegistry: StoreRegistry) {
    this.wsUrl = wsUrl;
    this.storeRegistry = storeRegistry;
  }

  connect() {
    if (this.ws || this.isConnecting) return;
    this.isConnecting = true;

    try {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        console.log('[LiveClient] Connected');
        // Resubscribe logic would go here
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.handleMessage(msg);
        } catch (e) {
          console.error('[LiveClient] Failed to parse message', e);
        }
      };

      this.ws.onclose = () => {
        this.ws = null;
        this.isConnecting = false;
        this.scheduleReconnect();
      };
    } catch (e) {
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;
    setTimeout(() => this.connect(), delay);
  }

  handleMessage(msg: any) {
    // 1. Check if it's a batch
    if (msg.type === 'Batch' && Array.isArray(msg.events)) {
      msg.events.forEach((evt: any) => this.routeEvent(evt));
      return;
    }

    // 2. Route single event
    this.routeEvent(msg);
  }

  routeEvent(msg: any) {
    if (msg.type === 'Snapshot') {
      // msg.topic maps directly to storeId in MVP
      this.storeRegistry.applySnapshot(msg.topic, msg.data);
    } else {
      // We assume event_type maps to a topic based on some logic, or the payload includes the topic.
      // For MVP, infer topic from event_type
      let topic = '';
      if (msg.event_type?.includes('Device')) topic = 'inventory';
      else if (msg.event_type?.includes('Topology')) topic = 'topology';
      
      if (topic) {
        this.storeRegistry.applyDelta(topic, msg.payload);
      }
    }
  }

  subscribe(topic: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ command: 'subscribe', topic }));
    }
  }
}
