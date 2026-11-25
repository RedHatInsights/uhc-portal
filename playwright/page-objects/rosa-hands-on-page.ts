import { expect, Locator, Page, Response } from '@playwright/test';

import { BasePage } from './base-page';

const DEMO_EXPERIENCE_ROUTE = '**/demoExperience/rosa-hands-on**';

// E2E expectations live in the fixture (not src/) so they stay stable if app constants move.
const { expected } = require('../fixtures/rosa/rosa-hands-on-page.spec.json') as {
  expected: {
    customerSuccessMailto: string;
    slackChannel: string;
    learnMoreAboutRosa: string;
    getStartedPath: string;
    statusAlertTestId: string;
    unauthorizedReason: string;
    recommendedContent: Array<{ title: string; label: string; href: string }>;
  };
};

export type DemoExperienceApiPayload = {
  status: string;
  unavailable_reason?: string;
  quota?: { current?: number; limit?: number };
  experience_url?: string;
  scheduled_delete_timestamp?: string;
};

/** UI status after the same rewrite applied in demoExperienceService. */
export type HandsOnUiStatus = string;

export type ResolvedHandsOnExperience = {
  raw: DemoExperienceApiPayload;
  status: HandsOnUiStatus;
  unavailableReason?: string;
  quotaCurrent: number;
  quotaLimit: number;
  remainingQuota: number;
};

/**
 * Mirrors src/components/RosaHandsOn/demoExperienceService.ts deserialization.
 */
export const resolveHandsOnUiStatus = (
  payload: DemoExperienceApiPayload,
): ResolvedHandsOnExperience => {
  const rawCurrent = payload.quota?.current;
  const rawLimit = payload.quota?.limit;
  const hasFiniteQuota = Number.isFinite(rawCurrent) && Number.isFinite(rawLimit);
  // Mirror demoExperienceService: do not rewrite on null/undefined (null >= null is true).
  const quotaCurrent = hasFiniteQuota ? Number(rawCurrent) : 0;
  const quotaLimit = hasFiniteQuota ? Number(rawLimit) : 0;
  const status =
    payload.status === 'unavailable' && hasFiniteQuota && quotaCurrent >= quotaLimit
      ? 'quota-exceeded'
      : payload.status;

  return {
    raw: payload,
    status,
    unavailableReason: payload.unavailable_reason,
    quotaCurrent,
    quotaLimit,
    remainingQuota: quotaLimit - quotaCurrent,
  };
};

/**
 * ROSA Hands-on Experience page object.
 */
