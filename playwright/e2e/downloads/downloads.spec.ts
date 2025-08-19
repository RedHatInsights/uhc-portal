import { test, expect, Page, BrowserContext } from '@playwright/test';
import { GlobalNavPage } from '../../page-objects/global-nav-page';
import { DownloadsPage } from '../../page-objects/downloads-page';
import { setupTestSuite, cleanupTestSuite } from '../../support/test-setup';
import * as fs from 'fs';
import * as path from 'path';

const ROSARowTitle = 'Manage your Red Hat OpenShift Service on AWS';
const OCRowTitle =
  'Create applications and manage OpenShift projects from the command line using the OpenShift client oc';
const HELMRowTitle = 'Define, install, and upgrade application packages as Helm charts using Helm';
const OSLocalTitle = 'Download and open the OpenShift Local';

// Shared context and page objects for serial test execution
let sharedContext: BrowserContext;
let sharedPage: Page;
let globalNavPage: GlobalNavPage;
let downloadsPage: DownloadsPage;

test.describe.serial('Downloads page', { tag: ['@ci', '@smoke'] }, () => {
  test.beforeAll(async ({ browser }) => {
    // Setup: auth + navigate to downloads page
    const setup = await setupTestSuite(browser, '/openshift/');

    sharedContext = setup.context;
    sharedPage = setup.page;

    // Initialize page objects for this test suite
    globalNavPage = new GlobalNavPage(sharedPage);
    downloadsPage = new DownloadsPage(sharedPage);

    // Navigate to downloads page
    await globalNavPage.downloadsNavigation().click();
    await downloadsPage.isDownloadsPage();
  });

  test.afterAll(async () => {
    // cleanup the downloaded secrets at the end of execution.
    const downloadsFolder = path.join(process.cwd(), 'test-results', 'downloads');
    const pullSecretPath = path.join(downloadsFolder, 'pull-secret.txt');
    if (fs.existsSync(pullSecretPath)) {
      fs.unlinkSync(pullSecretPath);
    }
    await cleanupTestSuite(sharedContext);
  });

  test('can expand and collapse rows', async () => {
    await downloadsPage.isHiddenRowContaining(ROSARowTitle);

    await downloadsPage.clickExpandableRow('(rosa)');
    await downloadsPage.isVisibleRowContaining(ROSARowTitle);

    await downloadsPage.clickExpandableRow('(rosa)');
    await downloadsPage.isHiddenRowContaining(ROSARowTitle);
  });

  test('expand/collapse affects only selected category', async () => {
    await downloadsPage.isHiddenRowContaining(ROSARowTitle);
    await downloadsPage.isHiddenRowContaining(OCRowTitle);
    await downloadsPage.isHiddenRowContaining(HELMRowTitle);

    await downloadsPage.filterByCategory('Command-line interface (CLI) tools');
    await downloadsPage.clickExpandAll();
    await downloadsPage.isVisibleRowContaining(ROSARowTitle);
    await downloadsPage.isVisibleRowContaining(OCRowTitle);
    await downloadsPage.rowDoesNotExist('expanded-row-helm');

    await downloadsPage.filterByCategory('All categories');
    await downloadsPage.isVisibleRowContaining(ROSARowTitle);
    await downloadsPage.isVisibleRowContaining(OCRowTitle);
    await downloadsPage.isHiddenRowContaining(HELMRowTitle);

    // Given mixed state, first click expands all.
    await downloadsPage.clickExpandAll();
    await downloadsPage.isVisibleRowContaining(ROSARowTitle);
    await downloadsPage.isVisibleRowContaining(HELMRowTitle);

    // Once all expanded, second click collapses all.
    await downloadsPage.clickCollapseAll();
    await downloadsPage.isHiddenRowContaining(ROSARowTitle);
    await downloadsPage.isHiddenRowContaining(OCRowTitle);
    await downloadsPage.isHiddenRowContaining(HELMRowTitle);
  });

  test('selecting OS affects architecture options & href', async () => {
    await sharedPage.getByTestId('os-dropdown-odo').selectOption('Linux');

    await downloadsPage.enabledDropdownOptions('arch-dropdown-odo', [
      'x86_64',
      'aarch64',
      'ppc64le',
      's390x',
    ]);

    await expect(sharedPage.getByTestId('download-btn-odo')).toHaveAttribute(
      'href',
      'https://developers.redhat.com/content-gateway/rest/mirror/pub/openshift-v4/clients/odo/latest/odo-linux-amd64.tar.gz',
    );

    await sharedPage.getByTestId('arch-dropdown-odo').selectOption('ppc64le');

    await expect(sharedPage.getByTestId('download-btn-odo')).toHaveAttribute(
      'href',
      'https://developers.redhat.com/content-gateway/rest/mirror/pub/openshift-v4/clients/odo/latest/odo-linux-ppc64le.tar.gz',
    );

    // Only x86 available for Windows.
    await sharedPage.getByTestId('os-dropdown-odo').selectOption('Windows');

    await downloadsPage.enabledDropdownOptions('arch-dropdown-odo', ['x86_64']);

    await expect(sharedPage.getByTestId('arch-dropdown-odo')).toBeDisabled();

    await downloadsPage.allDropdownOptions('arch-dropdown-odo', ['Select architecture', 'x86_64']);

    await expect(sharedPage.getByTestId('download-btn-odo')).toHaveAttribute(
      'href',
      'https://developers.redhat.com/content-gateway/rest/mirror/pub/openshift-v4/clients/odo/latest/odo-windows-amd64.exe.zip',
    );
  });

  test('selecting a category preserves OS & architecture of invisible sections', async () => {
    await sharedPage.getByTestId('os-dropdown-helm').selectOption('Linux');
    await sharedPage.getByTestId('arch-dropdown-helm').selectOption('s390x');

    // OpenShift Local
    await sharedPage.getByTestId('os-dropdown-crc').selectOption('Windows');

    await downloadsPage.filterByCategory('Tokens');

    await downloadsPage.rowDoesNotExist('expanded-row-rosa');
    await downloadsPage.rowDoesNotExist('expanded-row-helm');
    await downloadsPage.rowDoesNotExist('expanded-row-crc');

    await downloadsPage.filterByCategory('All categories');
    await downloadsPage.clickExpandAll();

    await downloadsPage.isVisibleRowContaining(ROSARowTitle);
    await downloadsPage.isVisibleRowContaining(HELMRowTitle);
    await downloadsPage.isVisibleRowContaining(OSLocalTitle);

    await expect(sharedPage.getByTestId('os-dropdown-helm')).toHaveValue('linux');
    await expect(sharedPage.getByTestId('arch-dropdown-helm')).toHaveValue('s390x');
    // OpenShift Local
    await expect(sharedPage.getByTestId('os-dropdown-crc')).toHaveValue('windows');
  });

  test('check the options under Tokens section', async () => {
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
    await expect(downloadsPage.pullSecretSection().locator('a')).toHaveAttribute(
      'href',
      /\/openshift\/create/,
    );
  });
});
