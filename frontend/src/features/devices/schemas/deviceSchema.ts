import { z } from "zod";

export const step1Schema = z.object({
  hostname: z.string().min(2, "Hostname must be at least 2 characters").max(255),
  management_ip: z.string().regex(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/, "Must be a valid IP address"),
  vendor: z.string().min(1, "Please select a vendor"),
  model: z.string().optional(),
});

export const step2Schema = z.object({
  organization_id: z.string().uuid("Please select a valid organization"),
  site_id: z.string().uuid("Please select a valid site"),
  collector_id: z.string().uuid("Please select a valid collector"),
});

export const step3Schema = z.object({
  device_group_id: z.string().uuid("Please select a valid device group"),
  credential_profile_id: z.string().uuid("Please select a credential profile"),
  polling_profile_id: z.string().uuid("Please select a polling profile"),
});

export const deviceSchema = step1Schema.merge(step2Schema).merge(step3Schema);

export type DeviceFormData = z.infer<typeof deviceSchema>;
