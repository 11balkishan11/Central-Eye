from typing import Dict, List
from app.sdk.collectors.base import BaseCollector
from app.sdk.plugin import BasePluginRegistry

class CollectorRegistry(BasePluginRegistry[BaseCollector]):
    """
    Registry for loading and retrieving Collector Plugins.
    """
    def __init__(self):
        super().__init__()
        
    def get_by_resource_type(self, resource_type: str) -> List[BaseCollector]:
        return [c for c in self._plugins.values() if resource_type in c.supported_resource_types()]
