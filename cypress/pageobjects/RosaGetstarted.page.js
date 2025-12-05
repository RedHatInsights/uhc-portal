import Page from './page';

class RosaGetstarted extends Page {
  rosaPrerequisitesStep1Items = () => cy.getByTestId('substep1-rosa-prerequisites').find('li');

  rosaPrerequisitesStep2Items = () => cy.getByTestId('rosa-cli-definition').find('li');

  rosaPrerequisitesStep3Items = () => cy.getByTestId('create-vpc-networking-definition').find('li');

  rosaPrerequisitesStep1Section = () => cy.getByTestId('step1-rosa-prerequisites');

  rosaPrerequisitesStep11Content = () => cy.getByTestId('substep1_1-rosa-prerequisites');

  rosaPrerequisitesStep12Content = () => cy.getByTestId('substep1_2-rosa-prerequisites');

  rosaPrerequisitesStep2Section = () => cy.getByTestId('rosa-cli-header');

  rosaPrerequisitesStep21Content = () => cy.getByTestId('rosa-cli-sub-definition-1');

  rosaPrerequisitesStep22Content = () => cy.getByTestId('rosa-cli-sub-definition-2');

  rosaPrerequisitesStep31Content = () => cy.getByTestId('create-vpc-networking-definition-item1');

  rosaHpcCreateVpcLabel = () => cy.getByTestId('create-vpc-networking-hcp-label');

  rosaFedRampDoclink = () => cy.getByTestId('rosa-aws-fedramp');

  rosaClientDropdown = () => cy.getByTestId('os-dropdown-rosa');

  rosaClientButton = () => cy.getByTestId('download-btn-rosa');

  rosaFedRampRequestFormlink = () => cy.getByTestId('fedramp-access-request-form');

  deployWithCliCard = () => cy.getByTestId('deploy-with-cli-card');

  deployWithWebInterfaceCard = () => cy.getByTestId('deploy-with-webinterface-card');

  deployWithTerraformCard = () => cy.getByTestId('deploy-with-terraform-card');

  isRosaGetStartedPage() {
    cy.contains('h1', 'Set up Red Hat OpenShift Service on AWS (ROSA)', { timeout: 20000 })
      .should('be.exist')
      .should('be.visible');
  }
  isRosaFedRAMPInfoAlertShown() {
    cy.contains(
      'h2',
      'Red Hat OpenShift Service on AWS (ROSA) with hosted control planes in AWS GovCloud achieves FedRAMP High Authorization',
    )
      .should('be.exist')
      .should('be.visible');
  }

  isCompleteAWSPrerequisitesHeaderShown() {
    cy.contains('h2', 'Complete AWS prerequisites')
      .scrollIntoView()
      .should('be.exist')
      .should('be.visible');
  }

  isCompleteROSAPrerequisitesHeaderShown() {
    cy.contains('h2', 'Complete ROSA prerequisites')
      .scrollIntoView()
      .should('be.exist')
      .should('be.visible');
  }

  isDeployClusterAndSetupAccessHeaderShown() {
    cy.contains('h2', 'Deploy the cluster and set up access')
      .scrollIntoView()
      .should('be.exist')
      .should('be.visible');
  }

  waitForCommands() {
    cy.get('div[role="status"]', { timeout: 100000 }).should('not.exist');
  }

  checkAnchorProperties(object, anchorText, anchorLink, accessLink = true) {
    object.contains(anchorText).then((anchor) => {
      const href = anchor.prop('href');
      expect(href).to.eq(anchorLink);
      if (accessLink) {
        this.isLinkAccessSuccess(href);
      }
    });
  }

  isLinkAccessSuccess(link) {
    cy.request({
      url: link,
      followRedirect: true,
    }).then((resp) => {
      expect(resp.status).to.eq(200);
    });
  }
}

export default new RosaGetstarted();
