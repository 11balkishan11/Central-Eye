NS3 Central — Technical Requirements Document
Document type: Production Technical Requirements Document
Product: NS3 Central
Version: 1.0
Audience: Engineering, Product, DevOps, Security, QA, Network Operations and Technical Leadership
Primary goal: Define a secure, scalable and production-ready architecture for building NS3 Central from MVP through enterprise scale.
The source product vision defines NS3 Central as a multi-tenant, AI-native operations platform covering inventory, infrastructure monitoring, alerting, support, reporting, automation, cloud/SASE integrations and eventually autonomous remediation. It explicitly proposes React, TypeScript and Tailwind CSS for the frontend; Python, FastAPI and Celery for the backend; PostgreSQL, Redis and containerized infrastructure; and an architecture integrating on-premise devices, cloud providers, SASE platforms and third-party APIs. 
________________________________________
1. Technical Executive Summary
NS3 Central should be implemented as a multi-tenant SaaS control plane with distributed customer-site collectors.
The platform will consist of:
1.	A cloud-hosted control plane that manages organizations, users, sites, devices, alerts, tickets, dashboards, reports and AI features. 
2.	A lightweight collector deployed inside each customer network. 
3.	An event-driven monitoring pipeline for polling and processing infrastructure telemetry. 
4.	A secure data platform for transactional data, time-series metrics, logs and configuration backups. 
5.	An AI orchestration layer that uses deterministic tools and approved data sources rather than allowing an LLM to interact directly with devices. 
6.	A human-approval automation framework for infrastructure changes. 
7.	A multi-tenant security model that isolates every customer's data and operations. 
The initial architecture should be a modular monolith plus independently scalable workers, not a large microservices system. The product deck shows a future microservices architecture, but splitting every domain into separate services during the MVP would create unnecessary operational complexity for a small engineering team. The system should be designed with clear internal module boundaries so selected modules can be extracted later. The deck's roadmap likewise starts with multi-tenancy, inventory, monitoring and an AI assistant before adding operations, integrations and autonomous intelligence. 
________________________________________
2. Technical Goals
The system must:
•	Monitor network, security, server and cloud infrastructure continuously. 
•	Support multiple customers, organizations, sites and devices. 
•	Collect telemetry through SNMP, APIs, Syslog and eventually SSH. 
•	Discover devices and relationships without exposing customer networks publicly. 
•	Generate reliable alerts with deduplication, suppression and escalation. 
•	Support real-time dashboards and historical analysis. 
•	Provide an AI assistant grounded in real infrastructure data. 
•	Keep all AI-generated actions auditable and approval-controlled. 
•	Support horizontal scaling of collection, ingestion and alert processing. 
•	Maintain strong tenant isolation. 
•	Continue operating during temporary internet or cloud connectivity failures. 
•	support enterprise deployment, backups, observability and disaster recovery. 
________________________________________
3. Scope by Product Phase
3.1 MVP technical scope
The MVP should include:
•	Multi-tenant authentication and authorization. 
•	Organizations, customers, sites and user management. 
•	Device inventory. 
•	Manual device onboarding. 
•	Basic network discovery. 
•	SNMP v2c and SNMPv3 polling. 
•	ICMP availability checks. 
•	Core device metrics. 
•	Collector registration and secure communication. 
•	Metric storage and historical charts. 
•	Rule-based alerts. 
•	Email and in-app notifications. 
•	Dashboard and device detail screens. 
•	Basic ticket creation and alert-to-ticket conversion. 
•	Audit logging. 
•	AI assistant beta for read-only infrastructure questions. 
•	Docker-based local and staging environments. 
•	Automated testing and CI/CD. 
•	Production observability. 
3.2 Post-MVP scope
Later releases can add:
•	Syslog ingestion. 
•	SSH-based configuration collection. 
•	Vendor API integrations. 
•	Cloud and SASE integrations. 
•	Automated topology mapping. 
•	Configuration backup and change tracking. 
•	SLA management. 
•	WhatsApp, SMS and Slack notifications. 
•	Predictive alerts. 
•	AI-assisted root-cause analysis. 
•	Workflow automation. 
•	Human-approved remediation. 
•	Compliance reporting. 
•	White-label MSP edition. 
•	Native mobile applications. 
The product deck lists SNMP, SSH, API and Syslog as the main protocol family and identifies multi-customer management, auto-discovery, configuration backup, license management, ticketing, prioritized alerts and white-labeling as major platform capabilities. 
________________________________________
4. Recommended System Architecture
4.1 Logical architecture
Users
  |
  v
Web Application / Future Mobile Application
  |
  v
CDN + WAF + Load Balancer
  |
  v
API Gateway / Backend API
  |
  +--------------------------------------------+
  |                                            |
  v                                            v
Core Application                         Real-Time Gateway
  |                                            |
  +-------------------+------------------------+
                      |
        +-------------+-------------+
        |             |             |
        v             v             v
   Job Queue      Event Bus      Scheduler
        |             |             |
        v             v             v
 Monitoring      Alert Engine    Reports/
 Workers         + Correlation   Maintenance
        |
        v
Telemetry Ingestion API
        ^
        |
Encrypted outbound connection
        |
Customer-Site Collector
        |
        +-- SNMP
        +-- ICMP
        +-- Syslog
        +-- SSH
        +-- Vendor APIs
        +-- Cloud APIs
4.2 Data architecture
PostgreSQL
- tenants
- users
- organizations
- sites
- devices
- credentials metadata
- alert rules
- alerts
- tickets
- integrations
- audit events
- automation approvals

Time-Series Database
- interface metrics
- CPU and memory
- latency and packet loss
- availability
- environmental metrics

Redis
- cache
- distributed locks
- job broker
- rate limiting
- short-lived sessions
- real-time state

Object Storage
- configuration backups
- reports
- exported topology images
- diagnostic files
- uploaded logs
- generated evidence bundles

Search / Log Store
- normalized syslog
- searchable event records
- text-based diagnostic data

