import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Page object for the Releases page
 */
export class ReleasesPage extends BasePage {
  private static readonly CONTAINER_PLATFORM_DOC_PATH =
    'https://docs.redhat.com/en/documentation/openshift_container_platform/';
  private static readonly UPDATE_CHANNELS_PATH =
    'html/updating_clusters/understanding-openshift-updates-1#understanding-update-channels-releases';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Assert that we're on the releases page
   */
  async isReleasesPage(): Promise<void> {
    await expect(this.page.getByText('Latest OpenShift releases')).toBeVisible({ timeout: 60000 });
  }

  /**
   * Check if the release version link is visible
   */
  async checkIndividualReleaseVersionLink(version: string): Promise<void> {
    const [majorVersion, minorVersion] = version.split('.');
    const versionLink = this.page.locator(
      `a[href="${ReleasesPage.CONTAINER_PLATFORM_DOC_PATH}${version}/html/release_notes/ocp-${majorVersion}-${minorVersion}-release-notes"]`,
    );
    await expect(versionLink).toBeVisible();
  }

  /**
   * Check if the support status is visible for a version
   */
  async checkIndividualReleaseVersionSupportStatus(
    version: string,
    supportType: string,
  ): Promise<void> {
    const supportRegex = new RegExp(supportType, 'i');
    await expect(
      this.page.getByTestId(`version-${version}`).getByText(supportRegex).first(),
    ).toBeVisible();
  }

  /**
   * Check more information modal for a version
   */
  async checkIndividualReleaseVersionMoreInfo(version: string): Promise<void> {
    // Open more information modal
    await this.page
      .getByTestId(`version-${version}`)
      .getByRole('button', { name: 'More information' })
      .click();

    // Verify candidate channels link
    const candidateChannelLink = this.getContainerPlatformDocLink(
      version,
      ReleasesPage.UPDATE_CHANNELS_PATH,
    ).last();
    await expect(candidateChannelLink).toContainText('Learn more about candidate channels');

    // Close modal
    await this.page.getByRole('button', { name: 'Close' }).first().click();
  }

  /**
   * Get container platform documentation link locator
   */
  private getContainerPlatformDocLink(version: string, relativePath: string): Locator {
    const href = `${ReleasesPage.CONTAINER_PLATFORM_DOC_PATH}${version}/${relativePath}`;
    return this.page.locator(`a[href="${href}"]`);
  }

  /**
   * Check for cluster list link and documentation link
   */
  async checkLatestReleasePageLinks(currentVersion: string): Promise<void> {
    // Verify updating channels link
    const updatingChannelsLink = this.getContainerPlatformDocLink(
      currentVersion,
      ReleasesPage.UPDATE_CHANNELS_PATH,
    ).first();
    await expect(updatingChannelsLink).toContainText('Learn more about updating channels');

    // Open versions modal
    await this.page
      .getByRole('button', { name: "I don't see these versions as upgrade options for my cluster" })
      .click();

    // Verify clusters list link
    const clustersLink = this.page.getByRole('link', { name: 'clusters list' });
    await expect(clustersLink).toHaveAttribute('href', '/openshift/cluster-list');

    // Close modal
    await this.page.getByRole('button', { name: 'Close' }).first().click();
  }
}
