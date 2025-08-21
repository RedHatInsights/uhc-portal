import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Page object for the Releases page
 */
export class ReleasesPage extends BasePage {
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
   * Check channel detail and support status for a specific version
   */
  async checkChannelDetailAndSupportStatus(version: string, supportType: string): Promise<void> {
    const majorVersion = version.split('.')[0];
    const minorVersion = version.split('.')[1];

    // Find the link to the version documentation
    const versionLinkSelector = `.ocm-l-ocp-releases__channel-detail-level a[href^="https://docs.redhat.com/en/documentation/openshift_container_platform/${version}/html/release_notes/ocp-${majorVersion}-${minorVersion}-release-notes"]`;
    const versionLink = this.page.locator(versionLinkSelector).first();

    await expect(versionLink).toBeVisible();

    // Check support type text in the next sibling element
    const supportTypeElement = versionLink.locator('..').locator('+ *');
    await expect(supportTypeElement.getByText(supportType)).toBeVisible();

    // Find and click the "More information" button in the parent card
    const cardElement = versionLink.locator(
      'xpath=ancestor::dl[ancestor::*[contains(@class, "pf-v6-c-card__body")]]',
    );
    const moreInfoButton = cardElement.getByRole('button', { name: 'More information' });

    await moreInfoButton.scrollIntoViewIfNeeded();
    await moreInfoButton.click();

    // Determine the relative path based on version
    const relativePath =
      parseInt(minorVersion) >= 14
        ? 'understanding-openshift-updates-1#understanding-update-channels-releases'
        : 'understanding-upgrade-channels-releases#candidate-version-channel_understanding-upgrade-channels-releases';

    // Check for the candidate channels documentation link
    const candidateChannelLink = this.getContainerPlatformDocLink(
      version,
      `html/updating_clusters/${relativePath}`,
    ).last();
    await expect(candidateChannelLink).toContainText('Learn more about candidate channels');

    // Close the modal/popup
    await this.page.getByRole('button', { name: 'Close' }).first().click();
  }

  /**
   * Get container platform documentation link
   */
  getContainerPlatformDocLink(version: string, relativePath: string): Locator {
    const containerPlatformDocPath =
      'https://docs.redhat.com/en/documentation/openshift_container_platform/';
    const href = `${containerPlatformDocPath}${version}/${relativePath}`;
    return this.page.locator(`a[href="${href}"]`);
  }

  /**
   * Check for cluster list link and documentation link
   */
  async checkReleasePageLinks(currentVersion: string): Promise<void> {
    // Check the "Learn more about updating channels" link
    const updatingChannelsLink = this.getContainerPlatformDocLink(
      currentVersion,
      'html/updating_clusters/understanding-openshift-updates-1#understanding-update-channels-releases',
    ).first();
    await expect(updatingChannelsLink).toContainText('Learn more about updating channels');
    // Click the "I don't see these versions" button
    await this.page
      .getByRole('button', { name: "I don't see these versions as upgrade options for my cluster" })
      .click();
    // Check the clusters list link
    const link = this.page.getByRole('link', { name: 'clusters list' });
    await expect(link).toHaveAttribute('href', '/openshift/cluster-list');
    // Close the modal
    await this.page.getByRole('button', { name: 'Close' }).first().click();
  }

  /**
   * Maps and normalizes version types for releases
   * @param versions Array of version objects with name and type properties
   * @param limit Optional limit for number of versions to process (default: 6)
   * @returns Array of normalized version objects
   */
  static mapVersionTypes<T extends { name: string; type: string }>(
    versions: T[],
    limit: number = 6,
  ): T[] {
    const limitedVersions = versions.slice(0, limit);

    return limitedVersions.map((item) => {
      if (item.type === 'Full Support') {
        item.type = 'Full support';
      } else if (item.type === 'Maintenance Support') {
        item.type = 'Maintenance support';
      }
      return item;
    });
  }
}
