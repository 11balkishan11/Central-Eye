# System Knowledge Graph
**Type**: Architecture & Interaction Maps
**Based on**: `FILE_INVENTORY.md`

## 1. High-Level System Architecture

```mermaid
flowchart TD
    subgraph Client [Browser]
        UI[React UI / Tailwind]
        State[Zustand Client State]
        Query[React Query Server State]
        Axios[Axios Interceptor]
        
        UI --> State
        UI --> Query
        Query --> Axios
    end

    subgraph API [FastAPI Backend]
        Router[API Routers]
        Auth[Dependencies: get_current_user]
        RBAC[Dependencies: RequirePermission]
        Service[Business Services]
        CRUD[Data Access Layer]
        
        Axios -- HTTP / JWT --> Router
        Router --> Auth
        Router --> RBAC
        Router --> Service
        Service --> CRUD
    end

    subgraph Data [Storage Layer]
        PG[(PostgreSQL)]
        CRUD --> PG
    end
```

## 2. Authentication Flow

```mermaid
sequenceDiagram
    participant Browser
    participant AuthRouter as auth.py
    participant DB as PostgreSQL
    
    Browser->>AuthRouter: POST /login (email, password)
    AuthRouter->>DB: Query User by Email
    DB-->>AuthRouter: Return User & PasswordHash
    AuthRouter->>AuthRouter: Verify bcrypt Hash
    AuthRouter->>AuthRouter: Generate AccessToken (JWT)
    AuthRouter->>AuthRouter: Generate RefreshToken (JWT)
    AuthRouter-->>Browser: 200 OK + Tokens
    
    Note over Browser,AuthRouter: Subsequent Requests
    
    Browser->>AuthRouter: GET /devices (Bearer Token)
    AuthRouter->>AuthRouter: Decode & Verify Token Signature
    AuthRouter-->>Browser: 200 OK + Data
```

## 3. RBAC (Role-Based Access Control) Graph

```mermaid
erDiagram
    TENANT ||--o{ ORGANIZATION : owns
    ORGANIZATION ||--o{ SITE : owns
    TENANT ||--o{ ROLE : defines
    ROLE ||--o{ ROLE_PERMISSION : has
    PERMISSION ||--o{ ROLE_PERMISSION : assigned_to
    USER ||--o{ USER_ROLE_ASSIGNMENT : receives
    ROLE ||--o{ USER_ROLE_ASSIGNMENT : grants
    
    USER_ROLE_ASSIGNMENT {
        uuid tenant_id "Scope (Global if all null)"
        uuid organization_id "Scope"
        uuid site_id "Scope"
    }
```
