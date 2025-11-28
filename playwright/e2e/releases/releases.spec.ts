import { test, expect } from '../../fixtures/pages';

type VersionData = {
  name: string;
  type: string;
};

let currentVersion: string;

test.describe.serial('Releases pages tests', { tag: ['@smoke'] }, () => {
  test('Check latest openshift release versions(OCP-41253)', async ({
    navigateTo,
    page,
    releasesPage,
  }) => {
    // Intercept the network request and navigate
    const [response] = await Promise.all([
      page.waitForResponse(
        (resp) =>
          resp.url().includes('/product-life-cycles/api/v1/products?name=Openshift') &&
          resp.request().method() === 'GET',
        { timeout: 30000 },
      ),
      navigateTo('/openshift/releases', { waitUntil: 'domcontentloaded' }),
    ]);

    await releasesPage.isReleasesPage();

    // Parse and filter versions
    const data = await response.json();
    const allVersions: VersionData[] = data.data[0].versions;
    const targetVersions = allVersions.slice(0, 6);
    currentVersion = targetVersions[0].name;

    // Check each version's details
    for (const { name: version, type: supportType } of targetVersions) {
      await releasesPage.checkIndividualReleaseVersionLink(version);
      await releasesPage.checkIndividualReleaseVersionSupportStatus(version, supportType);
      await releasesPage.checkIndividualReleaseVersionMoreInfo(version);
    }
  });

  test('Check all the links from release page(OCP-41253)', async ({ releasesPage }) => {
    expect(currentVersion, 'Current version should be set from previous test').toBeDefined();
    await releasesPage.checkLatestReleasePageLinks(currentVersion);
  });
});
