NS3 Central — Complete Backend Database Schema
Target stack: PostgreSQL 16+, TimescaleDB for metrics, Redis for cache/queues/sessions, object storage for files, FastAPI + SQLAlchemy/Alembic.
This schema is designed for:
•	Multi-tenant SaaS 
•	MSP and enterprise deployments 
•	Large device fleets 
•	Real-time monitoring 
•	Alerts and incidents 
•	AI-assisted operations 
•	Automation workflows 
•	Support tickets 
•	Reporting 
•	Integrations 
•	Strict auditability and tenant isolation 
________________________________________
1. Database Design Principles
1.1 Primary database strategy
Use PostgreSQL for:
•	Users and authentication 
•	Tenants and organizations 
•	Inventory 
•	Alerts 
•	Tickets 
•	Automation 
•	Reports 
•	Integrations 
•	Audit logs 
•	Configuration 
Use TimescaleDB hypertables for:
•	Device metrics 
•	Interface metrics 
•	Collector metrics 
•	Platform metrics 
•	Event streams 
Use Redis for:
•	Rate limiting 
•	Temporary sessions 
•	Distributed locks 
•	Celery queues 
•	WebSocket presence 
•	Cached dashboards 
•	Short-lived AI context 
Use S3-compatible object storage for:
•	Attachments 
•	Reports 
•	Configuration backups 
•	Diagnostic bundles 
•	Knowledge-base assets 
•	Exported data 
________________________________________
2. Global Conventions
2.1 Primary keys
Use UUIDv7 where available.
id UUID PRIMARY KEY DEFAULT uuid_generate_v7()
UUIDv7 is preferable because it is time-sortable and performs better in indexes than random UUIDv4.
________________________________________
2.2 Standard columns
Most business tables should include:
id              UUID PRIMARY KEY
tenant_id       UUID NOT NULL
created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
created_by      UUID NULL
updated_by      UUID NULL
deleted_at      TIMESTAMPTZ NULL
version         INTEGER NOT NULL DEFAULT 1
deleted_at enables soft deletion.
version supports optimistic concurrency control.
________________________________________
2.3 Naming
•	Tables: plural snake_case 
•	Columns: snake_case 
•	Foreign keys: <entity>_id 
•	Boolean columns: is_*, has_*, can_* 
•	Timestamps: *_at 
•	JSON columns: *_json or descriptive JSONB name 
•	Enums: PostgreSQL enums only for highly stable values; otherwise use lookup tables or constrained text 
________________________________________
2.4 Multi-tenancy rule
Every tenant-owned table must include:
tenant_id UUID NOT NULL
All tenant reads must include:
WHERE tenant_id = :current_tenant_id
Prefer PostgreSQL Row-Level Security in addition to application authorization.
________________________________________
3. Tenant and Organization Hierarchy
Platform
└── Tenant
    ├── Organizations
    │   ├── Customers
    │   │   └── Sites
    │   │       ├── Collectors
    │   │       └── Devices
    └── Users
