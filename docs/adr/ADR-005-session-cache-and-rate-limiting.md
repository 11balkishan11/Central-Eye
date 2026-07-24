# ADR 005: Session Cache and Rate Limiting

**Decision**: Use Redis to cache resolved permissions and session statuses, mitigating database load. Rate limiting will also be distributed via Redis.