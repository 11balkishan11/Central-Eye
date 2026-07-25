# Collector Protocol Specification (v1 - Frozen)

This document represents the strict API contract between the Central FastAPI Server and the distributed Collector Agents. **The Collector is the client; Central is the server.** All communication is initiated outbound via HTTPS from the Collector.

## 1. Global Headers
All endpoints require the following headers:
- `Content-Type: application/json`
- `X-Correlation-ID: <uuid>` (Generated per request by the Collector for distributed tracing)
- `Authorization: Bearer <CollectorAccessToken>` (Except `/register`)
- `Idempotency-Key: <uuid>` (Required for mutating endpoints like Job Start/Complete/Fail)

---

## 2. Authentication & Registration

### `POST /api/v1/collectors/register`
Initial handshake to exchange a pre-shared key for long-lived tokens.
- **Request Body**:
  ```json
  {
    "registration_key": "string",
    "hostname": "string",
    "platform": "linux | windows | darwin",
    "python_version": "3.11.2",
    "collector_version": "1.0.0",
    "capabilities": ["PING", "SNMP_V2C", "SNMP_V3"],
    "machine_id": "string"
  }
  ```
- **Success Response (200 OK)**: Tokens for future auth.

### `POST /api/v1/collectors/refresh`
Exchanges a valid refresh token for a new access token.

---

## 3. Operations & State Sync

### `POST /api/v1/collectors/{collector_id}/heartbeat`
Sent every 60 seconds. Heartbeat is full state synchronization.
- **Request Body**:
  ```json
  {
    "cpu_percent": 45.2,
    "memory_mb_used": 128,
    "uptime_seconds": 3600,
    "running_jobs": 2,
    "queue_capacity": 20,
    "free_capacity": 18,
    "capabilities": ["PING", "SNMP_V2C"],
    "ip_addresses": ["192.168.1.50"]
  }
  ```
- **Response**: Central configuration parameters (poll_interval, feature flags).

---

## 4. Job Leasing Lifecycle

### `POST /api/v1/collectors/{collector_id}/jobs/pull`
Sent to request work from the backend.
- **Response**: List of `JobDefinition` objects including a unique `lease_token`.

### `POST /api/v1/collectors/{collector_id}/jobs/{job_id}/start`
Acknowledges the job has started.
- **Header**: `Idempotency-Key`
- **Request Body**: `{ "lease_token": "string" }`

### `POST /api/v1/collectors/{collector_id}/jobs/{job_id}/complete`
Idempotent success reporting.
- **Header**: `Idempotency-Key`
- **Request Body**: `{ "lease_token": "string", "result": {} }`

### `POST /api/v1/collectors/{collector_id}/jobs/{job_id}/fail`
Idempotent failure reporting.
- **Header**: `Idempotency-Key`
- **Request Body**: `{ "lease_token": "string", "error_message": "string" }`

---

## 5. Retry, Backoff, and Idempotency Strategy
- **Exponential Backoff**: Initial 5s, multiplier 2x, max 300s, ±20% jitter.
- **Idempotency**: Mutating requests (Complete/Fail) use `Idempotency-Key`. If a response is lost, the Collector retries. Central ignores the state mutation but returns `200 OK` as if it succeeded.
- **Backward Compatibility**: Central will never remove fields from job payloads or heartbeat responses. New capabilities will be negotiated via the `capabilities` array.
