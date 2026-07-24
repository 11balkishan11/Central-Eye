# Metrics Storage Pipeline

## 1. Overview
Network devices generate high-velocity time-series data. Relational databases like PostgreSQL are unsuitable for storing raw metric points long-term. NS3 Central utilizes a purpose-built Time-Series Database (TSDB) for metrics.

## 2. Architecture
1. **Ingestion API**: Collectors push normalized JSON payloads containing metric data to the control plane.
2. **Buffer**: A message queue (e.g., Redis Streams or Kafka) buffers the incoming points to handle sudden spikes in load without overwhelming the database.
3. **Storage Engine**: Data is persisted to a TSDB (e.g., TimescaleDB, VictoriaMetrics, or InfluxDB).
   - TimescaleDB is preferred as it allows JOINs with the relational PostgreSQL metadata (Tenants, Devices) natively.

## 3. Data Schema
A typical metric point looks like:
- **Timestamp**: `2026-07-22T10:00:00Z`
- **Metric Name**: `interface_rx_bps`
- **Value**: `1500000.0`
- **Tags**: `{"device_id": "uuid", "tenant_id": "uuid", "interface_name": "eth0"}`

## 4. Retention & Downsampling
- **Raw Data**: Stored for 7 days (1-minute resolution).
- **Aggregated Data (Hourly)**: Stored for 30 days.
- **Aggregated Data (Daily)**: Stored for 365 days.
- Downsampling runs asynchronously as a background job to conserve disk space.
