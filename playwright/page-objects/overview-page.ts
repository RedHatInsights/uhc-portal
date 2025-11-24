import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';
import { CustomCommands } from '../support/custom-commands';

/**
 * Overview page object for Playwright tests
 */
export class OverviewPage extends BasePage {
  private customCommands: CustomCommands;

  constructor(page: Page) {
    super(page);
    this.customCommands = new CustomCommands(page);
  }

  async isOverviewPage(): Promise<void> {
    await this.isOverviewUrl();
    await expect(this.page.getByText('Get started with OpenShift')).toBeVisible({ timeout: 60000 });
  }

  async isOverviewUrl(): Promise<void> {
    await this.assertUrlIncludes('/openshift/overview');
  }

  // Header methods
  headerTitle(): Locator {
    return this.page.locator('[data-testid="OverviewHeader"] h1');
  }

  headerLearnMoreLink(): Locator {
    return this.page
      .locator('[data-testid="OverviewHeader"]')
      .getByRole('link', { name: 'Learn more' });
  }

  // Central section card methods
  centralSectionCard(cardId: string): Locator {
    return this.page.locator(`[data-testid="${cardId}"]`);
  }

  centralSectionCards(): Locator {
    return this.page.locator('[data-testid^="offering-card"]');
  }

  cardCreateClusterButton(cardId: string): Locator {
    return this.centralSectionCard(cardId).getByTestId('create-cluster');
  }

  cardViewDetailsLink(cardId: string): Locator {
    return this.centralSectionCard(cardId).getByRole('link', { name: 'View details' });
  }

  cardLearnMoreLink(cardId: string, linkText: string): Locator {
    return this.centralSectionCard(cardId).getByRole('link', { name: linkText });
  }

  cardRegisterClusterLink(cardId: string): Locator {
    return this.centralSectionCard(cardId).getByRole('link', { name: 'Register cluster' });
  }

  cardLabel(cardId: string): Locator {
    return this.centralSectionCard(cardId).locator('[data-testtag="label"]');
  }

  cardDetails(cardId: string): Locator {
    return this.centralSectionCard(cardId).locator('dl');
  }

  centralSectionFooterLink(): Locator {
    return this.page.getByRole('link', { name: 'View all OpenShift cluster types' });
  }

  viewAllOpenshiftClusterTypesLink(): Locator {
    return this.page.getByRole('link', { name: 'View all OpenShift cluster types' });
  }

  async waitForViewAllOpenshiftClusterTypesLink(): Promise<void> {
    await this.viewAllOpenshiftClusterTypesLink().scrollIntoViewIfNeeded();
    await this.viewAllOpenshiftClusterTypesLink().waitFor({ state: 'visible', timeout: 90000 });
  }

  // Featured products methods
  featuredProductsSection(): Locator {
    return this.page.getByRole('heading', { name: 'Featured products' }).locator('..');
  }

  featuredProductCards(): Locator {
    return this.featuredProductsSection().locator('[data-testid="product-overview-card"]');
  }

  // Recommended operators methods
  recommendedOperatorsSection(): Locator {
    return this.page.getByRole('heading', { name: 'Recommended operators' }).locator('..');
  }

  recommendedOperatorCards(): Locator {
    return this.recommendedOperatorsSection().locator('[data-testid="product-overview-card"]');
  }

  recommendedOperatorsHeaderLink(): Locator {
    return this.recommendedOperatorsSection().getByRole('link', {
      name: 'View all in Ecosystem Catalog',
    });
  }

  // Product/Operator card methods
  productCard(productName: string): Locator {
    return this.page
      .getByRole('heading', { name: productName, level: 3 })
      .locator('[data-testid="product-overview-card"]');
  }

  productCardLearnMoreButton(productName: string): Locator {
    return this.productCard(productName).getByText('Learn more');
  }

  // Drawer methods
  drawerContentTitle(): Locator {
    return this.page.getByTestId('drawer-panel-content__title');
  }

  drawerCloseButton(): Locator {
    return this.page.getByTestId('drawer-close-button');
  }

  async closeDrawer(): Promise<void> {
    await this.drawerCloseButton().click();
  }

  // Methods matching original Cypress naming
  async centralSectionCardsExpected(numberOfCards: number): Promise<void> {
    await expect(this.centralSectionCards()).toHaveCount(numberOfCards);
  }

  async featuredProductsExpected(numberOfContents: number): Promise<void> {
    await expect(this.featuredProductCards()).toHaveCount(numberOfContents);
  }

  async recommendedOperatorsExpected(numberOfContents: number): Promise<void> {
    await expect(this.recommendedOperatorCards()).toHaveCount(numberOfContents);
  }

  async isRecommendedOperatorsHeaderVisible(link: string): Promise<void> {
    const headerSection = this.page
      .getByRole('heading', { name: 'Recommended operators' })
      .locator('..');
    const catalogLink = headerSection.getByRole('link', { name: 'View all in Ecosystem Catalog' });
    await expect(catalogLink).toHaveAttribute('href', expect.stringContaining(link));
  }

  async centralSectionFooterLinkExists(title: string, link: string): Promise<void> {
    const footerLink = this.page.getByRole('link', { name: title });
    await expect(footerLink).toHaveAttribute('href', link);
    await expect(footerLink).toBeVisible();
  }

  productsOrOperatorCards(text: string, description: string): Locator {
    const card = this.page
      .getByRole('heading', { name: text, level: 3 })
      .locator('xpath=ancestor::div[@data-testid="product-overview-card"]');
    // Verify description exists in the card
    expect(card.getByText(description)).toBeDefined();
    return card.getByText('Learn more');
  }

  // Helper methods for validations (keeping both naming conventions)
  async expectCentralSectionCardsCount(count: number): Promise<void> {
    await this.centralSectionCardsExpected(count);
  }

  async expectFeaturedProductsCount(count: number): Promise<void> {
    await this.featuredProductsExpected(count);
  }

  async expectRecommendedOperatorsCount(count: number): Promise<void> {
    await this.recommendedOperatorsExpected(count);
  }

  async expectCardHasText(cardId: string, text: string): Promise<void> {
    await expect(this.centralSectionCard(cardId)).toContainText(text);
  }

  async expectCardHasLabel(cardId: string, label: string): Promise<void> {
    await expect(this.cardLabel(cardId)).toHaveText(label);
  }

  async expectCardDetails(cardId: string, details: Record<string, string>): Promise<void> {
    const cardDetailsElement = this.cardDetails(cardId);
    const keys = Object.keys(details);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = details[key];

      await expect(cardDetailsElement.locator('dt').nth(i)).toContainText(key);
      await expect(cardDetailsElement.locator('dd').nth(i)).toContainText(value);
    }
  }

  async expectProductCardHasDescription(productName: string, description: string): Promise<void> {
    await expect(this.productCard(productName)).toContainText(description);
  }

  async clickProductCardLearnMore(productName: string): Promise<void> {
    await this.productCardLearnMoreButton(productName).click();
  }

  async expectDrawerTitle(title: string): Promise<void> {
    await expect(this.drawerContentTitle()).toHaveText(title);
  }

  async expectLinkOpensInNewTab(link: Locator, expectedUrl: string): Promise<void> {
    await expect(link).toHaveAttribute('href', expectedUrl);
    await this.customCommands.assertUrlReturns200(expectedUrl);
  }
}
