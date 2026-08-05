import { expect, test } from '../../fixtures/pages';

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
    // Intercept the network request and navigate (v1 when OCP5_SUPPORT is off, v2 when on)
    const [response] = await Promise.all([
      page.waitForResponse(
        (resp) => {
          const url = resp.url();
          const isLifeCycleApi =
            url.includes('/product-life-cycles/api/v1/products?name=Openshift') ||
            url.includes(
              '/product-life-cycles/api/v2/products?name=Red+Hat+OpenShift+Container+Platform',
            );
          return isLifeCycleApi && resp.request().method() === 'GET';
        },
        { timeout: 30000 },
      ),
      navigateTo('/openshift/releases', { waitUntil: 'domcontentloaded' }),
    ]);

    await releasesPage.isReleasesPage();

    // Parse and filter versions - match component logic (exclude EOL and EUS rows)
    const data = await response.json();
    const allVersions: VersionData[] = data.data[0].versions;
    const targetVersions = allVersions.filter(
      (version) =>
        version.type?.toLowerCase() !== 'end of life' && !version.name.includes('EUS'),
    );
    expect(targetVersions.length, 'Expected at least one non-EOL version').toBeGreaterThan(0);
    currentVersion = targetVersions[0].name;

    // Check each version's details sequentially
    await targetVersions.reduce(async (previous, { name: version, type: supportType }) => {
      await previous;
      await releasesPage.checkIndividualReleaseVersionLink(version);
      await releasesPage.checkIndividualReleaseVersionSupportStatus(version, supportType);
      await releasesPage.checkIndividualReleaseVersionMoreInfo(version);
    }, Promise.resolve());
  });

  test('Check all the links from release page(OCP-41253)', async ({ releasesPage }) => {
    expect(currentVersion, 'Current version should be set from previous test').toBeDefined();
    await releasesPage.checkLatestReleasePageLinks(currentVersion);
  });
});
