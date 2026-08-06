from sqlalchemy.orm import Session
from sqlalchemy import asc, desc
from typing import Tuple, List, Dict, Any, Optional

from app.services.queries.registry import query
from app.services.queries.schema import QueryRequestV1, QueryContext, FilterOp
from app.models.projections import InventoryProjectionModel

@query(name="InventoryQuery", ttl=15, cost="low", paginated=True, permissions=["inventory:read"])
class InventoryQueryHandler:
    
    def execute(self, request: QueryRequestV1, context: QueryContext, db: Session) -> Tuple[List[Dict[str, Any]], Dict[str, Any], Optional[str]]:
        base_query = db.query(InventoryProjectionModel)
        
        # 1. Tenant Isolation
        base_query = base_query.filter(InventoryProjectionModel.tenant_id == context.tenant_id)
        
        # 2. Filtering
        if request.filter:
            for f in request.filter:
                column = getattr(InventoryProjectionModel, f.field, None)
                if not column:
                    continue # Ignore invalid fields for safety
                    
                if f.op == FilterOp.EQ:
                    base_query = base_query.filter(column == f.value)
                elif f.op == FilterOp.NEQ:
                    base_query = base_query.filter(column != f.value)
                elif f.op == FilterOp.GT:
                    base_query = base_query.filter(column > f.value)
                elif f.op == FilterOp.LT:
                    base_query = base_query.filter(column < f.value)
                elif f.op == FilterOp.GTE:
                    base_query = base_query.filter(column >= f.value)
                elif f.op == FilterOp.LTE:
                    base_query = base_query.filter(column <= f.value)
                elif f.op == FilterOp.CONTAINS:
                    base_query = base_query.filter(column.ilike(f"%{f.value}%"))
                elif f.op == FilterOp.IN:
                    base_query = base_query.filter(column.in_(f.value))
                    
        # 3. Sorting
        if request.sort:
            for s in request.sort:
                column = getattr(InventoryProjectionModel, s.field, None)
                if column:
                    if s.direction == "desc":
                        base_query = base_query.order_by(desc(column))
                    else:
                        base_query = base_query.order_by(asc(column))
                        
        # 4. Pagination
        limit = 100
        if request.page:
            limit = request.page.limit
            if request.page.cursor:
                # cursor decoding logic is naive here for MVP. Assuming resource_id sort fallback.
                base_query = base_query.filter(InventoryProjectionModel.resource_id > request.page.cursor)
                
        # Must have deterministic sorting for cursor pagination
        base_query = base_query.order_by(asc(InventoryProjectionModel.resource_id))
                
        results = base_query.limit(limit).all()
        
        # 5. Format Output
        data = []
        for r in results:
            item = {
                "resource_id": r.resource_id,
                "hostname": r.hostname,
                "ip_address": r.ip_address,
                "mac_address": r.mac_address,
                "vendor": r.vendor,
                "model": r.model,
                "state": r.state,
                "capabilities": r.capabilities,
                "last_updated": r.last_updated.isoformat() if r.last_updated else None
            }
            # Only select specific fields if requested
            if request.select:
                item = {k: v for k, v in item.items() if k in request.select}
            data.append(item)
            
        next_cursor = data[-1]["resource_id"] if len(data) == limit and "resource_id" in data[-1] else None
        
        return data, {}, next_cursor
