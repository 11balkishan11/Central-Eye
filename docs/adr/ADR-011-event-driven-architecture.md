# ADR-011: Event Driven Architecture

## Context
As the platform expands to include Polling Engines, Collectors, Metrics pipelines, and Alerting, tightly coupling these systems through synchronous API calls will create massive bottlenecks and single points of failure.

## Decision
We adopt an Event-Driven Architecture (EDA) using the `DomainEventBus` for all cross-domain communication.
- **Synchronous within Domain**: Internal CRUD operations complete their local SQL transactions synchronously.
- **Asynchronous between Domains**: Once committed, the transaction publishes a `DomainEvent` (e.g., `DeviceDownEvent`, `OrganizationCreatedEvent`).
- **Standardized Schema**: Events must contain `event_id`, `aggregate_id`, `aggregate_type`, `tenant_id`, `occurred_at`, `request_id`, `actor_id`, and `payload`.

## Consequences
- Total decoupling of domain logic (e.g., Auth service doesn't need to know how to send an email; it just publishes `InvitationSentEvent`).
- Prepares the system for a transparent migration from the in-memory bus to an external broker (Redis Pub/Sub, Kafka, or RabbitMQ) without rewriting business logic.
