import GlobalNav from '../../pageobjects/GlobalNav.page';
import Downloads from '../../pageobjects/Downloads.page';

const ROSARowTitle = 'Manage your Red Hat OpenShift Service on AWS';
const OCRowTitle =
  'Create applications and manage OpenShift projects from the command line using the OpenShift client oc';
const HELM3RowTitle =
  'Define, install, and upgrade application packages as Helm charts using Helm 3';
const OSLocalTitle = 'Download and open the OpenShift Local';

describe('Downloads page', { tags: ['ci', 'smoke'] }, () => {
  before(() => {
    GlobalNav.downloadsNavigation().click();
    Downloads.isDownloadsPage();
  });

  after(() => {
    // cleanup the downloaded secrets at the end of execution.
    cy.exec(`rm -rf ${Cypress.config('downloadsFolder')}/pull-secret.txt`);
  });

  it('can expand and collapse rows', () => {
    Downloads.isHiddenRowContaining(ROSARowTitle);

    Downloads.clickExpandableRow('(rosa)');
    Downloads.isVisibleRowContaining(ROSARowTitle);

    Downloads.clickExpandableRow('(rosa)');
    Downloads.isHiddenRowContaining(ROSARowTitle);
  });

  it('expand/collapse affects only selected category', () => {
    Downloads.isHiddenRowContaining(ROSARowTitle);
    Downloads.isHiddenRowContaining(OCRowTitle);
    Downloads.isHiddenRowContaining(HELM3RowTitle);

    Downloads.filterByCategory('Command-line interface (CLI) tools');
    Downloads.clickExpandAll();
    Downloads.isVisibleRowContaining(ROSARowTitle);
    Downloads.isVisibleRowContaining(OCRowTitle);
    Downloads.rowDoesNotExist('expanded-row-helm3');

    Downloads.filterByCategory('All categories');
    Downloads.isVisibleRowContaining(ROSARowTitle);
    Downloads.isVisibleRowContaining(OCRowTitle);
    Downloads.isHiddenRowContaining(HELM3RowTitle);

    // Given mixed state, first click expands all.
    Downloads.clickExpandAll();
    Downloads.isVisibleRowContaining(ROSARowTitle);
    Downloads.isVisibleRowContaining(HELM3RowTitle);

    // Once all expanded, second click collapses all.
    Downloads.clickCollapseAll();
    Downloads.isHiddenRowContaining(ROSARowTitle);
    Downloads.isHiddenRowContaining(OCRowTitle);
    Downloads.isHiddenRowContaining(HELM3RowTitle);
  });

  it('selecting OS affects architecture options & href', () => {
    cy.getByTestId('os-dropdown-odo').select('Linux');

    Downloads.enabledDropdownOptions('arch-dropdown-odo', [
      'x86_64',
      'aarch64',
      'ppc64le',
      's390x',
    ]);

    cy.getByTestId('download-btn-odo')
      .invoke('attr', 'href')
      .should(
        'equal',
        'https://developers.redhat.com/content-gateway/rest/mirror/pub/openshift-v4/clients/odo/latest/odo-linux-amd64.tar.gz',
      );

    cy.getByTestId('arch-dropdown-odo').select('ppc64le');

    cy.getByTestId('download-btn-odo')
      .invoke('attr', 'href')
      .should(
        'equal',
        'https://developers.redhat.com/content-gateway/rest/mirror/pub/openshift-v4/clients/odo/latest/odo-linux-ppc64le.tar.gz',
      );

    // Only x86 available for Windows.
    cy.getByTestId('os-dropdown-odo').select('Windows');

    Downloads.enabledDropdownOptions('arch-dropdown-odo', ['x86_64']);

    cy.getByTestId('arch-dropdown-odo').should('be.disabled');

    Downloads.allDropdownOptions('arch-dropdown-odo', ['Select architecture', 'x86_64']);

    cy.getByTestId('download-btn-odo')
      .invoke('attr', 'href')
      .should(
        'equal',
        'https://developers.redhat.com/content-gateway/rest/mirror/pub/openshift-v4/clients/odo/latest/odo-windows-amd64.exe.zip',
      );
  });

  it('selecting a category preserves OS & architecture of invisible sections', () => {
    cy.getByTestId('os-dropdown-helm3').select('Linux');

    cy.getByTestId('arch-dropdown-helm3').select('s390x');

    // OpenShift Local
    cy.getByTestId('os-dropdown-crc').select('Windows');

    Downloads.filterByCategory('Tokens');

    Downloads.rowDoesNotExist('expanded-row-rosa');
    Downloads.rowDoesNotExist('expanded-row-helm3');
    Downloads.rowDoesNotExist('expanded-row-crc');

    Downloads.filterByCategory('All categories');
    Downloads.clickExpandAll();

    Downloads.isVisibleRowContaining(ROSARowTitle);
    Downloads.isVisibleRowContaining(HELM3RowTitle);
    Downloads.isVisibleRowContaining(OSLocalTitle);

    cy.getByTestId('os-dropdown-helm3').should('have.value', 'linux');
    cy.getByTestId('arch-dropdown-helm3').should('have.value', 's390x');
    // OpenShift Local
    cy.getByTestId('os-dropdown-crc').should('have.value', 'windows');
  });

  it('check the options under Tokens section', () => {
    Downloads.filterByCategory('Tokens');
    Downloads.tokenSection().contains('Tokens').should('be.visible');
    Downloads.pullSecretSection().contains('Pull secret').should('be.visible');
    Downloads.copyPullSecretButton().should('be.visible');
    Downloads.downloadPullSecretButton().should('be.visible').click();
    cy.readFile(`${Cypress.config('downloadsFolder')}/pull-secret.txt`).should('exist');
    Downloads.pullSecretSection().find('button#expand-toggle0').click();
    Downloads.pullSecretSection()
      .find('a')
      .should('have.attr', 'href')
      .and('include', '/openshift/create');
  });
});
