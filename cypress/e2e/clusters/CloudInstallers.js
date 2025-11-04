import InstallersPage from '../../pageobjects/Installers.page';
import installerData from '../../fixtures/installer/CloudInstaller.json';
import { getCurrentOpenshiftVersion } from '../../support/versionUtils';

describe('Installer Subpage Component Tests', { tags: ['smoke'] }, () => {
  let currentVersion;
  before(() => {
    getCurrentOpenshiftVersion().then((version) => {
      currentVersion = version;
    });
  });

  installerData.installerSubpages.forEach((testData, index) => {
    describe(`Verification for: ${testData.name}`, () => {
      // before(() => {
      //   if (index > 0) {
      //     // Clear memory between test suites
      //     cy.window().then((win) => {
      //       win.location.href = 'about:blank';
      //     });
      //     cy.clearCookies();
      //     cy.clearLocalStorage();
      //   }
      before(() => {
        cy.visit(testData.url);
        InstallersPage.verifyPageTitle(testData.expectedTitle);
      });

      it('should verify installer and OC CLI dropdowns exist and work', () => {
        InstallersPage.verifyInstallerDropdownThoroughly();
        InstallersPage.verifyOCDropdownThoroughly();
      });

      it('should verify pull secret buttons are visible', () => {
        InstallersPage.getPullSecretCopyButton().scrollIntoView().should('be.visible');
        InstallersPage.getPullSecretDownloadButton().scrollIntoView().should('be.visible');
      });

      if (testData.hasCommandSnippet) {
        it('should verify the command snippet and related links', () => {
          cy.on('uncaught:exception', (err) => {
            if (err.message.includes('Clipboard write was blocked')) {
              return false;
            }
          });

          cy.window().then((win) => {
            cy.stub(win.navigator.clipboard, 'writeText').as('clipboardStub');
          });

          InstallersPage.getCommandSnippetInput().should('have.value', testData.commandText);
          InstallersPage.clickCommandCopyButton();
          cy.get('@clipboardStub').should('be.calledOnceWith', testData.commandText);

          if (testData.customizeLink) {
            InstallersPage.getCustomizationsLink()
              .should('have.attr', 'href')
              .and('include', testData.customizeLink);
          }

          if (testData.telemetryLink) {
            InstallersPage.getTelemetryLink()
              .should('have.attr', 'href')
              .and('include', testData.telemetryLink);
          }
        });
      }

      if (testData.hasPreReleaseLink) {
        it('should verify the pre-release builds link', () => {
          InstallersPage.getPrereleaseLink()
            .scrollIntoView()
            .should('be.visible')
            .and('have.attr', 'href')
            .and('include', '/openshift/install/')
            .and('include', '/pre-release');
        });
      }

      if (testData.getStartedLink) {
        it('should have a valid "Get started" button with correct link', () => {
          InstallersPage.getGetStartedButton().scrollIntoView().should('be.visible');

          InstallersPage.verifyDocumentationLink(
            InstallersPage.getGetStartedButton(),
            testData.getStartedLink,
            'documentation',
            currentVersion,
          );
        });
      }

      if (testData.rhcosData) {
        it('should verify the RHCOS section elements and download links', () => {
          InstallersPage.getRhcosLearnMoreLink()
            .scrollIntoView()
            .should('be.visible')
            .and('have.attr', 'href')
            .and('include', testData.rhcosData.learnMoreLinkPartial);

          testData.rhcosData.downloadButtons.forEach((button) => {
            InstallersPage.getRhcosDownloadButtonByText(button.text)
              .scrollIntoView()
              .should('be.visible')
              .and('have.attr', 'href')
              .and('include', button.hrefPartial);
          });
        });
      }
    });
  });
});
