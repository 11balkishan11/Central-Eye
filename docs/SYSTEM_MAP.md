# Master System Map
**Type**: End-to-End Traces
**Based on**: `FILE_INVENTORY.md`

## 1. Feature Trace: Provision Device

This maps the exact execution path when a user provisions a new network device.

```mermaid
flowchart TD
    %% Frontend execution
    User([User Clicks 'Provision']) --> UI[React: DeviceProvisionWizard.tsx]
    UI --> Form[React Hook Form]
    Form --> Zod[Zod Schema Validation]
    Zod --> RQ[React Query: useProvisionDevice()]
    RQ --> Axios[Axios Interceptor: Attaches JWT]
    
    %% Network Boundary
    Axios -- POST /api/v1/devices/provision --> FastAPI[Router: devices.py]
    
    %% Backend execution
    FastAPI --> DepAuth[Auth: get_current_user]
    FastAPI --> DepRBAC[Auth: RequirePermission('devices:create')]
    FastAPI --> DepTenant[Auth: extract_tenant_id]
    
    DepTenant --> Service[Service: DeviceService.provision_device()]
    Service --> CRUD1[CRUD: Check if IP exists in Site]
    Service --> DB1[(PostgreSQL: SELECT devices)]
    DB1 --> Service
    
    Service --> CRUD2[CRUD: create()]
    CRUD2 --> SQL[SQLAlchemy: session.add()]
    SQL --> DB2[(PostgreSQL: INSERT into devices)]
    
    DB2 --> EventBus[EventBus: emit('device.provisioned')]
    
    %% Return Path
    DB2 --> ServiceReturn[Service Returns SQLAlchemy Model]
    ServiceReturn --> Pydantic[Pydantic: DeviceResponse.model_validate()]
    Pydantic --> HTTP[HTTP 201 Created JSON]
    
    %% Frontend Resolution
    HTTP --> RQCache[React Query: Invalidate 'devices' cache]
    RQCache --> UIRerender[React: Re-render DevicesPage.tsx Table]
    UIRerender --> Toast[Sonner: Success Toast]
```

## 2. Feature Trace: Dashboard Load (Mock Engine)

This maps the execution path when a user logs in and loads the Dashboard.

```mermaid
flowchart TD
    %% Initial Load
    User([User navigates to /dashboard]) --> App[App.tsx Router]
    App --> Auth[ProtectedRoute.tsx]
    Auth --> Dashboard[DashboardPage.tsx]
    
    %% Real Data Fetch
    Dashboard --> OrgHook[useOrganizations()]
    Dashboard --> SiteHook[useSites()]
    OrgHook -- HTTP GET --> OrgRoute[organizations.py]
    SiteHook -- HTTP GET --> SiteRoute[sites.py]
    OrgRoute -- DB Query --> DB[(PostgreSQL)]
    
    %% Mock Data Engine
    Dashboard --> Engine[useDemoDataEngine.ts]
    Engine --> Interval[React: setInterval(2000ms)]
    Interval --> Calc[Math.random() based Metric Generation]
    Calc --> State[React: setState(cpuData, memData)]
    
    %% UI Render
    DB --> Dashboard
    State --> Charts[DashboardCharts.tsx: Recharts]
    Charts --> DOM[Browser Paint]
```


## 3. Feature Trace: Collector Job Execution

This maps the execution path for Collector Registration, Heartbeat, Job Lease, and Job Completion.

`mermaid
flowchart TD
    %% Collector Registration
    Daemon[Python Collector] -- POST /register --> Auth[Backend: RegistrationService]
    Auth -- Validate Hash --> DB[(PostgreSQL: keys)]
    Auth -- Generate JWT --> Daemon
    Auth -- Insert Audit --> DB

    %% Job Lease
    Daemon -- POST /jobs/pull --> CollectorAPI[Backend: CollectorService]
    CollectorAPI -- Update Capacity --> DB
    CollectorAPI -- Select & Lease Job --> DB
    CollectorAPI -- Insert Audit --> DB
    CollectorAPI -- Return Lease Token --> Daemon

    %% Job Execution & Completion
    Daemon -- POST /jobs/{id}/start --> CollectorAPI
    Daemon -- Execute Job locally --> Device[(Network Device)]
    Device -- Return Data --> Daemon
    Daemon -- POST /jobs/{id}/complete --> CollectorAPI
    CollectorAPI -- Idempotency Check --> DB
    CollectorAPI -- Save Result --> DB
    CollectorAPI -- Insert Audit --> DB
`
