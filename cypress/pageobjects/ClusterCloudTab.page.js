import Page from './page';
import LinkHelper from './LinkHelper';
import ButtonHelper from './ButtonHelper';

class ClusterCloudTab extends Page {
  managedServices = () => {
    cy.getByTestId('managed-service-table').as('managed-services');
    return {
      btnShouldExist: function (btnText, link) {
        return new ButtonHelper(
          { name: 'managed-services', isParent: true },
          btnText,
          link,
        ).btnExists();
      },

      checkLink: function (title, link) {
        return new LinkHelper(
          { name: 'managed-services', isParent: false },
          title,
          link,
        ).linkExists();
      },
    };
  };

  runItYourself = () => {
    cy.getByTestId('run-it-yourself').as('run-it-yourself');
    return {
      btnShouldExist: function (btnText, link) {
        return new ButtonHelper(
          { name: 'run-it-yourself', isParent: true },
          btnText,
          link,
        ).btnExists();
      },

      checkLink: function (title, link) {
        return new LinkHelper(
          { name: 'run-it-yourself', isParent: false },
          title,
          link,
        ).linkExists();
      },
    };
  };

  leaveClusterCreationPage = () => {
    cy.go('back');
    cy.getByTestId('leave-cluster-prompt-button').click();
  };

  isCloudTabPage = () => {
    cy.url().should('include', '/openshift/create/cloud');
    cy.title().should('eq', 'Create an OpenShift cluster | Red Hat OpenShift Cluster Manager');
  };

  clickBackButton = () => cy.go('back');

  createOSDTrialButton = () => cy.getByTestId('osd-create-trial-cluster');
  createOSDButton = () => cy.getByTestId('osd-create-cluster-button');
  createRosaButton = () => cy.getByTestId('rosa-create-cluster-button');

  rosaClusterWithWeb = () => cy.get('a').contains('With web interface');

  isCreateRosaPage() {
    super.assertUrlIncludes('/openshift/create/rosa/wizard');
  }

  expandToggle(selector) {
    cy.get(selector).scrollIntoView().should('be.visible').click();
  }

  isTextVisible(text) {
    cy.contains(text).should('be.visible');
    return this;
  }

  isCreateOSDTrialPage = () => cy.url().should('include', 'openshift/create/osdtrial?trial=osd');
  isCreateOSDPage = () => cy.url().should('include', '/openshift/create/osd');

  isQuotaPage() {
    super.assertUrlIncludes('/openshift/quota');
  }
}

export default new ClusterCloudTab();
