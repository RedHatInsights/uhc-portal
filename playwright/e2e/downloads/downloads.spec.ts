import { test, expect } from '../../fixtures/pages';
import * as fs from 'fs';
import * as path from 'path';

const ROSARowTitle = 'Manage your Red Hat OpenShift Service on AWS';
const OCRowTitle =
  'Create applications and manage OpenShift projects from the command line using the OpenShift client oc';
const HELMRowTitle = 'Define, install, and upgrade application packages as Helm charts using Helm';
const OSLocalTitle = 'Download and open the OpenShift Local';

test.describe.serial('Downloads page', { tag: ['@ci', '@smoke'] }, () => {
  test.beforeAll(async ({ page, downloadsPage }) => {
    // Navigate to downloads page
    await page.goto('downloads');
    await downloadsPage.isDownloadsPage();
  });

  test.afterAll(async () => {
    // cleanup the downloaded secrets at the end of execution.
    const downloadsFolder = path.join(process.cwd(), 'test-results', 'downloads');
    const pullSecretPath = path.join(downloadsFolder, 'pull-secret.txt');
    if (fs.existsSync(pullSecretPath)) {
      fs.unlinkSync(pullSecretPath);
    }
  });

  test('can expand and collapse rows', async ({ page }) => {
    // Debug: Check if we're on the downloads page
    await expect(page.locator('h1')).toContainText('Downloads');

    // Look for expand buttons and try clicking each one until we find ROSA
    const expandButtons = page.locator('button[id*="expand-toggle"]');
    const buttonCount = await expandButtons.count();

    let foundROSA = false;
    for (let i = 0; i < buttonCount; i++) {
      // Click the button
      await expandButtons.nth(i).click();

      // Wait a bit for the expansion
      await page.waitForTimeout(500);

      // Check if ROSA content is now visible
      if (await page.getByText(ROSARowTitle).isVisible()) {
        foundROSA = true;

        // Test collapse
        await expandButtons.nth(i).click();
        await expect(page.getByText(ROSARowTitle)).not.toBeVisible();
        break;
      }
    }

    expect(foundROSA).toBe(true);
  });

  test('expand/collapse affects only selected category', async ({ page, downloadsPage }) => {
    // Test filtering by CLI tools category
    await downloadsPage.filterByCategory('Command-line interface (CLI) tools');
    await downloadsPage.clickExpandAll();
    await expect(page.getByText(ROSARowTitle)).toBeVisible();
    await expect(page.getByText(OCRowTitle)).toBeVisible();
    await downloadsPage.rowDoesNotExist('expanded-row-helm');

    // Test filtering back to all categories
    await downloadsPage.filterByCategory('All categories');
    // ROSA and OC should still be visible from previous expansion
    await expect(page.getByText(ROSARowTitle)).toBeVisible();
    await expect(page.getByText(OCRowTitle)).toBeVisible();
    // HELM should not be visible since it wasn't expanded in CLI tools filter
    await expect(page.getByText(HELMRowTitle)).not.toBeVisible();

    // Expand all to show everything
    await downloadsPage.clickExpandAll();
    await expect(page.getByText(ROSARowTitle)).toBeVisible();
    await expect(page.getByText(HELMRowTitle)).toBeVisible();

    // Collapse all
    await downloadsPage.clickCollapseAll();
    await expect(page.getByText(ROSARowTitle)).not.toBeVisible();
    await expect(page.getByText(OCRowTitle)).not.toBeVisible();
    await expect(page.getByText(HELMRowTitle)).not.toBeVisible();
  });

  test('selecting OS affects architecture options & href', async ({ page, downloadsPage }) => {
    // Reset to clean state
    await downloadsPage.filterByCategory('All categories');
    await downloadsPage.clickCollapseAll();

    await page.getByTestId('os-dropdown-odo').selectOption('Linux');

    await downloadsPage.enabledDropdownOptions('arch-dropdown-odo', [
      'x86_64',
      'aarch64',
      'ppc64le',
      's390x',
    ]);

    await expect(page.getByTestId('download-btn-odo')).toHaveAttribute(
      'href',
      'https://developers.redhat.com/content-gateway/rest/mirror/pub/openshift-v4/clients/odo/latest/odo-linux-amd64.tar.gz',
    );

    await page.getByTestId('arch-dropdown-odo').selectOption('ppc64le');

    await expect(page.getByTestId('download-btn-odo')).toHaveAttribute(
      'href',
      'https://developers.redhat.com/content-gateway/rest/mirror/pub/openshift-v4/clients/odo/latest/odo-linux-ppc64le.tar.gz',
    );

    // Only x86 available for Windows.
    await page.getByTestId('os-dropdown-odo').selectOption('Windows');

    await downloadsPage.enabledDropdownOptions('arch-dropdown-odo', ['x86_64']);

    await expect(page.getByTestId('arch-dropdown-odo')).toBeDisabled();

    await downloadsPage.allDropdownOptions('arch-dropdown-odo', ['Select architecture', 'x86_64']);

    await expect(page.getByTestId('download-btn-odo')).toHaveAttribute(
      'href',
      'https://developers.redhat.com/content-gateway/rest/mirror/pub/openshift-v4/clients/odo/latest/odo-windows-amd64.exe.zip',
    );
  });

  test('selecting a category preserves OS & architecture of invisible sections', async ({
    page,
    downloadsPage,
  }) => {
    // Reset to clean state
    await downloadsPage.filterByCategory('All categories');
    await downloadsPage.clickExpandAll();

    await page.getByTestId('os-dropdown-helm').selectOption('Linux');
    await page.getByTestId('arch-dropdown-helm').selectOption('s390x');

    // OpenShift Local
    await page.getByTestId('os-dropdown-crc').selectOption('Windows');

    await downloadsPage.filterByCategory('Tokens');

    await downloadsPage.rowDoesNotExist('expanded-row-rosa');
    await downloadsPage.rowDoesNotExist('expanded-row-helm');
    await downloadsPage.rowDoesNotExist('expanded-row-crc');

    await downloadsPage.filterByCategory('All categories');
    await downloadsPage.clickExpandAll();

    await expect(page.getByText(ROSARowTitle)).toBeVisible();
    await expect(page.getByText(HELMRowTitle)).toBeVisible();
    await expect(page.getByText(OSLocalTitle)).toBeVisible();

    await expect(page.getByTestId('os-dropdown-helm')).toHaveValue('linux');
    await expect(page.getByTestId('arch-dropdown-helm')).toHaveValue('s390x');
    // OpenShift Local
    await expect(page.getByTestId('os-dropdown-crc')).toHaveValue('windows');
  });

  test('check the options under Tokens section', async ({ downloadsPage }) => {
    // Reset to clean state
    await downloadsPage.filterByCategory('All categories');
    await downloadsPage.clickCollapseAll();

    await downloadsPage.filterByCategory('Tokens');
    await expect(downloadsPage.tokenSection().getByText('Tokens')).toBeVisible();
    await expect(
      downloadsPage.pullSecretSection().locator('td').filter({ hasText: 'Pull secret' }).first(),
    ).toBeVisible();
    await expect(downloadsPage.copyPullSecretButton()).toBeVisible();
    await expect(downloadsPage.downloadPullSecretButton()).toBeVisible();

    // Click download button
    await downloadsPage.downloadPullSecretButton().click();

    // Check if file was downloaded (this might need adjustment based on actual download behavior)
    // For now, we'll just check that the download button was clickable

    await downloadsPage.pullSecretSection().locator('button#expand-toggle0').click();
    await expect(
      downloadsPage.pullSecretSection().locator('a').filter({ hasText: 'create a cluster' }),
    ).toHaveAttribute('href', /\/openshift\/create/);
  });
});
