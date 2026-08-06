from typing import Dict, Any, List
from sqlalchemy.orm import Session
import asyncio

from app.services.queries.engine import QueryEngine
from app.services.queries.schema import QueryRequestV1, QueryContext
from app.services.queries.registry import QueryRegistry

class WidgetConfig:
    def __init__(self, id: str, title: str, query: QueryRequestV1, component: str):
        self.id = id
        self.title = title
        self.query = query
        self.component = component

class ScreenConfig:
    def __init__(self, name: str, layout: str, widgets: List[WidgetConfig]):
        self.name = name
        self.layout = layout
        self.widgets = widgets

class ScreenEngine:
    """
    Composes UI screens by orchestrating multiple QueryEngine calls.
    """
    def __init__(self, db: Session, query_engine: QueryEngine):
        self.db = db
        self.query_engine = query_engine
        
    def execute_screen(self, config: ScreenConfig, context: QueryContext) -> Dict[str, Any]:
        """
        Executes all queries for a screen. 
        In MVP this is sequential, but can be parallelized with asyncio later.
        """
        response = {
            "screen_name": config.name,
            "layout": config.layout,
            "widgets": []
        }
        
        for widget in config.widgets:
            # Execute the query through the standard query engine
            try:
                query_result = self.query_engine.execute(widget.query, context)
                
                response["widgets"].append({
                    "id": widget.id,
                    "title": widget.title,
                    "component": widget.component,
                    "data": query_result.data,
                    "metadata": query_result.metadata,
                    "telemetry": query_result.telemetry
                })
            except Exception as e:
                # If one widget fails, don't crash the whole screen
                response["widgets"].append({
                    "id": widget.id,
                    "title": widget.title,
                    "component": widget.component,
                    "error": str(e)
                })
                
        return response
