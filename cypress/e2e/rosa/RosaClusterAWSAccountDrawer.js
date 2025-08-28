import CreateRosaWizardPage from '../../pageobjects/CreateRosaWizard.page';

let clusterControlPlanes = ['Hosted', 'Classic'];

describe('Rosa cluster AWS account drawer check(OCP-48396)', { tags: ['smoke'] }, () => {
  beforeEach(() => {
    if (Cypress.currentTest.title.match(/Launch ROSA.*cluster wizard/g)) {
      cy.visit('/create');
    }
  });
  clusterControlPlanes.forEach((controlPlane) => {
    it(`Launch ROSA - ${controlPlane} cluster wizard`, () => {
      CreateRosaWizardPage.rosaCreateClusterButton().click();
      CreateRosaWizardPage.rosaClusterWithWeb().should('be.visible').click();
      CreateRosaWizardPage.isCreateRosaPage();
      cy.get('.spinner-loading-text').should('not.exist');
    });

    it(`Step - ROSA Control plane - Select control plane type - ${controlPlane}`, () => {
      CreateRosaWizardPage.isControlPlaneTypeScreen();
      if (controlPlane == 'Hosted') {
        CreateRosaWizardPage.selectHostedControlPlaneTypeOption();
      } else {
        CreateRosaWizardPage.selectStandaloneControlPlaneTypeOption();
      }
      CreateRosaWizardPage.rosaNextButton().click();
    });

    it(`Step - ROSA Accounts and roles - Check drawer - ${controlPlane}`, () => {
      CreateRosaWizardPage.isAccountsAndRolesScreen();
      CreateRosaWizardPage.isNotAssociateAccountsDrawer();
      CreateRosaWizardPage.howToAssociateNewAWSAccountButton().click();
      CreateRosaWizardPage.isAssociateAccountsDrawer();

      CreateRosaWizardPage.rosaAssociateDrawerFirstStepButton().should('exist');
      CreateRosaWizardPage.rosaAssociateDrawerSecondStepButton().should('exist');
      CreateRosaWizardPage.rosaAssociateDrawerThirdStepButton().should('exist');

      CreateRosaWizardPage.rosaAssociateDrawerFirstStepButton().should(
        'have.attr',
        'aria-expanded',
        'true',
      );

      CreateRosaWizardPage.howToAssociateNewAWSAccountDrawerCloseButton().click();
      CreateRosaWizardPage.isNotAssociateAccountsDrawer();
      CreateRosaWizardPage.howToAssociateNewAWSAccountButton().click();
      CreateRosaWizardPage.isAssociateAccountsDrawer();
      CreateRosaWizardPage.howToAssociateNewAWSAccountDrawerXButton().click();
      CreateRosaWizardPage.isNotAssociateAccountsDrawer();

      CreateRosaWizardPage.howToAssociateNewAWSAccountButton().click();
      CreateRosaWizardPage.isAssociateAccountsDrawer();

      CreateRosaWizardPage.rosaListOcmField()
        .find('input')
        .should('have.value', 'rosa list ocm-role');

      CreateRosaWizardPage.rosaCreateOcmTab()
        .find('button')
        .should('have.attr', 'aria-pressed', 'true');
      CreateRosaWizardPage.rosaLinkOcmTab()
        .find('button')
        .should('have.attr', 'aria-pressed', 'false');

      CreateRosaWizardPage.rosaLinkOcmTab().click();

      CreateRosaWizardPage.rosaCreateOcmTab()
        .find('button')
        .should('have.attr', 'aria-pressed', 'false');
      CreateRosaWizardPage.rosaLinkOcmTab()
        .find('button')
        .should('have.attr', 'aria-pressed', 'true');

      CreateRosaWizardPage.rosaCreateOcmTab().click();

      CreateRosaWizardPage.rosaCreateOcmField()
        .find('input')
        .should('have.value', 'rosa create ocm-role');

      CreateRosaWizardPage.rosaCreateOcmAdminField()
        .find('input')
        .should('have.value', 'rosa create ocm-role --admin');

      CreateRosaWizardPage.rosaHelpMeDecideButton().click();
      cy.get('div').contains('Operator roles and OpenID Connect (OIDC) provider');
      CreateRosaWizardPage.rosaHelpMeDecideButton().click();

      CreateRosaWizardPage.rosaLinkOcmTab().click();

      CreateRosaWizardPage.rosaLinkOcmField()
        .find('input')
        .should('have.value', 'rosa link ocm-role <arn>');

      CreateRosaWizardPage.rosaAssociateDrawerFirstStepButton().click();
      CreateRosaWizardPage.rosaAssociateDrawerSecondStepButton().click();

      CreateRosaWizardPage.rosaListUserField()
        .find('input')
        .should('have.value', 'rosa list user-role');

      CreateRosaWizardPage.rosaCreateUserTab()
        .find('button')
        .should('have.attr', 'aria-pressed', 'true');
      CreateRosaWizardPage.rosaLinkUserTab()
        .find('button')
        .should('have.attr', 'aria-pressed', 'false');

      CreateRosaWizardPage.rosaLinkUserTab().click();

      CreateRosaWizardPage.rosaCreateUserTab()
        .find('button')
        .should('have.attr', 'aria-pressed', 'false');
      CreateRosaWizardPage.rosaLinkUserTab()
        .find('button')
        .should('have.attr', 'aria-pressed', 'true');

      CreateRosaWizardPage.rosaCreateUserTab().click();

      CreateRosaWizardPage.rosaCreateUserField()
        .find('input')
        .should('have.value', 'rosa create user-role');

      CreateRosaWizardPage.rosaLinkUserTab().click();

      CreateRosaWizardPage.rosaLinkUserField()
        .find('input')
        .should('have.value', 'rosa link user-role <arn>');

      CreateRosaWizardPage.rosaAssociateDrawerSecondStepButton().click();
      CreateRosaWizardPage.rosaAssociateDrawerThirdStepButton().click();

      let mode = controlPlane == 'Hosted' ? '--hosted-cp ' : '';
      CreateRosaWizardPage.rosaCreateAccountRolesField()
        .find('input')
        .should('have.value', `rosa create account-roles ${mode}--mode auto`);

      cy.get('a')
        .contains('these instructions')
        .should(
          'have.attr',
          'href',
          'https://docs.aws.amazon.com/ROSA/latest/userguide/getting-started-sts-manual.html',
        );

      CreateRosaWizardPage.rosaAssociateDrawerThirdStepButton().click();
      CreateRosaWizardPage.howToAssociateNewAWSAccountDrawerCloseButton().click();
    });
  });
});
