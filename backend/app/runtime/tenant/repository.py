from typing import TypeVar, Generic, Type, Any, Optional
from sqlalchemy.orm import Session

T = TypeVar("T")

class TenantRepository(Generic[T]):
    """
    Base Repository enforcing multi-tenancy.
    All models must have a `tenant_id` column. This base class automatically
    appends the filter to every query so developers cannot accidentally read cross-tenant.
    """
    def __init__(self, db: Session, model: Type[T], tenant_id: str):
        self.db = db
        self.model = model
        self.tenant_id = tenant_id
        
    def _base_query(self):
        # Automatically enforces tenant isolation
        return self.db.query(self.model).filter(self.model.tenant_id == self.tenant_id)
        
    def get(self, id: Any) -> Optional[T]:
        return self._base_query().filter(self.model.id == id).first()
        
    def get_all(self):
        return self._base_query().all()
        
    def create(self, obj_in: Any) -> T:
        # Automatically inject tenant_id on creation
        obj_in.tenant_id = self.tenant_id
        db_obj = self.model(**obj_in.dict())
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj
