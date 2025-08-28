import Page from './page';
import Docs from './Docs.page';

class Releases extends Page {
  isReleasesPage() {
    cy.contains('Latest OpenShift releases', { timeout: 60000 }).should('be.visible');
    cy.contains('Channels', { timeout: 60000 }).should('be.visible');
  }

  checkChannelDetailAndSupportStatus = (version, support_type) => {
    const major_version = version.split('.')[0];
    const minor_version = version.split('.')[1];
    cy.get(
      `.ocm-l-ocp-releases__channel-detail-level a[href^="https://docs.redhat.com/en/documentation/openshift_container_platform/${version}/html/release_notes/ocp-${major_version}-${minor_version}-release-notes"]`,
    )
      .first()
      .as('link_to_version')
      .should('exist');
    cy.get('@link_to_version')
      .parent()
      .next()
      .within(() => {
        cy.contains(`${support_type}`).should('exist');
      });
    cy.get('@link_to_version')
      .parentsUntil('.pf-v6-c-card__body', 'dl')
      .within(() => {
        cy.get('button[aria-label="More information"]').scrollIntoView().click({ force: true });
      });

    let relativePath =
      minor_version >= 14
        ? 'understanding-openshift-updates-1#understanding-update-channels-releases'
        : 'understanding-upgrade-channels-releases#candidate-version-channel_understanding-upgrade-channels-releases';
    Docs.getcontainerPlatformDocAbsolutePath(version, 'html/updating_clusters/' + relativePath)
      .should('exist')
      .and('contain.text', 'Learn more about candidate channels');
    cy.get('button[aria-label="Close"]').filter(':visible').click();
  };
}

export default new Releases();
