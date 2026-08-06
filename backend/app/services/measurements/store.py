from abc import ABC, abstractmethod
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.measurement import Measurement

class MeasurementStore(ABC):
    """
    Abstract interface for storing highly volatile time-series measurements.
    """
    @abstractmethod
    def write(self, measurement: Measurement) -> bool:
        pass
        
    @abstractmethod
    def write_batch(self, measurements: List[Measurement]) -> bool:
        pass

class PostgresMeasurementStore(MeasurementStore):
    """
    MVP implementation using PostgreSQL.
    Provides schema stability and operational simplicity before transitioning to a dedicated TSDB.
    """
    def __init__(self, db: Session):
        self.db = db
        
    def write(self, measurement: Measurement) -> bool:
        self.db.add(measurement)
        self.db.commit()
        return True
        
    def write_batch(self, measurements: List[Measurement]) -> bool:
        self.db.bulk_save_objects(measurements)
        self.db.commit()
        return True
