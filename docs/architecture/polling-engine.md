# Polling Engine Architecture

## 1. Overview
The Polling Engine is the scheduler and orchestrator of NS3 Central. It determines *what* needs to be polled, *when* it needs to be polled, and delegates the actual network requests to the `Collector` fleet.

## 2. Core Components
- **Scheduler**: A distributed timing wheel (e.g., Celery Beat or a custom Kafka-backed timer) that evaluates `PollingProfiles` (e.g., every 60s, every 5m) against the `Device` inventory.
- **Task Dispatcher**: Routes generated polling tasks to the correct `Site` queue.
- **Result Processor**: Consumes results asynchronously from the Collectors, updates the `Device` state (e.g., `last_seen`, `status`), and forwards raw metrics to the Metrics Pipeline.

## 3. Polling Profiles
Profiles abstract the complexity of scheduling.
- **Type**: `ICMP` (Ping), `SNMP` (Metrics), `API` (Cloud/SDN).
- **Frequency**: Configurable (e.g., 60 seconds).
- **Timeout & Retries**: Configurable fallback behaviors.

## 4. Concurrency & Scale
- The engine does not block on network I/O. It simply publishes a task to a queue (e.g., Redis Streams/Kafka) and immediately moves on.
- Scaling the polling engine involves scaling the background consumer workers handling the queues.
