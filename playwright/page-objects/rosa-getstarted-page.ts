import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * ROSA Get Started page object for Playwright tests
 */
export class RosaGetStartedPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Element selectors
  rosaPrerequisitesStep1Items(): Locator {
    return this.page.getByTestId('substep1-rosa-prerequisites').locator('li');
  }

  rosaPrerequisitesStep2Items(): Locator {
    return this.page.getByTestId('rosa-cli-definition').locator('li');
  }

  rosaPrerequisitesStep3Items(): Locator {
    return this.page.getByTestId('create-vpc-networking-definition').locator('li');
  }

  rosaPrerequisitesStep1Section(): Locator {
    return this.page.getByTestId('step1-rosa-prerequisites');
  }

  rosaPrerequisitesStep11Content(): Locator {
    return this.page.getByTestId('substep1_1-rosa-prerequisites');
  }

  rosaPrerequisitesStep12Content(): Locator {
    return this.page.getByTestId('substep1_2-rosa-prerequisites');
  }

  rosaPrerequisitesStep2Section(): Locator {
    return this.page.getByTestId('rosa-cli-header');
  }

  rosaPrerequisitesStep21Content(): Locator {
    return this.page.getByTestId('rosa-cli-sub-definition-1');
  }

  rosaPrerequisitesStep22Content(): Locator {
    return this.page.getByTestId('rosa-cli-sub-definition-2');
  }

  rosaPrerequisitesStep31Content(): Locator {
    return this.page.getByTestId('create-vpc-networking-definition-item1');
  }

  rosaHpcCreateVpcLabel(): Locator {
    return this.page.getByTestId('create-vpc-networking-hcp-label');
  }

  rosaFedRampDoclink(): Locator {
    return this.page.getByTestId('rosa-aws-fedramp');
  }

  rosaClientDropdown(): Locator {
    return this.page.getByTestId('os-dropdown-rosa');
  }

  rosaClientButton(): Locator {
    return this.page.getByTestId('download-btn-rosa');
  }

  rosaFedRampRequestFormlink(): Locator {
    return this.page.getByTestId('fedramp-access-request-form');
  }

  deployWithCliCard(): Locator {
    return this.page.getByTestId('deploy-with-cli-card');
  }

  deployWithWebInterfaceCard(): Locator {
    return this.page.getByTestId('deploy-with-webinterface-card');
  }

  deployWithTerraformCard(): Locator {
    return this.page.getByTestId('deploy-with-terraform-card');
  }

  // Verification methods
  async isRosaGetStartedPage(): Promise<void> {
    await expect(
      this.page.getByRole('heading', {
        name: 'Set up Red Hat OpenShift Service on AWS (ROSA)',
        level: 1,
      }),
    ).toBeVisible({ timeout: 60000 });
  }

  async isRosaFedRAMPInfoAlertShown(): Promise<void> {
    await expect(
      this.page.getByRole('heading', {
        name: 'Red Hat OpenShift Service on AWS (ROSA) with hosted control planes in AWS GovCloud achieves FedRAMP High Authorization',
        level: 2,
      }),
    ).toBeVisible();
  }

  async isCompleteAWSPrerequisitesHeaderShown(): Promise<void> {
    const header = this.page.getByRole('heading', { name: 'Complete AWS prerequisites', level: 2 });
    await header.scrollIntoViewIfNeeded();
    await expect(header).toBeVisible();
  }

  async isCompleteROSAPrerequisitesHeaderShown(): Promise<void> {
    const header = this.page.getByRole('heading', {
      name: 'Complete ROSA prerequisites',
      level: 2,
    });
    await header.scrollIntoViewIfNeeded();
    await expect(header).toBeVisible();
  }

  async isDeployClusterAndSetupAccessHeaderShown(): Promise<void> {
    const header = this.page.getByRole('heading', {
      name: 'Deploy the cluster and set up access',
      level: 2,
    });
    await header.scrollIntoViewIfNeeded();
    await expect(header).toBeVisible();
  }

  async waitForCommands(): Promise<void> {
    await this.page.locator('div[role="status"]').waitFor({ state: 'detached', timeout: 100000 });
  }

  // Helper method for checking anchor properties
  async checkAnchorProperties(
    linkLocator: Locator,
    anchorText: string,
    anchorLink: string,
    accessLink: boolean = true,
  ): Promise<void> {
    const link = linkLocator.filter({ hasText: anchorText });
    await expect(link).toHaveAttribute('href', anchorLink);

    if (accessLink) {
      await this.isLinkAccessSuccess(anchorLink);
    }
  }

  async isLinkAccessSuccess(link: string): Promise<void> {
    const response = await this.page.request.get(link);
    expect(response.status()).toBe(200);
  }

  // Additional helper methods for input field validation
  async expectInputValue(selector: string, expectedValue: string): Promise<void> {
    await expect(this.page.locator(selector)).toHaveValue(expectedValue);
  }

  async expectTextContent(locator: Locator, text: string): Promise<void> {
    await expect(locator).toContainText(text);
  }

  async scrollToElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  async selectOption(selector: Locator, value: string): Promise<void> {
    await selector.selectOption(value);
  }

  async navigateToUrl(url: string): Promise<void> {
    await this.page.goto(url);
  }

  async goBack(): Promise<void> {
    await this.page.goBack();
  }
}
