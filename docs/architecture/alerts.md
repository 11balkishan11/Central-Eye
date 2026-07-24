# Alert Engine Architecture

## 1. Overview
The Alert Engine processes incoming metric streams and state changes against a set of `AlertRules` configured by the user. When a rule condition is met, an `Alert` is generated.

## 2. Rule Evaluation
- **Threshold-Based**: e.g., `cpu_usage > 90% for 5 minutes`.
- **State-Based**: e.g., `device_status == DOWN`.
- **Anomaly-Based (Future)**: Leveraging the AI layer to detect statistical deviations from historical baselines (e.g., traffic spiked unexpectedly).

## 3. Alert Lifecycle
An Alert object in the database tracks its lifecycle:
- **Status**: `ACTIVE`, `ACKNOWLEDGED`, `RESOLVED`, `SILENCED`.
- **Severity**: `CRITICAL`, `WARNING`, `INFO`.
- **Deduplication**: If a device CPU remains above 90%, it updates the existing `ACTIVE` alert's `last_seen` timestamp rather than creating a new database row.

## 4. Notifications & Integrations
- Once an Alert is created or updated, an `AlertTriggeredEvent` is published to the Domain Event Bus.
- A Notification Worker consumes these events and pushes them to third-party integrations (Slack, Microsoft Teams, PagerDuty, Webhooks, Email) based on routing rules configured for the Tenant.
