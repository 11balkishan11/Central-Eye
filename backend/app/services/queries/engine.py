from sqlalchemy.orm import Session
import time
import hashlib

from app.services.queries.schema import QueryRequestV1, QueryResponseV1, QueryContext
from app.services.queries.registry import QueryRegistry
from app.services.queries.cache import QueryCache

class QueryExecutionError(Exception):
    pass

class QueryAuthorizationError(Exception):
    pass

class QueryEngine:
    """
    Standard Query Engine that validates requests, checks cache, authorizes, and executes handlers.
    Generates execution telemetry.
    """
    def __init__(self, db: Session, cache: QueryCache):
        self.db = db
        self.cache = cache
        
    def _generate_cache_key(self, request: QueryRequestV1, context: QueryContext) -> str:
        # Cache keys must incorporate tenant_id to prevent cross-tenant data leaks
        raw_key = f"{context.tenant_id}_{request.model_dump_json()}"
        return hashlib.md5(raw_key.encode()).hexdigest()
        
    def execute(self, request: QueryRequestV1, context: QueryContext) -> QueryResponseV1:
        start_time = time.perf_counter()
        telemetry = {
            "query": request.query,
            "tenant_id": context.tenant_id,
            "correlation_id": context.correlation_id,
            "cache_hit": False,
            "execution_time_ms": 0,
            "rows_returned": 0,
            "error": None
        }
        
        try:
            handler = QueryRegistry.get_handler(request.query)
            metadata = QueryRegistry.get_metadata(request.query)
            
            if not handler or not metadata:
                raise QueryExecutionError(f"Query {request.query} not found in registry.")
                
            # 1. Authorization
            for perm in metadata.permissions:
                if perm not in context.permissions:
                    raise QueryAuthorizationError(f"Missing required permission: {perm}")
                    
            # 2. Cache Lookup
            cache_key = self._generate_cache_key(request, context)
            if metadata.ttl > 0:
                cached_data = self.cache.get(cache_key)
                if cached_data:
                    telemetry["cache_hit"] = True
                    telemetry["rows_returned"] = len(cached_data.get("data", [])) if isinstance(cached_data.get("data"), list) else 1
                    telemetry["execution_time_ms"] = (time.perf_counter() - start_time) * 1000
                    return QueryResponseV1(
                        data=cached_data.get("data"),
                        metadata=cached_data.get("metadata", {}),
                        next_cursor=cached_data.get("next_cursor"),
                        telemetry=telemetry
                    )
                    
            # 3. Execute Handler
            # Handlers are expected to implement an `execute` method that returns (data, metadata, next_cursor)
            if not hasattr(handler, "execute"):
                raise QueryExecutionError(f"Handler for {request.query} missing execute method.")
                
            result_data, result_metadata, next_cursor = handler.execute(request, context, self.db)
            
            # 4. Cache Store
            if metadata.ttl > 0:
                self.cache.set(
                    cache_key, 
                    {"data": result_data, "metadata": result_metadata, "next_cursor": next_cursor}, 
                    ttl=metadata.ttl
                )
                
            telemetry["rows_returned"] = len(result_data) if isinstance(result_data, list) else 1
            telemetry["execution_time_ms"] = (time.perf_counter() - start_time) * 1000
            
            return QueryResponseV1(
                data=result_data,
                metadata=result_metadata,
                next_cursor=next_cursor,
                telemetry=telemetry
            )
            
        except Exception as e:
            telemetry["error"] = str(e)
            telemetry["execution_time_ms"] = (time.perf_counter() - start_time) * 1000
            # Ensure exceptions propagate for standard HTTP error handlers
            raise e
