# Time-Series Database Design

**Status**: Future Specification
**Component**: Storage Engine for Metrics

## 1. Business Problem
Traditional relational databases (like standard PostgreSQL) are designed for CRUD operations on stateful entities (Users, Devices). They degrade severely in performance when inserting millions of timestamped metrics (e.g., CPU, Memory) every hour and querying aggregates (e.g., "average CPU over the last 30 days").

## 2. Why it exists
We need a specialized storage mechanism capable of high-throughput ingestion and automatic data retention policies (dropping data older than 1 year).

## 3. Architecture
- **Technology**: **TimescaleDB** (A PostgreSQL extension).
- **Why TimescaleDB?**: It allows us to keep a single PostgreSQL cluster for both our relational data (FastAPI models) and our time-series data, drastically simplifying DevOps.
- **Hypertables**: The `metric_series` table will be converted into a TimescaleDB Hypertable partitioned by `time`.

## 4. Database Impact & Schema
- **Data Model**:
  ```sql
  CREATE TABLE metrics_data (
      time TIMESTAMPTZ NOT NULL,
      device_id UUID NOT NULL,
      metric_id UUID NOT NULL,
      value DOUBLE PRECISION NOT NULL
  );
  SELECT create_hypertable('metrics_data', 'time');
  ```
- **Continuous Aggregates**: We will create materialized views that automatically downsample the data (e.g., turning 1-minute data points into 1-hour averages for the 30-day dashboard view).
- **Data Retention**: 
  ```sql
  SELECT add_retention_policy('metrics_data', INTERVAL '90 days');
  ```

## 5. Scaling Strategy
- When a single PostgreSQL node can no longer handle the ingestion rate (typically > 50,000 inserts/second), we will utilize TimescaleDB's Multi-Node capabilities to shard the hypertable across multiple worker nodes, allowing infinite horizontal scaling of telemetry ingestion.
