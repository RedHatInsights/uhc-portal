import { expect, Locator, Page, Response } from '@playwright/test';

import docLinks from '../../src/common/docLinks.mjs';
import { rosaHandsOnLinks, UNAUTHORIZED } from '../../src/components/RosaHandsOn/constants';
import { DemoExperienceStatusEnum } from '../../src/components/RosaHandsOn/DemoExperienceModels';

import { BasePage } from './base-page';

const DEMO_EXPERIENCE_ROUTE = '**/demoExperience/rosa-hands-on**';

export type DemoExperienceApiPayload = {
  status: string;
  unavailable_reason?: string;
  quota?: { current?: number; limit?: number };
  experience_url?: string;
  scheduled_delete_timestamp?: string;
};

/** UI status after the same rewrite applied in demoExperienceService. */
export type HandsOnUiStatus = DemoExperienceStatusEnum | 'quota-exceeded' | string;

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
  const quotaCurrent = payload.quota?.current ?? 0;
  const quotaLimit = payload.quota?.limit ?? 0;
  const status =
    payload.status === DemoExperienceStatusEnum.Unavailable && quotaCurrent >= quotaLimit
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
   *
   * Prefer getByRole('alert') elsewhere in this repo, but Hands-on StatusAlert
   * uses PF <Alert component="span" />, which does not expose role="alert" or
   * role="status" in the a11y tree — only the .pf-v6-c-alert container.
   */
  alertContactSupportLink(): Locator {
    return this.page.locator('.pf-v6-c-alert').getByRole('link', { name: 'contact support' });
  }

  customerSuccessTeamLink(): Locator {
    return this.page.getByRole('link', { name: 'customer success team' });
  }

  requestExperienceButton(): Locator {
    return this.page.getByRole('button', { name: 'Request experience' });
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
    return this.page.locator('tr', { has: this.page.getByText(title, { exact: true }) });
  }

  /**
   * Header Slack, Learn more about ROSA, and recommended-content Learn more links.
   * Stable across demo-experience statuses (card footer Learn more is always present).
   */
  async expectStaticChromeLinks(): Promise<void> {
    await expect(this.headerSlackCommunityLink()).toBeVisible();
    await expect(this.headerSlackCommunityLink()).toHaveAttribute(
      'href',
      rosaHandsOnLinks.slackChannel,
    );

    await this.learnMoreAboutRosaLink().scrollIntoViewIfNeeded();
    await expect(this.learnMoreAboutRosaLink()).toBeVisible();
    await expect(this.learnMoreAboutRosaLink()).toHaveAttribute('href', rosaHandsOnLinks.learnMore);

    await this.recommendedContentHeading().scrollIntoViewIfNeeded();
    await expect(this.recommendedContentHeading()).toBeVisible();

    await this.expectRecommendedContentRow(
      'Red Hat OpenShift Service on AWS learning hub',
      'Documentation',
      docLinks.RH_ROSA_LEARN,
    );
    await this.expectRecommendedContentRow(
      'Red Hat OpenShift Service on AWS (ROSA) interactive walkthrough',
      'Walkthrough',
      docLinks.RH_ROSA_INSTALL,
    );
    await this.expectRecommendedContentRow(
      'Watch our Red Hat OpenShift Service on AWS video series',
      'Video',
      docLinks.RH_ROSA_LIGHTBOARD,
    );
  }

  private async expectRecommendedContentRow(
    title: string,
    label: string,
    href: string,
  ): Promise<void> {
    const row = this.recommendedContentRow(title);
    await row.scrollIntoViewIfNeeded();
    await expect(row).toBeVisible();
    await expect(row.getByText(label, { exact: true })).toBeVisible();
    await expect(row.getByRole('link', { name: 'Learn more' })).toHaveAttribute('href', href);
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
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(payload),
      });
    });
  }

  async clearDemoExperienceMock(): Promise<void> {
    await this.page.unroute(DEMO_EXPERIENCE_ROUTE);
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
    await expect(link).toHaveAttribute('href', rosaHandsOnLinks.customerSuccess);
  }

  async expectWhatToExpectPopoverLinks(): Promise<void> {
    await this.whatToExpectHelpButton().click();
    await expect(this.page.getByText('ROSA community Slack channel')).toBeVisible();
    await expect(
      this.page.getByRole('link', { name: 'ROSA community Slack channel' }),
    ).toHaveAttribute('href', rosaHandsOnLinks.slackChannel);
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
      case DemoExperienceStatusEnum.Available: {
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
      case DemoExperienceStatusEnum.Unavailable: {
        if (unavailableReason === UNAUTHORIZED) {
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
        await expect(this.createRosaClusterLink()).toHaveAttribute(
          'href',
          /\/create\/rosa\/getstarted/,
        );
        break;
      }
      case DemoExperienceStatusEnum.Failed: {
        await expect(this.page.getByText(/error on our end/i)).toBeVisible();
        await this.expectCustomerSuccessMailto(this.alertContactSupportLink());
        await expect(this.requestExperienceButton()).toBeEnabled();
        await this.expectWhatToExpectPopoverLinks();
        break;
      }
      case DemoExperienceStatusEnum.Started: {
        await expect(this.page.getByText(/current experience demo will end/i)).toBeVisible();
        await expect(this.accessExperienceLink()).toBeVisible();
        break;
      }
      case DemoExperienceStatusEnum.Deploying:
      case DemoExperienceStatusEnum.Requested: {
        await expect(this.provisioningButton()).toBeVisible();
        break;
      }
      default:
        throw new Error(`Unhandled demo experience status for e2e assertions: ${status}`);
    }
  }
}