A tenant may represent:
•	A direct enterprise customer 
•	An MSP 
•	An internal NS3 deployment 
________________________________________
4. Tenant Tables
4.1 tenants
Top-level data isolation boundary.
Column	Type	Constraints
id	UUID	PK
name	VARCHAR(200)	NOT NULL
slug	VARCHAR(100)	NOT NULL UNIQUE
tenant_type	VARCHAR(30)	enterprise, msp, internal
status	VARCHAR(30)	active, suspended, trial, closed
default_timezone	VARCHAR(64)	NOT NULL
default_locale	VARCHAR(20)	NOT NULL DEFAULT en-IN
data_region	VARCHAR(50)	nullable
settings	JSONB	NOT NULL DEFAULT {}
metadata	JSONB	NOT NULL DEFAULT {}
created_at	TIMESTAMPTZ	NOT NULL
updated_at	TIMESTAMPTZ	NOT NULL
deleted_at	TIMESTAMPTZ	nullable
Indexes:
UNIQUE INDEX idx_tenants_slug ON tenants(slug);
INDEX idx_tenants_status ON tenants(status);
________________________________________
4.2 organizations
A tenant may manage one or more organizations.
Column	Type	Constraints
id	UUID	PK
tenant_id	UUID	FK tenants.id
parent_organization_id	UUID	nullable self-FK
name	VARCHAR(200)	NOT NULL
slug	VARCHAR(120)	NOT NULL
organization_type	VARCHAR(30)	internal, customer, department
status	VARCHAR(30)	active, suspended, archived
industry	VARCHAR(100)	nullable
timezone	VARCHAR(64)	nullable
contact_email	CITEXT	nullable
contact_phone	VARCHAR(30)	nullable
billing_email	CITEXT	nullable
address	JSONB	default {}
settings	JSONB	default {}
metadata	JSONB	default {}
created_at	TIMESTAMPTZ	
updated_at	TIMESTAMPTZ	
deleted_at	TIMESTAMPTZ	
Indexes:
UNIQUE (tenant_id, slug)
INDEX (tenant_id, status)
INDEX (tenant_id, parent_organization_id)
________________________________________
4.3 customers
Used mainly by MSP tenants.
Column	Type
id	UUID PK
tenant_id	UUID FK
organization_id	UUID FK organizations.id
name	VARCHAR(200)
customer_code	VARCHAR(80)
status	VARCHAR(30)
industry	VARCHAR(100)
service_plan_id	UUID nullable
primary_contact_name	VARCHAR(150)
primary_contact_email	CITEXT
primary_contact_phone	VARCHAR(30)
support_tier	VARCHAR(30)
contract_start_at	TIMESTAMPTZ
contract_end_at	TIMESTAMPTZ
sla_policy_id	UUID nullable
settings	JSONB
metadata	JSONB
created_at	TIMESTAMPTZ
updated_at	TIMESTAMPTZ
deleted_at	TIMESTAMPTZ
Indexes:
UNIQUE (tenant_id, customer_code)
INDEX (tenant_id, organization_id)
INDEX (tenant_id, status)
________________________________________
4.4 sites
Column	Type
id	UUID PK
tenant_id	UUID FK
organization_id	UUID FK
customer_id	UUID nullable FK
parent_site_id	UUID nullable self-FK
name	VARCHAR(200)
code	VARCHAR(80)
site_type	VARCHAR(50)
status	VARCHAR(30)
timezone	VARCHAR(64)
address	JSONB
latitude	NUMERIC(9,6)
longitude	NUMERIC(9,6)
business_hours	JSONB
maintenance_calendar_id	UUID nullable
settings	JSONB
metadata	JSONB
created_at	TIMESTAMPTZ
updated_at	TIMESTAMPTZ
deleted_at	TIMESTAMPTZ
Indexes:
UNIQUE (tenant_id, code)
INDEX (tenant_id, organization_id)
INDEX (tenant_id, customer_id)
INDEX (tenant_id, status)
INDEX USING GIST on geographic coordinates if PostGIS is enabled
________________________________________
5. User and Authentication Schema
5.1 users
Global identity record. A user may belong to multiple tenants.
Column	Type
id	UUID PK
email	CITEXT UNIQUE
username	CITEXT nullable
password_hash	TEXT nullable
first_name	VARCHAR(100)
last_name	VARCHAR(100)
display_name	VARCHAR(200)
phone	VARCHAR(30) nullable
avatar_url	TEXT nullable
status	VARCHAR(30)
email_verified_at	TIMESTAMPTZ nullable
phone_verified_at	TIMESTAMPTZ nullable
last_login_at	TIMESTAMPTZ nullable
password_changed_at	TIMESTAMPTZ nullable
failed_login_count	INTEGER default 0
locked_until	TIMESTAMPTZ nullable
preferences	JSONB default {}
locale	VARCHAR(20)
timezone	VARCHAR(64)
created_at	TIMESTAMPTZ
updated_at	TIMESTAMPTZ
deleted_at	TIMESTAMPTZ
Indexes:
UNIQUE INDEX idx_users_email ON users(email);
INDEX idx_users_status ON users(status);
INDEX idx_users_last_login ON users(last_login_at);
Never store raw passwords.
Use Argon2id hashes.
________________________________________
5.2 tenant_memberships
Maps users to tenants.
Column	Type
id	UUID PK
tenant_id	UUID FK
user_id	UUID FK
status	VARCHAR(30)
membership_type	VARCHAR(30)
default_organization_id	UUID nullable
invited_by	UUID nullable FK users
invited_at	TIMESTAMPTZ nullable
joined_at	TIMESTAMPTZ nullable
expires_at	TIMESTAMPTZ nullable
settings	JSONB
created_at	TIMESTAMPTZ
updated_at	TIMESTAMPTZ
Constraints:
UNIQUE (tenant_id, user_id)
Indexes:
INDEX (user_id, status)
INDEX (tenant_id, status)
________________________________________
5.3 organization_memberships
Limits user access to specific organizations.
Column	Type
id	UUID PK
tenant_id	UUID FK
organization_id	UUID FK
user_id	UUID FK
status	VARCHAR(30)
is_primary	BOOLEAN
created_at	TIMESTAMPTZ
updated_at	TIMESTAMPTZ
Constraint:
UNIQUE (organization_id, user_id)
________________________________________
5.4 customer_memberships
Optional access restriction for MSP users.
Column	Type
id	UUID PK
tenant_id	UUID FK
customer_id	UUID FK
user_id	UUID FK
access_level	VARCHAR(30)
created_at	TIMESTAMPTZ
Constraint:
UNIQUE (customer_id, user_id)
________________________________________
5.5 site_memberships
Column	Type
id	UUID PK
tenant_id	UUID FK
site_id	UUID FK
user_id	UUID FK
access_level	VARCHAR(30)
created_at	TIMESTAMPTZ
Constraint:
UNIQUE (site_id, user_id)
________________________________________
6. Authentication and Session Tables
6.1 user_sessions
Stores refresh-session state.
Column	Type
id	UUID PK
user_id	UUID FK
tenant_id	UUID nullable FK
session_token_hash	TEXT UNIQUE
refresh_token_family	UUID
device_id	VARCHAR(200)
device_name	VARCHAR(200)
user_agent	TEXT
ip_address	INET
country_code	VARCHAR(2)
last_activity_at	TIMESTAMPTZ
expires_at	TIMESTAMPTZ
revoked_at	TIMESTAMPTZ nullable
revoke_reason	VARCHAR(100) nullable
created_at	TIMESTAMPTZ
Indexes:
INDEX (user_id, revoked_at)
INDEX (expires_at)
INDEX (refresh_token_family)
Access JWTs should be short-lived, for example 5–15 minutes.
Refresh tokens should be:
•	Rotated after every use 
•	Hashed before storage 
•	Revoked as a family if reuse is detected 
________________________________________
6.2 login_attempts
Column	Type
id	UUID PK
email	CITEXT nullable
user_id	UUID nullable
ip_address	INET
user_agent	TEXT
was_successful	BOOLEAN
failure_reason	VARCHAR(100)
attempted_at	TIMESTAMPTZ
Indexes:
INDEX (email, attempted_at DESC)
INDEX (ip_address, attempted_at DESC)
INDEX (user_id, attempted_at DESC)
________________________________________
6.3 password_reset_tokens
Column	Type
id	UUID PK
user_id	UUID FK
token_hash	TEXT UNIQUE
expires_at	TIMESTAMPTZ
consumed_at	TIMESTAMPTZ nullable
created_at	TIMESTAMPTZ
________________________________________
6.4 email_verification_tokens
Same structure as password reset tokens.
________________________________________
6.5 mfa_methods
Column	Type
id	UUID PK
user_id	UUID FK
method_type	VARCHAR(30)
encrypted_secret	BYTEA nullable
phone_number	VARCHAR(30) nullable
credential_id	BYTEA nullable
public_key	BYTEA nullable
is_primary	BOOLEAN
is_verified	BOOLEAN
last_used_at	TIMESTAMPTZ
created_at	TIMESTAMPTZ
disabled_at	TIMESTAMPTZ nullable
Supported methods:
•	TOTP 
•	WebAuthn 
•	Recovery codes 
•	SMS, only if absolutely required 
________________________________________
6.6 mfa_recovery_codes
Column	Type
id	UUID PK
user_id	UUID FK
code_hash	TEXT
used_at	TIMESTAMPTZ nullable
created_at	TIMESTAMPTZ
________________________________________
6.7 identity_providers
Column	Type
id	UUID PK
tenant_id	UUID FK
provider_type	VARCHAR(30)
name	VARCHAR(150)
issuer_url	TEXT
client_id	TEXT
encrypted_client_secret	BYTEA nullable
metadata_url	TEXT nullable
configuration	JSONB
is_enabled	BOOLEAN
created_at	TIMESTAMPTZ
updated_at	TIMESTAMPTZ
________________________________________
6.8 external_identities
Column	Type
id	UUID PK
user_id	UUID FK
identity_provider_id	UUID FK
external_subject	VARCHAR(255)
external_email	CITEXT
claims	JSONB
last_login_at	TIMESTAMPTZ
created_at	TIMESTAMPTZ
Constraint:
UNIQUE (identity_provider_id, external_subject)
________________________________________
6.9 user_invitations
Column	Type
id	UUID PK
tenant_id	UUID FK
email	CITEXT
invited_by	UUID FK users
token_hash	TEXT UNIQUE
role_ids	UUID[]
organization_ids	UUID[]
customer_ids	UUID[]
site_ids	UUID[]
status	VARCHAR(30)
expires_at	TIMESTAMPTZ
accepted_at	TIMESTAMPTZ nullable
created_at	TIMESTAMPTZ
________________________________________
7. Authorization and RBAC Tables
7.1 roles
Column	Type
id	UUID PK
tenant_id	UUID nullable
name	VARCHAR(100)
slug	VARCHAR(100)
description	TEXT
role_type	VARCHAR(30)
is_system	BOOLEAN
is_assignable	BOOLEAN
created_at	TIMESTAMPTZ
updated_at	TIMESTAMPTZ
deleted_at	TIMESTAMPTZ
tenant_id = NULL means platform-defined system role.
Constraint:
UNIQUE NULLS NOT DISTINCT (tenant_id, slug)
________________________________________
7.2 permissions
Global permission catalogue.
Column	Type
id	UUID PK
code	VARCHAR(150) UNIQUE
module	VARCHAR(80)
resource	VARCHAR(80)
action	VARCHAR(50)
description	TEXT
risk_level	VARCHAR(20)
created_at	TIMESTAMPTZ
Examples:
inventory.device.read
inventory.device.create
inventory.device.update
inventory.device.delete
monitoring.metric.read
alerts.alert.acknowledge
automation.workflow.execute
automation.workflow.approve
admin.user.manage
________________________________________
7.3 role_permissions
Column	Type
role_id	UUID FK
permission_id	UUID FK
effect	VARCHAR(10)
conditions	JSONB
created_at	TIMESTAMPTZ
Primary key:
PRIMARY KEY (role_id, permission_id)
effect can be allow or deny.
conditions may include:
{
  "scope": "site",
  "allowed_severities": ["low", "medium"],
  "requires_approval": true
}
________________________________________
7.4 user_role_assignments
Column	Type
id	UUID PK
tenant_id	UUID FK
user_id	UUID FK
role_id	UUID FK
scope_type	VARCHAR(30)
scope_id	UUID nullable
starts_at	TIMESTAMPTZ nullable
expires_at	TIMESTAMPTZ nullable
assigned_by	UUID FK users
created_at	TIMESTAMPTZ
Scope types:
•	tenant 
•	organization 
•	customer 
•	site 
•	device_group 
Indexes:
INDEX (tenant_id, user_id)
INDEX (role_id)
INDEX (scope_type, scope_id)
INDEX (expires_at)
________________________________________
7.5 teams
Column	Type
id	UUID PK
tenant_id	UUID FK
organization_id	UUID nullable FK
name	VARCHAR(150)
slug	VARCHAR(100)
description	TEXT
manager_user_id	UUID nullable
settings	JSONB
created_at	TIMESTAMPTZ
updated_at	TIMESTAMPTZ
Constraint:
UNIQUE (tenant_id, slug)
________________________________________
7.6 team_members
Column	Type
team_id	UUID FK
user_id	UUID FK
member_role	VARCHAR(30)
joined_at	TIMESTAMPTZ
Primary key:
PRIMARY KEY (team_id, user_id)
________________________________________
7.7 team_role_assignments
Same scope structure as user role assignments.
________________________________________
8. API and Machine Identity Tables
8.1 service_accounts
Column	Type
id	UUID PK
tenant_id	UUID FK
name	VARCHAR(150)
description	TEXT
status	VARCHAR(30)
created_by	UUID
last_used_at	TIMESTAMPTZ
expires_at	TIMESTAMPTZ nullable
created_at	TIMESTAMPTZ
________________________________________
8.2 api_keys
Column	Type
id	UUID PK
tenant_id	UUID FK
service_account_id	UUID nullable
user_id	UUID nullable
name	VARCHAR(150)
key_prefix	VARCHAR(20)
key_hash	TEXT
scopes	TEXT[]
allowed_ips	CIDR[]
allowed_origins	TEXT[]
rate_limit_policy_id	UUID nullable
last_used_at	TIMESTAMPTZ
expires_at	TIMESTAMPTZ nullable
revoked_at	TIMESTAMPTZ nullable
created_at	TIMESTAMPTZ
Indexes:
UNIQUE (key_hash)
INDEX (tenant_id, key_prefix)
INDEX (expires_at)
Never store raw API keys.
________________________________________
9. Inventory Domain
9.1 device_types
Reference catalogue.
Column	Type
id	UUID PK
vendor	VARCHAR(100)
product_family	VARCHAR(100)
model	VARCHAR(150)
device_category	VARCHAR(50)
capabilities	JSONB
default_polling_profile_id	UUID nullable
created_at	TIMESTAMPTZ
________________________________________
9.2 devices
Central device record.
Column	Type
id	UUID PK
tenant_id	UUID FK
organization_id	UUID FK
customer_id	UUID nullable FK
site_id	UUID FK
collector_id	UUID nullable FK
device_type_id	UUID nullable FK
parent_device_id	UUID nullable self-FK
name	VARCHAR(200)
display_name	VARCHAR(200)
hostname	VARCHAR(255)
primary_ip	INET
management_ip	INET
mac_address	MACADDR nullable
serial_number	VARCHAR(150)
asset_tag	VARCHAR(100)
vendor	VARCHAR(100)
model	VARCHAR(150)
operating_system	VARCHAR(150)
firmware_version	VARCHAR(100)
device_category	VARCHAR(50)
status	VARCHAR(30)
lifecycle_status	VARCHAR(30)
monitoring_status	VARCHAR(30)
health_score	NUMERIC(5,2)
reachability_status	VARCHAR(30)
last_seen_at	TIMESTAMPTZ
discovered_at	TIMESTAMPTZ
installed_at	TIMESTAMPTZ nullable
warranty_expires_at	DATE nullable
support_expires_at	DATE nullable
criticality	VARCHAR(30)
credential_profile_id	UUID nullable
polling_profile_id	UUID nullable
configuration	JSONB
custom_fields	JSONB
metadata	JSONB
created_at	TIMESTAMPTZ
updated_at	TIMESTAMPTZ
deleted_at	TIMESTAMPTZ
version	INTEGER
Important indexes:
UNIQUE (tenant_id, site_id, serial_number) WHERE serial_number IS NOT NULL
INDEX (tenant_id, site_id)
INDEX (tenant_id, collector_id)
INDEX (tenant_id, status)
INDEX (tenant_id, primary_ip)
INDEX (tenant_id, hostname)
GIN INDEX (custom_fields)
GIN INDEX (metadata)
________________________________________
9.3 device_addresses
Column	Type
id	UUID PK
tenant_id	UUID FK
device_id	UUID FK
address	INET
address_type	VARCHAR(30)
interface_id	UUID nullable
is_primary	BOOLEAN
discovered_at	TIMESTAMPTZ
Constraint:
UNIQUE (device_id, address)
________________________________________
9.4 device_interfaces
Column	Type
id	UUID PK
tenant_id	UUID FK
device_id	UUID FK
interface_index	INTEGER
name	VARCHAR(200)
alias	VARCHAR(255)
description	TEXT
interface_type	VARCHAR(50)
mac_address	MACADDR
admin_status	VARCHAR(20)
operational_status	VARCHAR(20)
speed_bps	BIGINT
mtu	INTEGER
duplex	VARCHAR(20)
vlan_id	INTEGER nullable
ip_addresses	INET[]
parent_interface_id	UUID nullable
last_seen_at	TIMESTAMPTZ
metadata	JSONB
created_at	TIMESTAMPTZ
updated_at	TIMESTAMPTZ
deleted_at	TIMESTAMPTZ
Constraints:
UNIQUE (device_id, interface_index)
Indexes:
INDEX (tenant_id, device_id)
INDEX (tenant_id, operational_status)
INDEX (tenant_id, vlan_id)
________________________________________
9.5 device_groups
Column	Type
id	UUID PK
tenant_id	UUID FK
name	VARCHAR(150)
group_type	VARCHAR(30)
query_definition	JSONB nullable
description	TEXT
created_at	TIMESTAMPTZ
updated_at	TIMESTAMPTZ
________________________________________
9.6 device_group_members
Column	Type
device_group_id	UUID FK
device_id	UUID FK
source	VARCHAR(30)
added_at	TIMESTAMPTZ
Primary key:
PRIMARY KEY (device_group_id, device_id)
For dynamic groups, this may be materialized and refreshed.
________________________________________
9.7 device_tags
Column	Type
id	UUID PK
tenant_id	UUID FK
name	VARCHAR(80)
color	VARCHAR(20)
created_at	TIMESTAMPTZ
Constraint:
UNIQUE (tenant_id, name)
________________________________________
9.8 device_tag_assignments
PRIMARY KEY (device_id, tag_id)
Additional column:
assigned_at TIMESTAMPTZ
________________________________________
9.9 assets
Column	Type
id	UUID PK
tenant_id	UUID FK
device_id	UUID nullable FK
asset_type	VARCHAR(50)
asset_tag	VARCHAR(100)
serial_number	VARCHAR(150)
manufacturer	VARCHAR(100)
model	VARCHAR(150)
purchase_date	DATE
purchase_cost	NUMERIC(14,2)
currency	CHAR(3)
warranty_end_date	DATE
owner_department	VARCHAR(150)
lifecycle_status	VARCHAR(30)
metadata	JSONB
________________________________________
9.10 licenses
Column	Type
id	UUID PK
tenant_id	UUID FK
device_id	UUID nullable
vendor	VARCHAR(100)
product_name	VARCHAR(200)
license_key_encrypted	BYTEA nullable
license_type	VARCHAR(50)
quantity	INTEGER
start_date	DATE
end_date	DATE
status	VARCHAR(30)
metadata	JSONB
________________________________________
10. Collector and Discovery Domain
10.1 collectors
Column	Type
id	UUID PK
tenant_id	UUID FK
organization_id	UUID FK
customer_id	UUID nullable
site_id	UUID nullable
name	VARCHAR(200)
collector_key_hash	TEXT
version	VARCHAR(50)
status	VARCHAR(30)
operating_system	VARCHAR(80)
hostname	VARCHAR(255)
private_ip	INET
public_ip	INET
region	VARCHAR(80)
capabilities	JSONB
configuration	JSONB
current_job_count	INTEGER
managed_device_count	INTEGER
last_heartbeat_at	TIMESTAMPTZ
registered_at	TIMESTAMPTZ
last_upgrade_at	TIMESTAMPTZ nullable
certificate_expires_at	TIMESTAMPTZ nullable
created_at	TIMESTAMPTZ
updated_at	TIMESTAMPTZ
Indexes:
INDEX (tenant_id, site_id)
INDEX (tenant_id, status)
INDEX (last_heartbeat_at)
________________________________________
10.2 collector_heartbeats
Timescale hypertable.
Column	Type
time	TIMESTAMPTZ
tenant_id	UUID
collector_id	UUID
status	VARCHAR(30)
cpu_percent	REAL
memory_percent	REAL
disk_percent	REAL
queue_depth	INTEGER
latency_ms	REAL
active_jobs	INTEGER
metadata	JSONB
Partition by time, optionally space-partition by tenant_id.
________________________________________
10.3 credential_profiles
Column	Type
id	UUID PK
tenant_id	UUID FK
name	VARCHAR(150)
credential_type	VARCHAR(30)
username	VARCHAR(200) nullable
encrypted_secret	BYTEA
encrypted_private_key	BYTEA nullable
auth_protocol	VARCHAR(50) nullable
privacy_protocol	VARCHAR(50) nullable
port	INTEGER nullable
settings	JSONB
secret_version	INTEGER
last_rotated_at	TIMESTAMPTZ
created_at	TIMESTAMPTZ
updated_at	TIMESTAMPTZ
Never return encrypted material through normal API responses.
________________________________________
10.4 discovery_jobs
Column	Type
id	UUID PK
tenant_id	UUID FK
site_id	UUID FK
collector_id	UUID FK
name	VARCHAR(150)
discovery_type	VARCHAR(30)
target_ranges	CIDR[]
target_hosts	INET[]
protocol_settings	JSONB
credential_profile_ids	UUID[]
status	VARCHAR(30)
progress_percent	NUMERIC(5,2)
devices_found	INTEGER
devices_imported	INTEGER
started_at	TIMESTAMPTZ
completed_at	TIMESTAMPTZ
requested_by	UUID FK
error_summary	TEXT
created_at	TIMESTAMPTZ
Indexes:
INDEX (tenant_id, status)
INDEX (collector_id, created_at DESC)
________________________________________
10.5 discovery_results
Column	Type
id	UUID PK
tenant_id	UUID FK
discovery_job_id	UUID FK
discovered_ip	INET
hostname	VARCHAR(255)
mac_address	MACADDR
vendor	VARCHAR(100)
model	VARCHAR(150)
serial_number	VARCHAR(150)
protocols	TEXT[]
confidence_score	NUMERIC(5,2)
raw_data	JSONB
import_status	VARCHAR(30)
imported_device_id	UUID nullable
created_at	TIMESTAMPTZ
________________________________________
11. Monitoring Domain
11.1 metric_definitions
Column	Type
id	UUID PK
namespace	VARCHAR(100)
metric_key	VARCHAR(200)
display_name	VARCHAR(200)
description	TEXT
unit	VARCHAR(50)
value_type	VARCHAR(30)
aggregation_type	VARCHAR(30)
entity_type	VARCHAR(50)
default_retention_days	INTEGER
metadata	JSONB
Constraint:
UNIQUE (namespace, metric_key)
________________________________________
11.2 device_metrics
Timescale hypertable.
Column	Type
time	TIMESTAMPTZ NOT NULL
tenant_id	UUID NOT NULL
organization_id	UUID
customer_id	UUID nullable
site_id	UUID
device_id	UUID NOT NULL
interface_id	UUID nullable
metric_definition_id	UUID NOT NULL
value_double	DOUBLE PRECISION nullable
value_bigint	BIGINT nullable
value_text	TEXT nullable
quality	SMALLINT
labels	JSONB
collector_id	UUID
ingestion_id	UUID
Indexes:
(device_id, metric_definition_id, time DESC)
(interface_id, metric_definition_id, time DESC)
(tenant_id, time DESC)
GIN(labels)
Only one value column should be populated per row.
For very high scale, use a numeric metric table and a separate event/string table.
________________________________________
11.3 polling_profiles
Column	Type
id	UUID PK
tenant_id	UUID FK
name	VARCHAR(150)
description	TEXT
default_interval_seconds	INTEGER
timeout_seconds	INTEGER
retry_count	INTEGER
enabled_metric_ids	UUID[]
protocol_config	JSONB
is_default	BOOLEAN
created_at	TIMESTAMPTZ
updated_at	TIMESTAMPTZ
________________________________________
11.4 polling_jobs
Column	Type
id	UUID PK
tenant_id	UUID
collector_id	UUID
device_id	UUID
polling_profile_id	UUID
scheduled_at	TIMESTAMPTZ
started_at	TIMESTAMPTZ
completed_at	TIMESTAMPTZ
status	VARCHAR(30)
attempt	INTEGER
duration_ms	INTEGER
result_summary	JSONB
error_code	VARCHAR(100)
error_message	TEXT
Consider partitioning monthly.
________________________________________
11.5 threshold_rules
Column	Type
id	UUID PK
tenant_id	UUID
name	VARCHAR(200)
description	TEXT
metric_definition_id	UUID
entity_type	VARCHAR(30)
entity_scope	JSONB
operator	VARCHAR(20)
warning_value	DOUBLE PRECISION nullable
critical_value	DOUBLE PRECISION nullable
recovery_value	DOUBLE PRECISION nullable
evaluation_window_seconds	INTEGER
required_occurrences	INTEGER
severity	VARCHAR(20)
is_enabled	BOOLEAN
alert_rule_id	UUID nullable
created_by	UUID
created_at	TIMESTAMPTZ
updated_at	TIMESTAMPTZ
________________________________________
11.6 maintenance_windows
Column	Type
id	UUID PK
tenant_id	UUID
name	VARCHAR(200)
scope_type	VARCHAR(30)
scope_ids	UUID[]
starts_at	TIMESTAMPTZ
ends_at	TIMESTAMPTZ
recurrence_rule	TEXT nullable
suppress_alerts	BOOLEAN
pause_polling	BOOLEAN
reason	TEXT
status	VARCHAR(30)
created_by	UUID
created_at	TIMESTAMPTZ
Indexes:
INDEX (tenant_id, starts_at, ends_at)
GIN (scope_ids)
________________________________________
12. Event and Alert Domain
12.1 events
General normalized event stream.
Column	Type
id	UUID PK
tenant_id	UUID
organization_id	UUID
customer_id	UUID nullable
site_id	UUID nullable
source_type	VARCHAR(50)
source_id	UUID nullable
event_type	VARCHAR(100)
severity	VARCHAR(20)
title	VARCHAR(300)
message	TEXT
occurred_at	TIMESTAMPTZ
received_at	TIMESTAMPTZ
correlation_key	VARCHAR(255)
fingerprint	VARCHAR(255)
labels	JSONB
raw_payload	JSONB
status	VARCHAR(30)
Indexes:
INDEX (tenant_id, occurred_at DESC)
INDEX (tenant_id, source_type, source_id)
INDEX (tenant_id, severity, occurred_at DESC)
INDEX (tenant_id, fingerprint)
GIN (labels)
Partition by month for scale.
________________________________________
12.2 alert_rules
Column	Type
id	UUID PK
tenant_id	UUID
name	VARCHAR(200)
description	TEXT
rule_type	VARCHAR(30)
condition_expression	JSONB
grouping_expression	JSONB
deduplication_window_seconds	INTEGER
recovery_condition	JSONB
default_severity	VARCHAR(20)
notification_policy_id	UUID nullable
escalation_policy_id	UUID nullable
is_enabled	BOOLEAN
created_by	UUID
created_at	TIMESTAMPTZ
updated_at	TIMESTAMPTZ
version	INTEGER
________________________________________
12.3 alerts
Column	Type
id	UUID PK
tenant_id	UUID
organization_id	UUID
customer_id	UUID nullable
site_id	UUID nullable
alert_rule_id	UUID nullable
source_event_id	UUID nullable
device_id	UUID nullable
interface_id	UUID nullable
collector_id	UUID nullable
incident_id	UUID nullable
title	VARCHAR(300)
description	TEXT
severity	VARCHAR(20)
status	VARCHAR(30)
fingerprint	VARCHAR(255)
occurrence_count	INTEGER
first_triggered_at	TIMESTAMPTZ
last_triggered_at	TIMESTAMPTZ
acknowledged_at	TIMESTAMPTZ nullable
acknowledged_by	UUID nullable
resolved_at	TIMESTAMPTZ nullable
resolved_by	UUID nullable
suppressed_until	TIMESTAMPTZ nullable
assigned_user_id	UUID nullable
assigned_team_id	UUID nullable
impact	JSONB
labels	JSONB
context	JSONB
created_at	TIMESTAMPTZ
updated_at	TIMESTAMPTZ
Indexes:
INDEX (tenant_id, status, severity)
INDEX (tenant_id, device_id, status)
INDEX (tenant_id, incident_id)
INDEX (tenant_id, assigned_user_id, status)
INDEX (tenant_id, last_triggered_at DESC)
UNIQUE partial index on active fingerprint where status not resolved
________________________________________
12.4 alert_occurrences
Preserves each repeated trigger.
Column	Type
id	UUID PK
tenant_id	UUID
alert_id	UUID FK
event_id	UUID nullable
triggered_at	TIMESTAMPTZ
observed_value	JSONB
context	JSONB
________________________________________
12.5 alert_comments
Column	Type
id	UUID PK
tenant_id	UUID
alert_id	UUID
author_user_id	UUID
body	TEXT
created_at	TIMESTAMPTZ
updated_at	TIMESTAMPTZ
________________________________________
12.6 incidents
Column	Type
id	UUID PK
tenant_id	UUID
organization_id	UUID
customer_id	UUID nullable
site_id	UUID nullable
incident_number	BIGINT
title	VARCHAR(300)
description	TEXT
severity	VARCHAR(20)
priority	VARCHAR(20)
status	VARCHAR(30)
owner_user_id	UUID nullable
owner_team_id	UUID nullable
root_cause	TEXT nullable
impact_summary	TEXT nullable
resolution_summary	TEXT nullable
started_at	TIMESTAMPTZ
detected_at	TIMESTAMPTZ
acknowledged_at	TIMESTAMPTZ nullable
resolved_at	TIMESTAMPTZ nullable
closed_at	TIMESTAMPTZ nullable
ai_summary	TEXT nullable
metadata	JSONB
created_at	TIMESTAMPTZ
updated_at	TIMESTAMPTZ
Constraint:
UNIQUE (tenant_id, incident_number)
________________________________________
12.7 incident_alerts
PRIMARY KEY (incident_id, alert_id)
________________________________________
12.8 incident_timeline_entries
Column	Type
id	UUID PK
tenant_id	UUID
incident_id	UUID
entry_type	VARCHAR(50)
title	VARCHAR(200)
body	TEXT
actor_type	VARCHAR(30)
actor_id	UUID nullable
metadata	JSONB
occurred_at	TIMESTAMPTZ
________________________________________
13. Notification Domain
13.1 notification_channels
Column	Type
id	UUID PK
tenant_id	UUID
channel_type	VARCHAR(30)
name	VARCHAR(150)
encrypted_configuration	BYTEA
is_enabled	BOOLEAN
health_status	VARCHAR(30)
last_tested_at	TIMESTAMPTZ
created_at	TIMESTAMPTZ
updated_at	TIMESTAMPTZ
________________________________________
13.2 notification_policies
Column	Type
id	UUID PK
tenant_id	UUID
name	VARCHAR(150)
rules	JSONB
grouping_window_seconds	INTEGER
repeat_interval_seconds	INTEGER
is_enabled	BOOLEAN
created_at	TIMESTAMPTZ
updated_at	TIMESTAMPTZ
________________________________________
13.3 notification_policy_channels
PRIMARY KEY (notification_policy_id, notification_channel_id)
Additional fields:
severity_filter TEXT[]
delay_seconds INTEGER
________________________________________
13.4 notifications
In-app notification record.
Column	Type
id	UUID PK
tenant_id	UUID
user_id	UUID
notification_type	VARCHAR(50)
title	VARCHAR(250)
body	TEXT
severity	VARCHAR(20)
action_url	TEXT
entity_type	VARCHAR(50)
entity_id	UUID nullable
read_at	TIMESTAMPTZ nullable
dismissed_at	TIMESTAMPTZ nullable
created_at	TIMESTAMPTZ
Indexes:
INDEX (user_id, read_at, created_at DESC)
________________________________________
13.5 notification_deliveries
Column	Type
id	UUID PK
tenant_id	UUID
notification_channel_id	UUID
source_type	VARCHAR(50)
source_id	UUID
recipient	TEXT
status	VARCHAR(30)
attempt_count	INTEGER
provider_message_id	VARCHAR(255)
request_payload	JSONB
response_payload	JSONB
error_message	TEXT
queued_at	TIMESTAMPTZ
sent_at	TIMESTAMPTZ
delivered_at	TIMESTAMPTZ
________________________________________
14. Support and Ticketing Domain
14.1 ticket_queues
Column	Type
id	UUID PK
tenant_id	UUID
organization_id	UUID nullable
name	VARCHAR(150)
description	TEXT
default_priority	VARCHAR(20)
assignment_strategy	VARCHAR(30)
manager_user_id	UUID nullable
sla_policy_id	UUID nullable
settings	JSONB
created_at	TIMESTAMPTZ
updated_at	TIMESTAMPTZ
________________________________________
14.2 queue_members
PRIMARY KEY (queue_id, user_id)
Fields:
skill_level VARCHAR(30)
is_active BOOLEAN
max_active_tickets INTEGER
________________________________________
14.3 tickets
Column	Type
id	UUID PK
tenant_id	UUID
organization_id	UUID
customer_id	UUID nullable
site_id	UUID nullable
ticket_number	BIGINT
parent_ticket_id	UUID nullable
queue_id	UUID nullable
assigned_user_id	UUID nullable
assigned_team_id	UUID nullable
requester_user_id	UUID nullable
requester_name	VARCHAR(200)
requester_email	CITEXT nullable
source	VARCHAR(30)
title	VARCHAR(300)
description	TEXT
status	VARCHAR(30)
priority	VARCHAR(20)
category	VARCHAR(100)
subcategory	VARCHAR(100)
impact	VARCHAR(30)
urgency	VARCHAR(30)
business_service	VARCHAR(150)
root_cause	TEXT nullable
resolution_summary	TEXT nullable
first_response_due_at	TIMESTAMPTZ nullable
resolution_due_at	TIMESTAMPTZ nullable
acknowledged_at	TIMESTAMPTZ nullable
resolved_at	TIMESTAMPTZ nullable
closed_at	TIMESTAMPTZ nullable
sla_policy_id	UUID nullable
sla_state	VARCHAR(30)
tags	TEXT[]
custom_fields	JSONB
created_at	TIMESTAMPTZ
updated_at	TIMESTAMPTZ
deleted_at	TIMESTAMPTZ
Constraints:
UNIQUE (tenant_id, ticket_number)
Indexes:
INDEX (tenant_id, status, priority)
INDEX (tenant_id, assigned_user_id, status)
INDEX (tenant_id, queue_id, status)
INDEX (tenant_id, customer_id, created_at DESC)
INDEX (tenant_id, resolution_due_at)
GIN (tags)
GIN (custom_fields)
________________________________________
14.4 ticket_comments
Column	Type
id	UUID PK
tenant_id	UUID
ticket_id	UUID
author_user_id	UUID nullable
author_type	VARCHAR(30)
body	TEXT
body_format	VARCHAR(20)
visibility	VARCHAR(20)
is_ai_generated	BOOLEAN
created_at	TIMESTAMPTZ
updated_at	TIMESTAMPTZ
deleted_at	TIMESTAMPTZ
Visibility:
•	internal 
•	customer 
•	vendor 
________________________________________
14.5 ticket_links
Links tickets to other entities.
Column	Type
id	UUID PK
tenant_id	UUID
ticket_id	UUID
linked_entity_type	VARCHAR(50)
linked_entity_id	UUID
relationship_type	VARCHAR(50)
created_at	TIMESTAMPTZ
Indexes:
UNIQUE (ticket_id, linked_entity_type, linked_entity_id, relationship_type)
________________________________________
14.6 ticket_status_history
Column	Type
id	UUID PK
tenant_id	UUID
ticket_id	UUID
from_status	VARCHAR(30)
to_status	VARCHAR(30)
changed_by	UUID nullable
reason	TEXT
changed_at	TIMESTAMPTZ
________________________________________
14.7 sla_policies
Column	Type
id	UUID PK
tenant_id	UUID
name	VARCHAR(150)
timezone	VARCHAR(64)
business_hours	JSONB
holiday_calendar	JSONB
rules	JSONB
is_active	BOOLEAN
created_at	TIMESTAMPTZ
updated_at	TIMESTAMPTZ
________________________________________
14.8 sla_events
Column	Type
id	UUID PK
tenant_id	UUID
ticket_id	UUID
event_type	VARCHAR(50)
target_at	TIMESTAMPTZ
occurred_at	TIMESTAMPTZ nullable
status	VARCHAR(30)
metadata	JSONB
________________________________________
14.9 customer_satisfaction_surveys
Column	Type
id	UUID PK
tenant_id	UUID
ticket_id	UUID
token_hash	TEXT
overall_rating	SMALLINT nullable
resolution_rating	SMALLINT nullable
communication_rating	SMALLINT nullable
comments	TEXT nullable
submitted_at	TIMESTAMPTZ nullable
expires_at	TIMESTAMPTZ
________________________________________
15. Knowledge Base Domain
15.1 knowledge_spaces
Column	Type
id	UUID PK
tenant_id	UUID
name	VARCHAR(150)
slug	VARCHAR(100)
visibility	VARCHAR(30)
organization_id	UUID nullable
customer_id	UUID nullable
created_at	TIMESTAMPTZ
updated_at	TIMESTAMPTZ
________________________________________
15.2 knowledge_articles
Column	Type
id	UUID PK
tenant_id	UUID
space_id	UUID
parent_article_id	UUID nullable
title	VARCHAR(300)
slug	VARCHAR(200)
summary	TEXT
content	TEXT
content_format	VARCHAR(20)
status	VARCHAR(30)
visibility	VARCHAR(30)
author_user_id	UUID
reviewer_user_id	UUID nullable
published_at	TIMESTAMPTZ nullable
current_version	INTEGER
tags	TEXT[]
ai_generated_summary	TEXT nullable
search_vector	TSVECTOR
created_at	TIMESTAMPTZ
updated_at	TIMESTAMPTZ
deleted_at	TIMESTAMPTZ
Indexes:
UNIQUE (space_id, slug)
GIN (search_vector)
GIN (tags)
________________________________________
15.3 knowledge_article_versions
Column	Type
id	UUID PK
tenant_id	UUID
article_id	UUID
version	INTEGER
title	VARCHAR(300)
content	TEXT
change_summary	TEXT
created_by	UUID
created_at	TIMESTAMPTZ
Constraint:
UNIQUE (article_id, version)
________________________________________
16. Automation Domain
16.1 workflows
Column	Type
id	UUID PK
tenant_id	UUID
organization_id	UUID nullable
name	VARCHAR(200)
slug	VARCHAR(150)
description	TEXT
category	VARCHAR(50)
risk_level	VARCHAR(20)
status	VARCHAR(30)
current_version	INTEGER
is_template	BOOLEAN
requires_approval	BOOLEAN
timeout_seconds	INTEGER
concurrency_policy	VARCHAR(30)
created_by	UUID
created_at	TIMESTAMPTZ
updated_at	TIMESTAMPTZ
deleted_at	TIMESTAMPTZ
Constraint:
UNIQUE (tenant_id, slug)
________________________________________
16.2 workflow_versions
Immutable published definition.
Column	Type
id	UUID PK
tenant_id	UUID
workflow_id	UUID
version	INTEGER
definition	JSONB
input_schema	JSONB
output_schema	JSONB
rollback_definition	JSONB nullable
change_summary	TEXT
published_by	UUID
published_at	TIMESTAMPTZ
checksum	VARCHAR(128)
Constraint:
UNIQUE (workflow_id, version)
The workflow canvas, nodes, edges and settings may be stored in definition.
For advanced querying, also normalize nodes and edges.
________________________________________
16.3 workflow_nodes
Optional normalized representation.
Column	Type
id	UUID PK
tenant_id	UUID
workflow_version_id	UUID
node_key	VARCHAR(100)
node_type	VARCHAR(50)
position_x	NUMERIC
position_y	NUMERIC
configuration	JSONB
retry_policy	JSONB
timeout_seconds	INTEGER
created_at	TIMESTAMPTZ
________________________________________
16.4 workflow_edges
Column	Type
id	UUID PK
workflow_version_id	UUID
source_node_id	UUID
target_node_id	UUID
source_handle	VARCHAR(100)
target_handle	VARCHAR(100)
condition	JSONB nullable
________________________________________
16.5 workflow_triggers
Column	Type
id	UUID PK
tenant_id	UUID
workflow_id	UUID
trigger_type	VARCHAR(50)
configuration	JSONB
is_enabled	BOOLEAN
last_triggered_at	TIMESTAMPTZ nullable
created_at	TIMESTAMPTZ
updated_at	TIMESTAMPTZ
________________________________________
16.6 workflow_schedules
Column	Type
id	UUID PK
tenant_id	UUID
workflow_id	UUID
cron_expression	VARCHAR(100)
timezone	VARCHAR(64)
next_run_at	TIMESTAMPTZ
last_run_at	TIMESTAMPTZ
is_enabled	BOOLEAN
________________________________________
16.7 workflow_executions
Column	Type
id	UUID PK
tenant_id	UUID
workflow_id	UUID
workflow_version_id	UUID
trigger_type	VARCHAR(50)
trigger_reference_id	UUID nullable
initiated_by	UUID nullable
status	VARCHAR(30)
input_data	JSONB
output_data	JSONB
context	JSONB
correlation_id	UUID
started_at	TIMESTAMPTZ
completed_at	TIMESTAMPTZ nullable
duration_ms	BIGINT nullable
current_node_key	VARCHAR(100) nullable
error_code	VARCHAR(100) nullable
error_message	TEXT nullable
rollback_status	VARCHAR(30) nullable
created_at	TIMESTAMPTZ
Indexes:
INDEX (tenant_id, workflow_id, started_at DESC)
INDEX (tenant_id, status)
INDEX (correlation_id)
________________________________________
16.8 workflow_node_executions
Column	Type
id	UUID PK
tenant_id	UUID
workflow_execution_id	UUID
workflow_node_id	UUID
node_key	VARCHAR(100)
status	VARCHAR(30)
attempt	INTEGER
input_data	JSONB
output_data	JSONB
error_data	JSONB
started_at	TIMESTAMPTZ
completed_at	TIMESTAMPTZ
duration_ms	BIGINT
________________________________________
16.9 approval_requests
General approval table usable by workflows and other modules.
Column	Type
id	UUID PK
tenant_id	UUID
entity_type	VARCHAR(50)
entity_id	UUID
request_type	VARCHAR(50)
requested_by	UUID
assigned_user_id	UUID nullable
assigned_role_id	UUID nullable
status	VARCHAR(30)
risk_summary	TEXT
request_payload	JSONB
decision_payload	JSONB nullable
requested_at	TIMESTAMPTZ
expires_at	TIMESTAMPTZ nullable
decided_at	TIMESTAMPTZ nullable
decided_by	UUID nullable
________________________________________
17. AI Assistant Domain
17.1 ai_conversations
Column	Type
id	UUID PK
tenant_id	UUID
user_id	UUID
organization_id	UUID nullable
title	VARCHAR(250)
conversation_type	VARCHAR(50)
scope_type	VARCHAR(50)
scope_id	UUID nullable
model_profile_id	UUID nullable
status	VARCHAR(30)
context_summary	TEXT nullable
metadata	JSONB
created_at	TIMESTAMPTZ
updated_at	TIMESTAMPTZ
deleted_at	TIMESTAMPTZ
________________________________________
17.2 ai_messages
Column	Type
id	UUID PK
tenant_id	UUID
conversation_id	UUID
parent_message_id	UUID nullable
role	VARCHAR(20)
content	TEXT
content_json	JSONB nullable
token_count_input	INTEGER
token_count_output	INTEGER
model_name	VARCHAR(100)
latency_ms	INTEGER
status	VARCHAR(30)
error_code	VARCHAR(100) nullable
created_at	TIMESTAMPTZ
Indexes:
INDEX (conversation_id, created_at)
________________________________________
17.3 ai_tool_calls
Column	Type
id	UUID PK
tenant_id	UUID
message_id	UUID
tool_name	VARCHAR(150)
arguments	JSONB
result	JSONB
status	VARCHAR(30)
started_at	TIMESTAMPTZ
completed_at	TIMESTAMPTZ
required_approval	BOOLEAN
approval_request_id	UUID nullable
________________________________________
17.4 ai_sources
Column	Type
id	UUID PK
tenant_id	UUID
message_id	UUID
source_type	VARCHAR(50)
source_entity_id	UUID nullable
title	VARCHAR(300)
excerpt	TEXT
source_uri	TEXT nullable
relevance_score	NUMERIC(6,5)
metadata	JSONB
________________________________________
17.5 ai_feedback
Column	Type
id	UUID PK
tenant_id	UUID
message_id	UUID
user_id	UUID
rating	SMALLINT
feedback_type	VARCHAR(50)
comments	TEXT
created_at	TIMESTAMPTZ
________________________________________
17.6 ai_recommendations
Column	Type
id	UUID PK
tenant_id	UUID
recommendation_type	VARCHAR(50)
title	VARCHAR(250)
description	TEXT
confidence_score	NUMERIC(6,5)
risk_level	VARCHAR(20)
source_entities	JSONB
recommended_action	JSONB
status	VARCHAR(30)
assigned_user_id	UUID nullable
dismissed_by	UUID nullable
accepted_at	TIMESTAMPTZ nullable
expires_at	TIMESTAMPTZ nullable
created_at	TIMESTAMPTZ
________________________________________
17.7 ai_model_profiles
Column	Type
id	UUID PK
tenant_id	UUID nullable
name	VARCHAR(150)
provider	VARCHAR(50)
model_name	VARCHAR(150)
encrypted_api_credential_id	UUID nullable
routing_priority	INTEGER
max_input_tokens	INTEGER
max_output_tokens	INTEGER
temperature	NUMERIC(4,3)
allowed_tools	TEXT[]
data_policy	JSONB
is_enabled	BOOLEAN
created_at	TIMESTAMPTZ
________________________________________
18. Reporting Domain
18.1 report_definitions
Column	Type
id	UUID PK
tenant_id	UUID
name	VARCHAR(200)
description	TEXT
report_type	VARCHAR(50)
category	VARCHAR(50)
data_source	VARCHAR(100)
query_definition	JSONB
layout_definition	JSONB
filter_schema	JSONB
visibility	VARCHAR(30)
is_template	BOOLEAN
owner_user_id	UUID
current_version	INTEGER
created_at	TIMESTAMPTZ
updated_at	TIMESTAMPTZ
________________________________________
18.2 report_versions
Column	Type
id	UUID PK
report_definition_id	UUID
version	INTEGER
definition	JSONB
created_by	UUID
created_at	TIMESTAMPTZ
________________________________________
18.3 report_schedules
Column	Type
id	UUID PK
tenant_id	UUID
report_definition_id	UUID
cron_expression	VARCHAR(100)
timezone	VARCHAR(64)
delivery_channels	JSONB
recipients	JSONB
parameters	JSONB
is_enabled	BOOLEAN
next_run_at	TIMESTAMPTZ
last_run_at	TIMESTAMPTZ
________________________________________
18.4 report_runs
Column	Type
id	UUID PK
tenant_id	UUID
report_definition_id	UUID
report_version_id	UUID
initiated_by	UUID nullable
status	VARCHAR(30)
parameters	JSONB
result_summary	JSONB
output_file_id	UUID nullable
started_at	TIMESTAMPTZ
completed_at	TIMESTAMPTZ
error_message	TEXT
________________________________________
18.5 dashboards
Column	Type
id	UUID PK
tenant_id	UUID
owner_user_id	UUID nullable
name	VARCHAR(200)
dashboard_type	VARCHAR(50)
layout	JSONB
global_filters	JSONB
visibility	VARCHAR(30)
is_default	BOOLEAN
created_at	TIMESTAMPTZ
updated_at	TIMESTAMPTZ
________________________________________
18.6 dashboard_widgets
Column	Type
id	UUID PK
dashboard_id	UUID
widget_type	VARCHAR(50)
title	VARCHAR(200)
position	JSONB
configuration	JSONB
data_query	JSONB
refresh_interval_seconds	INTEGER
created_at	TIMESTAMPTZ
updated_at	TIMESTAMPTZ
________________________________________
19. Topology Domain
19.1 topology_nodes
Column	Type
id	UUID PK
tenant_id	UUID
topology_id	UUID
entity_type	VARCHAR(50)
entity_id	UUID
label	VARCHAR(200)
position_x	NUMERIC
position_y	NUMERIC
metadata	JSONB
________________________________________
19.2 topology_edges
Column	Type
id	UUID PK
tenant_id	UUID
topology_id	UUID
source_node_id	UUID
target_node_id	UUID
edge_type	VARCHAR(50)
source_interface_id	UUID nullable
target_interface_id	UUID nullable
bandwidth_bps	BIGINT nullable
status	VARCHAR(30)
discovery_method	VARCHAR(50)
confidence_score	NUMERIC(6,5)
metadata	JSONB
________________________________________
19.3 topologies
Column	Type
id	UUID PK
tenant_id	UUID
site_id	UUID nullable
name	VARCHAR(200)
topology_type	VARCHAR(50)
layout_type	VARCHAR(30)
is_auto_generated	BOOLEAN
last_generated_at	TIMESTAMPTZ
settings	JSONB
________________________________________
20. Integrations Domain
20.1 connector_definitions
Global marketplace catalogue.
Column	Type
id	UUID PK
key	VARCHAR(100) UNIQUE
name	VARCHAR(150)
vendor	VARCHAR(100)
category	VARCHAR(50)
version	VARCHAR(50)
configuration_schema	JSONB
credential_schema	JSONB
capability_manifest	JSONB
status	VARCHAR(30)
created_at	TIMESTAMPTZ
updated_at	TIMESTAMPTZ
________________________________________
20.2 connector_instances
Column	Type
id	UUID PK
tenant_id	UUID
connector_definition_id	UUID
name	VARCHAR(150)
status	VARCHAR(30)
health_status	VARCHAR(30)
encrypted_configuration	BYTEA
credential_profile_id	UUID nullable
owner_user_id	UUID
last_sync_at	TIMESTAMPTZ
last_success_at	TIMESTAMPTZ
last_error_at	TIMESTAMPTZ
next_sync_at	TIMESTAMPTZ
installed_version	VARCHAR(50)
created_at	TIMESTAMPTZ
updated_at	TIMESTAMPTZ
________________________________________
20.3 connector_sync_runs
Column	Type
id	UUID PK
tenant_id	UUID
connector_instance_id	UUID
status	VARCHAR(30)
sync_type	VARCHAR(30)
records_read	INTEGER
records_created	INTEGER
records_updated	INTEGER
records_failed	INTEGER
checkpoint	JSONB
started_at	TIMESTAMPTZ
completed_at	TIMESTAMPTZ
error_summary	TEXT
________________________________________
20.4 webhook_endpoints
Outbound webhooks.
Column	Type
id	UUID PK
tenant_id	UUID
name	VARCHAR(150)
url	TEXT
secret_hash	TEXT
encrypted_secret	BYTEA
subscribed_events	TEXT[]
custom_headers	JSONB
retry_policy	JSONB
timeout_seconds	INTEGER
status	VARCHAR(30)
created_at	TIMESTAMPTZ
updated_at	TIMESTAMPTZ
________________________________________
20.5 webhook_deliveries
Column	Type
id	UUID PK
tenant_id	UUID
webhook_endpoint_id	UUID
event_type	VARCHAR(100)
event_id	UUID
attempt	INTEGER
request_body	JSONB
response_status	INTEGER
response_body	TEXT
latency_ms	INTEGER
status	VARCHAR(30)
next_retry_at	TIMESTAMPTZ
created_at	TIMESTAMPTZ
completed_at	TIMESTAMPTZ
________________________________________
20.6 oauth_clients
Column	Type
id	UUID PK
tenant_id	UUID
client_id	VARCHAR(150) UNIQUE
client_secret_hash	TEXT
name	VARCHAR(150)
grant_types	TEXT[]
redirect_uris	TEXT[]
scopes	TEXT[]
status	VARCHAR(30)
created_at	TIMESTAMPTZ
expires_at	TIMESTAMPTZ nullable
________________________________________
21. Files and Attachments
21.1 files
Column	Type
id	UUID PK
tenant_id	UUID
uploaded_by	UUID nullable
storage_provider	VARCHAR(30)
bucket	VARCHAR(150)
object_key	TEXT
original_filename	VARCHAR(255)
content_type	VARCHAR(150)
size_bytes	BIGINT
checksum_sha256	VARCHAR(64)
encryption_key_reference	VARCHAR(255) nullable
virus_scan_status	VARCHAR(30)
status	VARCHAR(30)
retention_until	TIMESTAMPTZ nullable
created_at	TIMESTAMPTZ
deleted_at	TIMESTAMPTZ
Constraint:
UNIQUE (tenant_id, object_key)
________________________________________
21.2 file_attachments
Polymorphic relationship.
Column	Type
id	UUID PK
tenant_id	UUID
file_id	UUID
entity_type	VARCHAR(50)
entity_id	UUID
attachment_type	VARCHAR(50)
visibility	VARCHAR(30)
created_by	UUID nullable
created_at	TIMESTAMPTZ
Index:
INDEX (entity_type, entity_id)
________________________________________
22. Configuration and Backup Domain
22.1 device_configuration_backups
Column	Type
id	UUID PK
tenant_id	UUID
device_id	UUID
file_id	UUID
configuration_hash	VARCHAR(128)
backup_type	VARCHAR(30)
captured_at	TIMESTAMPTZ
captured_by	UUID nullable
source	VARCHAR(30)
status	VARCHAR(30)
metadata	JSONB
________________________________________
22.2 configuration_diffs
Column	Type
id	UUID PK
tenant_id	UUID
device_id	UUID
previous_backup_id	UUID
current_backup_id	UUID
diff_text	TEXT
diff_summary	JSONB
risk_score	NUMERIC(5,2)
detected_at	TIMESTAMPTZ
________________________________________
23. Compliance Domain
23.1 compliance_frameworks
Column	Type
id	UUID PK
key	VARCHAR(100) UNIQUE
name	VARCHAR(200)
version	VARCHAR(50)
description	TEXT
metadata	JSONB
________________________________________
23.2 compliance_controls
Column	Type
id	UUID PK
framework_id	UUID
control_code	VARCHAR(100)
title	VARCHAR(300)
description	TEXT
severity	VARCHAR(20)
evaluation_type	VARCHAR(50)
evaluation_definition	JSONB
Constraint:
UNIQUE (framework_id, control_code)
________________________________________
23.3 compliance_assessments
Column	Type
id	UUID PK
tenant_id	UUID
framework_id	UUID
name	VARCHAR(200)
scope	JSONB
status	VARCHAR(30)
score	NUMERIC(5,2)
started_at	TIMESTAMPTZ
completed_at	TIMESTAMPTZ
initiated_by	UUID
________________________________________
23.4 compliance_findings
Column	Type
id	UUID PK
tenant_id	UUID
assessment_id	UUID
control_id	UUID
entity_type	VARCHAR(50)
entity_id	UUID
status	VARCHAR(30)
severity	VARCHAR(20)
evidence	JSONB
remediation	TEXT
assigned_user_id	UUID nullable
detected_at	TIMESTAMPTZ
resolved_at	TIMESTAMPTZ nullable
________________________________________
24. Licensing and Billing Domain
24.1 subscription_plans
Column	Type
id	UUID PK
code	VARCHAR(80) UNIQUE
name	VARCHAR(150)
billing_interval	VARCHAR(30)
base_price	NUMERIC(14,2)
currency	CHAR(3)
limits	JSONB
features	JSONB
is_active	BOOLEAN
________________________________________
24.2 tenant_subscriptions
Column	Type
id	UUID PK
tenant_id	UUID
plan_id	UUID
status	VARCHAR(30)
seats	INTEGER
starts_at	TIMESTAMPTZ
trial_ends_at	TIMESTAMPTZ nullable
current_period_start	TIMESTAMPTZ
current_period_end	TIMESTAMPTZ
cancel_at_period_end	BOOLEAN
external_subscription_id	VARCHAR(255)
created_at	TIMESTAMPTZ
updated_at	TIMESTAMPTZ
________________________________________
24.3 usage_records
Column	Type
id	UUID PK
tenant_id	UUID
metric_key	VARCHAR(100)
quantity	NUMERIC(18,4)
period_start	TIMESTAMPTZ
period_end	TIMESTAMPTZ
metadata	JSONB
Constraint:
UNIQUE (tenant_id, metric_key, period_start, period_end)
________________________________________
24.4 invoices
Column	Type
id	UUID PK
tenant_id	UUID
invoice_number	VARCHAR(100)
status	VARCHAR(30)
subtotal	NUMERIC(14,2)
tax	NUMERIC(14,2)
total	NUMERIC(14,2)
currency	CHAR(3)
due_at	TIMESTAMPTZ
paid_at	TIMESTAMPTZ nullable
external_invoice_id	VARCHAR(255)
file_id	UUID nullable
created_at	TIMESTAMPTZ
________________________________________
25. Feature Flags and Configuration
25.1 feature_flags
Column	Type
id	UUID PK
key	VARCHAR(150) UNIQUE
name	VARCHAR(200)
description	TEXT
default_enabled	BOOLEAN
rollout_type	VARCHAR(30)
created_at	TIMESTAMPTZ
updated_at	TIMESTAMPTZ
________________________________________
25.2 feature_flag_overrides
Column	Type
id	UUID PK
feature_flag_id	UUID
scope_type	VARCHAR(30)
scope_id	UUID nullable
is_enabled	BOOLEAN
rollout_percentage	NUMERIC(5,2) nullable
conditions	JSONB
starts_at	TIMESTAMPTZ nullable
ends_at	TIMESTAMPTZ nullable
Constraint:
UNIQUE (feature_flag_id, scope_type, scope_id)
________________________________________
25.3 system_settings
Column	Type
id	UUID PK
tenant_id	UUID nullable
scope_type	VARCHAR(30)
scope_id	UUID nullable
key	VARCHAR(150)
value	JSONB
is_secret	BOOLEAN
version	INTEGER
updated_by	UUID nullable
updated_at	TIMESTAMPTZ
Constraint:
UNIQUE NULLS NOT DISTINCT (tenant_id, scope_type, scope_id, key)
________________________________________
26. Audit and Security Domain
26.1 audit_logs
Append-only table.
Column	Type
id	UUID PK
tenant_id	UUID nullable
organization_id	UUID nullable
actor_type	VARCHAR(30)
actor_id	UUID nullable
impersonated_by	UUID nullable
action	VARCHAR(150)
entity_type	VARCHAR(80)
entity_id	UUID nullable
request_id	UUID nullable
correlation_id	UUID nullable
ip_address	INET nullable
user_agent	TEXT nullable
before_data	JSONB nullable
after_data	JSONB nullable
metadata	JSONB
occurred_at	TIMESTAMPTZ
Indexes:
INDEX (tenant_id, occurred_at DESC)
INDEX (tenant_id, actor_id, occurred_at DESC)
INDEX (tenant_id, entity_type, entity_id)
INDEX (correlation_id)
Partition monthly.
Audit rows must not be updated or deleted through application APIs.
________________________________________
26.2 security_events
Column	Type
id	UUID PK
tenant_id	UUID nullable
event_type	VARCHAR(100)
severity	VARCHAR(20)
actor_user_id	UUID nullable
ip_address	INET nullable
title	VARCHAR(250)
description	TEXT
evidence	JSONB
status	VARCHAR(30)
assigned_user_id	UUID nullable
detected_at	TIMESTAMPTZ
acknowledged_at	TIMESTAMPTZ nullable
resolved_at	TIMESTAMPTZ nullable
________________________________________
26.3 data_access_logs
Optional for highly regulated customers.
Column	Type
id	UUID PK
tenant_id	UUID
user_id	UUID
resource_type	VARCHAR(80)
resource_id	UUID nullable
action	VARCHAR(50)
fields_accessed	TEXT[]
purpose	VARCHAR(150)
occurred_at	TIMESTAMPTZ
________________________________________
27. Platform Operations Domain
27.1 platform_services
Column	Type
id	UUID PK
service_name	VARCHAR(150)
environment	VARCHAR(30)
region	VARCHAR(50)
version	VARCHAR(50)
status	VARCHAR(30)
desired_replicas	INTEGER
current_replicas	INTEGER
metadata	JSONB
last_heartbeat_at	TIMESTAMPTZ
________________________________________
27.2 platform_metrics
Timescale hypertable.
Column	Type
time	TIMESTAMPTZ
service_id	UUID
region	VARCHAR(50)
metric_key	VARCHAR(150)
value	DOUBLE PRECISION
labels	JSONB
________________________________________
27.3 background_jobs
Column	Type
id	UUID PK
tenant_id	UUID nullable
queue_name	VARCHAR(100)
job_type	VARCHAR(150)
status	VARCHAR(30)
priority	INTEGER
payload	JSONB
attempt	INTEGER
max_attempts	INTEGER
scheduled_at	TIMESTAMPTZ
started_at	TIMESTAMPTZ nullable
completed_at	TIMESTAMPTZ nullable
error_message	TEXT nullable
correlation_id	UUID nullable
Indexes:
INDEX (queue_name, status, scheduled_at)
INDEX (tenant_id, status)
INDEX (correlation_id)
If Celery/Redis is the execution system, this table should be a durable job ledger, not the primary queue.
________________________________________
27.4 deployment_records
Column	Type
id	UUID PK
environment	VARCHAR(30)
service_name	VARCHAR(150)
deployment_strategy	VARCHAR(30)
from_version	VARCHAR(50)
to_version	VARCHAR(50)
status	VARCHAR(30)
initiated_by	UUID
started_at	TIMESTAMPTZ
completed_at	TIMESTAMPTZ
rollback_deployment_id	UUID nullable
metadata	JSONB
________________________________________
27.5 backup_records
Column	Type
id	UUID PK
tenant_id	UUID nullable
backup_type	VARCHAR(50)
storage_file_id	UUID
status	VARCHAR(30)
size_bytes	BIGINT
checksum	VARCHAR(128)
started_at	TIMESTAMPTZ
completed_at	TIMESTAMPTZ
expires_at	TIMESTAMPTZ
created_by	UUID nullable
________________________________________
28. Data Ownership Rules
28.1 Ownership hierarchy
Every record must belong to the narrowest applicable scope.
Examples:
•	Device belongs to tenant, organization and site 
•	Ticket belongs to tenant and organization, optionally customer and site 
•	Alert belongs to tenant and affected infrastructure scope 
•	AI conversation belongs to tenant and initiating user 
•	Workflow belongs to tenant, optionally organization 
•	Report belongs to tenant and owner 
________________________________________
28.2 Ownership enforcement
Platform administrators
May access all tenants only through a separately authorized platform context.
Normal tenant APIs must never implicitly allow platform-wide reads.
Tenant administrators
May access all records where:
record.tenant_id = current_tenant_id
Organization administrators
May access records where:
record.organization_id IN user_allowed_organization_ids
Customer administrators
May access:
record.customer_id IN user_allowed_customer_ids
Site administrators
May access:
record.site_id IN user_allowed_site_ids
Resource owners
A report or dashboard owner may edit it if:
owner_user_id = current_user_id
unless tenant policy allows shared editors.
________________________________________
28.3 No client-supplied tenant ownership
The backend must never trust tenant_id submitted by the client.
Tenant context must be derived from:
•	Validated access token 
•	Active workspace selection 
•	Server-side membership lookup 
________________________________________
29. PostgreSQL Row-Level Security
Example for devices:
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_devices
ON devices
USING (
    tenant_id = current_setting('app.current_tenant_id')::uuid
)
WITH CHECK (
    tenant_id = current_setting('app.current_tenant_id')::uuid
);
For scoped access:
CREATE POLICY site_scope_devices
ON devices
USING (
    tenant_id = current_setting('app.current_tenant_id')::uuid
    AND (
        current_setting('app.is_tenant_admin', true)::boolean = true
        OR site_id = ANY(
            string_to_array(
                current_setting('app.allowed_site_ids', true),
                ','
            )::uuid[]
        )
    )
);
Set these transaction-local variables immediately after acquiring the connection.
________________________________________
30. Authentication Flow
Login
Email + Password
    ↓
