# ADR-013: API Response Standard

## Context
Inconsistent API responses (e.g., returning the full object on POST vs returning a Location header, or wrapping some responses in `{"data": ...}` while others return raw arrays) cause frustration for frontend and API consumers.

## Decision
1. **Envelope Standardization**: All list responses will be wrapped in a standard envelope: `{"items": [...], "total": X, "skip": Y, "limit": Z}`.
2. **Creation Responses**: `POST` requests resulting in entity creation will return HTTP `201 Created` with a `Location` header pointing to the new resource URI (e.g., `/organizations/{id}`), and the full object in the body for convenience.
3. **Soft Delete**: `DELETE` requests will return HTTP `204 No Content` upon successful soft deletion.
4. **Error Handling**: All errors must conform to the RFC 7807 Problem Details for HTTP APIs standard, extended with our `request_id` for tracing.

## Consequences
- Requires strict validation of Pydantic response models across all endpoints.
- Ensures consumers always know exactly how to parse paginated lists versus single items.
