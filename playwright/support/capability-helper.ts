import { Page } from '@playwright/test';

type OrganizationCapability = {
  name?: string;
  value?: string;
};

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
