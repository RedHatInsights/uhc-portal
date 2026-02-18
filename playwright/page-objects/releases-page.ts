import semver from 'semver';

import { expect, Locator, Page } from '@playwright/test';

import { BasePage } from './base-page';

/**
 * Page object for the Releases page
 */
export class ReleasesPage extends BasePage {
  private static readonly CONTAINER_PLATFORM_DOC_PATH =
    'https://docs.redhat.com/en/documentation/openshift_container_platform/';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Get the update channels documentation path for a specific version.
   * Matches the logic in src/components/releases/getCandidateChannelLink.ts
   *
   * @param major - Major version number (must be 4 for OCP)
   * @param minor - Minor version number
   * @returns Documentation path or null if not OCP 4.x
   */
  private static getUpdateChannelsPath(major: number, minor: number): string | null {
    // Only OCP 4.x is supported (matches source behavior)
    if (major !== 4) {
      return null;
    }

    if (minor < 6) {
      return `html/updating_clusters/index#candidate-${major}-${minor}-channel`;
    }
    if (minor < 14) {
      return 'html/updating_clusters/understanding-upgrade-channels-releases#candidate-version-channel_understanding-upgrade-channels-releases';
    }
    return 'html/updating_clusters/understanding-openshift-updates-1#understanding-update-channels-releases';
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
    const parsed = semver.coerce(version);
    expect(parsed, `Failed to parse version: ${version}`).not.toBeNull();
    const { major, minor } = parsed!;
    const versionLink = this.page.locator(
      `a[href="${ReleasesPage.CONTAINER_PLATFORM_DOC_PATH}${major}.${minor}/html/release_notes/ocp-${major}-${minor}-release-notes"]`,
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
    const parsed = semver.coerce(version);
    expect(parsed, `Failed to parse version: ${version}`).not.toBeNull();
    const { major, minor } = parsed!;
    const normalizedVersion = `${major}.${minor}`;

    // Open more information modal
    await this.page
      .getByTestId(`version-${version}`)
      .getByRole('button', { name: 'More information' })
      .click();

    // Verify candidate channels link (URL varies by version)
    const updateChannelsPath = ReleasesPage.getUpdateChannelsPath(major, minor);
    expect(updateChannelsPath, `Unsupported OCP version: ${version}`).not.toBeNull();
    const candidateChannelLink = this.getContainerPlatformDocLink(
      normalizedVersion,
      updateChannelsPath!,
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
    const parsed = semver.coerce(currentVersion);
    expect(parsed, `Failed to parse version: ${currentVersion}`).not.toBeNull();
    const { major, minor } = parsed!;
    const normalizedVersion = `${major}.${minor}`;

    // Verify updating channels link
    const updateChannelsPath = ReleasesPage.getUpdateChannelsPath(major, minor);
    expect(updateChannelsPath, `Unsupported OCP version: ${currentVersion}`).not.toBeNull();
    const updatingChannelsLink = this.getContainerPlatformDocLink(
      normalizedVersion,
      updateChannelsPath!,
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
