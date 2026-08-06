import asyncio
from typing import List
from abc import ABC, abstractmethod

class BaseWorker(ABC):
    """
    Base class for background workers in the Event Platform.
    """
    @property
    @abstractmethod
    def name(self) -> str:
        pass
        
    @abstractmethod
    async def run(self):
        """
        The continuous loop for the worker.
        """
        pass

class WorkerManager:
    """
    Orchestrates background worker tasks, allowing them to be decoupled from the main FastAPI app.
    In the future, this manager can be run in a completely separate process.
    """
    def __init__(self):
        self._workers: List[BaseWorker] = []
        self._tasks: List[asyncio.Task] = []
        
    def register(self, worker: BaseWorker):
        self._workers.append(worker)
        
    async def start_all(self):
        print("Starting background workers...")
        for worker in self._workers:
            task = asyncio.create_task(worker.run(), name=worker.name)
            self._tasks.append(task)
            print(f"Started worker: {worker.name}")
            
    async def stop_all(self):
        print("Stopping background workers...")
        for task in self._tasks:
            task.cancel()
        
        # Wait for all tasks to cancel gracefully
        await asyncio.gather(*self._tasks, return_exceptions=True)
        self._tasks.clear()
        print("All background workers stopped.")
