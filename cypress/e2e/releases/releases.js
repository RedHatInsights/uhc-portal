import Releases from '../../pageobjects/Releases.page';
import Docs from '../../pageobjects/Docs.page';
import { CLUSTER_LIST_FULL_PATH } from '../../support/routePaths';

var current_version;
describe('Releases pages tests', () => {
  it('Check latest openshift release versions(OCP-41253)', { tags: ['smoke'] }, () => {
    cy.intercept('/product-life-cycles/api/v1/products?name=Openshift*').as('getProductsLifecycle');
    cy.visit('/releases', { retryOnNetworkFailure: true });
    Releases.isReleasesPage();
    cy.wait('@getProductsLifecycle').then((intercept) => {
      const { response } = intercept;
      const all_versions = response.body.data[0].versions;
      const first_six_versions = all_versions.slice(0, 6);
      const mapped_first_fix_versions = first_six_versions.map((item) => {
        if (item.type === 'Full Support') {
          item.type = 'Full support';
          return item;
        } else if (item.type === 'Maintenance Support') {
          item.type = 'Maintenance support';
          return item;
        } else {
          return item;
        }
      });
      current_version = mapped_first_fix_versions[0].name;
      cy.log(`mapped list are ${mapped_first_fix_versions}`);
      cy.wrap(mapped_first_fix_versions).each((item) => {
        Releases.checkChannelDetailAndSupportStatus(item.name, item.type);
      });
    });
  });
  it('Check all the links from release page(OCP-41253)', { tags: ['smoke'] }, () => {
    Docs.getcontainerPlatformDocAbsolutePath(
      current_version,
      'html/updating_clusters/understanding-openshift-updates-1#understanding-update-channels-releases',
    )
      .should('exist')
      .and('contain.text', 'Learn more about updating channels');
    cy.get('button')
      .contains("I don't see these versions as upgrade options for my cluster")
      .click();
    cy.get(`a[href="${CLUSTER_LIST_FULL_PATH}"]`)
      .should('exist')
      .and('contain.text', 'clusters list');
    cy.get('button[aria-label="Close"]').filter(':visible').click();
  });
});