Vector Store
- product documentation
- runbooks
- sanitized configuration explanations
- previous resolved incidents
- vendor knowledge documents
________________________________________
5. Architectural Style and Technical Decision
5.1 Start with a modular monolith
Decision: Build the central backend as a modular monolith, supported by dedicated background workers.
Suggested internal modules:
auth
tenancy
users
sites
inventory
discovery
monitoring
telemetry
alerts
notifications
tickets
reports
topology
integrations
ai
automation
audit
billing_future
Reasoning:
•	A single developer or small team can deploy and debug it more easily. 
•	Transactions across modules remain straightforward. 
•	Shared authentication and tenant isolation are easier to enforce. 
•	Infrastructure and operational cost remain manageable. 
•	Clear module boundaries permit future extraction. 
Extract a module into an independent service only when there is measurable need, such as:
•	telemetry ingestion requires separate scaling; 
•	alert processing becomes CPU-heavy; 
•	AI workloads require isolation; 
•	reporting workloads affect API latency; 
•	different release or security boundaries emerge. 
5.2 Event-driven internal workflows
Even within a modular monolith, asynchronous operations must be event-driven.
Examples:
telemetry.received
device.status_changed
device.discovered
alert.opened
alert.acknowledged
alert.resolved
ticket.created
configuration.changed
collector.offline
automation.approval_requested
automation.executed
This prevents tight coupling and supports future service extraction.
5.3 Separate control plane and data collection plane
Decision: Never have the public cloud backend directly scan private customer networks.
A customer-site collector should:
•	be installed as a Docker container, Linux service or virtual appliance; 
•	initiate outbound TLS connections to NS3 Central; 
•	poll devices locally; 
•	buffer telemetry during internet outages; 
•	redact or transform sensitive data before transmission; 
•	receive signed jobs from the control plane; 
•	never expose an inbound public management port by default. 
This is one of the most important production architecture decisions.
________________________________________
6. Frontend Technical Requirements
6.1 Recommended stack
Area	Technology
Framework	React with TypeScript
Build system	Vite initially
Styling	Tailwind CSS
Component primitives	Radix UI or shadcn/ui
Routing	React Router
Server-state management	TanStack Query
Local UI state	Zustand
Forms	React Hook Form
Validation	Zod
Tables	TanStack Table
Charts	Apache ECharts
Topology	React Flow initially; Cytoscape.js for advanced graphs
Real-time updates	WebSocket client with fallback polling
Internationalization	i18next-ready, but English only in MVP
Testing	Vitest, React Testing Library and Playwright
Error monitoring	Sentry-compatible frontend monitoring
The document already proposes React, TypeScript and Tailwind CSS as the frontend foundation. 
6.2 Frontend application structure
src/
  app/
    router/
    providers/
    layouts/
  modules/
    auth/
    dashboard/
    organizations/
    sites/
    inventory/
    devices/
    monitoring/
    alerts/
    tickets/
    reports/
    topology/
    ai-assistant/
    settings/
  components/
    ui/
    charts/
    tables/
    forms/
    feedback/
  services/
    api/
    websocket/
  stores/
  hooks/
  types/
  utils/
6.3 Primary screens
Authentication
•	Login. 
•	Password reset. 
•	MFA challenge. 
•	SSO redirect. 
•	Session management. 
Global operations dashboard
•	Fleet health score. 
•	Online, degraded and offline device counts. 
•	Open critical alerts. 
•	Active incidents. 
•	Site health. 
•	Top affected devices. 
•	Alert trend. 
•	Collector status. 
•	AI insight feed. 
Customer and site hierarchy
MSP
 └── Customer
      └── Site
           └── Network segment
                └── Device
Inventory
•	Paginated searchable device table. 
•	Filtering by customer, site, vendor, type, state and severity. 
•	Bulk actions. 
•	Import and export. 
•	Saved filters. 
•	Column customization. 
Device detail
•	Identity and location. 
•	Reachability. 
•	Health score. 
•	Interfaces. 
•	Performance charts. 
•	Recent alerts. 
•	Configuration change history. 
•	Tickets. 
•	Related topology. 
•	Credentials status, never raw secrets. 
•	“Ask AI about this device” contextual action. 
Alert center
•	Active, acknowledged, suppressed and resolved alerts. 
•	Severity and ownership. 
•	Deduplication groups. 
•	Event timeline. 
•	Related metrics. 
•	Recommended action. 
•	Ticket link. 
•	Acknowledge, assign, suppress and resolve. 
AI assistant
•	Organization-level context. 
•	Site-level context. 
•	Device-level context. 
•	Source citations. 
•	Tool execution status. 
•	Confidence and data freshness. 
•	Approval button for suggested actions. 
•	Visible warning when data is incomplete. 
6.4 Frontend requirements
•	Responsive from 360-pixel mobile width through large NOC screens. 
•	Accessible to WCAG 2.1 AA standards. 
•	Keyboard-navigable tables and dialogs. 
•	Virtualization for large inventory and alert lists. 
•	Server-side filtering and pagination. 
•	No unrestricted loading of thousands of metrics in the browser. 
•	Charts must aggregate based on selected time range. 
•	Every UI state must support loading, empty, partial and error conditions. 
•	Destructive actions require explicit confirmation. 
•	Stale telemetry must show its timestamp and stale state. 
•	Permissions must remove unavailable controls from the UI, while backend authorization remains authoritative. 
________________________________________
7. Backend Technical Requirements
7.1 Recommended backend stack
Area	Technology
Language	Python
API framework	FastAPI
Schema validation	Pydantic
ORM	SQLAlchemy
Migrations	Alembic
Background jobs	Celery initially
Job broker	Redis initially
Event streaming at scale	Kafka-compatible platform later
Scheduling	Celery Beat initially
HTTP client	httpx
SNMP	PySNMP or an actively maintained equivalent
SSH	Scrapli or Netmiko
Structured logging	structlog
API documentation	OpenAPI generated by FastAPI
Testing	pytest, pytest-asyncio, Testcontainers
Code quality	Ruff, mypy and pre-commit
Python, FastAPI and Celery align with the initial stack identified in the source deck. 
7.2 Backend API domains
/api/v1/auth
/api/v1/organizations
/api/v1/tenants
/api/v1/users
/api/v1/roles
/api/v1/sites
/api/v1/collectors
/api/v1/devices
/api/v1/device-groups
/api/v1/discovery
/api/v1/metrics
/api/v1/alerts
/api/v1/alert-rules
/api/v1/notifications
/api/v1/tickets
/api/v1/reports
/api/v1/topology
/api/v1/integrations
/api/v1/ai
/api/v1/automation
/api/v1/audit-events
7.3 API design standards
•	REST APIs for standard CRUD and queries. 
•	WebSockets or Server-Sent Events for live updates. 
•	Webhooks for outbound integrations. 
•	OpenAPI 3 documentation. 
•	Cursor-based pagination for large datasets. 
•	Consistent error envelope. 
•	Idempotency keys for retryable write operations. 
•	Optimistic concurrency using record version or updated_at. 
•	API versioning from the first production release. 
•	Request correlation IDs. 
•	Tenant context derived from authenticated identity, never trusted from an unrestricted request field. 
•	Strict input validation. 
•	Explicit maximum page sizes and request-body limits. 
•	UTC timestamps using ISO 8601. 
•	UUIDv7 or ULID identifiers for distributed ordering. 
Example error response:
{
  "error": {
    "code": "DEVICE_NOT_FOUND",
    "message": "The requested device was not found.",
    "request_id": "req_...",
    "details": {}
  }
}
________________________________________
8. Collector and Monitoring Engine
8.1 Collector responsibilities
Each collector must:
•	Register securely with one tenant and site. 
•	Use certificate-based identity. 
•	Maintain a heartbeat. 
•	Poll SNMP devices. 
•	Perform ICMP checks. 
•	Receive discovery jobs. 
•	Normalize collected telemetry. 
•	Batch and compress metric uploads. 
•	Cache jobs locally. 
•	Buffer data when disconnected. 
•	Rotate logs. 
•	Self-report CPU, memory, disk and queue status. 
•	Upgrade safely through signed packages. 
•	Prevent execution of unsigned commands. 
8.2 Collector implementation
Recommended MVP implementation:
•	Python service. 
•	Docker image and systemd installation option. 
•	SQLite or embedded persistent queue for local buffering. 
•	Mutual TLS communication. 
•	Outbound HTTPS or secure WebSocket only. 
•	Configurable proxy support. 
•	Bounded concurrency. 
•	Resource limits. 
•	Plugin-based protocol handlers. 
Example internal structure:
collector/
  agent/
  registration/
  scheduler/
  plugins/
    icmp/
    snmp/
    syslog/
    ssh/
    api/
  buffer/
  transport/
  security/
  updater/
  health/
