import Page from './page';

class ClusterTypes extends Page {
  isClusterTypesUrl() {
    super.assertUrlIncludes('/install');
  }

  clickCloudProvider(provider, techPreview) {
    if (techPreview == true)
      () => {
        cy.get("[data-label='Cloud provider']")
          .contains('span', 'Technology Preview')
          .should('be.visible');
      };
    cy.get("[data-label='Cloud provider']").contains(provider).scrollIntoView().click();
  }

  clickDatacenter() {
    cy.get('button').contains('Datacenter').click();
  }

  clickInfrastructureProvider(provider) {
    cy.get('a').contains(provider).click({ force: true });
  }

  isClusterTypesScreen() {
    cy.contains('h1', 'Select an OpenShift cluster type to create');
  }

  isClusterTypesUrl(URL) {
    cy.url().should('include', URL);
  }

  isClusterTypesHeader(header) {
    cy.get('h1')
      .contains('Create an OpenShift Cluster: ' + header)
      .should('be.visible');
  }

  isAutomated(clusterType, clusterHeader, clusterArch, recommended) {
    if (clusterArch.length > 0) clusterArch = clusterArch + ' ';
    cy.get('#select-automated').within(() => {
      cy.get('h2:contains(Automated)').scrollIntoView().should('be.visible');
      if (recommended == true)
        () => {
          cy.get('span:contains(Recommended)').should('be.visible');
        };
      cy.get('span:contains(CLI-based)').should('be.visible');
      cy.get('a:contains(Learn more about automated)')
        .scrollIntoView()
        .should('be.visible')
        .should('have.attr', 'href')
        .and('contain', '/installing')
        .and('contain', clusterType);
    });
    cy.get('button:contains(Automated)').click();
    cy.get('h1')
      .contains(
        'Install OpenShift on ' +
          clusterHeader +
          ' with installer-provisioned ' +
          clusterArch +
          'infrastructure',
        { matchCase: false },
      )
      .should('be.visible');
    cy.url().should('contain', 'installer-provisioned');
    cy.go('back');
  }

  isFullControl(clusterType, clusterHeader, clusterArch, nonTested, recommended) {
    if (clusterArch.length > 0) clusterArch = clusterArch + ' ';
    cy.get('#select-full-control').within(() => {
      cy.get('h2:contains(Full control)').scrollIntoView().should('be.visible');
      if (recommended == true)
        () => {
          cy.get('span:contains(Recommended)').should('be.visible');
        };
      cy.get('span:contains(CLI-based)').should('be.visible');
      if (nonTested == true)
        () => {
          cy.get('a:contains(non-tested platforms)')
            .scrollIntoView()
            .should('be.visible')
            .should('have.attr', 'href')
            .and('contain', 'https://access.redhat.com/articles/4207611');
        };
      cy.get('a:contains(Learn more about full control)')
        .scrollIntoView()
        .should('be.visible')
        .should('have.attr', 'href')
        .and('contain', '/installing')
        .and('contain', clusterType);
    });
    cy.get('button:contains(Full control)').click();
    cy.get('h1')
      .contains(
        'Install OpenShift on ' +
          clusterHeader +
          ' with user-provisioned ' +
          clusterArch +
          'infrastructure',
        { matchCase: false },
      )
      .should('be.visible');
    cy.url().should('contain', 'user-provisioned');
    cy.go('back');
  }

  isInteractive(nonTested, recommended) {
    cy.get('#select-interactive').within(() => {
      cy.get('h2:contains(Interactive)').scrollIntoView().should('be.visible');
      if (recommended == true)
        () => {
          cy.get('span:contains(Recommended)').should('be.visible');
        };
      cy.get('span:contains(Web-based)').should('be.visible');
      if (nonTested == true)
        () => {
          cy.get('a:contains(non-tested platforms)')
            .scrollIntoView()
            .should('be.visible')
            .should('have.attr', 'href')
            .and('contain', 'https://access.redhat.com/articles/4207611');
        };
      cy.get('a:contains(Learn more about interactive)')
        .scrollIntoView()
        .should('be.visible')
        .should('have.attr', 'href')
        .and('contain', 'installing-on-prem-assisted');
    });
    cy.get('button:contains(Interactive)').scrollIntoView().click();
    cy.get('h1').contains('Install OpenShift with the Assisted Installer');
    cy.go('back');
  }

  isLocalAgentBased(clusterHeader, clusterArch, nonTested, recommended) {
    cy.get('#select-agent-based').within(() => {
      cy.get('h2:contains("Local Agent-based")').scrollIntoView().should('be.visible');
      if (recommended == true)
        () => {
          cy.get('span:contains(Recommended)').should('be.visible');
        };
      cy.get('span:contains(CLI-based)').should('be.visible');
      if (nonTested == true)
        () => {
          cy.get('a:contains(non-tested platforms)')
            .scrollIntoView()
            .should('be.visible')
            .should('have.attr', 'href')
            .and('contain', 'https://access.redhat.com/articles/4207611');
        };
      cy.get('a:contains(Learn more about local agent-based)')
        .scrollIntoView()
        .should('be.visible')
        .should('have.attr', 'href')
        .and('contain', 'preparing-to-install-with-agent-based-installer');
    });
    cy.get('button:contains(Local Agent-based)').click();
    cy.get('h1')
      .contains(
        'Install OpenShift on ' + clusterHeader + ' locally ' + clusterArch + 'with Agent',
        {
          matchCase: false,
        },
      )
      .should('be.visible');
    cy.go('back');
  }
}
export default new ClusterTypes();
