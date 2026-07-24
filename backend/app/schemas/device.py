from pydantic import BaseModel, Field, ConfigDict, field_serializer
from typing import Optional, List, Any
import uuid
from datetime import datetime
from ipaddress import IPv4Address, IPv6Address

from app.models.device import (
    DeviceLifecycleState, 
    DeviceAdminState, 
    DeviceOperState, 
    DeviceHealth
)

class DeviceProvisionRequest(BaseModel):
    hostname: str = Field(..., max_length=255)
    management_ip: str = Field(...)
    site_id: uuid.UUID
    group_id: Optional[uuid.UUID] = None

class DeviceLifecycleUpdate(BaseModel):
    lifecycle_state: DeviceLifecycleState

class DeviceAdminStateUpdate(BaseModel):
    admin_state: DeviceAdminState

class DeviceResponse(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    site_id: uuid.UUID
    group_id: Optional[uuid.UUID] = None
    device_uuid: str
    hostname: str
    management_ip: Any  # PostgreSQL INET returns IPv4Address/IPv6Address
    lifecycle_state: DeviceLifecycleState
    admin_state: DeviceAdminState
    oper_state: DeviceOperState
    health: DeviceHealth
    
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

    @field_serializer("management_ip")
    def serialize_ip(self, v: Any) -> str:
        return str(v)

class DeviceListResponse(BaseModel):
    items: List[DeviceResponse]
    total: int
    skip: int
    limit: int
