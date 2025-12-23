import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * OSD Product page object for Playwright tests
 */
export class OsdProductPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async isOSDProductPage(): Promise<void> {
    await this.assertUrlIncludes('openshift/overview/osd');
    await expect(this.page).toHaveTitle('Overview | OpenShift');
  }

  async isTitlePage(): Promise<void> {
    await expect(
      this.page.getByRole('heading', { name: 'Red Hat OpenShift Dedicated', level: 1 }),
    ).toBeVisible({ timeout: 30000 });
  }

  async isBenefitsTitle(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Benefits', level: 2 })).toBeVisible();
  }

  async isFeaturesTitle(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Features', level: 2 })).toBeVisible();
  }

  async isPricingTitle(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Pricing', level: 2 })).toBeVisible();
  }

  async isRecommendationsTitle(): Promise<void> {
    await expect(
      this.page.getByRole('heading', { name: 'Recommendations', level: 2 }),
    ).toBeVisible();
  }

  async isRecommendedContentTitle(): Promise<void> {
    await expect(
      this.page.getByRole('heading', { name: 'Recommended content', level: 2 }),
    ).toBeVisible();
  }

  async validateUrlLink(expectedText: string, expectedUrl: string): Promise<void> {
    const link = this.page.getByRole('link', { name: expectedText });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', expectedUrl);
    await expect(link).toHaveAttribute('target', '_blank');
  }

  // Create cluster card methods
  createClusterCard(): Locator {
    return this.page.getByTestId('create-cluster-card');
  }

  async createClusterCardIsCardTitle(): Promise<void> {
    await expect(
      this.createClusterCard().getByRole('heading', {
        name: 'Create an OpenShift Dedicated cluster',
        level: 3,
      }),
    ).toBeVisible();
  }

  async createClusterCardBtnShouldExist(btnText: string, link: string): Promise<void> {
    const button = this.createClusterCard().getByRole('link', { name: btnText });
    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute('href', link);
  }

  async clickCreateOSDButton(): Promise<void> {
    const createButton = this.page.getByTestId('register-cluster');
    await expect(createButton).toBeVisible();
    await expect(createButton).not.toBeDisabled();
    await expect(createButton).toContainText('Create cluster');
    await createButton.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(1000);
    await createButton.click();
  }

  async isCreateOSDPage(): Promise<void> {
    await this.assertUrlIncludes('/openshift/create/osd');
  }

  async clickBackButton(): Promise<void> {
    await this.page.goBack();
  }

  // Learn more card methods
  learnMoreCard(): Locator {
    return this.page.getByTestId('learn-more-osdcard');
  }

  async learnMoreCardIsCardTitle(): Promise<void> {
    await expect(
      this.learnMoreCard().getByRole('heading', { name: 'Want to learn more?', level: 3 }),
    ).toBeVisible();
  }

  async learnMoreCardCheckLink(title: string, link: string): Promise<void> {
    const linkElement = this.learnMoreCard().getByRole('link', { name: title });
    await expect(linkElement).toBeVisible();
    await expect(linkElement).toHaveAttribute('href', link);
    await expect(linkElement).toHaveAttribute('target', '_blank');
  }

  // Feature expansion/collapse methods
  async expandFeature(sectionTitle: string): Promise<void> {
    const button = this.page.getByRole('button', { name: sectionTitle });
    await button.scrollIntoViewIfNeeded();
    await expect(button).toBeVisible();
    await button.click();
  }

  async collapseFeature(sectionTitle: string): Promise<void> {
    const button = this.page.getByRole('button', { name: sectionTitle });
    await button.click();
  }

  async verifyFeatureContent(expectedText: string): Promise<void> {
    await expect(
      this.page.locator('.rosa-expandable-list-item').filter({ hasText: expectedText }),
    ).toBeVisible();
  }

  // Pricing card validation
  async validatePricingCard({
    title,
    yearlyText,
  }: {
    title: string;
    yearlyText: string;
  }): Promise<void> {
    const pricingCard = this.page
      .getByRole('heading', { name: title, level: 3 })
      .locator('xpath=ancestor::*[@data-testid="pricing-card"]');

    await pricingCard.scrollIntoViewIfNeeded();
    await expect(pricingCard).toBeVisible();
    await expect(pricingCard.getByText(yearlyText)).toBeVisible();
  }

  // Recommendations card validation
  async validateRecommendationsCard({
    title,
    cardText,
  }: {
    title: string;
    cardText: string;
  }): Promise<void> {
    const recommendationsCard = this.page
      .getByRole('heading', { name: title, level: 3 })
      .locator('xpath=ancestor::*[@data-testid="recommendations-card"]');

    await recommendationsCard.scrollIntoViewIfNeeded();
    await expect(recommendationsCard).toBeVisible();
    await expect(recommendationsCard.getByText(cardText)).toBeVisible();
  }

  // Recommended content list validation
  async validateRecommendedContentList(
    testId: string,
    rows: Array<{ label: string; badge: string; linkUrl: string }>,
  ): Promise<void> {
    const contentList = this.page.getByTestId(testId);
    await contentList.scrollIntoViewIfNeeded();
    await expect(contentList).toBeVisible();

    const listItems = contentList.locator('ul > li');
    await expect(listItems).toHaveCount(rows.length);

    for (let i = 0; i < rows.length; i++) {
      const listItem = listItems.nth(i);
      const expected = rows[i];

      await expect(listItem.locator('[data-testtag="label"]')).toContainText(expected.badge);
      await expect(listItem.getByText(expected.label)).toBeVisible();

      const link = listItem.locator('a');
      await expect(link).toHaveAttribute('href', expected.linkUrl);
      await expect(link).toHaveAttribute('target', '_blank');
    }
  }
}
