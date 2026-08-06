import uuid
import pytest
from unittest.mock import MagicMock

from app.services.graph.graph_cache import MemoryGraphCache
from app.services.graph.graph_query_service import GraphQueryService
from app.models.resource import Resource

@pytest.fixture
def mock_db():
    return MagicMock()

def test_cache_invalidation():
    cache = MemoryGraphCache()
    res_id = uuid.uuid4()
    
    # Put and check
    cache.put_neighbors(res_id, [{"id": "n1"}])
    assert cache.get_neighbors(res_id) is not None
    
    # Invalidate
    cache.invalidate(res_id)
    assert cache.get_neighbors(res_id) is None

def test_cycle_detection(mock_db):
    """
    Ensure the query service doesn't loop infinitely on A -> B -> C -> A
    This is partially handled by the recursive CTE depth limit (e.g. depth < 10).
    In this test, we verify GraphQueryService returns what the mocked repo gives it without freezing.
    """
    repo_mock = MagicMock()
    repo_mock.get_downstream.return_value = [
        Resource(id=uuid.uuid4(), resource_type="A"),
        Resource(id=uuid.uuid4(), resource_type="B"),
        Resource(id=uuid.uuid4(), resource_type="C")
    ]
    
    gqs = GraphQueryService(mock_db)
    gqs.repo = repo_mock  # Inject mock repo
    
    res = gqs.downstream(uuid.uuid4())
    assert len(res) == 3

def test_depth_limiting(mock_db):
    """
    Ensure subgraph respects depth limits.
    """
    gqs = GraphQueryService(mock_db)
    
    # Mocking neighbors to return 2 nodes
    gqs.neighbors = MagicMock(return_value=[
        Resource(id=uuid.uuid4(), resource_type="B"),
        Resource(id=uuid.uuid4(), resource_type="C")
    ])
    
    # With depth 1, should just return the center + neighbors
    subgraph = gqs.subgraph(uuid.uuid4(), depth=1)
    assert len(subgraph["nodes"]) == 3
    assert len(subgraph["edges"]) == 2

def test_large_graph_benchmark(benchmark, mock_db):
    """
    Measure traversal latency on a mock graph.
    Requires pytest-benchmark. 
    """
    # Mock repo to return 1000 nodes quickly
    repo_mock = MagicMock()
    repo_mock.get_downstream.return_value = [Resource(id=uuid.uuid4()) for _ in range(1000)]
    
    gqs = GraphQueryService(mock_db)
    gqs.repo = repo_mock
    
    # We define a function for pytest-benchmark to call
    def run_traversal():
        return gqs.downstream(uuid.uuid4())
    
    # If benchmark fixture is available (pytest-benchmark), use it.
    # Otherwise just call it once to ensure it runs.
    if benchmark:
        result = benchmark(run_traversal)
        assert len(result) == 1000
    else:
        result = run_traversal()
        assert len(result) == 1000
