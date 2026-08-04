import { Page } from '@playwright/test';

export const ROVS_REGISTRATION_FEATURE = 'ocmui-rovs-registration';

/**
 * Forces a self_feature_review response to enabled for the given feature.
 * Must be registered before the first navigation that loads OCM (gates are
 * prefetched once with infinite staleTime).
 */
export async function mockFeatureGateEnabled(page: Page, featureId: string): Promise<void> {
  await page.route('**/api/authorizations/v1/self_feature_review', async (route) => {
    const postData = route.request().postDataJSON() as { feature?: string } | null;
    if (postData?.feature === featureId) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ enabled: true, feature_id: featureId }),
      });
      return;
    }
    await route.continue();
  });
}
