import { Page } from '@playwright/test';

/**
 * Temporarily overlays quota_cost so contractedAccountId has a valid billing
 * contract while other AWS billing accounts do not. Uses the real response
 * (same account IDs) so staging accounts without contracts can still exercise
 * contract warning / confirmation flows.
 */
export async function mockQuotaCostWithBillingContract(
  page: Page,
  contractedAccountId: string,
  billingAccountIds: string[] = [],
): Promise<void> {
  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + 1);

  const billingContract = {
    dimensions: [
      { name: 'four_vcpu_hour', value: '96' },
      { name: 'control_plane', value: '4' },
    ],
    start_date: '2025-01-01T00:00:00Z',
    end_date: endDate.toISOString(),
  };

  await page.route('**/quota_cost**', async (route) => {
    const response = await route.fetch();
    const data = await response.json();
    const items = data.items || [];
    const marketplaceQuota = items.find(
      (quota: { quota_id?: string }) => quota.quota_id === 'cluster|byoc|moa|marketplace',
    );

    if (marketplaceQuota) {
      const existingAccounts = (marketplaceQuota.cloud_accounts || []).filter(
        (account: { cloud_provider_id?: string }) => account.cloud_provider_id === 'aws',
      );
      const accountIds = new Set([
        ...existingAccounts.map(
          (account: { cloud_account_id?: string }) => account.cloud_account_id,
        ),
        ...billingAccountIds,
        contractedAccountId,
      ]);

      marketplaceQuota.cloud_accounts = [...accountIds].filter(Boolean).map((cloudAccountId) => {
        const existing = existingAccounts.find(
          (account: { cloud_account_id?: string }) => account.cloud_account_id === cloudAccountId,
        );
        return {
          ...(existing || {}),
          cloud_account_id: cloudAccountId,
          cloud_provider_id: 'aws',
          contracts: cloudAccountId === contractedAccountId ? [billingContract] : [],
        };
      });
    }

    await route.fulfill({
      status: response.status(),
      contentType: 'application/json',
      body: JSON.stringify(data),
    });
  });
}

export async function clearQuotaCostMock(page: Page): Promise<void> {
  await page.unroute('**/quota_cost**');
}