8.3 Polling strategy
Do not poll every metric at one fixed frequency.
Suggested polling classes:
Metric type	Typical interval
Device availability	30–60 seconds
Critical interfaces	30–60 seconds
CPU and memory	1–5 minutes
Environmental sensors	5 minutes
Inventory facts	6–24 hours
Configuration backup	Event-triggered or daily
License and warranty	Daily
Intervals must be configurable by tenant, site, device group and metric profile.
8.4 Monitoring safeguards
•	Per-device concurrency limits. 
•	SNMP timeout and retry policy. 
•	Exponential backoff. 
•	Circuit breakers for failing devices. 
•	Jitter to prevent polling storms. 
•	Distributed locks to avoid duplicate collection. 
•	Collector-side rate limiting. 
•	Detection of counter wrap and device reboot. 
•	Conversion of raw counters into rates. 
•	Clock drift handling. 
•	Metric quality flags. 
•	Separate “unknown” from “offline.” 
________________________________________
9. Database and Storage Design
9.1 PostgreSQL
PostgreSQL is the source of truth for:
•	organizations; 
•	tenants; 
•	users and roles; 
•	customers and sites; 
•	devices and interfaces; 
•	alert rules and alerts; 
•	tickets and SLAs; 
•	collector registration; 
•	integrations; 
•	notification policies; 
•	report definitions; 
•	automation definitions; 
•	audit trails; 
•	AI conversation metadata. 
Multi-tenant model
For the MVP, use a shared database and shared schema with a required tenant_id on tenant-owned rows.
Enforce isolation through:
1.	Application-layer tenant context. 
2.	PostgreSQL Row-Level Security. 
3.	Composite indexes beginning with tenant_id. 
4.	Automated cross-tenant security tests. 
5.	Tenant-aware background jobs. 
6.	Tenant ID in every audit event. 
Example:
devices
- id
- tenant_id
- site_id
- collector_id
- hostname
- management_ip_encrypted
- device_type
- vendor
- model
- serial_number
- status
- health_score
- last_seen_at
- created_at
- updated_at
Large regulated customers may later use a dedicated database or dedicated deployment.
9.2 Time-series storage
Recommended production choice: PostgreSQL with TimescaleDB for the first production phase.
Reasons:
•	Uses the existing PostgreSQL operational model. 
•	Supports time-series partitioning and compression. 
•	Simplifies backup and deployment. 
•	Supports SQL-based analytics. 
•	Avoids introducing another distributed database too early. 
Metric table concept:
metric_samples
- tenant_id
- device_id
- interface_id nullable
- metric_key
- timestamp
- numeric_value
- unit
- quality
- labels JSONB
Retention tiers:
•	Raw high-resolution data: 7–30 days. 
•	Five-minute aggregates: 90 days. 
•	Hourly aggregates: 12–24 months. 
•	Daily aggregates: policy-driven long-term retention. 
9.3 Redis
Redis will support:
•	Celery broker and result backend during MVP. 
•	Rate limiting. 
•	Distributed locks. 
•	Short-lived query cache. 
•	WebSocket presence. 
•	Token and session revocation. 
•	Debouncing and alert deduplication windows. 
•	Health summary cache. 
Redis must not be treated as the authoritative store for alerts, tickets or device inventory.
9.4 Object storage
Use S3-compatible object storage for:
•	configuration files; 
•	support log bundles; 
•	report exports; 
•	topology exports; 
•	evidence archives; 
•	uploaded diagnostics; 
•	model-generated documents. 
Requirements:
•	Server-side encryption. 
•	Per-tenant key prefixes. 
•	Signed time-limited download links. 
•	Malware scanning. 
•	Content-type validation. 
•	File-size restrictions. 
•	Lifecycle and retention policies. 
•	Object versioning for configuration backups. 
9.5 Search and log storage
Do not add OpenSearch in the first milestone unless Syslog search is required.
When Syslog becomes a core feature, use:
•	OpenSearch for flexible log search; or 
•	ClickHouse for high-volume analytical event storage. 
The choice should be based on real ingest volume and query patterns.
________________________________________
10. Authentication and Authorization
10.1 Authentication methods
MVP:
•	Email and password. 
•	Password reset. 
•	TOTP-based MFA. 
•	Secure session management. 
•	Service accounts for collectors and APIs. 
Enterprise:
•	SAML 2.0 SSO. 
•	OpenID Connect. 
•	Microsoft Entra ID. 
•	Google Workspace. 
•	SCIM provisioning. 
•	Hardware-key or WebAuthn support. 
10.2 Token model
For the web application, prefer:
•	short-lived access token; 
•	rotating refresh token; 
•	refresh token stored in an HttpOnly, Secure, SameSite cookie; 
•	access token stored in memory rather than persistent browser storage. 
Collector authentication should use:
•	unique collector identity; 
•	short-lived access credentials; 
•	mutual TLS; 
•	certificate rotation; 
•	revocation support. 
10.3 Authorization model
Use RBAC with resource scopes.
Core roles:
•	Platform Super Admin. 
•	MSP Admin. 
•	Organization Admin. 
•	Site Admin. 
•	Network Engineer. 
•	Support Engineer. 
•	Auditor. 
•	Read-only Viewer. 
•	Automation Approver. 
Example permissions:
device.read
device.create
device.update
device.delete
metric.read
alert.acknowledge
alert.suppress
ticket.assign
integration.manage
credential.manage
automation.propose
automation.approve
automation.execute
audit.read
Authorization must be checked on every backend request and background job, not only in the frontend.
10.4 Privileged access
•	Require re-authentication for credential changes. 
•	Require MFA for automation approval. 
•	Separate proposal and approval privileges. 
•	Log all sensitive activity. 
•	Support time-bounded elevated access. 
•	Never allow customer support personnel to access tenant data without explicit authorization and audit records. 
________________________________________
11. Secrets and Device Credentials
Device credentials are highly sensitive.
Requirements:
•	Never store plaintext passwords, community strings or API tokens. 
•	Encrypt secrets using cloud KMS-backed envelope encryption. 
•	Maintain different encryption keys by environment. 
•	Optionally support customer-managed keys for enterprise plans. 
•	Mask credentials in APIs and logs. 
•	Record credential creation, access, rotation and deletion. 
•	Allow secrets to be stored locally on the collector when a customer does not permit cloud storage. 
•	Support SNMPv3 authentication and privacy protocols. 
•	Prefer API tokens and key-based SSH over passwords. 
•	Rotate collector certificates automatically. 
•	Restrict which collector can retrieve a credential. 
Recommended architecture:
Application asks Secret Service
        |
        v
