export interface Device {
  id: string;
  hostname: string;
  management_ip: string;
  vendor: string;
  model: string;
  organization_id: string;
  site_id: string;
  collector_id: string;
  lifecycle: string;
  admin_state: string;
  oper_state: string;
  health: string;
  serial_number?: string;
  firmware?: string;
  location?: string;
  cpu?: string;
  memory?: string;
  last_poll?: string;
  credential_profile_id?: string;
  polling_profile_id?: string;
  tags?: string[];
}
