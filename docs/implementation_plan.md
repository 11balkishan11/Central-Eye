NS3 Central — Complete Step-by-Step Implementation Plan
Goal
Build NS3 Central as a production-ready, multi-tenant, AI-assisted infrastructure operations platform that supports:
•	User and tenant administration 
•	Device inventory 
•	Distributed collectors 
•	Network discovery 
•	SNMP-based monitoring 
•	Metrics and dashboards 
•	Alerts and incidents 
•	Ticketing and support workflows 
•	AI investigation and recommendations 
•	Workflow automation 
•	Reports and analytics 
•	Integrations 
•	Audit, security, observability, deployment and recovery 
Do not attempt to build every module simultaneously.
The safest build strategy is:
Foundation
→ Authentication
→ Multi-tenancy
→ Inventory
→ Collector communication
→ Monitoring
→ Alerts
→ Support tickets
→ AI assistance
→ Automation
→ Reports
→ Integrations
→ Administration
→ Production hardening
________________________________________
1. Recommended Delivery Strategy
Build the application in three product releases.
Release 1 — Operational MVP
This must work with real users and real network devices.
Include:
•	Authentication and RBAC 
•	Tenant, organization and site management 
•	Device inventory 
•	Collector registration 
•	SNMP device onboarding 
•	Basic discovery 
•	Device polling 
•	Metrics dashboard 
•	Threshold rules 
•	Alerts 
•	Notifications 
•	Audit logs 
•	Deployment and observability 
Release 2 — Operations Platform
Include:
•	Incidents 
•	Support tickets 
•	SLA management 
•	Topology 
•	Configuration backup 
•	Reports 
•	AI investigation 
•	AI summaries 
•	Basic workflow automation 
•	External integrations 
Release 3 — Enterprise Platform
Include:
•	Advanced automation 
•	Compliance 
•	Billing and licensing 
•	White labeling 
•	SSO, SCIM and enterprise identity 
•	Multi-region collectors 
•	Advanced analytics 
•	AI recommendations 
•	Disaster recovery controls 
•	Plugin marketplace 
•	Platform operations console 
Do not build Release 3 features before Release 1 is stable.
________________________________________
2. Technology Baseline
Use a modular monolith initially.
Frontend
React
TypeScript
Vite
Tailwind CSS
shadcn/ui or Radix UI
TanStack Query
Zustand
React Hook Form
Zod
React Router
Apache ECharts
React Flow
Socket.IO client or native WebSocket
Vitest
Playwright
Backend
Python 3.12+
FastAPI
SQLAlchemy 2
Alembic
Pydantic
PostgreSQL
TimescaleDB
Redis
Celery
Celery Beat
WebSockets or Server-Sent Events
PySNMP
Paramiko
HTTPX
OpenTelemetry
Pytest
Infrastructure
Docker Compose for development
Managed PostgreSQL in production
Managed Redis
S3-compatible object storage
GitHub Actions
Terraform
Container registry
Managed container platform or Kubernetes later
Suggested repository structure
ns3-central/
├── apps/
│   ├── web/
│   ├── api/
│   ├── worker/
│   └── collector/
├── packages/
│   ├── ui/
│   ├── contracts/
│   ├── config/
│   └── shared-types/
├── infrastructure/
│   ├── docker/
│   ├── terraform/
│   └── monitoring/
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── runbooks/
│   ├── decisions/
│   └── testing/
├── scripts/
├── .github/
└── docker-compose.yml
The frontend, API, worker and collector may share one monorepo while remaining separately deployable.
________________________________________
3. Phase 0 — Product Scope and Engineering Preparation
Purpose
Remove ambiguity before generating code.
Step-by-step sequence
Step 0.1 — Freeze the MVP
Define exactly what Release 1 contains.
The MVP user journey should be:
Admin creates tenant
→ Creates organization and site
→ Installs collector
→ Adds SNMP credentials
→ Discovers or manually adds device
→ Collector polls device
→ Metrics appear in dashboard
→ Threshold is crossed
→ Alert is created
→ User acknowledges and resolves alert
→ Every action appears in audit history
Anything not necessary for this flow is not part of the first implementation milestone.
Step 0.2 — Create requirements documents
Create:
docs/product/mvp-scope.md
docs/product/user-stories.md
docs/product/acceptance-criteria.md
docs/product/out-of-scope.md
Step 0.3 — Create architectural decisions
Create ADRs for:
•	Modular monolith vs microservices 
•	PostgreSQL and TimescaleDB 
•	Redis and Celery 
•	Authentication method 
•	Multi-tenancy model 
•	Collector communication method 
•	Metrics retention 
•	Secret encryption 
•	WebSocket strategy 
•	File storage 
•	Deployment target 
Example:
docs/decisions/ADR-001-modular-monolith.md
docs/decisions/ADR-002-multi-tenancy.md
docs/decisions/ADR-003-collector-architecture.md
Step 0.4 — Define environments
Use:
local
development
staging
production
Each environment must have separate:
•	Databases 
•	Redis 
•	secrets 
•	object storage 
•	API keys 
•	domains 
•	telemetry 
Step 0.5 — Define coding standards
Create:
CONTRIBUTING.md
docs/engineering/coding-standards.md
docs/engineering/git-workflow.md
docs/engineering/api-guidelines.md
docs/engineering/database-guidelines.md
Deliverables
•	Approved MVP scope 
•	User journey map 
•	Architecture diagrams 
•	ADRs 
•	Definition of Done 
•	Initial backlog 
•	Prioritized sprint plan 
Exit criteria
No major feature in the MVP remains undefined.
________________________________________
4. Phase 1 — Repository, Local Environment and Developer Tooling
Purpose
Create a repeatable development environment before feature development.
Step-by-step sequence
Step 1.1 — Initialize the monorepo
Create:
apps/web
apps/api
apps/worker
apps/collector
packages/ui
packages/contracts
Step 1.2 — Configure frontend
Install and configure:
•	React 
•	TypeScript strict mode 
•	Vite 
•	Tailwind 
•	ESLint 
•	Prettier 
•	Vitest 
•	React Testing Library 
•	Playwright 
•	path aliases 
•	environment validation 
Step 1.3 — Configure backend
Install and configure:
•	FastAPI 
•	SQLAlchemy 
•	Alembic 
•	Pydantic Settings 
•	PostgreSQL driver 
•	Redis client 
•	Celery 
•	structured logging 
•	Pytest 
•	Ruff 
•	MyPy 
•	Bandit 
Step 1.4 — Create local Docker Compose
Services:
postgres-timescaledb
redis
minio
mailpit
api
worker
collector
web
Optional local services:
prometheus
grafana
jaeger
Step 1.5 — Create environment templates
Create:
.env.example
apps/api/.env.example
apps/web/.env.example
apps/collector/.env.example
Never commit real secrets.
Step 1.6 — Add health endpoints
Backend:
GET /health/live
GET /health/ready
GET /health/dependencies
Collector:
GET /health
Step 1.7 — Configure Git hooks
Run before commits:
•	formatting 
•	linting 
•	type checking 
•	unit tests 
•	secret scanning 
Step 1.8 — Create CI baseline
GitHub Actions should run:
frontend lint
frontend typecheck
frontend unit tests
backend lint
backend typecheck
backend unit tests
migration validation
Docker build
dependency scanning
Deliverables
•	Working monorepo 
•	One-command local startup 
•	Docker Compose 
•	CI pipeline 
•	Health endpoints 
•	Coding quality checks 
•	Environment documentation 
Exit criteria
A new developer can clone the repository and run the platform locally using documented commands.
________________________________________
5. Phase 2 — Core Backend Architecture
Purpose
Create the backend foundation before adding business modules.
Step-by-step sequence
Step 2.1 — Define backend modules
app/
├── auth/
├── tenants/
├── users/
├── organizations/
├── inventory/
├── collectors/
├── monitoring/
├── alerts/
├── tickets/
├── automation/
├── ai/
├── reports/
├── integrations/
├── audit/
└── common/
Each module should contain:
models.py
schemas.py
repository.py
service.py
router.py
permissions.py
events.py
tests/
Step 2.2 — Establish dependency layers
Use this direction:
API router
→ application service
→ domain logic
→ repository
→ database
Routers must not directly contain database logic.
Step 2.3 — Configure database sessions
Implement:
•	request-scoped SQLAlchemy sessions 
•	transaction helpers 
•	rollback on failure 
•	optimistic concurrency support 
•	tenant context propagation 
Step 2.4 — Implement standard API conventions
Use:
{
  "data": {},
  "meta": {},
  "error": null
}
For list endpoints:
{
  "data": [],
  "meta": {
    "next_cursor": "...",
    "has_more": true
  }
}
Step 2.5 — Implement global error handling
Standard error shape:
{
  "error": {
    "code": "DEVICE_NOT_FOUND",
    "message": "The requested device was not found.",
    "details": {},
    "request_id": "uuid"
  }
}
Step 2.6 — Implement request IDs and correlation IDs
Every request must produce:
•	request ID 
•	correlation ID 
•	trace ID where available 
Return the request ID in response headers.
Step 2.7 — Add transactional outbox
Implement outbox_events before business events are introduced.
Step 2.8 — Add idempotency middleware
Required for:
•	create device 
•	import devices 
•	execute workflow 
•	receive webhooks 
•	create ticket 
•	start discovery 
Deliverables
•	Backend module structure 
•	Transaction layer 
•	Global error contract 
•	Pagination 
•	Correlation IDs 
•	Outbox mechanism 
•	Idempotency support 
•	Base service and repository utilities 
Exit criteria
A sample domain resource can be created, listed, updated and audited using the standard backend architecture.
________________________________________
6. Phase 3 — Database Foundation and Migrations
Purpose
Create only foundational tables first. Avoid adding all proposed tables in a single migration.
Migration sequence
Migration group 1 — Extensions and helpers
Enable:
citext
pgcrypto
timescaledb
uuid extension or UUIDv7 function
Create:
•	UUID helper 
•	updated_at trigger 
•	soft-delete conventions 
•	enum or lookup structures 
Migration group 2 — Identity
Create:
•	users 
•	user_sessions 
•	login_attempts 
•	password_reset_tokens 
•	email_verification_tokens 
•	MFA tables 
Migration group 3 — Multi-tenancy
Create:
•	tenants 
•	tenant_memberships 
•	organizations 
•	organization_memberships 
•	customers 
•	sites 
Migration group 4 — Authorization
Create:
•	roles 
•	permissions 
•	role_permissions 
•	user_role_assignments 
•	teams 
•	team_members 
Migration group 5 — Audit and events
Create:
•	audit_logs 
•	outbox_events 
•	idempotency_keys 
•	security_events 
Migration group 6 — Inventory foundation
Create:
•	collectors 
•	credential_profiles 
•	device_types 
•	devices 
•	interfaces 
•	addresses 
•	tags 
•	device groups 
Migration group 7 — Monitoring foundation
Create:
•	metric_definitions 
•	polling_profiles 
•	polling_jobs 
•	device_metrics hypertable 
•	collector_heartbeats hypertable 
•	threshold_rules 
•	maintenance_windows 
Migration group 8 — Alerts
Create:
•	events 
•	alert_rules 
•	alerts 
•	alert_occurrences 
•	incidents 
•	notification channels and policies 
The remaining domain migrations should be added only when those modules enter development.
Data seeding
Seed:
•	system roles 
•	permissions 
•	device categories 
•	standard metrics 
•	default polling profile 
•	default alert severities 
•	development tenant 
•	development admin user 
Database engineering tasks
Add:
•	foreign keys 
•	unique constraints 
•	tenant-aware composite indexes 
•	check constraints 
•	RLS policies 
•	retention policies 
•	compression policies 
•	backup verification 
Deliverables
•	Versioned Alembic migrations 
•	Seed scripts 
•	ER diagram 
•	RLS policies 
•	Index documentation 
•	Database reset command 
•	Test database setup 
Exit criteria
All migrations work both forward and backward in a fresh environment and in CI.
________________________________________
7. Phase 4 — Authentication, Sessions and Account Security
Purpose
Build secure identity before exposing application modules.
Step-by-step sequence
Step 4.1 — Registration policy
Decide whether signup is:
•	invite only 
•	public trial 
•	admin-created 
For enterprise MVP, prefer invite-only onboarding.
Step 4.2 — Implement password authentication
Endpoints:
POST /auth/login
POST /auth/logout
POST /auth/refresh
POST /auth/forgot-password
POST /auth/reset-password
POST /auth/verify-email
GET  /auth/me
Step 4.3 — Implement secure password storage
Use Argon2id.
Add:
•	password strength validation 
•	breached-password policy if available 
•	password reuse prevention later 
•	account lockout 
•	progressive rate limiting 
Step 4.4 — Implement sessions
Use:
•	short-lived access JWT 
•	rotating refresh token 
•	refresh token family 
•	reuse detection 
•	server-side session revocation 
Prefer storing refresh tokens in secure, HTTP-only cookies.
Step 4.5 — Implement MFA
Start with TOTP and recovery codes.
Add WebAuthn after the MVP.
Step 4.6 — Implement invitations
Flow:
Admin invites user
→ User receives link
→ Token validation
→ Password setup
→ Email verification
→ Tenant membership created
→ Role assigned
→ Onboarding begins
Step 4.7 — Implement active tenant selection
Users with multiple memberships select a workspace.
The active tenant must be represented server-side and validated on every request.
Step 4.8 — Implement session management UI
Users can view and revoke:
•	browser sessions 
•	IP 
•	device 
•	last activity 
Step 4.9 — Add security events
Log:
•	failed login 
•	successful login 
•	MFA failure 
•	password reset 
•	token reuse detection 
•	session revocation 
•	account lockout 
Frontend authentication screens
Build:
•	Login 
•	Invitation acceptance 
•	Forgot password 
•	Reset password 
•	Verify email 
•	MFA setup 
•	MFA challenge 
•	Workspace selection 
•	Session expired 
•	Access denied 
Deliverables
•	Secure login 
•	Refresh token rotation 
•	Session revocation 
•	Invitation system 
•	MFA 
•	Account security pages 
•	Authentication integration tests 
•	Rate limiting 
•	Audit events 
Exit criteria
Users cannot access tenant resources without a valid membership, session and permission.
________________________________________
8. Phase 5 — Multi-Tenancy, RBAC and Data Ownership
Purpose
Prevent cross-tenant data access before building business features.
Step-by-step sequence
Step 5.1 — Implement tenant context middleware
Resolve:
current_user
current_session
current_tenant
current_membership
current_permissions
current_scope
Step 5.2 — Implement permission catalogue
Examples:
inventory.device.read
inventory.device.create
inventory.device.update
inventory.device.delete
monitoring.metric.read
alerts.alert.acknowledge
alerts.alert.resolve
admin.user.invite
Step 5.3 — Implement role assignment
Support:
•	tenant-scoped roles 
•	organization-scoped roles 
•	customer-scoped roles 
•	site-scoped roles 
Step 5.4 — Build authorization service
The service must answer:
Can this actor perform this action on this resource?
Authorization must occur in the backend even if the frontend hides the action.
Step 5.5 — Add RLS
Apply to all tenant-owned tables.
Step 5.6 — Test isolation aggressively
Write tests that attempt to:
•	read another tenant's device 
•	update another tenant's site 
•	guess resource IDs 
•	use stale roles 
•	bypass frontend checks 
•	manipulate tenant_id in a request 
Step 5.7 — Build administration basics
Pages:
•	Organizations 
•	Customers 
•	Sites 
•	Users 
•	Roles 
•	Teams 
Deliverables
•	Tenant isolation middleware 
•	RBAC engine 
•	Resource scopes 
•	RLS policies 
•	Permission seeds 
•	Admin pages 
•	Cross-tenant security tests 
Exit criteria
Cross-tenant access is blocked at API and database levels.
________________________________________
9. Phase 6 — Design System and Core UI Shell
Purpose
Build reusable visual foundations before module-specific pages.
Step-by-step sequence
Step 6.1 — Create design tokens
Define:
•	colors 
•	typography 
•	spacing 
•	border radius 
•	elevation 
•	motion 
•	breakpoints 
•	z-index scale 
Step 6.2 — Build reusable components
Start with:
Button
IconButton
Input
Textarea
Select
MultiSelect
Checkbox
Switch
Badge
Tooltip
Popover
Dropdown
Dialog
Drawer
Toast
Tabs
Breadcrumbs
Pagination
Skeleton
EmptyState
ErrorState
ConfirmDialog
DataTable
KpiCard
StatusIndicator
DateRangePicker
Step 6.3 — Create Storybook or component gallery
Every component should demonstrate:
•	default 
•	hover 
•	focus 
•	disabled 
•	loading 
•	error 
•	dark mode 
•	mobile 
Step 6.4 — Build application shell
Include:
•	sidebar 
•	top navigation 
•	workspace switcher 
•	global search 
•	notifications 
•	user menu 
•	breadcrumbs 
•	page header 
•	help menu 
•	AI assistant entry point 
Step 6.5 — Build route guards
Support:
•	unauthenticated 
•	authenticated 
•	permission required 
•	feature disabled 
•	tenant suspended 
•	session expired 
Step 6.6 — Implement theme system
Support:
•	dark 
•	light 
•	system preference 
Persist per-user preference.
Step 6.7 — Implement global UX states
Build standardized:
•	loading screen 
•	empty screen 
•	offline banner 
•	forbidden page 
•	not found 
•	service unavailable 
•	maintenance page 
Deliverables
•	Design token package 
•	Component library 
•	App shell 
•	Responsive navigation 
•	Theme switching 
•	Route guards 
•	Global loading and error patterns 
•	Storybook or component documentation 
Exit criteria
A new module can be added without inventing new layout or component patterns.
________________________________________
10. Phase 7 — Organization, Customer and Site Management
Purpose
Create the ownership hierarchy required by devices and collectors.
Backend sequence
Build APIs for:
organizations
customers
sites
teams
users
role assignments
Implement:
•	create 
•	list 
•	detail 
•	update 
•	archive 
•	restore 
•	search 
•	pagination 
•	audit logging 
Frontend sequence
Build:
1.	Organization list 
2.	Organization detail 
3.	Customer list 
4.	Customer detail 
5.	Site list 
6.	Site detail 
7.	User invitations 
8.	Role assignment 
9.	Team management 
Important UX rules
•	Use drawers for editing. 
•	Use confirmation dialogs for archive and delete. 
•	Show inherited settings. 
•	Clearly show current scope in the header. 
•	Prevent users from accidentally editing the wrong tenant or site. 
Deliverables
•	Organization management 
•	Customer management 
•	Site management 
•	User and team management 
•	Role assignment interface 
•	Audit history 
•	Search and filters 
Exit criteria
An administrator can prepare the tenant hierarchy needed to add real infrastructure.
________________________________________
11. Phase 8 — Collector Agent Foundation
Purpose
Create the secure connection between customer networks and NS3 Central.
This phase must happen before real device monitoring.
Collector architecture
The collector should:
•	run inside the customer network 
•	establish outbound-only communication 
•	register using a one-time token 
•	receive signed jobs 
•	poll devices locally 
•	send normalized results 
•	report health 
•	update safely 
Step-by-step sequence
Step 8.1 — Build collector registration
Flow:
Admin creates registration token
→ Installer starts collector
→ Collector exchanges token
→ Platform issues collector identity and certificate
→ Collector begins heartbeat
Step 8.2 — Build collector heartbeat
Send:
•	version 
•	status 
•	hostname 
•	IP 
•	CPU 
•	memory 
•	disk 
•	queue depth 
•	active jobs 
•	last job status 
Step 8.3 — Build secure communication
Use:
•	TLS 
•	signed requests 
•	short-lived access tokens or mTLS 
•	replay protection 
•	collector-specific identity 
Step 8.4 — Build job polling or persistent connection
Start with:
Collector requests work
→ Platform returns job
→ Collector executes
→ Collector posts result
A persistent WebSocket or message broker can be introduced later.
Step 8.5 — Build local job queue
The collector must survive temporary internet loss.
Store queued results locally using SQLite or a durable local store.
Step 8.6 — Build diagnostics
Collector diagnostics should include:
•	connectivity 
•	DNS 
•	outbound API reachability 
•	SNMP reachability 
•	clock drift 
•	certificate validity 
•	local resources 
Step 8.7 — Package collector
Provide:
•	Docker image 
•	Linux installation script 
•	systemd service 
•	Windows service later 
•	upgrade mechanism 
Deliverables
•	Collector binary or container 
•	Secure registration 
•	Heartbeats 
•	Durable local queue 
•	Job execution framework 
•	Diagnostic command 
•	Installation guide 
•	Collector management UI 
Exit criteria
A collector installed on a remote network appears online in NS3 Central and can execute a simple test job.
________________________________________
12. Phase 9 — Credentials and Secret Management
Purpose
Securely store SNMP, SSH and integration credentials.
Step-by-step sequence
Step 9.1 — Implement envelope encryption
Use:
Application generates data encryption key
→ Secret encrypted with data key
→ Data key encrypted using KMS key
→ Encrypted data and encrypted data key stored
Step 9.2 — Build credential types
Start with:
•	SNMP v2c 
•	SNMP v3 
•	SSH username/password 
•	SSH private key 
Step 9.3 — Build credential profiles UI
Users can:
•	create 
•	test 
•	rotate 
•	disable 
•	assign to site or device 
•	view usage references 
Never display secrets after creation.
Step 9.4 — Restrict secret access
Collector should receive secrets only for the assigned job and device.
Prefer issuing short-lived encrypted job payloads.
Step 9.5 — Add secret audit
Log:
•	creation 
•	test 
•	assignment 
•	rotation 
•	removal 
Do not log secret values.
Deliverables
•	Encrypted credential storage 
•	Credential profile APIs 
•	Credential creation UI 
•	Connection test 
•	Rotation workflow 
•	Secret access audit 
Exit criteria
The collector can securely use a stored SNMP credential without exposing it through application logs or normal APIs.
________________________________________
13. Phase 10 — Inventory and Device Management
Purpose
Create the system of record for infrastructure devices.
Step-by-step sequence
Step 10.1 — Build device CRUD
Fields:
•	name 
•	hostname 
•	management IP 
•	site 
•	collector 
•	vendor 
•	model 
•	category 
•	criticality 
•	credential profile 
•	polling profile 
•	tags 
Step 10.2 — Build device interfaces
Support:
•	interface discovery 
•	operational status 
•	admin status 
•	speed 
•	MAC 
•	IP addresses 
•	VLAN 
•	alias 
•	description 
Step 10.3 — Build device list UI
Include:
•	search 
•	filters 
•	pagination 
•	saved views 
•	column selection 
•	row actions 
•	bulk actions 
•	export 
Step 10.4 — Build device detail UI
Tabs:
Overview
Metrics
Interfaces
Alerts
Events
Configuration
Topology
Tickets
Activity
Initially, inactive modules may show planned empty states.
Step 10.5 — Add manual device onboarding
Flow:
Select site
→ Select collector
→ Enter IP or hostname
→ Select credential
→ Test connection
→ Fetch device identity
→ Review
→ Save
Step 10.6 — Build import
Support CSV import with:
•	template download 
•	validation preview 
•	duplicate detection 
•	field mapping 
•	error report 
•	resumable background processing 
Step 10.7 — Add tags and groups
Support:
•	static groups 
•	dynamic query-based groups 
•	bulk tagging 
Deliverables
•	Inventory APIs 
•	Device list and detail 
•	Manual device onboarding 
•	Interface inventory 
•	CSV import 
•	Tags and groups 
•	Export 
•	Audit logs 
Exit criteria
Administrators can add and manage real network devices associated with the correct site and collector.
________________________________________
14. Phase 11 — Network Discovery
Purpose
Discover devices automatically through a collector.
Step-by-step sequence
Step 11.1 — Build discovery job model
Inputs:
•	site 
•	collector 
•	IP ranges 
•	protocols 
•	credential profiles 
•	timeout 
•	rate limit 
Step 11.2 — Implement ICMP discovery
Determine reachable hosts.
Step 11.3 — Implement SNMP identity discovery
Retrieve:
•	sysName 
•	sysDescr 
•	sysObjectID 
•	sysLocation 
•	sysContact 
•	uptime 
•	interfaces 
Step 11.4 — Normalize vendor and model
Create a mapping layer for:
•	sysObjectID 
•	vendor 
•	family 
•	model 
•	capabilities 
Step 11.5 — Add duplicate detection
Match using:
•	serial number 
•	MAC 
•	management IP 
•	hostname 
•	existing aliases 
Step 11.6 — Build discovery wizard UI
Steps:
Scope
→ Collector
→ Credentials
→ Protocols
→ Review
→ Run
→ Results
→ Import
Step 11.7 — Build progress streaming
Show live:
•	addresses scanned 
•	reachable hosts 
•	SNMP successes 
•	errors 
•	devices identified 
•	duplicates 
Deliverables
•	Discovery job APIs 
•	Collector discovery executor 
•	ICMP and SNMP discovery 
•	Progress updates 
•	Results review 
•	Duplicate detection 
•	Import workflow 
Exit criteria
A user can scan a network, review results and import discovered devices into inventory.
________________________________________
15. Phase 12 — Monitoring and Metrics Pipeline
Purpose
Collect, store, aggregate and display real device telemetry.
Build sequence
Step 12.1 — Define canonical metrics
Start with:
device availability
ping latency
packet loss
CPU utilization
memory utilization
uptime
interface operational status
interface traffic in
interface traffic out
interface errors
interface discards
Step 12.2 — Build polling profiles
Define:
•	metric set 
•	interval 
•	timeout 
•	retries 
•	protocol 
•	collector assignment 
Step 12.3 — Build scheduler
The scheduler should create polling jobs based on:
•	device polling profile 
•	collector capacity 
•	next poll time 
•	maintenance state 
•	retry policy 
Step 12.4 — Build collector SNMP poller
Support:
•	SNMP v2c 
•	SNMP v3 
•	bulk walk 
•	timeout handling 
•	retry 
•	OID normalization 
•	counter wrap handling 
Step 12.5 — Build ingestion API
Requirements:
•	authenticated collector 
•	batch upload 
•	idempotent ingestion 
•	schema validation 
•	timestamp validation 
•	duplicate prevention 
•	tenant ownership validation 
Step 12.6 — Store TimescaleDB metrics
Add:
•	hypertable 
•	compression 
•	retention 
•	continuous aggregates 
•	downsampling 
Suggested aggregates:
1 minute
5 minutes
1 hour
1 day
Step 12.7 — Build metric query service
Support:
•	time ranges 
•	aggregation 
•	group by device 
•	group by interface 
•	comparison 
•	downsample selection 
Step 12.8 — Build monitoring dashboard
Include:
•	fleet availability 
•	CPU and memory trends 
•	top utilized devices 
•	interface errors 
•	collector health 
•	live event stream 
Step 12.9 — Build device metric charts
Implement:
•	time-range selector 
•	zoom 
•	tooltip 
•	compare 
•	metric selection 
•	export 
•	live refresh 
Deliverables
•	Polling scheduler 
•	Collector SNMP polling 
•	Batch metric ingestion 
•	Timescale hypertables 
•	Retention and aggregation 
•	Metric query APIs 
•	Monitoring dashboards 
•	Device and interface charts 
•	Polling status UI 
Exit criteria
Metrics from real devices continuously appear in NS3 Central with acceptable latency and no duplicate ingestion.
________________________________________
16. Phase 13 — Thresholds, Alerts and Notifications
Purpose
Turn metric conditions into actionable operational events.
Step-by-step sequence
Step 13.1 — Build threshold rules
Support:
•	greater than 
•	less than 
•	equal 
•	range 
•	missing data 
•	interface down 
•	device unreachable 
Step 13.2 — Build evaluation engine
The engine must support:
•	evaluation window 
•	number of occurrences 
•	severity 
•	recovery condition 
•	deduplication 
•	maintenance suppression 
•	hysteresis 
Step 13.3 — Create alert lifecycle
Open
→ Acknowledged
→ Investigating
→ Resolved
Additional:
Suppressed
Closed
Step 13.4 — Implement alert fingerprinting
Prevent duplicate alerts for the same active condition.
Step 13.5 — Build alert UI
Include:
•	severity summary 
•	filters 
•	grouping 
•	acknowledgement 
•	assignment 
•	comments 
•	related metrics 
•	source events 
•	timeline 
Step 13.6 — Build notification channels
Start with:
•	email 
•	in-app 
•	webhook 
Add Slack and Teams later.
Step 13.7 — Build notification policies
Support:
•	severity filters 
•	site filters 
•	quiet hours 
•	grouping 
•	repeat interval 
•	escalation 
Step 13.8 — Add real-time updates
Use WebSocket or SSE for:
•	new alerts 
•	status changes 
•	notification badges 
•	dashboard updates 
Deliverables
•	Threshold rule builder 
•	Evaluation workers 
•	Alert lifecycle 
•	Deduplication 
•	Alert center 
•	Email and in-app notifications 
•	Notification policies 
•	Real-time alert updates 
•	Maintenance suppression 
Exit criteria
A real metric threshold breach creates one deduplicated alert, sends the appropriate notification and resolves correctly after recovery.
________________________________________
17. Phase 14 — MVP Dashboard
Purpose
Create the primary operational overview after real data exists.
Do not create fake dashboard logic before monitoring and alerts are functional.
Build sequence
Step 14.1 — Create dashboard query service
Aggregate:
•	device totals 
•	device health 
•	active alerts 
•	critical alerts 
•	site health 
•	collector health 
•	monitoring gaps 
•	recent activity 
Step 14.2 — Build dashboard widgets
Initial widgets:
Fleet Health
Active Alerts
Critical Devices
Site Status
Collector Health
Availability Trend
Top Interfaces by Utilization
Recent Events
Step 14.3 — Add dashboard filters
Support:
•	organization 
•	customer 
•	site 
•	device group 
•	time range 
Step 14.4 — Add widget loading isolation
One failed widget must not break the entire dashboard.
Step 14.5 — Cache expensive aggregates
Use Redis with short TTL and tenant-aware cache keys.
Deliverables
•	Operational dashboard 
•	Real metrics 
•	Real alert data 
•	Scope filters 
•	Widget-level loading and errors 
•	Dashboard caching 
•	Responsive layouts 
Exit criteria
An operations user can understand infrastructure health within five seconds of opening the dashboard.
________________________________________
18. Phase 15 — Audit, Activity and Compliance Baseline
Purpose
Make all important actions traceable before adding advanced modules.
Step-by-step sequence
Step 15.1 — Create central audit service
Every sensitive mutation should produce an audit event.
Step 15.2 — Add entity activity timelines
Support for:
•	users 
•	devices 
•	alerts 
•	collectors 
•	credentials 
•	roles 
•	sites 
Step 15.3 — Protect audit logs
Audit records must be append-only.
Step 15.4 — Build audit center UI
Include:
•	filters 
•	search 
•	actor 
•	entity 
•	action 
•	before/after 
•	correlation ID 
•	export 
Step 15.5 — Add retention policy
Audit retention should be tenant configurable only within permitted compliance limits.
Deliverables
•	Audit service 
•	Entity timelines 
•	Audit center 
•	Export 
•	Retention rules 
•	Tamper-resistant storage policy 
Exit criteria
Every high-risk action can be traced to an actor, time, request and affected entity.
________________________________________
19. Phase 16 — Production MVP Testing
Purpose
Validate Release 1 before adding larger features.
Unit tests
Cover:
•	authorization 
•	thresholds 
•	alert state transitions 
•	device matching 
•	metric normalization 
•	token rotation 
•	secret encryption 
•	polling schedule generation 
Integration tests
Cover:
•	PostgreSQL 
•	TimescaleDB 
•	Redis 
•	Celery 
•	object storage 
•	collector registration 
•	metric ingestion 
•	outbox publishing 
End-to-end tests
Critical flows:
Login
Invite user
Create site
Register collector
Create credential
Add device
Run connection test
Poll metrics
Create threshold
Generate alert
Acknowledge alert
Resolve alert
Inspect audit log
Security tests
Test:
•	tenant bypass 
•	ID guessing 
•	privilege escalation 
•	SQL injection 
•	mass assignment 
•	token reuse 
•	refresh replay 
•	secret exposure 
•	unsafe file uploads 
•	rate-limit bypass 
Performance tests
Test:
•	device list with 100,000 devices 
•	metric ingestion batches 
•	alert storms 
•	dashboard queries 
•	collector heartbeat volume 
•	concurrent WebSocket users 
•	discovery scans 
Resilience tests
Test:
•	Redis unavailable 
•	worker crash 
•	collector offline 
•	duplicate metric batch 
•	PostgreSQL failover 
•	outbox backlog 
•	notification provider failure 
Deliverables
•	Test suites 
•	Coverage reports 
•	Load test reports 
•	Security test report 
•	Bug backlog 
•	Release readiness checklist 
Exit criteria
All critical E2E flows pass, tenant isolation is verified and production performance targets are met.
________________________________________
20. Phase 17 — Initial Deployment and Operations
Purpose
Deploy Release 1 safely.
Step-by-step sequence
Step 17.1 — Build production images
Separate images:
web
api
worker
scheduler
collector
Use:
•	multi-stage builds 
•	non-root users 
•	pinned dependencies 
•	vulnerability scans 
•	minimal base images 
Step 17.2 — Provision infrastructure
Create with Terraform:
•	network 
•	container runtime 
•	PostgreSQL/TimescaleDB 
•	Redis 
•	object storage 
•	secrets manager 
•	container registry 
•	load balancer 
•	DNS 
•	TLS certificates 
•	monitoring 
•	backups 
Step 17.3 — Configure staging
Deploy to staging first.
Run:
•	migration tests 
•	smoke tests 
•	E2E tests 
•	security scan 
•	backup and restore test 
Step 17.4 — Configure production
Production requirements:
•	TLS 
•	WAF 
•	rate limiting 
•	database backups 
•	point-in-time recovery 
•	Redis persistence where required 
•	object versioning 
•	alerting 
•	log retention 
•	secret rotation 
Step 17.5 — Configure observability
Use OpenTelemetry.
Track:
•	request rate 
•	error rate 
•	latency 
•	worker queue depth 
•	failed jobs 
•	database connections 
•	slow queries 
•	cache hit rate 
•	collector connectivity 
•	polling failures 
•	metric ingestion lag 
•	alert evaluation lag 
Step 17.6 — Create operational alerts
Examples:
•	API p95 latency high 
•	error rate above threshold 
•	database connection saturation 
•	failed migrations 
•	queue backlog 
•	collector heartbeat gap 
•	metric ingestion delay 
•	notification failures 
•	disk capacity warning 
Step 17.7 — Create runbooks
Create:
API unavailable
Database unavailable
Redis unavailable
Worker queue backlog
Collector offline
Metric ingestion delayed
Alert storm
Failed deployment
Secret rotation failure
Backup restore
Step 17.8 — Release using controlled rollout
Use:
staging
→ internal users
→ pilot tenant
→ limited customers
→ general availability
Deliverables
•	Production infrastructure 
•	CI/CD deployment pipeline 
•	Staging environment 
•	Monitoring dashboards 
•	Alerting 
•	Backup and restore 
•	Runbooks 
•	Rollback procedure 
•	Release checklist 
Exit criteria
The platform is deployed, monitored, recoverable and successfully used by a pilot tenant with real devices.
________________________________________
21. Phase 18 — Incident Management
Purpose
Group correlated alerts into operational incidents.
Build sequence
1.	Incident data model 
2.	Manual incident creation 
3.	Link alerts to incidents 
4.	Incident timeline 
5.	Ownership and assignment 
6.	Severity and impact 
7.	Resolution and root cause 
8.	Basic alert correlation 
9.	Incident dashboard 
10.	Postmortem record 
Deliverables
•	Incident lifecycle 
•	Alert correlation 
•	Incident detail page 
•	Timeline 
•	Ownership and assignment 
•	Postmortem foundation 
•	Incident analytics 
________________________________________
22. Phase 19 — Support Tickets and SLA
Purpose
Convert operational issues into structured support work.
Build sequence
Backend
Create:
•	queues 
•	queue members 
•	tickets 
•	comments 
•	links 
•	status history 
•	SLA policies 
•	SLA timers 
•	satisfaction surveys 
Frontend
Build:
1.	Ticket dashboard 
2.	Ticket list 
3.	Ticket creation 
4.	Ticket detail 
5.	Internal notes 
6.	Customer-visible comments 
7.	Assignment 
8.	Queue management 
9.	SLA indicators 
10.	Merge and split 
11.	Attachments 
12.	Linked alerts and devices 
Automation
Add automatic ticket creation from selected alerts.
Deliverables
•	Full ticket lifecycle 
•	Queues and assignment 
•	SLA calculation 
•	Comments and internal notes 
•	Attachments 
•	Linked resources 
•	Ticket notifications 
•	Satisfaction survey 
Exit criteria
An alert can create a ticket that is assigned, investigated, resolved and measured against an SLA.
________________________________________
23. Phase 20 — Knowledge Base
Purpose
Convert repeated resolutions into reusable knowledge.
Build sequence
1.	Knowledge spaces 
2.	Article editor 
3.	Draft and published states 
4.	Article versions 
5.	Tags 
6.	Search 
7.	Role-based visibility 
8.	Link article to ticket 
9.	Suggested related articles 
10.	Article feedback 
Deliverables
•	Knowledge base 
•	Versioned articles 
•	Search 
•	Ticket integration 
•	Visibility rules 
•	Attachments 
________________________________________
24. Phase 21 — AI Assistant
Purpose
Add AI only after reliable operational data and permission boundaries exist.
Do not let AI directly query the production database.
AI architecture
User request
→ AI gateway
→ permission-aware context builder
→ approved tools
→ domain APIs
→ grounded response
→ citations and audit
Build sequence
Step 21.1 — AI gateway
Support:
•	provider abstraction 
•	model routing 
•	timeouts 
•	retries 
•	fallback model 
•	token logging 
•	cost tracking 
•	prompt versioning 
Step 21.2 — Permission-aware tools
Initial tools:
get_device
query_device_metrics
get_active_alerts
get_incident
get_ticket
search_knowledge
get_collector_health
Step 21.3 — Conversation UI
Build:
•	streaming messages 
•	suggested prompts 
•	sources 
•	tool status 
•	retry 
•	feedback 
•	scoped context 
Step 21.4 — Add use cases gradually
Start with:
1.	Summarize device health 
2.	Explain alert 
3.	Summarize incident 
4.	Suggest investigation steps 
5.	Find similar tickets 
6.	Generate ticket response 
7.	Generate RCA draft 
Step 21.5 — Add safety controls
AI must not:
•	reveal inaccessible tenant data 
•	expose credentials 
•	execute high-risk actions automatically 
•	invent source data 
•	bypass domain APIs 
Step 21.6 — Add evaluations
Create evaluation sets for:
•	factual accuracy 
•	permission isolation 
•	source grounding 
•	tool selection 
•	hallucination 
•	unsafe action prevention 
Deliverables
•	AI gateway 
•	Tool framework 
•	Streaming assistant 
•	Source citations 
•	Token and cost tracking 
•	AI audit trail 
•	AI evaluation suite 
•	Initial operational use cases 
Exit criteria
The assistant produces grounded, permission-safe answers using actual NS3 Central data and clearly shows its sources.
________________________________________
25. Phase 22 — Workflow Automation
Purpose
Automate repetitive operations with human approval.
Build sequence
Step 22.1 — Start with a code-defined workflow engine
Before building a visual editor, support:
•	triggers 
•	conditions 
•	actions 
•	retries 
•	timeout 
•	approval 
•	execution history 
•	rollback metadata 
Step 22.2 — Create safe initial actions
Examples:
•	send notification 
•	create ticket 
•	assign ticket 
•	add device tag 
•	run diagnostics 
•	pause monitoring 
•	resume monitoring 
•	generate report 
Step 22.3 — Add approvals
High-risk actions should pause for:
•	user approval 
•	role approval 
•	expiration 
•	rejection reason 
Step 22.4 — Add execution monitoring
Track:
•	current node 
•	node attempts 
•	inputs 
•	outputs 
•	errors 
•	duration 
•	correlation ID 
Step 22.5 — Build visual workflow editor
Use React Flow.
Support:
•	trigger nodes 
•	condition nodes 
•	action nodes 
•	approval nodes 
•	delay nodes 
•	validation 
•	versioning 
•	publish 
•	test mode 
Step 22.6 — Add AI suggestions
AI may generate a draft workflow but cannot publish or execute it without human review.
Deliverables
•	Workflow runtime 
•	Versioned definitions 
•	Trigger engine 
•	Safe actions 
•	Approval system 
•	Execution history 
•	Visual builder 
•	Templates 
•	AI-generated drafts 
Exit criteria
Users can safely automate a low-risk operational flow and inspect every execution step.
________________________________________
26. Phase 23 — Reports and Analytics
Purpose
Provide operational and executive reporting.
Build sequence
1.	Report data access layer 
2.	Standard report definitions 
3.	Report execution jobs 
4.	Export to CSV 
5.	Export to PDF 
6.	Scheduled reports 
7.	Email delivery 
8.	Dashboard widgets 
9.	Saved filters 
10.	Report builder 
11.	AI-generated summaries 
Initial reports:
•	Device inventory 
•	Availability 
•	Alert volume 
•	Alert resolution time 
•	Collector health 
•	Ticket SLA 
•	Incident trends 
•	Capacity utilization 
Deliverables
•	Standard reports 
•	Export 
•	Scheduling 
•	Report history 
•	Saved report definitions 
•	Executive summaries 
•	Dashboard personalization 
________________________________________
27. Phase 24 — Topology and Configuration Management
Topology sequence
1.	LLDP/CDP data collection 
2.	Link normalization 
3.	Topology nodes and edges 
4.	Site topology 
5.	Device-neighbor view 
6.	Link status 
7.	Health overlays 
8.	Auto-layout 
9.	Manual position persistence 
10.	Historical topology snapshots 
Configuration sequence
1.	SSH connector 
2.	Vendor-specific command profiles 
3.	Configuration backup 
4.	Hash comparison 
5.	Configuration diff 
6.	Drift alert 
7.	Scheduled backup 
8.	Restore workflow with approval 
Deliverables
•	Auto topology 
•	Interactive map 
•	Link status 
•	Configuration backup 
•	Diff viewer 
•	Drift detection 
•	Scheduled backup 
________________________________________
28. Phase 25 — External Integrations
Purpose
Connect NS3 Central to surrounding enterprise tools.
Build one integration pattern first, then reuse it.
Integration framework
Every connector should implement:
install
configure
test
enable
sync
health
logs
disable
remove
Integration order
First
•	SMTP 
•	generic webhooks 
•	Slack 
•	Microsoft Teams 
Second
•	Jira 
•	ServiceNow 
•	PagerDuty 
•	Opsgenie 
Third
•	AWS 
•	Azure 
•	GCP 
•	VMware 
•	Kubernetes 
Fourth
•	LDAP 
•	SAML 
•	OIDC 
•	SCIM 
Deliverables
•	Connector framework 
•	Connector health 
•	Sync history 
•	Retry and failure handling 
•	Secrets integration 
•	Webhook replay 
•	Integration marketplace UI 
•	Initial production connectors 
________________________________________
29. Phase 26 — Enterprise Administration
Build sequence
1.	Custom roles 
2.	Permission builder 
3.	SSO 
4.	SCIM 
5.	IP restrictions 
6.	Password policies 
7.	MFA enforcement 
8.	Session policies 
9.	Data retention 
10.	Feature flags 
11.	Licensing 
12.	Subscription limits 
13.	Branding 
14.	Custom domains 
15.	Audit exports 
Deliverables
•	Enterprise identity 
•	Custom RBAC 
•	Security policies 
•	Data retention 
•	Feature flags 
•	Licensing 
•	White labeling 
•	Custom domains 
________________________________________
30. Phase 27 — Security Hardening
Application security
Implement:
•	CSP 
•	HSTS 
•	secure cookie settings 
•	CSRF protection where applicable 
•	rate limiting 
•	input size limits 
•	safe file validation 
•	virus scanning 
•	output encoding 
•	dependency scanning 
•	secret scanning 
•	image and container scanning 
Infrastructure security
Implement:
•	private database networking 
•	least-privileged IAM 
•	KMS encryption 
•	encrypted backups 
•	WAF 
•	network policies 
•	certificate rotation 
•	separate production accounts 
•	controlled operator access 
Secure development process
Require:
•	threat model 
•	security review 
•	penetration test 
•	incident response plan 
•	vulnerability disclosure process 
•	dependency update policy 
Deliverables
•	Threat model 
•	Security checklist 
•	Penetration test findings 
•	Fixed vulnerabilities 
•	Incident response playbook 
•	Security monitoring 
________________________________________
31. Phase 28 — Performance and Scalability
Tasks
Frontend
•	code splitting 
•	lazy routes 
•	virtualized tables 
•	chart downsampling 
•	request cancellation 
•	memoization 
•	bundle analysis 
•	browser performance monitoring 
Backend
•	query profiling 
•	N+1 prevention 
•	connection pooling 
•	cache strategy 
•	background jobs 
•	batch APIs 
•	cursor pagination 
•	API response compression 
Database
•	index review 
•	continuous aggregates 
•	Timescale compression 
•	partition management 
•	slow query alerts 
•	archival jobs 
Collector
•	adaptive concurrency 
•	rate limiting 
•	batching 
•	local queue limits 
•	backpressure 
•	polling distribution 
Deliverables
•	Performance budget 
•	Load test suite 
•	Capacity model 
•	Query optimization report 
•	Scaling thresholds 
•	Cost estimate per device and tenant 
________________________________________
32. Phase 29 — Disaster Recovery and Reliability
Tasks
•	define RPO and RTO 
•	configure point-in-time recovery 
•	replicate object storage 
•	test Redis recovery 
•	automate infrastructure rebuild 
•	test secrets recovery 
•	restore production-like staging 
•	run collector outage simulation 
•	run region failure simulation 
•	verify backup integrity regularly 
Deliverables
•	Disaster recovery plan 
•	Restore scripts 
•	Recovery runbooks 
•	DR test report 
•	Backup verification jobs 
•	Business continuity plan 
________________________________________
33. Phase 30 — Final Product Polish
UX polish
Review every screen for:
•	loading 
•	empty 
•	partial data 
•	error 
•	offline 
•	permission denied 
•	feature locked 
•	maintenance 
•	destructive confirmation 
•	success feedback 
Accessibility
Verify:
•	keyboard navigation 
•	focus order 
•	screen-reader labels 
•	color contrast 
•	reduced motion 
•	chart accessibility 
•	form errors 
•	modal focus trapping 
Content design
Standardize:
•	terminology 
•	button labels 
•	errors 
•	empty-state messages 
•	tooltip language 
•	help text 
•	confirmation text 
Product onboarding
Add:
•	first-run checklist 
•	setup progress 
•	collector installation guide 
•	device onboarding wizard 
•	contextual help 
•	guided tours only where useful 
Documentation
Complete:
•	admin guide 
•	operator guide 
•	collector install guide 
•	API documentation 
•	integration guides 
•	security overview 
•	backup guide 
•	troubleshooting 
•	release notes 
Deliverables
•	Visual consistency review 
•	Accessibility audit 
•	Onboarding 
•	Product documentation 
•	Help center 
•	Final UAT 
•	Launch checklist 
________________________________________
34. Exact First-to-Last Build Order
Use this sequence without skipping foundational phases:
1. Freeze MVP requirements
2. Create repository and environments
3. Configure CI, linting and tests
4. Build backend architecture
5. Create foundational database migrations
6. Implement authentication
7. Implement tenant context
8. Implement RBAC and RLS
9. Build design system
10. Build application shell
11. Build organization/customer/site management
12. Build collector registration and heartbeat
13. Build secrets and credentials
14. Build device inventory
15. Build manual device onboarding
16. Build discovery
17. Build polling scheduler
18. Build SNMP collector
19. Build metric ingestion
20. Build TimescaleDB storage and aggregates
21. Build metric APIs and charts
22. Build threshold engine
23. Build alerts
24. Build notifications
25. Build operational dashboard
26. Complete audit center
27. Run MVP testing and hardening
28. Deploy staging
29. Deploy pilot production
30. Stabilize Release 1
31. Build incidents
32. Build tickets and SLA
33. Build knowledge base
34. Build AI gateway and read-only AI tools
35. Build workflow engine
36. Build visual automation builder
37. Build reports
38. Build topology
39. Build configuration backups
40. Build external integrations
41. Build enterprise administration
42. Complete security hardening
43. Complete performance testing
44. Complete disaster recovery
45. Complete accessibility and UX polish
46. Run UAT
47. Launch gradually
________________________________________
35. AI Coding Agent Workflow
AI agents should work on one clearly bounded task at a time.
Do not ask an agent:
Build the complete NS3 Central application.
Instead, provide a feature packet.
Each AI task packet should contain
Task title
Business purpose
Relevant user story
Exact scope
Out-of-scope items
Existing architecture
Files allowed to modify
Database tables
API contract
UI states
Permissions
Validation rules
Error cases
Test cases
Acceptance criteria
Commands to run
Recommended agent sequence for every feature
Step 1 — Ask for analysis only
Prompt the agent to:
•	inspect the repository 
•	identify related files 
•	explain the existing flow 
•	propose a plan 
•	list risks 
•	avoid writing code 
Step 2 — Review the plan
Confirm:
•	architecture alignment 
•	tenant isolation 
•	security 
•	migration impact 
•	backwards compatibility 
•	tests 
Step 3 — Ask for implementation in small slices
Example:
Slice 1: database migration and model
Slice 2: repository and service
Slice 3: API routes
Slice 4: frontend API client
Slice 5: UI
Slice 6: tests
Slice 7: documentation
Step 4 — Require validation
The agent must run:
•	format 
•	lint 
•	typecheck 
•	unit tests 
•	relevant integration tests 
•	build 
Step 5 — Human review
Review:
•	security 
•	ownership 
•	error handling 
•	test quality 
•	hidden assumptions 
•	unnecessary complexity 
Step 6 — Commit only a complete slice
Use small commits:
feat(auth): add rotating refresh sessions
feat(inventory): add device creation service
test(inventory): cover cross-tenant device access
________________________________________
36. Standard AI Agent Prompt Template
You are working on NS3 Central, a multi-tenant infrastructure operations platform.