Authorization check
        |
        v
KMS decrypts data key
        |
        v
Secret returned only to authorized worker/collector
        |
        v
Value never written to logs
________________________________________
12. Alerting Architecture
12.1 Alert pipeline
Metric or event received
        |
        v
Normalize and validate
        |
        v
Evaluate rule
        |
        v
Apply maintenance window
        |
        v
Deduplicate / correlate
        |
        v
Determine severity and ownership
        |
        v
Open or update alert
        |
        v
Send notification
        |
        v
Escalate or create ticket
12.2 Alert types
•	Static threshold. 
•	Dynamic baseline. 
•	Availability. 
•	Rate-of-change. 
•	Missing telemetry. 
•	Log-pattern. 
•	Configuration-change. 
•	Composite alert. 
•	Dependency-aware alert. 
•	Predictive alert in later releases. 
12.3 Alert lifecycle
Detected
→ Open
→ Acknowledged
→ Investigating
→ Resolved
→ Closed
Additional states:
•	Suppressed. 
•	Maintenance. 
•	Auto-resolved. 
•	Reopened. 
12.4 Alert quality controls
•	Consecutive breach requirement. 
•	Hysteresis. 
•	Cooldown period. 
•	Deduplication key. 
•	Event grouping. 
•	Parent-child suppression. 
•	Maintenance windows. 
•	Notification throttling. 
•	Escalation policy. 
•	False-positive feedback. 
________________________________________
13. Real-Time Communication
Use WebSockets for:
•	live dashboard health changes; 
•	new and updated alerts; 
•	collector status; 
•	ticket updates; 
•	AI streaming responses; 
•	automation execution status. 
Architecture:
Backend event
   |
   v
Redis Pub/Sub initially
   |
   v
Real-Time Gateway
   |
   v
Authorized tenant room
   |
   v
Connected browser
At larger scale, replace Redis Pub/Sub with a durable event stream where required.
Do not send raw high-frequency telemetry over WebSockets. Push summarized updates and allow charts to retrieve historical ranges through APIs.
________________________________________
14. AI Architecture
14.1 AI principles
The AI assistant must be:
•	grounded in current tenant data; 
•	read-only by default; 
•	tool-driven; 
•	auditable; 
•	permission-aware; 
•	transparent about freshness; 
•	resistant to prompt injection; 
•	incapable of directly executing arbitrary commands; 
•	human-approved for infrastructure changes. 
14.2 AI use cases by maturity
AI MVP
•	“Which devices are offline?” 
•	“Show critical alerts at Delhi DC.” 
•	“Why is this firewall unhealthy?” 
•	“Summarize the last 24 hours.” 
•	“Explain this SNMP metric.” 
•	“Draft a troubleshooting checklist.” 
•	“Summarize uploaded logs.” 
•	“Create a ticket draft from this alert.” 
Later AI functions
•	Cross-device correlation. 
•	Probable root-cause ranking. 
•	Incident summarization. 
•	Ticket classification and routing. 
•	Natural-language report generation. 
•	Configuration risk detection. 
•	Predictive health scoring. 
•	Runbook recommendation. 
•	Human-approved remediation. 
The deck describes anomaly detection, predictive alerts, root-cause analysis, health scoring, natural-language queries and smart recommendations as the desired AI capabilities. 
14.3 AI orchestration design
User question
    |
    v
Auth and tenant permission check
    |
    v
Intent classification
    |
    v
Approved tool selection
    |
    +-- query inventory
    +-- query metrics
    +-- query alerts
    +-- query tickets
    +-- retrieve runbooks
    +-- retrieve vendor documentation
    |
    v
Context assembly
    |
    v
LLM response
    |
    v