Verify Argon2id hash
    ↓
Check account status and lockout
    ↓
Require MFA if enabled
    ↓
Create session
    ↓
Issue short-lived access token
    ↓
Issue rotating refresh token
________________________________________
Access token claims
{
  "sub": "user_uuid",
  "sid": "session_uuid",
  "tenant_id": "tenant_uuid",
  "membership_id": "membership_uuid",
  "roles": ["role-slug"],
  "scopes": ["inventory.device.read"],
  "iat": 1760000000,
  "exp": 1760000900,
  "jti": "token_uuid"
}
Do not put thousands of resource IDs into JWTs.
Load fine-grained scope assignments from Redis or PostgreSQL.
________________________________________
Session security
•	Access token lifetime: 5–15 minutes 
•	Refresh token lifetime: 7–30 days 
•	Refresh token rotation 
•	Reuse detection 
•	Session revocation 
•	Device metadata 
•	Idle timeout 
•	Absolute timeout 
•	MFA step-up for high-risk actions 
________________________________________
31. High-Risk Action Protection
Require re-authentication or MFA step-up for:
•	Deleting organizations 
•	Rotating secrets 
•	Executing critical workflows 
•	Restoring backups 
•	Exporting sensitive data 
•	Changing SSO settings 
•	Modifying tenant roles 
•	Disabling audit controls 
•	Accessing platform operations 
Track confirmation in a short-lived security context stored in Redis.
________________________________________
32. Indexing Rules
Always index
•	Foreign keys used in joins 
•	tenant_id 
•	Frequently filtered status columns 
•	Common timestamp ordering fields 
•	Unique business identifiers 
•	Searchable names and codes 
Composite index convention
For tenant-owned queries:
(tenant_id, status)
(tenant_id, created_at DESC)
(tenant_id, site_id)
(tenant_id, entity_id)
Putting tenant_id first improves tenant-local scans.
JSONB indexes
Use GIN only for JSON fields queried frequently.
Do not create broad GIN indexes on every JSONB column.
________________________________________
33. Partitioning and Retention
Partition or use Timescale hypertables for:
•	device_metrics 
•	collector_heartbeats 
•	platform_metrics 
•	events 
•	audit_logs 
•	notification_deliveries 
•	polling_jobs 
•	workflow_node_executions at very high scale 
Suggested retention:
Data	Hot retention	Long-term
Raw metrics	30–90 days	compressed/archive
Aggregated metrics	13–24 months	optional
Events	6–12 months	object storage
Alerts	2–7 years	tenant policy
Audit logs	1–7 years	compliance policy
AI conversations	configurable	redact/archive
Platform logs	14–90 days	archive
Tickets	contract-defined	typically years
________________________________________
34. Soft Delete Rules
Use soft delete for:
•	Users 
•	Organizations 
•	Customers 
•	Sites 
•	Devices 
•	Workflows 
•	Reports 
•	Knowledge articles 
•	Integrations 
Do not soft-delete immutable history records such as:
•	Audit logs 
•	Alert occurrences 
•	Ticket status history 
•	Workflow execution history 
•	Compliance assessment evidence 
________________________________________
35. Foreign Key Delete Policies
Use:
RESTRICT
for critical parent records.
Use:
CASCADE
only for tightly owned child records such as:
•	Dashboard widgets 
•	Workflow edges 
•	Temporary invitation metadata 
•	Article versions when permanently purging an article 
Use:
SET NULL
for historical actor references when a user is deleted or anonymized.
________________________________________
36. Search Architecture
Use PostgreSQL full-text search initially for:
•	Tickets 
•	Knowledge articles 
•	Devices 
•	Alerts 
•	Reports 
Use tsvector fields and GIN indexes.
Introduce OpenSearch only when:
•	Log volume becomes very high 
•	Cross-entity ranking becomes complex 
•	Fuzzy search requirements exceed PostgreSQL 
•	Search latency becomes unacceptable 
________________________________________
37. Transaction Boundaries
Use database transactions for:
•	Ticket state transition + status history 
•	Alert acknowledgement + audit log 
•	Workflow publish + version creation 
•	Workflow approval + execution resume 
•	Device import + related interface creation 
•	User invitation acceptance + membership creation 
•	Secret rotation + connector reconfiguration 
•	Subscription update + usage entitlement recalculation 
Use an outbox pattern for events emitted after commits.
________________________________________
38. Transactional Outbox
outbox_events
Column	Type
id	UUID PK
tenant_id	UUID nullable
aggregate_type	VARCHAR(80)
aggregate_id	UUID
event_type	VARCHAR(150)
payload	JSONB
headers	JSONB
status	VARCHAR(30)
retry_count	INTEGER
available_at	TIMESTAMPTZ
created_at	TIMESTAMPTZ
published_at	TIMESTAMPTZ nullable
Index:
INDEX (status, available_at)
This prevents database changes from succeeding while event publishing fails silently.
________________________________________
39. Idempotency
idempotency_keys
Column	Type
id	UUID PK
tenant_id	UUID
key	VARCHAR(255)
user_id	UUID nullable
endpoint	VARCHAR(255)
request_hash	VARCHAR(128)
response_status	INTEGER
response_body	JSONB
expires_at	TIMESTAMPTZ
created_at	TIMESTAMPTZ
Constraint:
UNIQUE (tenant_id, key)
Use for:
•	Ticket creation 
•	Workflow execution 
•	Webhook ingestion 
•	Billing operations 
•	Device import 
•	Alert ingestion 
________________________________________
40. Recommended Domain Relationships
Tenant
├── Organizations
├── Users through TenantMemberships
├── Roles
├── Teams
├── Customers
├── Sites
├── Collectors
├── Devices
│   ├── Interfaces
│   ├── Addresses
│   ├── Metrics
│   ├── Alerts
│   ├── Configuration Backups
│   └── Topology Nodes
├── Alerts
│   ├── Occurrences
│   ├── Incident
│   └── Tickets through TicketLinks
├── Tickets
│   ├── Comments
│   ├── SLA Events
│   ├── Attachments
│   └── Knowledge Articles
├── Workflows
│   ├── Versions
│   ├── Triggers
│   ├── Executions
│   └── Approvals
├── AI Conversations
│   ├── Messages
│   ├── Tool Calls
│   ├── Sources
│   └── Feedback
├── Reports
├── Integrations
└── Audit Logs
________________________________________
41. AI App Builder Implementation Rules
The backend generator must follow these non-negotiable rules:
1.	Every tenant-owned table must contain tenant_id. 
2.	Tenant ownership must be enforced server-side and preferably with PostgreSQL RLS. 
3.	UUIDs must be generated on the backend or database, never trusted from the client for ownership. 
4.	All user passwords must use Argon2id. 
5.	Refresh tokens and API keys must be hashed before storage. 
6.	Credentials and integration secrets must be envelope-encrypted using a KMS-managed key. 
7.	Audit logs must be append-only. 
8.	Workflow versions, report versions and knowledge article versions must be immutable. 
9.	Metrics must use TimescaleDB hypertables instead of regular high-volume PostgreSQL tables. 
10.	Large files must be stored in object storage, not database byte columns. 
11.	Every mutation must create an audit record for security-sensitive entities. 
12.	Long-running work must execute through workers, not HTTP request threads. 
13.	All event-producing transactions must use the transactional outbox pattern. 
14.	All dangerous actions must support approval, idempotency and traceable execution. 
15.	Foreign keys must never cross tenant boundaries. 
16.	Unique constraints must generally include tenant_id. 
17.	APIs must filter soft-deleted rows by default. 
18.	All list APIs must support cursor-based pagination. 
19.	All write APIs must support optimistic concurrency using version. 
20.	All queries must be designed to avoid unbounded tenant-wide scans. 
________________________________________
42. Suggested Initial Migration Order
1. PostgreSQL extensions and helper functions
2. tenants
3. users and authentication
4. organizations, customers and sites
5. roles, permissions and memberships
6. files and secrets
7. collectors and credentials
8. inventory and devices
9. monitoring definitions and Timescale hypertables
10. events, alerts and incidents
11. notifications
12. support tickets and SLA
13. automation
14. AI assistant
15. reports and dashboards
16. topology
17. integrations
18. compliance
19. subscriptions and billing
20. audit and security
21. platform operations
22. outbox and idempotency
23. RLS policies
24. retention and compression policies
This schema gives NS3 Central a production-grade foundation while still allowing the backend to begin as a modular monolith. Individual domains can later be extracted into services without redesigning the core ownership model.
	
