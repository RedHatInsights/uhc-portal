import { Page } from '@playwright/test';

export type OrganizationCapability = {
  name?: string;
  value?: string;
};

export const ROSA_OSD_ALLOW_OCP_5_CAPABILITY = 'capability.organization.rosa_osd_allow_ocp_5';

export async function waitForOrganizationCapabilities(
  page: Page,
): Promise<OrganizationCapability[]> {
  const response = await page.waitForResponse(
    (res) =>
      res.request().method() === 'GET' &&
      res.url().includes('/api/accounts_mgmt/v1/organizations/') &&
      res.url().includes('fetchCapabilities=true'),
    { timeout: 30000 },
  );
  if (!response.ok()) {
    return [];
  }
  const body = (await response.json()) as { capabilities?: OrganizationCapability[] };
  return body.capabilities ?? [];
}

export function hasOrganizationCapability(
  capabilities: OrganizationCapability[],
  capabilityName: string,
): boolean {
  return capabilities.some(
    (capability) => capability.name === capabilityName && capability.value === 'true',
  );
}