Citation, confidence and audit record
The LLM must not be given direct database credentials.
It interacts only through narrow internal tools such as:
get_device_health(device_id)
get_recent_alerts(site_id, duration)
query_metric(device_id, metric, range)
get_topology_neighbors(device_id)
search_runbooks(query)
create_ticket_draft(alert_id)
propose_automation(runbook_id)
14.4 Model strategy
Use a provider abstraction rather than hard-coding one model vendor.
Support:
•	primary hosted LLM; 
•	lower-cost model for classification and summarization; 
•	embedding model; 
•	optional self-hosted model for regulated deployments; 
•	fallback provider. 
Model categories:
Workload	Model type
Intent classification	Small low-latency model
Alert summarization	Small or medium model
Complex investigation	Strong reasoning model
Embeddings	Text embedding model
Log anomaly detection	Statistical/ML model, not necessarily an LLM
Forecasting	Time-series model
Sensitive on-premise use	Self-hosted model option
14.5 RAG and knowledge system
Potential sources:
•	NS3 product documentation. 
•	Vendor manuals. 
•	MIB documentation. 
•	Internal runbooks. 
•	Customer-approved standard operating procedures. 
•	Sanitized resolved incidents. 
•	Device configuration references. 
•	Known-error database. 
Every vector must carry metadata:
tenant_id
document_id
source_type
vendor
product
version
access_scope
created_at
updated_at
Cross-tenant retrieval must be technically impossible.
14.6 AI safety requirements
•	Filter instructions contained inside uploaded logs and documents. 
•	Treat retrieved content as data, not system instructions. 
•	Apply tenant and role checks before every tool call. 
•	Limit token and cost consumption. 
•	Redact secrets and personal data. 
•	Do not train shared models using customer data without explicit agreement. 
•	Persist prompt, tool calls, model version and response metadata for audit. 
•	Display source evidence. 
•	Distinguish facts from recommendations. 
•	Reject unsupported infrastructure changes. 
•	Require human approval for actions. 
•	Use deterministic templates for high-risk recommendations. 
14.7 Predictive monitoring
Do not begin with sophisticated deep learning.
Start with:
1.	Threshold rules. 
2.	Seasonal baselines. 
3.	Moving averages. 
4.	Z-score or robust anomaly detection. 
5.	Exponential smoothing. 
6.	Isolation Forest for selected metrics. 
7.	Correlation across alerts and dependencies. 
8.	Forecasting only when sufficient historical data exists. 
Machine learning should be introduced only after collecting clean, labeled operational data.
________________________________________
15. Automation and Remediation Architecture
Automation must use a controlled runbook model.
Example runbook:
name: restart_interface_monitoring
risk: medium
supported_vendors:
  - cisco
preconditions:
  - device_online
  - interface_admin_up
approval:
  required: true
steps:
  - collect_current_state
  - execute_vendor_command
  - verify_state
rollback:
  - restore_previous_state
timeout_seconds: 120
Execution flow:
AI or user proposes action
        |
        v
Policy validation
        |
        v
Risk classification
        |
        v
Human approval
        |
        v
Signed job sent to collector
        |
        v
Precondition check
        |
        v
Execution
        |
        v
Verification
        |
        +--> Success
        |
        +--> Rollback
        |
        v
Immutable audit record
Version 1 should not include autonomous remediation. The product roadmap places automation and predictive alerts after the monitoring and operations stages, with autonomous remediation only in the intelligence phase. 
________________________________________
16. Topology Engine
The product vision requires automatic discovery of devices and links, continuously updated physical, logical and security views. 
16.1 Discovery sources
•	SNMP LLDP and CDP. 
•	ARP tables. 
•	MAC address tables. 
•	Routing tables. 
•	Interface relationships. 
•	Cloud network APIs. 
•	Firewall zones and policies. 
•	Virtualization relationships. 
•	Manual overrides. 
16.2 Graph model
Use PostgreSQL tables initially:
topology_nodes
topology_edges
topology_snapshots
Edge example:
source_device_id
target_device_id
relationship_type
source_interface_id
target_interface_id
confidence
discovery_source
first_seen_at
last_seen_at
Use a graph database only if production query patterns prove PostgreSQL insufficient.
16.3 Topology requirements
•	Preserve historical snapshots. 
•	Record discovery confidence. 
•	Permit manual correction. 
•	Avoid deleting links after one missed poll. 
•	Show unknown nodes. 
•	Filter by layer, site, vendor and health. 
•	Overlay alerts and utilization. 
•	Export PNG and PDF first. 
•	Defer Visio export until customer demand is validated. 
________________________________________
17. Third-Party Integrations
The source vision names network and security vendors including Cisco, Fortinet, Palo Alto, Juniper, Check Point and Sophos; SASE vendors such as Zscaler, Prisma, Cisco Umbrella, Versa, FortiSASE and Netskope; and cloud and virtualization environments such as AWS, Azure, Google Cloud, VMware, Nutanix and Hyper-V. 
17.1 Integration priority
Phase 1
•	SNMP. 
•	ICMP. 
•	SMTP email. 
•	Generic outbound webhooks. 
•	Basic Slack notifications. 
Phase 2
•	Syslog. 
•	SSH. 
•	Microsoft Teams. 
•	WhatsApp Business API. 
•	Jira Service Management. 
•	ServiceNow. 
•	Remote support provider. 
•	Vendor-specific Fortinet and Cisco APIs. 
Phase 3
•	AWS CloudWatch and inventory APIs. 
•	Azure Monitor and Resource Graph. 
•	Google Cloud Monitoring. 
•	VMware vCenter. 
•	Zscaler. 
•	Palo Alto Prisma. 
•	Cisco Umbrella. 
17.2 Integration adapter interface
Every adapter should implement a common contract:
authenticate()
test_connection()
discover_resources()
collect_inventory()
collect_metrics()
collect_events()
execute_supported_action()
normalize_error()
refresh_credentials()
Integrations must expose capability metadata so the application knows what each adapter supports.
17.3 Webhook requirements
•	HMAC signatures. 
•	Timestamp and replay protection. 
•	Retry with exponential backoff. 
•	Dead-letter queue. 
•	Delivery logs. 
•	Secret rotation. 
•	Configurable event selection. 
•	Tenant-specific endpoints. 
________________________________________
18. Cloud and Deployment Plan
18.1 Cloud provider
Deploy initially to one major cloud provider, preferably AWS or Azure, based on NS3's customer base and internal expertise.
Avoid multi-cloud application hosting in Version 1. Supporting monitored resources across clouds is different from running the product across multiple clouds.
18.2 Production deployment stages
Local development
Docker Compose containing:
•	application API; 
•	worker; 
•	scheduler; 
•	PostgreSQL/TimescaleDB; 
•	Redis; 
•	MinIO; 
•	mock collector; 
•	mail testing service; 
•	optional local LLM mock. 
Development environment
•	Shared cloud development environment. 
•	Synthetic devices and telemetry. 
•	Automatically deployed from the development branch. 
•	No real customer data. 
Staging
•	Production-like infrastructure. 
•	Separate cloud account or subscription. 
•	Real collector integration tests. 
•	Load tests. 
•	Migration rehearsals. 
•	Security scanning. 
•	Release candidate validation. 
Production
•	Separate cloud account. 
•	Multi-availability-zone deployment. 
•	Private database and cache networking. 
•	WAF and managed load balancer. 
•	Automated backups. 
•	Central observability. 
•	Strict IAM. 
•	No developer direct database access by default. 
18.3 Container orchestration
Recommended progression:
MVP
Use managed containers such as:
•	AWS ECS/Fargate; 
•	Azure Container Apps; 
•	Google Cloud Run where long-running worker behavior is suitable. 
Scale stage
Move to Kubernetes only when required by:
•	many independently scalable services; 
•	advanced scheduling needs; 
•	customer-hosted deployments; 
•	operational team maturity; 
•	complex service-mesh or multi-cluster requirements. 
Starting immediately with Kubernetes would increase delivery and operational complexity.
18.4 Suggested AWS deployment
Route 53
   |
