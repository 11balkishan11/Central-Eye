from app.services.bff.screen_engine import ScreenConfig, WidgetConfig
from app.services.queries.schema import QueryRequestV1, QueryFilter, FilterOp

DashboardScreen = ScreenConfig(
    name="Dashboard",
    layout="grid-3-col",
    widgets=[
        WidgetConfig(
            id="device-count",
            title="Total Devices",
            component="MetricCard",
            query=QueryRequestV1(
                query="InventoryQuery",
                select=["resource_id"] # Just need existence for counting, or in a full DSL we'd use Aggregate
            )
        ),
        WidgetConfig(
            id="cisco-devices",
            title="Cisco Devices",
            component="MetricCard",
            query=QueryRequestV1(
                query="InventoryQuery",
                filter=[QueryFilter(field="vendor", op=FilterOp.EQ, value="Cisco")],
                select=["resource_id"]
            )
        ),
        WidgetConfig(
            id="topology-minimap",
            title="Topology Preview",
            component="TopologyGraph",
            query=QueryRequestV1(
                query="TopologyQuery",
                parameters={"operation": "subgraph"}
            )
        )
    ]
)
