import { z } from "zod";

export const organizationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
});

export type OrganizationFormData = z.infer<typeof organizationSchema>;
