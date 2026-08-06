import uuid
from typing import Dict, Any, List
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.resource import (
    Observation, Fact, Resource, ResourceAlias, 
    ResourceState, Relationship, RelationshipState
)

def utc_now():
    return datetime.now(timezone.utc)

class ObservationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def process_observation(
        self, 
        collector_id: uuid.UUID, 
        source_type: str, 
        resource_hint: str, 
        payload: Dict[str, Any],
        tenant_id: uuid.UUID
    ) -> Observation:
        
        # 1. Store Raw Observation
        obs = Observation(
            collector_id=collector_id,
            source_type=source_type,
            resource_hint=resource_hint,
            payload=payload,
            observed_at=utc_now()
        )
        self.db.add(obs)
        await self.db.flush()
        
        # 2. Normalize to Facts
        facts = self._normalize_to_facts(obs)
        for f in facts:
            self.db.add(f)
        await self.db.flush()
        
        # 3. Identity Matching
        resource = await self._resolve_identity(tenant_id, facts, resource_hint)
        
        # 4. Update Knowledge Graph (Resource State)
        await self._update_resource_state(resource, facts, obs.observed_at)
        
        # 5. Extract Relationships (Edges)
        await self._extract_relationships(resource, payload, obs.observed_at)
        
        await self.db.commit()
        return obs

    def _normalize_to_facts(self, obs: Observation) -> List[Fact]:
        facts = []
        payload = obs.payload
        
        # Example naive normalization based on source_type
        if obs.source_type == "snmp" or obs.source_type == "icmp":
            # Extract basic facts
            if "hostname" in payload:
                facts.append(Fact(observation_id=obs.id, category="identity", key="hostname", value=payload["hostname"]))
            if "mac" in payload:
                facts.append(Fact(observation_id=obs.id, category="identity", key="mac", value=payload["mac"]))
            if "ip" in payload:
                facts.append(Fact(observation_id=obs.id, category="identity", key="ip", value=payload["ip"]))
            if "vendor" in payload:
                facts.append(Fact(observation_id=obs.id, category="hardware", key="vendor", value=payload["vendor"]))
            if "os_version" in payload:
                facts.append(Fact(observation_id=obs.id, category="software", key="os_version", value=payload["os_version"]))
            if "cpu" in payload:
                facts.append(Fact(observation_id=obs.id, category="telemetry", key="cpu", value=payload["cpu"]))
            if "memory" in payload:
                facts.append(Fact(observation_id=obs.id, category="telemetry", key="memory", value=payload["memory"]))
                
        return facts

    async def _resolve_identity(self, tenant_id: uuid.UUID, facts: List[Fact], resource_hint: str) -> Resource:
        identity_facts = [f for f in facts if f.category == "identity"]
        
        # Try to find existing resource by alias
        for fact in identity_facts:
            stmt = select(ResourceAlias).where(
                ResourceAlias.alias_type == fact.key.upper(),
                ResourceAlias.alias_value == str(fact.value)
            )
            result = await self.db.execute(stmt)
            alias = result.scalars().first()
            if alias:
                # Found it
                stmt2 = select(Resource).where(Resource.id == alias.resource_id)
                res2 = await self.db.execute(stmt2)
                found_res = res2.scalars().first()
                if found_res and found_res.resource_type == "UNKNOWN":
                    found_res.resource_type = "NETWORK_DEVICE"
                    self.db.add(found_res)
                    await self.db.flush()
                return found_res
                
        # Also try by hint (e.g. IP)
        stmt_hint = select(ResourceAlias).where(
            ResourceAlias.alias_value == resource_hint
        )
        result_hint = await self.db.execute(stmt_hint)
        alias_hint = result_hint.scalars().first()
        if alias_hint:
            stmt2 = select(Resource).where(Resource.id == alias_hint.resource_id)
            res2 = await self.db.execute(stmt2)
            found_res = res2.scalars().first()
            if found_res and found_res.resource_type == "UNKNOWN":
                found_res.resource_type = "NETWORK_DEVICE"
                self.db.add(found_res)
                await self.db.flush()
            return found_res

        # Not found, create new Resource
        resource = Resource(tenant_id=tenant_id, resource_type="NETWORK_DEVICE")
        self.db.add(resource)
        await self.db.flush()
        
        # Create aliases
        for fact in identity_facts:
            new_alias = ResourceAlias(
                resource_id=resource.id,
                alias_type=fact.key.upper(),
                alias_value=str(fact.value)
            )
            self.db.add(new_alias)
            
        # Ensure hint is also an alias if it looks like an IP or hostname
        new_hint_alias = ResourceAlias(
            resource_id=resource.id,
            alias_type="HINT",
            alias_value=resource_hint
        )
        self.db.add(new_hint_alias)
            
        await self.db.flush()
        return resource

    async def _update_resource_state(self, resource: Resource, facts: List[Fact], observed_at: datetime):
        attributes = {}
        for f in facts:
            attributes[f.key] = f.value
            
        # Simple upsert logic for attributes (overwrites existing with latest fact)
        # Fetch current latest state or start fresh
        stmt = select(ResourceState).where(ResourceState.resource_id == resource.id).order_by(ResourceState.observed_at.desc())
        result = await self.db.execute(stmt)
        latest_state = result.scalars().first()
        
        new_attrs = {}
        if latest_state:
            new_attrs = dict(latest_state.attributes)
            
        new_attrs.update(attributes)
        
        new_state = ResourceState(
            resource_id=resource.id,
            attributes=new_attrs,
            observed_at=observed_at
        )
        self.db.add(new_state)

    async def _extract_relationships(self, resource: Resource, payload: Dict[str, Any], observed_at: datetime):
        # Example naive edge creation (LLDP neighbors)
        if "neighbors" in payload and isinstance(payload["neighbors"], list):
            for neighbor_hint in payload["neighbors"]:
                # Try to resolve neighbor identity
                stmt_hint = select(ResourceAlias).where(
                    ResourceAlias.alias_value == neighbor_hint
                )
                result_hint = await self.db.execute(stmt_hint)
                alias_hint = result_hint.scalars().first()
                
                target_id = None
                if alias_hint:
                    target_id = alias_hint.resource_id
                else:
                    # Create a placeholder resource for the missing neighbor
                    placeholder = Resource(tenant_id=resource.tenant_id, resource_type="UNKNOWN")
                    self.db.add(placeholder)
                    await self.db.flush()
                    
                    new_alias = ResourceAlias(
                        resource_id=placeholder.id,
                        alias_type="HINT",
                        alias_value=neighbor_hint
                    )
                    self.db.add(new_alias)
                    await self.db.flush()
                    target_id = placeholder.id
                    
                # Create or Update Relationship
                stmt_rel = select(Relationship).where(
                    Relationship.source_id == resource.id,
                    Relationship.target_id == target_id,
                    Relationship.relationship_type == "connected_to"
                )
                res_rel = await self.db.execute(stmt_rel)
                rel = res_rel.scalars().first()
                
                if not rel:
                    rel = Relationship(
                        source_id=resource.id,
                        target_id=target_id,
                        relationship_type="connected_to"
                    )
                    self.db.add(rel)
                    await self.db.flush()
                    
                rel_state = RelationshipState(
                    relationship_id=rel.id,
                    attributes={"protocol": "lldp", "status": "up"},
                    observed_at=observed_at
                )
                self.db.add(rel_state)
