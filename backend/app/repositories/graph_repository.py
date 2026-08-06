import uuid
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.models.resource import Resource, Relationship

class GraphRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_neighbors(self, resource_id: uuid.UUID) -> List[Resource]:
        """Fetch immediate neighbors (1 hop) in either direction."""
        sql = text("""
            SELECT r.* 
            FROM resources r
            JOIN relationships rel ON (r.id = rel.target_id OR r.id = rel.source_id)
            WHERE (rel.source_id = :res_id OR rel.target_id = :res_id)
              AND r.id != :res_id
        """)
        self.db.execute(sql, {"res_id": resource_id})
        # Assuming we just map directly to Resource model instances
        # A more robust implementation would use SQLAlchemy ORM loading
        # For Sprint 3 MVP, we just rely on ORM:
        
        # Better ORM way:
        rels = self.db.query(Relationship).filter(
            (Relationship.source_id == resource_id) | (Relationship.target_id == resource_id)
        ).all()
        
        neighbors = []
        for rel in rels:
            if rel.source_id == resource_id:
                neighbors.append(rel.target)
            else:
                neighbors.append(rel.source)
        return list(set(neighbors))

    def get_downstream(self, resource_id: uuid.UUID) -> List[Resource]:
        """Fetch all transitive downstream dependencies using recursive CTE."""
        sql = text("""
            WITH RECURSIVE downstream_cte AS (
                SELECT target_id, 1 as depth
                FROM relationships
                WHERE source_id = :res_id
                
                UNION
                
                SELECT r.target_id, c.depth + 1
                FROM relationships r
                JOIN downstream_cte c ON r.source_id = c.target_id
                WHERE c.depth < 10 -- Prevent infinite loops
            )
            SELECT DISTINCT res.*
            FROM resources res
            JOIN downstream_cte cte ON res.id = cte.target_id
        """)
        # We can execute this raw SQL and map it to Resource instances.
        # SQLAlchemy supports mapping raw SQL to ORM objects.
        return list(self.db.query(Resource).from_statement(sql).params(res_id=resource_id).all())

    def get_upstream(self, resource_id: uuid.UUID) -> List[Resource]:
        """Fetch all transitive upstream dependencies using recursive CTE."""
        sql = text("""
            WITH RECURSIVE upstream_cte AS (
                SELECT source_id, 1 as depth
                FROM relationships
                WHERE target_id = :res_id
                
                UNION
                
                SELECT r.source_id, c.depth + 1
                FROM relationships r
                JOIN upstream_cte c ON r.target_id = c.source_id
                WHERE c.depth < 10 -- Prevent infinite loops
            )
            SELECT DISTINCT res.*
            FROM resources res
            JOIN upstream_cte cte ON res.id = cte.source_id
        """)
        return list(self.db.query(Resource).from_statement(sql).params(res_id=resource_id).all())
