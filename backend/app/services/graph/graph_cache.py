from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import uuid

class GraphCache(ABC):
    @abstractmethod
    def get_neighbors(self, resource_id: uuid.UUID) -> Optional[List[Dict[str, Any]]]:
        pass
        
    @abstractmethod
    def put_neighbors(self, resource_id: uuid.UUID, neighbors: List[Dict[str, Any]]):
        pass
        
    @abstractmethod
    def invalidate(self, resource_id: uuid.UUID):
        pass
        
    @abstractmethod
    def invalidate_relationship(self, source_id: uuid.UUID, target_id: uuid.UUID):
        pass
        
    @abstractmethod
    def clear(self):
        pass


class MemoryGraphCache(GraphCache):
    """
    In-memory cache implementation for single-worker Sprint 3.
    """
    def __init__(self):
        self._neighbors: Dict[uuid.UUID, List[Dict[str, Any]]] = {}

    def get_neighbors(self, resource_id: uuid.UUID) -> Optional[List[Dict[str, Any]]]:
        return self._neighbors.get(resource_id)

    def put_neighbors(self, resource_id: uuid.UUID, neighbors: List[Dict[str, Any]]):
        self._neighbors[resource_id] = neighbors

    def invalidate(self, resource_id: uuid.UUID):
        if resource_id in self._neighbors:
            del self._neighbors[resource_id]
        
        # In a real adjacency graph, deleting a node also invalidates others caching it.
        # For memory cache simplicity, we clear all or do a scan.
        # We will do a full clear for safety in this naive implementation when a single node changes.
        self.clear()

    def invalidate_relationship(self, source_id: uuid.UUID, target_id: uuid.UUID):
        if source_id in self._neighbors:
            del self._neighbors[source_id]
        if target_id in self._neighbors:
            del self._neighbors[target_id]

    def clear(self):
        self._neighbors.clear()

# Singleton instance
cache_instance = MemoryGraphCache()