CloudFront
   |
AWS WAF
   |
Application Load Balancer
   |
ECS/Fargate Services
   +-- API
   +-- Real-Time Gateway
   +-- Worker
   +-- Scheduler
   +-- AI Worker
   |
   +-- RDS PostgreSQL / Timescale-compatible deployment
   +-- ElastiCache Redis
   +-- S3
   +-- Secrets Manager
   +-- KMS
   +-- SQS/SNS initially where appropriate
   +-- CloudWatch / OpenTelemetry backend
18.5 Infrastructure as code
Use Terraform or OpenTofu.
Requirements:
•	No manually created production resources. 
•	Separate state per environment. 
•	Remote encrypted state. 
•	State locking. 
•	Code review for infrastructure changes. 
•	Reusable modules. 
•	Policy checks. 
•	Secret values never committed to repositories. 
________________________________________
19. CI/CD Requirements
Pipeline stages:
Pull request opened
    |
    +-- formatting
    +-- linting
    +-- type checks
    +-- unit tests
    +-- dependency scan
    +-- secret scan
    +-- container scan
    +-- frontend build
    +-- backend build
    |
Merge to main
    |
    +-- build immutable images
    +-- generate SBOM
    +-- sign images
    +-- deploy staging
    +-- integration tests
    +-- migration validation
    +-- smoke tests
    |
Production approval
    |
    +-- canary or blue-green deployment
    +-- automated health checks
    +-- rollback on failure
