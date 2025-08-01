import InstallersPage from '../../pageobjects/Installers.page';
import installerData from '../../fixtures/installer/DatacenterInstaller.json';

describe('Datacenter Installer Subpage Component Tests', { tags: ['smoke'] }, () => {
  // Test a representative sample of pages instead of all 16
  const pagesToTest = [
    installerData.installerSubpages[0], // Bare Metal Agent-based (x86_64)
    installerData.installerSubpages[3], // ARM Bare Metal Agent-based (aarch64)
    installerData.installerSubpages[8], // IBM Z Agent-based (s390x)
    installerData.installerSubpages[10], // IBM Power Agent-based (ppc64le)
    installerData.installerSubpages[16], // vSphere Automated (common datacenter)
  ];

  before(() => {
    cy.log(
      `Testing ${pagesToTest.length} out of ${installerData.installerSubpages.length} datacenter pages to prevent memory issues`,
    );
  });

  pagesToTest.forEach((testData, index) => {
    describe(`Verification for: ${testData.name}`, () => {
      before(() => {
        if (index > 0) {
          // Clear memory between test suites
          cy.window().then((win) => {
            win.location.href = 'about:blank';
          });
          cy.wait(2000);
          cy.clearCookies();
          cy.clearLocalStorage();
        }
      });

      beforeEach(() => {
        cy.visit(testData.url);
        InstallersPage.verifyPageTitle(testData.expectedTitle);
      });

      it('should verify installer and OC CLI dropdowns exist', () => {
        InstallersPage.verifyInstallerDropdown(testData.installerType);
        InstallersPage.verifyOCDropdown();
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

          // Test only the first RHCOS download button to save memory
          const firstButton = testData.rhcosData.downloadButtons[0];
          InstallersPage.getRhcosDownloadButtonByText(firstButton.text)
            .scrollIntoView()
            .should('be.visible')
            .and('have.attr', 'href')
            .and('include', firstButton.hrefPartial);

          if (testData.rhcosData.downloadButtons.length > 1) {
            cy.log(
              `Verifying existence of ${testData.rhcosData.downloadButtons.length - 1} additional RHCOS buttons`,
            );
            testData.rhcosData.downloadButtons.slice(1).forEach((button) => {
              InstallersPage.getRhcosDownloadButtonByText(button.text).should('exist');
            });
          }
        });
      }
    });
  });

  describe('Detailed Dropdown Functionality Test - First Datacenter Page', () => {
    const firstDatacenterPage = installerData.installerSubpages[0];

    beforeEach(() => {
      cy.visit(firstDatacenterPage.url);
      cy.wait(2000);
    });

    it('should thoroughly verify all installer dropdown combinations', () => {
      InstallersPage.verifyInstallerDropdownThoroughly();
    });

    it('should thoroughly verify all OC CLI dropdown combinations', () => {
      InstallersPage.verifyOCDropdownThoroughly();
    });
  });
});
