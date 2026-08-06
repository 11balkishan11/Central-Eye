from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.queries.schema import QueryRequestV1, QueryResponseV1, QueryContext
from app.services.queries.engine import QueryEngine, QueryExecutionError, QueryAuthorizationError
from app.services.queries.cache import MemoryQueryCache

router = APIRouter()

# MVP Cache singleton. In prod this would be dependency injected from application state
_query_cache = MemoryQueryCache()

def get_query_engine(db: Session = Depends(get_db)) -> QueryEngine:
    return QueryEngine(db, _query_cache)

def get_query_context(request: Request) -> QueryContext:
    # MVP: Mock context. In real app, build this from JWT/session.
    return QueryContext(
        tenant_id="t1",
        user_id="user-123",
        permissions=["inventory:read", "topology:read"],
        correlation_id=request.headers.get("X-Correlation-ID")
    )

@router.post("/", response_model=QueryResponseV1)
def execute_query(
    query_request: QueryRequestV1,
    engine: QueryEngine = Depends(get_query_engine),
    context: QueryContext = Depends(get_query_context)
):
    """
    Unified Query endpoint. 
    Accepts a Query DSL request and routes it to the registered handler.
    """
    try:
        return engine.execute(query_request, context)
    except QueryAuthorizationError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except QueryExecutionError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