Requirements:
•	Immutable versioned artifacts. 
•	Database migrations run as controlled release jobs. 
•	Backward-compatible migrations. 
•	Feature flags for risky functionality. 
•	Environment-specific configuration. 
•	Deployment audit trail. 
•	Automated rollback. 
•	No shared credentials between CI and human users. 
________________________________________
20. Security Requirements
20.1 Application security
•	Follow OWASP ASVS and OWASP API Security guidance. 
•	Prevent SQL injection through parameterized access. 
•	Strong input validation. 
•	Output encoding. 
•	Content Security Policy. 
•	CSRF protection where cookie authentication is used. 
•	Strict CORS allowlists. 
•	Secure headers. 
•	Rate limits by IP, user, token and tenant. 
•	Brute-force detection. 
•	Account lockout controls. 
•	Request-body size limits. 
•	Safe file upload processing. 
•	Dependency and container scanning. 
•	Regular penetration tests. 
20.2 Network security
•	TLS 1.2 minimum, preferably TLS 1.3. 
•	Private subnets for databases and caches. 
•	No public database endpoints. 
•	Egress restrictions for sensitive workers. 
•	Mutual TLS for collectors. 
•	WAF protection. 
•	DDoS protection. 
•	Segregated production environment. 
•	Zero-trust administrative access. 
•	Bastionless access through managed session services where possible. 
20.3 Data protection
•	Encryption at rest. 
•	Encryption in transit. 
•	KMS-backed key management. 
•	Key rotation. 
•	Data classification. 
•	Tenant-configurable retention. 
•	Secure deletion workflows. 
•	Backup encryption. 
•	Restricted production data access. 
•	Data export and deletion capabilities. 
•	Data residency roadmap. 
20.4 Audit requirements
Record:
•	Login and logout. 
•	Failed authentication. 
•	MFA changes. 
•	Role and permission changes. 
•	Credential changes. 
•	Device onboarding and deletion. 
•	Alert state changes. 
•	Ticket updates. 
•	Integration changes. 
•	AI questions and tool calls. 
•	Automation proposal, approval and execution. 
•	Report exports. 
•	Data downloads. 
•	Support impersonation or administrative access. 
Audit events should be append-only and tamper-evident.
20.5 Compliance readiness
The platform vision includes DPDP, ISO 27001 and HIPAA-oriented reporting. These should be treated as product and organizational compliance programs, not simply report templates. 
Production readiness should include:
•	DPDP-aligned data inventory and processing records. 
•	ISO 27001 control mapping. 
•	Incident response policy. 
•	Access review process. 
•	Vulnerability management. 
•	Supplier assessment. 
•	Business continuity plan. 
•	Change management. 
•	HIPAA support only after legal, contractual and technical readiness. 
Do not claim certification or legal compliance merely because a report exists.
________________________________________
21. Performance Requirements
21.1 API targets
Metric	Initial target
Read API p50	Under 200 ms
Read API p95	Under 500 ms
Standard write API p95	Under 800 ms
Authentication p95	Under 1 second
Dashboard initial API set	Under 2 seconds
Search response p95	Under 1.5 seconds
These targets exclude slow external vendor APIs and large report generation.
21.2 Frontend targets
•	Initial compressed JavaScript should remain controlled through route-level code splitting. 
•	Largest Contentful Paint under 2.5 seconds under normal enterprise network conditions. 
•	Interaction responsiveness under 200 milliseconds for local UI actions. 
•	Avoid rendering more than a bounded number of DOM table rows. 
•	Time-series charts should use downsampled datasets. 
•	Lazy-load heavy topology and chart libraries. 
21.3 Monitoring pipeline targets
Initial production target:
•	10,000 managed devices. 
•	100,000 monitored interfaces. 
•	One million metric samples per minute as a scalable design target, not an immediate provisioning requirement. 
•	Alert evaluation within 30 seconds of metric availability. 
•	Collector heartbeat detection within two missed intervals. 
•	Notification dispatch within 60 seconds of alert creation. 
Design for horizontal scaling without promising untested capacity.
21.4 Report generation
•	Reports must run asynchronously. 
•	User receives progress status. 
•	Large exports must stream to object storage. 
•	Signed download link returned after completion. 
•	Limit simultaneous report jobs per tenant. 
•	Schedule heavy reports outside peak periods where possible. 
________________________________________
22. Availability and Reliability Requirements
Initial SLA target:
•	MVP pilot: 99.5%. 
•	General availability: 99.9%. 
•	Enterprise tier later: higher SLA based on validated architecture. 
Requirements:
•	Multi-availability-zone database. 
•	Automated failover. 
•	Health checks. 
•	Graceful degradation. 
•	Retry with backoff. 
•	Circuit breakers. 
•	Dead-letter queues. 
•	Idempotent workers. 
•	Collector offline buffering. 
•	Zero-data-loss objective for transactional records. 
•	At-least-once event processing with deduplication. 
•	Runbooks for major failure scenarios. 
Suggested recovery targets:
Requirement	Target
Transactional RPO	5–15 minutes
Transactional RTO	Under 1 hour
Telemetry RPO	Up to 15 minutes during severe outage
Object storage RPO	Provider durability plus versioning
Configuration backup recovery	Under 4 hours
________________________________________
23. Observability Requirements
Use OpenTelemetry across frontend, backend and workers.
23.1 Logs
Structured JSON logs containing:
•	timestamp; 
•	environment; 
•	service; 
•	severity; 
•	request ID; 
•	trace ID; 
•	tenant ID where safe; 
•	user or service principal ID; 
•	event name; 
•	duration; 
•	error code. 
Never log:
•	passwords; 
•	API tokens; 
•	community strings; 
•	private keys; 
•	complete device configurations; 
•	sensitive personal data. 
23.2 Metrics
Application metrics:
•	request volume; 
•	latency; 
•	errors; 
•	active sessions; 
•	job queue depth; 
•	worker duration; 
•	failed jobs; 
•	collector heartbeats; 
•	polling success; 
•	metrics ingested; 
•	alerts generated; 
•	notification delivery; 
•	AI token usage; 
•	AI tool failures; 
•	database connection utilization. 
23.3 Tracing
Trace:
browser request
→ API
→ database
→ job queue
→ worker
→ external integration
23.4 Operational alerting
NS3 Central must monitor itself.
Critical internal alerts:
•	API unavailable. 
•	Database saturation. 
•	Queue backlog. 
•	Polling delays. 
•	Collector disconnections. 
•	Alert engine lag. 
•	Notification failures. 
•	AI provider errors. 
•	Object storage failures. 
•	High error rates. 
•	Certificate expiry. 
________________________________________
24. Testing Strategy
24.1 Unit testing
Test:
•	metric normalization; 
•	alert evaluation; 
•	permission checks; 
•	tenant isolation; 
•	topology edge calculation; 
•	credential policies; 
•	AI tool authorization; 
•	retention logic. 
24.2 Integration testing
Use containerized dependencies for:
•	PostgreSQL; 
•	Redis; 
•	object storage; 
•	message broker; 
•	mock SNMP devices; 
•	mock vendor APIs. 
24.3 Protocol testing
Maintain a device simulator lab supporting:
•	SNMPv2c. 
•	SNMPv3. 
•	timeouts. 
•	malformed responses. 
•	counter wrap. 
•	device reboot. 
•	high latency. 
•	packet loss. 
•	authentication failure. 
24.4 End-to-end testing
Critical flows:
create tenant
→ register collector
→ add device
→ collect metric
→ open alert
→ send notification
→ acknowledge alert
→ create ticket
→ ask AI about alert
→ resolve incident
24.5 Security testing
•	SAST. 
•	DAST. 
•	dependency scanning. 
•	container scanning. 
•	infrastructure scanning. 
•	secret scanning. 
•	API fuzzing. 
•	authorization matrix tests. 
•	cross-tenant access tests. 
•	prompt-injection tests. 
•	penetration testing before general availability. 
24.6 Performance testing
Test:
•	many concurrent collectors; 
•	bulk metric ingestion; 
•	alert storms; 
•	large dashboard queries; 
•	report generation; 
•	reconnecting WebSocket clients; 
•	database failover; 
•	queue backlog recovery. 
________________________________________
25. Data Lifecycle and Retention
Each data class should have an explicit retention policy.
Data	Default retention
Raw metrics	30 days
Aggregated metrics	13 months
Alerts	24 months
Tickets	Customer-configurable, typically 3–7 years
Audit logs	Minimum 1 year
AI conversation data	30–90 days by default
Config backups	Configurable versions and age
Uploaded diagnostic logs	7–30 days
Generated reports	90 days
Collector operational logs	14–30 days
Enterprise tenants should receive configurable retention and legal hold options.
________________________________________
26. Key Technical Decisions and Reasons
Decision	Recommendation	Reason
Backend architecture	Modular monolith plus workers	Faster delivery and lower operational complexity
Collection architecture	Customer-site collector	Secure access to private infrastructure
Frontend	React + TypeScript	Strong ecosystem and matches proposed stack
Backend	Python + FastAPI	Good for APIs, integrations and AI workloads
Primary database	PostgreSQL	Reliable relational model and tenant controls
Metrics	TimescaleDB initially	Time-series capability without a separate platform
Cache and jobs	Redis + Celery initially	Simple and appropriate for MVP
Long-term event streaming	Kafka-compatible only when required	Avoid premature complexity
Authentication	Internal auth plus enterprise OIDC/SAML	Supports SMB and enterprise customers
Authorization	RBAC with scoped permissions	Clear and auditable enterprise model
Tenant isolation	Shared schema plus RLS initially	Cost-effective with strong safeguards
Secrets	KMS envelope encryption	Protects highly sensitive device credentials
AI access	Tool-based RAG	More reliable and secure than raw database access
AI actions	Human approval	Prevents unsafe infrastructure changes
Deployment	Managed containers first	Easier than Kubernetes for a small team
Infrastructure	Terraform/OpenTofu	Reproducible and reviewable environments
Topology storage	PostgreSQL first	Graph database is unnecessary until proven
Mobile	Responsive web first	Avoid duplicated product and engineering effort
Microservices	Extract only under measured pressure	Prevent distributed-system overhead
ML predictions	Rules and statistical baselines first	Requires less data and is easier to validate
________________________________________
27. Technical Features to Avoid in Version 1
Do not include the following in the first production release:
•	Fully autonomous remediation. 
•	Arbitrary shell-command execution. 
•	Native iOS and Android applications. 
•	Kubernetes unless operationally necessary. 
•	A large microservice fleet. 
•	A separate database for every product module. 
•	Self-built video calling. 
•	Self-built remote desktop. 
•	Custom identity provider. 
•	Proprietary message broker. 
•	Multi-region active-active deployment. 
•	Complex no-code automation builder. 
•	Graph database without proven requirements. 
•	Advanced deep-learning forecasting without sufficient data. 
•	Full SIEM capabilities. 
•	Full ServiceNow replacement. 
•	Every vendor integration at launch. 
•	White-labeling before the core product is stable. 
•	Compliance certification claims without formal audits. 
________________________________________
28. Production Readiness Gate
The product should not be considered production-ready until all of the following are complete:
Platform
•	Multi-tenant isolation verified. 
•	RBAC enforced. 
•	Collector authentication secured. 
•	Device credentials encrypted. 
•	Database backups tested. 
•	Disaster recovery exercise completed. 
•	Monitoring and alerting configured. 
•	Audit logs available. 
•	API rate limits enabled. 
•	Data retention policies implemented. 
Engineering
•	CI/CD operational. 
•	Automated tests cover critical flows. 
•	Database migration rollback strategy defined. 
•	Load test completed. 
•	Dependency and container scans pass. 
•	Runbooks written. 
•	On-call ownership defined. 
•	Feature flags available. 
•	Error budgets and SLOs defined. 
AI
•	Tool permissions enforced. 
•	Cross-tenant retrieval tests pass. 
•	Prompt injection tests completed. 
•	Sources shown in answers. 
•	Unsupported actions rejected. 
•	Cost limits configured. 
•	Model failure fallback exists. 
•	Human approval required for changes. 
Business operations
•	Customer onboarding procedure documented. 
•	Collector installation guide complete. 
•	Support escalation process defined. 
•	Incident response plan approved. 
•	Privacy policy and data-processing terms reviewed. 
•	Pilot customer environment validated. 
________________________________________
29. Recommended Implementation Sequence
Foundation
1.	Repository and development standards. 
2.	Docker Compose environment. 
3.	PostgreSQL schema and migrations. 
4.	Tenant model. 
5.	Authentication and RBAC. 
6.	Audit logging. 
7.	CI/CD and observability. 
Inventory and collectors
8.	Organization and site management. 
9.	Collector registration. 
10.	Collector heartbeat. 
11.	Manual device onboarding. 
12.	SNMP credential management. 
13.	ICMP and SNMP polling. 
14.	Device and interface inventory. 
Monitoring
15.	Time-series ingestion. 
16.	Device health model. 
17.	Dashboard APIs. 
18.	Historical charts. 
19.	Alert rules. 
20.	Alert lifecycle. 
21.	Email and in-app notifications. 
Operations
22.	Ticketing. 
23.	Basic topology. 
24.	Report generation. 
25.	Slack/webhook integrations. 
26.	Configuration backup. 
AI beta
27.	Internal AI tool layer. 
28.	Tenant-scoped RAG. 
29.	Read-only assistant. 
30.	Alert and incident summarization. 
31.	Ticket draft generation. 
32.	AI audit and usage controls. 
Scale and enterprise hardening
33.	SSO and SCIM. 
34.	Syslog pipeline. 
35.	Vendor adapters. 
36.	Cloud integrations. 
37.	Advanced alert correlation. 
38.	Statistical anomaly detection. 
39.	Runbook automation with approval. 
40.	Autonomous capabilities only after extensive production validation. 
________________________________________
30. Final Recommended Production Stack
Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Radix UI / shadcn/ui
- TanStack Query
- Zustand
- React Hook Form
- Zod
- Apache ECharts
- React Flow
- Playwright

