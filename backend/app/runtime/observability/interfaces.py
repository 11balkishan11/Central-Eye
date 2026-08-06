from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import contextlib

class Tracer(ABC):
    @abstractmethod
    @contextlib.contextmanager
    def start_span(self, name: str, attributes: Optional[Dict[str, Any]] = None):
        pass

class MetricsProvider(ABC):
    @abstractmethod
    def increment_counter(self, name: str, value: int = 1, tags: Optional[Dict[str, str]] = None):
        pass
        
    @abstractmethod
    def record_histogram(self, name: str, value: float, tags: Optional[Dict[str, str]] = None):
        pass
        
    @abstractmethod
    def set_gauge(self, name: str, value: float, tags: Optional[Dict[str, str]] = None):
        pass

class Logger(ABC):
    @abstractmethod
    def info(self, msg: str, **kwargs):
        pass
        
    @abstractmethod
    def error(self, msg: str, **kwargs):
        pass
        
    @abstractmethod
    def warn(self, msg: str, **kwargs):
        pass
