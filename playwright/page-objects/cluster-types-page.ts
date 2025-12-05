import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Page object for Cluster Types page functionality
 */
export class ClusterTypesPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Locators
  get cloudProviderSection(): Locator {
    return this.page.locator("[data-label='Cloud provider']");
  }

  get datacenterButton(): Locator {
    return this.page.locator('button').filter({ hasText: 'Datacenter' });
  }

  get automatedSection(): Locator {
    return this.page.locator('#select-automated');
  }

  get fullControlSection(): Locator {
    return this.page.locator('#select-full-control');
  }

  get interactiveSection(): Locator {
    return this.page.locator('#select-interactive');
  }

  get agentBasedSection(): Locator {
    return this.page.locator('#select-agent-based');
  }

  get automatedButton(): Locator {
    return this.page.locator('button').filter({ hasText: 'Automated' });
  }

  get fullControlButton(): Locator {
    return this.page.locator('button').filter({ hasText: 'Full control' });
  }

  get interactiveButton(): Locator {
    return this.page.locator('button').filter({ hasText: 'Interactive' });
  }

  get agentBasedButton(): Locator {
    return this.page.locator('button').filter({ hasText: 'Local Agent-based' });
  }

  // Methods
  async isClusterTypesUrl(expectedPath?: string): Promise<void> {
    if (expectedPath) {
      await expect(this.page).toHaveURL(
        new RegExp(expectedPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
      );
    } else {
      await expect(this.page).toHaveURL(new RegExp('/install'));
    }
  }

  async clickCloudProvider(provider: string, techPreview?: boolean): Promise<void> {
    if (techPreview) {
      await expect(this.cloudProviderSection.getByText('Technology Preview')).toBeVisible({
        timeout: 30000,
      });
    }
    await this.cloudProviderSection.getByText(provider).scrollIntoViewIfNeeded();
    await this.cloudProviderSection.getByText(provider).click();
  }

  async clickDatacenter(): Promise<void> {
    await this.datacenterButton.click();
  }

  async clickInfrastructureProvider(provider: string): Promise<void> {
    await this.page.getByRole('link', { name: provider }).click();
  }

  async isClusterTypesScreen(): Promise<void> {
    await expect(
      this.page.locator('h1').filter({ hasText: 'Select an OpenShift cluster type to create' }),
    ).toBeVisible({ timeout: 60000 });
  }

  async isClusterTypesHeader(header: string): Promise<void> {
    await expect(
      this.page.locator('h1').filter({ hasText: `Create an OpenShift Cluster: ${header}` }),
    ).toBeVisible({ timeout: 60000 });
  }

  async isAutomated(
    clusterType: string,
    clusterHeader: string,
    clusterArch?: string,
    recommended?: boolean,
  ): Promise<void> {
    const archText = clusterArch && clusterArch.length > 0 ? `${clusterArch} ` : '';

    await this.automatedSection.scrollIntoViewIfNeeded();

    // Check section elements
    await expect(this.automatedSection.locator('h2').filter({ hasText: 'Automated' })).toBeVisible({
      timeout: 30000,
    });

    if (recommended) {
      await expect(this.automatedSection.getByText('Recommended')).toBeVisible({ timeout: 30000 });
    }
    await expect(this.automatedSection.getByText('CLI-based')).toBeVisible({ timeout: 30000 });

    const learnMoreLink = this.automatedSection
      .locator('a')
      .filter({ hasText: 'Learn more about automated' });
    await expect(learnMoreLink).toBeVisible({ timeout: 30000 });
    const escapedClusterType = clusterType.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    await expect(learnMoreLink).toHaveAttribute(
      'href',
      new RegExp(`/installing.*${escapedClusterType}`),
    );

    // Click automated button and verify navigation
    await this.automatedButton.click();

    const expectedHeaderRegex = new RegExp(
      `Install OpenShift on ${clusterHeader} with installer-provisioned ${archText}infrastructure`,
      'i',
    );
    await expect(this.page.locator('h1')).toHaveText(expectedHeaderRegex, { timeout: 30000 });
    await expect(this.page).toHaveURL(new RegExp('installer-provisioned'));

    await this.page.goBack();
  }

  async isFullControl(
    clusterType: string,
    clusterHeader: string,
    clusterArch?: string,
    nonTested?: boolean,
    recommended?: boolean,
  ): Promise<void> {
    const archText = clusterArch && clusterArch.length > 0 ? `${clusterArch} ` : '';

    await this.fullControlSection.scrollIntoViewIfNeeded();

    // Check section elements
    await expect(
      this.fullControlSection.locator('h2').filter({ hasText: 'Full control' }),
    ).toBeVisible({ timeout: 30000 });

    if (recommended) {
      await expect(this.fullControlSection.getByText('Recommended')).toBeVisible({
        timeout: 30000,
      });
    }
    await expect(this.fullControlSection.getByText('CLI-based')).toBeVisible({ timeout: 30000 });

    if (nonTested) {
      const nonTestedLink = this.fullControlSection
        .locator('a')
        .filter({ hasText: 'non-tested platforms' });
      await expect(nonTestedLink).toBeVisible({ timeout: 30000 });
      await expect(nonTestedLink).toHaveAttribute(
        'href',
        'https://access.redhat.com/articles/4207611',
      );
    }

    const learnMoreLink = this.fullControlSection
      .locator('a')
      .filter({ hasText: 'Learn more about full control' });
    await expect(learnMoreLink).toBeVisible({ timeout: 30000 });
    const escapedClusterType = clusterType.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    await expect(learnMoreLink).toHaveAttribute(
      'href',
      new RegExp(`/installing.*${escapedClusterType}`),
    );

    // Click full control button and verify navigation
    await this.fullControlButton.click();

    const expectedHeader = `Install OpenShift on ${clusterHeader} with user-provisioned ${archText}infrastructure`;
    await expect(this.page.locator('h1')).toHaveText(expectedHeader.trim(), { timeout: 30000 });

    await expect(this.page).toHaveURL(new RegExp('user-provisioned'));

    await this.page.goBack();
  }

  async isInteractive(nonTested?: boolean, recommended?: boolean): Promise<void> {
    await this.interactiveSection.scrollIntoViewIfNeeded();

    // Check section elements
    await expect(
      this.interactiveSection.locator('h2').filter({ hasText: 'Interactive' }),
    ).toBeVisible({ timeout: 30000 });

    if (recommended) {
      await expect(this.interactiveSection.getByText('Recommended')).toBeVisible({
        timeout: 30000,
      });
    }
    await expect(this.interactiveSection.getByText('Web-based')).toBeVisible({ timeout: 30000 });

    if (nonTested) {
      const nonTestedLink = this.interactiveSection
        .locator('a')
        .filter({ hasText: 'non-tested platforms' });
      await expect(nonTestedLink).toBeVisible({ timeout: 30000 });
      await expect(nonTestedLink).toHaveAttribute(
        'href',
        'https://access.redhat.com/articles/4207611',
      );
    }

    const learnMoreLink = this.interactiveSection
      .locator('a')
      .filter({ hasText: 'Learn more about interactive' });
    await expect(learnMoreLink).toBeVisible({ timeout: 30000 });
    await expect(learnMoreLink).toHaveAttribute('href', new RegExp('installing-on-prem-assisted'));

    // Click interactive button and verify navigation
    await this.interactiveButton.scrollIntoViewIfNeeded();
    await this.interactiveButton.click();

    await expect(
      this.page.locator('h1').filter({ hasText: 'Install OpenShift with the Assisted Installer' }),
    ).toBeVisible({ timeout: 30000 });

    await this.page.goBack();
  }

  async isLocalAgentBased(
    clusterHeader: string,
    clusterArch?: string,
    nonTested?: boolean,
    recommended?: boolean,
  ): Promise<void> {
    await this.agentBasedSection.scrollIntoViewIfNeeded();

    // Check section elements
    await expect(
      this.agentBasedSection.locator('h2').filter({ hasText: 'Local Agent-based' }),
    ).toBeVisible({ timeout: 30000 });

    if (recommended) {
      await expect(this.agentBasedSection.getByText('Recommended')).toBeVisible({ timeout: 30000 });
    }

    if (nonTested) {
      const nonTestedLink = this.agentBasedSection
        .locator('a')
        .filter({ hasText: 'non-tested platforms' });
      await expect(nonTestedLink).toBeVisible({ timeout: 30000 });
      await expect(nonTestedLink).toHaveAttribute(
        'href',
        'https://access.redhat.com/articles/4207611',
      );
    }

    const learnMoreLink = this.agentBasedSection
      .locator('a')
      .filter({ hasText: 'Learn more about local agent-based' });
    await expect(learnMoreLink).toBeVisible({ timeout: 30000 });
    await expect(learnMoreLink).toHaveAttribute(
      'href',
      new RegExp('preparing-to-install-with-agent-based-installer'),
    );

    // Click agent-based button and verify navigation
    await this.agentBasedButton.click();
    const archText = clusterArch && clusterArch.length > 0 ? `${clusterArch} ` : '';
    const expectedHeader = `Install OpenShift on ${clusterHeader} locally ${archText}with Agent`;
    await expect(this.page.locator('h1')).toHaveText(expectedHeader, { timeout: 30000 });

    await this.page.goBack();
  }
}
