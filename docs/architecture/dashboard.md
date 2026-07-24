# Dashboard Architecture

## 1. Overview
The Dashboard system provides dynamic, real-time visualization of network health, metrics, and alerts. It is designed to be highly customizable per Tenant.

## 2. Dynamic Configuration
Dashboards are not hardcoded UI views. They are stored as JSON configurations in the database.
- **Widgets**: Reusable visual components (e.g., TimeSeriesChart, Gauge, AlertList, TopologyMap).
- **Data Sources**: Each widget is bound to a specific API endpoint or WebSocket channel (e.g., `/api/v1/metrics/query`).
- **Layout**: Grid-based positioning configuration that the frontend React application interprets.

## 3. Real-Time Telemetry (WebSocket Streaming)
Instead of polling the REST API every 5 seconds for chart updates, the frontend establishes a single WebSocket connection to the NS3 Central control plane.
- **Subscriptions**: The frontend subscribes to specific device metrics (e.g., `SUBSCRIBE device:1234:cpu`).
- **Push Architecture**: As the Polling Engine processes results, it publishes them to Redis Pub/Sub. The WebSocket service listens to these channels and pushes live data directly to the active browsers.

## 4. Default vs Custom Dashboards
- **System Dashboards**: Built-in, read-only dashboards provided out-of-the-box (e.g., "Site Overview", "Device Health").
- **Custom Dashboards**: Users can construct and save their own combinations of widgets, scoped to their specific Site or Organization.
