from sqlalchemy.orm import Session
from app.models.observation import Observation
from app.services.twin.normalizer import Normalizer
from app.services.twin.change_detector import ChangeDetector
# from app.services.twin.transaction import TwinTransactionManager (will implement next)

class ObservationPipeline:
    """
    Entry point for all collector data.
    """
    def __init__(self, db: Session):
        self.db = db
        self.normalizer = Normalizer()
        self.change_detector = ChangeDetector(db)
        
    def process(self, observation: Observation):
        # 1. Normalize
        normalized_obs = self.normalizer.normalize(observation)
        
        # 2. Append to immutable observation store
        self.db.add(normalized_obs)
        self.db.commit()
        self.db.refresh(normalized_obs)
        
        # 3. Change Detection
        if not self.change_detector.has_changed(normalized_obs):
            # Dropped to save downstream work
            return
            
        # 4. In a full implementation, we queue this for reconciliation 
        # or call TwinTransactionManager directly here.
        # self.transaction_manager.reconcile_and_commit(normalized_obs)
