import { useQuery } from "@tanstack/react-query";
import { lookupApi } from "@/shared/api/lookupApi";

export const lookupKeys = {
  all: ["lookups"] as const,
  credentialProfiles: () => [...lookupKeys.all, "credentials"] as const,
  pollingProfiles: () => [...lookupKeys.all, "polling"] as const,
  collectors: () => [...lookupKeys.all, "collectors"] as const,
  deviceGroups: () => [...lookupKeys.all, "groups"] as const,
  vendors: () => [...lookupKeys.all, "vendors"] as const,
  sites: (orgId: string) => [...lookupKeys.all, "sites", orgId] as const,
};

export function useCredentialProfiles() {
  return useQuery({ queryKey: lookupKeys.credentialProfiles(), queryFn: lookupApi.getCredentialProfiles });
}

export function usePollingProfiles() {
  return useQuery({ queryKey: lookupKeys.pollingProfiles(), queryFn: lookupApi.getPollingProfiles });
}

export function useCollectors() {
  return useQuery({ queryKey: lookupKeys.collectors(), queryFn: lookupApi.getCollectors });
}

export function useDeviceGroups() {
  return useQuery({ queryKey: lookupKeys.deviceGroups(), queryFn: lookupApi.getDeviceGroups });
}

export function useVendors() {
  return useQuery({ queryKey: lookupKeys.vendors(), queryFn: lookupApi.getVendors });
}

export function useLookupSites(orgId?: string) {
  return useQuery({
    queryKey: lookupKeys.sites(orgId!),
    queryFn: () => lookupApi.getSites(orgId!),
    enabled: !!orgId,
  });
}
