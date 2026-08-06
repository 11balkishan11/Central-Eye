from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Union
from enum import Enum

class FilterOp(str, Enum):
    EQ = "eq"
    NEQ = "neq"
    GT = "gt"
    LT = "lt"
    GTE = "gte"
    LTE = "lte"
    CONTAINS = "contains"
    IN = "in"

class QueryFilter(BaseModel):
    field: str
    op: FilterOp
    value: Any

class QuerySort(BaseModel):
    field: str
    direction: str = Field(pattern="^(asc|desc)$", default="asc")

class QueryPagination(BaseModel):
    cursor: Optional[str] = None
    limit: int = Field(ge=1, le=1000, default=100)

class QueryContext(BaseModel):
    tenant_id: str
    user_id: Optional[str] = None
    permissions: List[str] = Field(default_factory=list)
    scopes: List[str] = Field(default_factory=list)
    correlation_id: Optional[str] = None

class QueryAggregate(BaseModel):
    field: str
    func: str = Field(pattern="^(count|sum|avg|min|max)$")

class QueryRequestV1(BaseModel):
    query: str # e.g. "InventoryQuery", "TopologyQuery"
    select: Optional[List[str]] = None
    include: Optional[List[str]] = None
    aggregate: Optional[List[QueryAggregate]] = None
    group_by: Optional[List[str]] = None
    filter: Optional[List[QueryFilter]] = None
    sort: Optional[List[QuerySort]] = None
    page: Optional[QueryPagination] = None
    expand: Optional[List[str]] = None
    parameters: Optional[Dict[str, Any]] = None # For arbitrary arguments like specific Node ID

class QueryResponseV1(BaseModel):
    data: Any
    metadata: Dict[str, Any] = Field(default_factory=dict)
    next_cursor: Optional[str] = None
    telemetry: Optional[Dict[str, Any]] = None
