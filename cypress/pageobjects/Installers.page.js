class Installers {
  // Getters using aria-labels
  getOSDropdown = () => cy.get('[aria-label="Select OS dropdown"]').first();
  getOCOSDropdown = () => cy.get('[aria-label="Select OS dropdown"]').eq(1);
  getArchDropdown = () => cy.get('[aria-label="Select architecture dropdown"]').first();
  getOCArchDropdown = () => cy.get('[aria-label="Select architecture dropdown"]').eq(1);

  // For elements without aria-labels, we still need specific selectors
  getDropdown = (testId) => cy.get(`[data-testid="${testId}"]`);
  getDownloadButton = (selector) => cy.get(selector);
  getPullSecretDownloadButton = () => cy.getByTestId('download-pull-secret');
  getPullSecretCopyButton = () => cy.getByTestId('copy-pull-secret-button');
  getCommandSnippetContainer = () => cy.getByTestId('copy-command');
  getCommandSnippetInput = () =>
    this.getCommandSnippetContainer().find('input[aria-label="Copyable input"]');
  getCommandSnippetCopyButton = () =>
    this.getCommandSnippetContainer().find('button[aria-label="Copy to clipboard"]');
  getPrereleaseLink = () => cy.get('a').contains('Download pre-release builds');
  getCustomizationsLink = () => cy.contains('a', 'install with customizations');
  getTelemetryLink = () => cy.contains('a', 'Learn more');
  getPageTitle = () => cy.get('h1');
  getRhcosSection = () => cy.contains('h3', 'Red Hat Enterprise Linux CoreOS (RHCOS)').parent();
  getRhcosLearnMoreLink = () => this.getRhcosSection().contains('a', 'Learn more');
  getRhcosDownloadButtonByText = (buttonText) => {
    return cy.getByTestId('download-btn-rhcos').contains(buttonText);
  };
  getGetStartedButton = () => cy.contains('a', 'Get started');

  clickCommandCopyButton = () => this.getCommandSnippetCopyButton().click();
  goBack = () => cy.go('back');
  selectDropdownOption = (testId, value) => this.getDropdown(testId).select(value);

  getEnabledOptions(testId) {
    return this.getDropdown(testId).find('option:not([disabled])');
  }

  getArchValues(archTestId) {
    return this.getDropdown(archTestId).then(($select) => {
      if ($select.is(':disabled')) {
        const onlyValue = $select.find('option:selected').text().trim();
        return [onlyValue];
      }
      return [...$select.find('option:not([disabled])')].map((opt) => opt.innerText.trim());
    });
  }

  verifyPageTitle(expectedTitle) {
    this.getPageTitle().should('contain', expectedTitle);
  }

  verifyDocumentationLink(linkElement, expectedPath, linkType = 'documentation', expectedVersion) {
    return linkElement.should('have.attr', 'href').then((href) => {
      expect(href, `${linkType} link should be absolute URL`).to.match(/^https:\/\//);

      const baseUrl = 'https://docs.redhat.com/en/documentation/openshift_container_platform/';
      expect(href, `${linkType} link should point to correct docs site`).to.include(baseUrl);

      if (expectedVersion) {
        expect(href, `${linkType} link should include version ${expectedVersion}`).to.include(
          `/${expectedVersion}/`,
        );
      } else {
        expect(href, `${linkType} link should include version`).to.match(/\/\d+\.\d+\//);
      }

      expect(href, `${linkType} link should include correct path`).to.include(expectedPath);
    });
  }

  verifyDropdownsExist() {
    this.getOSDropdown()
      .should('exist')
      .should('be.visible')
      .find('option')
      .should('have.length.at.least', 2);

    this.getArchDropdown()
      .should('exist')
      .then(($select) => {
        if (!$select.is(':disabled')) {
          cy.wrap($select).find('option').should('have.length.at.least', 1);
        }
      });
  }

  verifyDownloadButtonExists(installerType) {
    const downloadSelectors = {
      x86_64: '[data-testid="download-btn-x86_64-openshift-install"]',
      aarch64: '[data-testid="download-btn-aarch64-openshift-install"]',
      multi: '[data-testid="download-btn-multi-openshift-install"]',
      ppc64le: '[data-testid="download-btn-ppc64le-openshift-install"]',
      s390x: '[data-testid="download-btn-s390x-openshift-install"]',
    };

    const selector = downloadSelectors[installerType] || downloadSelectors['x86_64'];

    cy.get(selector)
      .should('exist')
      .should('be.visible')
      .should('have.attr', 'href')
      .and('match', /\.(tar\.gz|zip|exe)$/);
  }

  verifyDownloadForAllCombinations(artifactKey) {
    const osMap = {
      Linux: 'linux',
      MacOS: 'mac',
      macOS: 'mac',
      Windows: 'windows',
      'Linux - RHEL 9': 'rhel9',
      'RHEL 9 (FIPS)': 'rhel9',
      'Linux - RHEL 8': 'rhel8',
    };

    const archMap = {
      x86_64: 'amd64',
      aarch64: 'arm64',
    };

    const isOC = artifactKey === 'client';

    const getOSDropdown = () => (isOC ? this.getOCOSDropdown() : this.getOSDropdown());
    const getArchDropdown = () => (isOC ? this.getOCArchDropdown() : this.getArchDropdown());

    getOSDropdown()
      .find('option:not([disabled])')
      .then(($osOptions) => {
        const osValues = [...$osOptions].map((o) => o.innerText.trim());

        osValues.forEach((os) => {
          const osKey = osMap[os] || os.toLowerCase();

          // Get a fresh reference to the dropdown and select the option
          getOSDropdown().select(os);

          getArchDropdown().then(($archSelect) => {
            let archValues = [];
            if ($archSelect.is(':disabled')) {
              const archValue = $archSelect.find('option:selected').text().trim();
              archValues = [archValue];
            } else {
              archValues = [...$archSelect.find('option:not([disabled])')].map((opt) =>
                opt.innerText.trim(),
              );
            }

            archValues.forEach((arch) => {
              const rawArch = arch.toLowerCase();
              const mappedArch = archMap[arch] || rawArch;

              // Select arch if dropdown is enabled - use fresh reference
              if (!$archSelect.is(':disabled')) {
                getArchDropdown().select(arch);
              }

              // Get the appropriate download button based on artifact type
              const downloadButton =
                artifactKey === 'client'
                  ? cy.get('[data-testid="download-btn-oc"]')
                  : cy
                      .get('[data-testid*="download-btn-"][data-testid*="-openshift-install"]')
                      .first();

              // Check the href
              downloadButton.should('have.attr', 'href').then((href) => {
                const h = href.toLowerCase();

                // OS folder check
                expect(h.includes(osKey), `expected OS segment "${osKey}" in ${href}`).to.be.true;

                // Artifact + architecture checks
                if (osKey === 'mac') {
                  // Build the mac filename base
                  const base = `openshift-${artifactKey}-mac`;

                  if (rawArch === 'x86_64') {
                    // universal mac: no suffix
                    expect(
                      h.match(new RegExp(`${base}\\.tar\\.gz$`)),
                      `expected universal ${artifactKey} URL for mac x86_64, got ${href}`,
                    ).to.not.be.null;
                  } else if (rawArch === 'aarch64') {
                    // arm64-only: -arm64 suffix
                    expect(
                      h.match(new RegExp(`${base}-arm64\\.tar\\.gz$`)),
                      `expected ARM-only ${artifactKey} URL for mac aarch64, got ${href}`,
                    ).to.not.be.null;
                  } else {
                    throw new Error(`Unexpected mac arch "${arch}"`);
                  }
                } else {
                  // Other OS must include either rawArch or mappedArch
                  const archOk = h.includes(rawArch) || h.includes(mappedArch);
                  expect(archOk, `expected arch "${rawArch}" or "${mappedArch}" in ${href}`).to.be
                    .true;
                }
              });
            });
          });
        });
      });
  }

  verifyInstallerDropdown(installerType) {
    this.verifyDropdownsExist();
    this.verifyDownloadButtonExists(installerType);
  }

  verifyOCDropdown() {
    cy.get('[data-testid="download-btn-oc"]')
      .should('exist')
      .scrollIntoView()
      .should('be.visible')
      .should('have.attr', 'href')
      .and('include', 'client');
  }

  verifyInstallerDropdownThoroughly() {
    this.verifyDownloadForAllCombinations('install');
  }

  verifyOCDropdownThoroughly() {
    this.verifyDownloadForAllCombinations('client');
  }

  // Helper methods for testing
  selectInstallerOS(osName) {
    this.getOSDropdown().then(($select) => {
      const options = [...$select.find('option')].map((opt) => ({
        text: opt.text,
        value: opt.value,
      }));

      const matchingOption = options.find(
        (opt) =>
          opt.text.toLowerCase().includes(osName.toLowerCase()) ||
          opt.value.toLowerCase().includes(osName.toLowerCase()),
      );

      if (matchingOption) {
        cy.wrap($select).select(matchingOption.value);
      } else {
        cy.log(
          `Could not find "${osName}". Available options: ${options.map((o) => o.text).join(', ')}`,
        );
        throw new Error(`Option "${osName}" not found in dropdown`);
      }
    });
  }

  selectOCOS(osName) {
    this.getOCOSDropdown().then(($select) => {
      const options = [...$select.find('option')].map((opt) => ({
        text: opt.text,
        value: opt.value,
      }));

      const matchingOption = options.find(
        (opt) =>
          opt.text.toLowerCase().includes(osName.toLowerCase()) ||
          opt.value.toLowerCase().includes(osName.toLowerCase()),
      );

      if (matchingOption) {
        cy.wrap($select).select(matchingOption.value);
      } else {
        cy.log(
          `Could not find "${osName}". Available options: ${options.map((o) => o.text).join(', ')}`,
        );
        throw new Error(`Option "${osName}" not found in dropdown`);
      }
    });
  }

  verifyInstallerDownloadContains(text) {
    cy.get('[data-testid="download-btn-x86_64-openshift-install"]')
      .should('have.attr', 'href')
      .and('include', text);
  }

  verifyOCDownloadContains(text) {
    cy.get('[data-testid="download-btn-oc"]').should('have.attr', 'href').and('include', text);
  }

  checkIfOSOptionExists(osName) {
    return this.getOSDropdown().then(($select) => {
      const options = [...$select.find('option')].map((o) => o.value);
      return options.some((o) => o.toLowerCase().includes(osName.toLowerCase()));
    });
  }

  logAvailableOSOptions() {
    this.getOSDropdown().then(($select) => {
      const options = [...$select.find('option')].map((opt) => opt.text);
      cy.log('Available OS options:', options.join(', '));
      return options;
    });
  }
}

export default new Installers();
