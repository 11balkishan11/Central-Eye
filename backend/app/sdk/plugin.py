from typing import Dict, TypeVar, Generic
from pydantic import BaseModel

class PluginMetadata(BaseModel):
    id: str
    display_name: str
    version: str
    author: str
    description: str

class Plugin(BaseModel):
    metadata: PluginMetadata

T = TypeVar('T', bound=Plugin)

class BasePluginRegistry(Generic[T]):
    """
    Generalized registry for all extensible platform components 
    (Engines, AI Providers, Actions, Collectors).
    """
    def __init__(self):
        self._plugins: Dict[str, T] = {}
        
    def register(self, plugin: T):
        self._plugins[plugin.metadata.id] = plugin
        
    def get(self, plugin_id: str) -> T:
        if plugin_id not in self._plugins:
            raise ValueError(f"Plugin '{plugin_id}' not found in registry.")
        return self._plugins[plugin_id]
        
    def list_all(self) -> Dict[str, T]:
        return self._plugins.copy()
