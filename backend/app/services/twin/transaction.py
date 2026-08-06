from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models.observation import Observation
from app.models.digital_twin import FactVersion
from app.services.twin.resolvers.registry import ConflictResolverRegistry

from app.services.twin.publisher import TwinPublisher

class TwinTransactionManager:
    """
    Applies a set of fact, relationship, and state mutations atomically.
    Ensures that the Digital Twin never exists in a partially reconciled state.
    """
    def __init__(self, db: Session, resolver_registry: ConflictResolverRegistry):
        self.db = db
        self.resolver_registry = resolver_registry
        self.publisher = TwinPublisher(db)
        
    def reconcile_and_commit(self, observation: Observation):
        """
        Takes a changed observation, generates mutations via resolvers, 
        and atomically commits them to the Twin.
        """
        try:
            # 1. Fetch current active facts for this resource
            current_facts = self.db.query(FactVersion).filter(
                FactVersion.resource_id == observation.resource_id,
                FactVersion.valid_to.is_(None)
            ).all()
            current_facts_dict = {f.fact_group_id: f for f in current_facts}
            
            # 2. Generate mutations
            now = datetime.now(timezone.utc)
            new_facts = []
            
            for key, value in observation.payload.items():
                resolver = self.resolver_registry.get_resolver(key)
                # In MVP, we just pass this single observation.
                # In full implementation, we pass all hot observations for this key.
                resolution = resolver.resolve(key, [observation], current_facts_dict.get(key))
                
                # If resolved value differs from current fact, we mutate
                curr = current_facts_dict.get(key)
                if not curr or curr.payload.get(key) != resolution["value"]:
                    # Invalidate old
                    if curr:
                        curr.valid_to = now
                        
                    # Create new version
                    new_fact = FactVersion(
                        tenant_id=observation.tenant_id,
                        fact_group_id=key,
                        resource_id=observation.resource_id,
                        version=str(int(curr.version) + 1) if curr else "1",
                        valid_from=now,
                        payload={key: resolution["value"]},
                        evidence=resolution["evidence"]
                    )
                    new_facts.append(new_fact)
                    
            # 3. Apply all mutations in one transaction
            if new_facts:
                for f in new_facts:
                    self.db.add(f)
                
                # Also update Resource State (e.g. to OBSERVED or VERIFIED)
                # ... update resource state ...
                
                # 4. Insert Outbox Events into the same transaction
                self.publisher.emit_fact_updated(new_facts)
                
                self.db.commit()
                
        except Exception as e:
            self.db.rollback()
            raise e