Task:
[Describe one bounded feature.]

Business objective:
[Explain why the feature exists.]

Existing architecture:
- React + TypeScript frontend
- FastAPI + SQLAlchemy backend
- PostgreSQL + TimescaleDB
- Redis + Celery
- Tenant isolation through tenant_id and PostgreSQL RLS
- RBAC must be enforced server-side
- All sensitive mutations require audit logs

Scope:
[List exact required behavior.]

Out of scope:
[List explicitly excluded behavior.]

Database:
[List relevant tables and expected schema changes.]

API contract:
[List endpoints, request fields, response fields and error codes.]

Frontend behavior:
[List screens, components, loading, empty, success and error states.]

Permissions:
[List permission codes and data-scope rules.]

Security requirements:
- Never trust tenant_id from the client.
- Never expose secrets.
- Validate ownership of every foreign key.
- Add idempotency where the request may be retried.
- Add audit logs for sensitive mutations.

Testing:
[List unit, integration and E2E tests.]

Acceptance criteria:
[List measurable completion conditions.]

First inspect the repository and produce an implementation plan. Do not modify files until the plan is reviewed.
________________________________________
37. Definition of Done for Every Feature
A feature is not complete merely because the screen works.
It is complete only when:
•	Requirements are satisfied. 
•	Backend authorization is enforced. 
•	Tenant isolation is tested. 
•	Database migration is reviewed. 
•	API is documented. 
•	Loading, empty, error and permission states exist. 
•	Unit tests pass. 
•	Integration tests pass. 
•	Critical E2E tests pass. 
•	Audit events are added. 
•	Logs and metrics are added. 
•	Accessibility is checked. 
•	Documentation is updated. 
•	CI passes. 
•	No secrets are committed. 
•	Rollback or migration recovery is understood. 
•	Product acceptance criteria are met. 
________________________________________
38. Suggested Sprint Structure
For a small team, use two-week sprints.
Sprint 0
•	Requirements 
•	Architecture 
•	Repository 
•	Docker 
•	CI 
Sprint 1
•	Database foundation 
•	Authentication 
•	Sessions 
Sprint 2
•	Tenants 
•	Organizations 
•	RBAC 
•	Admin shell 
Sprint 3
•	Design system 
•	App shell 
•	Sites and users 
Sprint 4
•	Collector registration 
•	Heartbeats 
•	Credentials 
Sprint 5
•	Device inventory 
•	Manual onboarding 
Sprint 6
•	Discovery 
•	Interfaces 
•	Import 
Sprint 7
•	Polling engine 
•	Metric ingestion 
Sprint 8
•	Metrics UI 
•	Device monitoring 
Sprint 9
•	Thresholds 
•	Alerts 
•	Notifications 
Sprint 10
•	Dashboard 
•	Audit center 
•	MVP hardening 
Sprint 11
•	Staging 
•	Load testing 
•	Security testing 
Sprint 12
•	Pilot deployment 
•	Bug fixes 
•	Release 1 launch 
Subsequent sprints can follow the feature sequence described above.
________________________________________
39. Highest-Risk Areas
Spend extra engineering and testing time on:
1.	Tenant isolation 
2.	Secret storage 
3.	Collector authentication 
4.	SNMP v3 handling 
5.	Metric ingestion scale 
6.	Alert deduplication 
7.	Workflow safety 
8.	AI permission boundaries 
9.	Database migrations 
10.	Backup restoration 
11.	Audit integrity 
12.	Production observability 
A visually complete dashboard with fake data is not meaningful progress if these foundations are missing.
________________________________________
40. Final Release Gates
Release 1 gate
Required:
•	Real collector 
•	Real devices 
•	Real metrics 
•	Real alerts 
•	Secure authentication 
•	Tenant isolation 
•	Audit logging 
•	Monitoring 
•	Backup and restore test 
•	Pilot customer approval 
Release 2 gate
Required:
•	Incidents 
•	Tickets 
•	AI grounded in actual data 
•	Workflow approvals 
•	Reports 
•	Topology 
•	Integration reliability 
General availability gate
Required:
•	Security review 
•	Penetration test 
•	Accessibility audit 
•	Load test 
•	DR test 
•	Support process 
•	Operational runbooks 
•	Legal and privacy documentation 
•	UAT approval 
•	Gradual rollout plan