export class RosaHandsOnPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async isRosaHandsOnPage(): Promise<void> {
    await this.assertUrlIncludes('/overview/rosa/hands-on');
    await expect(
      this.page.getByRole('heading', { name: /Hands-on Experience/i }).first(),
    ).toBeVisible();
  }

  pageHeading(): Locator {
    return this.page.getByRole('heading', { name: /Hands-on Experience/i }).first();
  }

  /**
   * "contact support" mailto inside a StatusAlert banner.
   * data-testid is required: PF <Alert component="span" /> has no role="alert".
   */
  alertContactSupportLink(): Locator {
    return this.page
      .getByTestId(expected.statusAlertTestId)
      .getByRole('link', { name: 'contact support' });
  }

  customerSuccessTeamLink(): Locator {
    return this.page.getByRole('link', { name: 'customer success team' });
  }

  requestExperienceButton(): Locator {
    return this.page.getByRole('button', { name: 'Request experience' });
  }

  requestExperienceFailureAlert(): Locator {
    // PF Alert titles are exposed as headings, e.g. "Danger alert: Failed to request an experience".
    return this.page.getByRole('heading', { name: /Failed to request an experience/i });
  }

  createRosaClusterLink(): Locator {
    return this.page.getByRole('link', { name: 'Create a ROSA cluster' });
  }

  accessExperienceLink(): Locator {
    return this.page.getByRole('link', { name: 'Access experience' });
  }

  provisioningButton(): Locator {
    return this.page.getByRole('button', { name: 'Provisioning cluster' });
  }

  whatToExpectHelpButton(): Locator {
    return this.page.getByRole('button', { name: 'What to expect help' });
  }

  recommendedContentHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Recommended content', level: 3 });
  }

  headerSlackCommunityLink(): Locator {
    return this.page.getByRole('link', { name: /Have a question\? Join our slack community/i });
  }

  learnMoreAboutRosaLink(): Locator {
    return this.page.getByRole('link', { name: 'Learn more about ROSA' });
  }

  recommendedContentRow(title: string): Locator {
    // PF Table exposes role="grid", not "table".
    return this.page
      .getByRole('grid', { name: 'Recommended content table' })
      .getByRole('row')
      .filter({ has: this.page.getByText(title, { exact: true }) });
  }

  /**
   * Header Slack, Learn more about ROSA, and recommended-content Learn more links.
   * Stable across demo-experience statuses (card footer Learn more is always present).
   */
  async expectStaticChromeLinks(): Promise<void> {
    await expect(this.headerSlackCommunityLink()).toBeVisible();
    await expect(this.headerSlackCommunityLink()).toHaveAttribute('href', expected.slackChannel);

    await this.learnMoreAboutRosaLink().scrollIntoViewIfNeeded();
    await expect(this.learnMoreAboutRosaLink()).toBeVisible();
    await expect(this.learnMoreAboutRosaLink()).toHaveAttribute(
      'href',
      expected.learnMoreAboutRosa,
    );

    await this.recommendedContentHeading().scrollIntoViewIfNeeded();
    await expect(this.recommendedContentHeading()).toBeVisible();

    await this.expectRecommendedContentRow(expected.recommendedContent[0]);
    await this.expectRecommendedContentRow(expected.recommendedContent[1]);
    await this.expectRecommendedContentRow(expected.recommendedContent[2]);
  }

  private async expectRecommendedContentRow(item: {
    title: string;
    label: string;
    href: string;
  }): Promise<void> {
    const row = this.recommendedContentRow(item.title);
    await row.scrollIntoViewIfNeeded();
    await expect(row).toBeVisible();
    await expect(row.getByText(item.label, { exact: true })).toBeVisible();
    await expect(row.getByRole('link', { name: 'Learn more' })).toHaveAttribute('href', item.href);
  }

  /**
   * Start before navigation so the waiter catches the initial GET.
   */
  waitForDemoExperienceResponse(): Promise<Response> {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'GET' &&
        res.url().includes('/demoExperience/rosa-hands-on') &&
        res.ok(),
      { timeout: 60_000 },
    );
  }

  async captureDemoExperience(): Promise<ResolvedHandsOnExperience> {
    const response = await this.waitForDemoExperienceResponse();
    const payload = (await response.json()) as DemoExperienceApiPayload;
    return resolveHandsOnUiStatus(payload);
  }

  async mockDemoExperience(payload: DemoExperienceApiPayload): Promise<void> {
    await this.page.route(DEMO_EXPERIENCE_ROUTE, async (route) => {
      if (route.request().method() !== 'GET') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(payload),
      });
    });
  }

  /**
   * Single route handler: fulfill GET with getPayload, fail POST with status.
   * Replaces any existing demoExperience mock (avoids LIFO continue() bypassing GET mocks).
   */
  async mockRequestExperienceFailure(
    getPayload: DemoExperienceApiPayload,
    status = 503,
  ): Promise<void> {
    await this.clearDemoExperienceMock();
    await this.page.route(DEMO_EXPERIENCE_ROUTE, async (route) => {
      const method = route.request().method();
      if (method === 'POST') {
        await route.fulfill({
          status,
          contentType: 'application/json',
          body: JSON.stringify({
            message: `Request failed with status code ${status}`,
          }),
        });
        return;
      }
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(getPayload),
        });
        return;
      }
      await route.continue();
    });
  }

  waitForRequestExperienceFailure(status = 503): Promise<Response> {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'POST' &&
        res.url().includes('/demoExperience/rosa-hands-on') &&
        res.status() === status,
      { timeout: 60_000 },
    );
  }

  async clearDemoExperienceMock(): Promise<void> {
    await this.page.unroute(DEMO_EXPERIENCE_ROUTE);
  }

  async expectRequestExperienceFailureAlert(status = 503): Promise<void> {
    await expect(this.requestExperienceFailureAlert()).toBeVisible();
    // Axios sets err.message from the status; getErrorMessage renders that in the alert body.
    await expect(
      this.page.getByText(`Request failed with status code ${status}`, { exact: true }),
    ).toBeVisible();
    await expect(this.requestExperienceButton()).toBeEnabled();
  }

  /**
   * Installs a demoExperience mock, reloads the page, and returns the resolved UI status.
   */
  async reloadWithMockedExperience(
    payload: DemoExperienceApiPayload,
  ): Promise<ResolvedHandsOnExperience> {
    await this.clearDemoExperienceMock();
    await this.mockDemoExperience(payload);
    const capturePromise = this.captureDemoExperience();
    await this.page.reload({ waitUntil: 'domcontentloaded' });
    const experience = await capturePromise;
    await this.isRosaHandsOnPage();
    return experience;
  }

  async expectCustomerSuccessMailto(link: Locator): Promise<void> {
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', expected.customerSuccessMailto);
  }

  async expectWhatToExpectPopoverLinks(): Promise<void> {
    await this.whatToExpectHelpButton().click();
    await expect(this.page.getByText('ROSA community Slack channel')).toBeVisible();
    await expect(
      this.page.getByRole('link', { name: 'ROSA community Slack channel' }),
    ).toHaveAttribute('href', expected.slackChannel);
    await this.expectCustomerSuccessMailto(this.customerSuccessTeamLink());
    await this.page.keyboard.press('Escape');
  }

  /**
   * Asserts status-specific CTA enablement and customer-success mailto presence.
   * Alert copy checks stay loose (substring) so minor wording tweaks are less brittle;
   * exact copy is covered in unit tests.
   */
  async expectStatusSpecificUi(experience: ResolvedHandsOnExperience): Promise<void> {
    const { status, unavailableReason, remainingQuota, quotaLimit } = experience;

    switch (status) {
      case 'available': {
        if (experience.quotaCurrent > 0) {
          await expect(
            this.page.getByText(new RegExp(`You have ${remainingQuota} launch`, 'i')),
          ).toBeVisible();
          await this.expectCustomerSuccessMailto(this.alertContactSupportLink());
        } else {
          await expect(this.alertContactSupportLink()).toHaveCount(0);
        }
        await expect(this.requestExperienceButton()).toBeEnabled();
        await this.expectWhatToExpectPopoverLinks();
        break;
      }
      case 'unavailable': {
        if (unavailableReason === expected.unauthorizedReason) {
          await expect(this.page.getByText(/business email account/i)).toBeVisible();
          await expect(this.alertContactSupportLink()).toHaveCount(0);
        } else {
          await expect(this.page.getByText(/demo system is currently unavailable/i)).toBeVisible();
          await this.expectCustomerSuccessMailto(this.alertContactSupportLink());
        }
        await expect(this.requestExperienceButton()).toBeDisabled();
        await this.expectWhatToExpectPopoverLinks();
        break;
      }
      case 'quota-exceeded': {
        await expect(
          this.page.getByText(new RegExp(`After ${quotaLimit} launches`, 'i')),
        ).toBeVisible();
        await this.expectCustomerSuccessMailto(this.alertContactSupportLink());
        await expect(this.createRosaClusterLink()).toBeVisible();
        // Router may prefix /openshift; fixture stores the app path suffix.
        await expect(this.createRosaClusterLink()).toHaveAttribute(
          'href',
          expect.stringContaining(expected.getStartedPath),
        );
        break;
      }
      case 'failed': {
        await expect(this.page.getByText(/error on our end/i)).toBeVisible();
        await this.expectCustomerSuccessMailto(this.alertContactSupportLink());
        await expect(this.requestExperienceButton()).toBeEnabled();
        await this.expectWhatToExpectPopoverLinks();
        break;
      }
      case 'started': {
        await expect(this.page.getByText(/current experience demo will end/i)).toBeVisible();
        await expect(this.accessExperienceLink()).toBeVisible();
        if (experience.raw.experience_url) {
          await expect(this.accessExperienceLink()).toHaveAttribute(
            'href',
            experience.raw.experience_url,
          );
        }
        break;
      }
      case 'deploying':
      case 'requested': {
        await expect(this.provisioningButton()).toBeVisible();
        break;
      }
      default:
        throw new Error(`Unhandled demo experience status for e2e assertions: ${status}`);
    }
  }
}