Backend
- Python
- FastAPI
- Pydantic
- SQLAlchemy
- Alembic
- Celery
- Redis
- httpx
- PySNMP-compatible library
- Scrapli / Netmiko
- pytest

Data
- PostgreSQL
- TimescaleDB
- Redis
- S3-compatible object storage
- pgvector initially
- OpenSearch or ClickHouse later for large-scale logs

Infrastructure
- Docker
- Managed container platform
- Terraform or OpenTofu
- Managed PostgreSQL
- Managed Redis
- CDN
- WAF
- Load balancer
- KMS
- Secret manager

Observability
- OpenTelemetry
- Prometheus-compatible metrics
- Grafana
- Centralized structured logs
- Distributed tracing
- Sentry-compatible application error tracking

Security
- OIDC and SAML
- MFA
- RBAC
- PostgreSQL Row-Level Security
- Mutual TLS for collectors
- KMS envelope encryption
- Signed artifacts and jobs
- Immutable audit logs

AI
- Provider-neutral LLM gateway
- Tool calling
- Tenant-isolated RAG
- pgvector initially
- Embedding model
- Small classification model
- Strong reasoning model for investigation
- Statistical anomaly detection
- Human-approved automation
This architecture preserves the original vision of an AI-powered, unified and increasingly autonomous platform while giving NS3 a practical path to production. The central principle should be: first build reliable collection, clean data, tenant isolation and trustworthy monitoring; then layer AI and automation on top. Without those foundations, predictive intelligence and autonomous remediation will not be safe or dependable.

