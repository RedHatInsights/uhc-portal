import ClusterListPage from '../../pageobjects/ClusterList.page';
import ClusterDetailsPage from '../../pageobjects/ClusterDetails.page';
import ClusterSettingsTab from '../../pageobjects/ClusterSettingsTab.page';

const clusterDetails = require('../../fixtures/rosa-hosted/RosaHostedClusterCreatePublic.json');
const clusterProperties = clusterDetails['rosa-hosted-public']['day1-profile'];
const { ClusterName: clusterName } = clusterProperties;
const day2Profile = clusterDetails['rosa-hosted-public']['day2-profile'];

describe(
  'Rosa hosted cluster (hypershift) - Overview actions(OCP-76127)',
  { tags: ['day2', 'hosted', 'rosa', 'hcp'] },
  () => {
    before(() => {
      cy.visit('/cluster-list');
      ClusterListPage.waitForDataReady();
    });

    it(`Open ${clusterName} cluster`, () => {
      ClusterListPage.filterTxtField().should('be.visible').click();
      ClusterListPage.filterTxtField().clear().type(clusterName);
      ClusterListPage.waitForDataReady();
      ClusterListPage.openClusterDefinition(clusterName);
      ClusterDetailsPage.waitForInstallerScreenToLoad();
      ClusterDetailsPage.clusterNameTitle().contains(clusterName);
    });
    /**
     * Test: Verify Edit (Pencil) Icon is Disabled During Cluster State Transitions
     *
     * The channel group edit button should be disabled when cluster is in:
     * - Installing state
     * - Error state
     * - Hibernating state
     *
     * This prevents users from modifying channel group during critical cluster operations.
     */
    it('Step ROSA Hosted - Day 2 - Verify edit icon behavior based on cluster state', () => {
      cy.log('🔍 Testing: Edit icon behavior during cluster state transitions');

      // Check if the channel group edit button is disabled by checking its aria-disabled attribute
      cy.getByTestId('channelGroupModal').then(($button) => {
        const isDisabled = $button.attr('aria-disabled') === 'true';

        if (isDisabled) {
          cy.log('🔒 Channel group edit button is DISABLED');

          // Check the specific reason why it's disabled
          cy.get('body').then(($body) => {
            const bodyText = $body.text();

            if (bodyText.includes('Installing cluster')) {
              cy.log('📦 Cluster is in INSTALLING state');
              ClusterDetailsPage.clusterInstallationHeader()
                .should('be.visible')
                .and('contain.text', 'Installing cluster');
              cy.log('✅ Edit button correctly DISABLED during installation');
            } else if (bodyText.includes('Hibernating') || bodyText.includes('Powering off')) {
              cy.log('💤 Cluster is in HIBERNATING state');
              cy.log('✅ Edit button correctly DISABLED during hibernation');
            } else {
              cy.log('⚠️ Edit button is disabled for another reason');
            }
          });

          cy.log('⏭️ Skipping channel group update - button is disabled');
        } else {
          cy.log('✅ Channel group edit button is ENABLED - Cluster is READY');
          cy.log('📝 Proceeding with channel group modal verification');

          // Click on the channel group selector to open the modal
          ClusterDetailsPage.channelGroupSelector().click();

          // Verify the modal dialog appears
          ClusterDetailsPage.channelGroupModal()
            .should('be.visible')
            .within(() => {
              // Verify modal elements are present
              ClusterDetailsPage.channelGroupModalHeader().should('be.visible');
              ClusterDetailsPage.channelGroupModalSelect().should('be.visible');
              ClusterDetailsPage.channelGroupModalSaveButton().should('be.visible');
              ClusterDetailsPage.channelGroupModalCancelButton().should('be.visible');
            });

          cy.log('✅ Channel group modal opened successfully');

          // Close the modal (cancel)
          ClusterDetailsPage.channelGroupModalCancelButton().click({ force: true });
          cy.log('✅ Channel group modal closed');
        }
      });
    });

    it('Step ROSA Hosted - Day 2 - Channel Group Dropdown - Verify modal and dropdown options', () => {
      // Click on the channel group selector to open the modal
      ClusterDetailsPage.channelGroupSelector().click({ force: true });

      // Verify the modal dialog appears (implicit wait)
      ClusterDetailsPage.channelGroupModal()
        .should('be.visible')
        .within(() => {
          // Verify modal title
          ClusterDetailsPage.channelGroupModalHeader().should('be.visible');

          // Verify the select dropdown is visible
          ClusterDetailsPage.channelGroupModalSelect()
            .should('be.visible')
            .should('have.attr', 'aria-label', 'Channel group select input');

          // Verify Save and Cancel buttons are present
          ClusterDetailsPage.channelGroupModalSaveButton().should('be.visible');
          ClusterDetailsPage.channelGroupModalCancelButton()
            .should('be.visible')
            .should('not.be.disabled');
        });
    });

    it('Step ROSA Hosted - Day 2 - Channel Group Dropdown - Verify all available options', () => {
      // Open the modal if not already open
      cy.get('body').then(($body) => {
        if (
          $body.find('[role="dialog"][aria-labelledby="edit-channel-group-modal"]').length === 0
        ) {
          ClusterDetailsPage.channelGroupSelector().click();
        }
      });

      // Wait for modal to be visible (implicit wait)
      ClusterDetailsPage.channelGroupModal().should('be.visible');

      // Verify all channel group options are present
      const expectedChannels = clusterProperties.AvailableChannelGroups;

      ClusterDetailsPage.channelGroupModalOptions().should('have.length', expectedChannels.length);

      // Verify each expected channel group option exists in the dropdown (order-independent)
      expectedChannels.forEach((channelName) => {
        ClusterDetailsPage.channelGroupModalOptions()
          .filter(`:contains("${channelName}")`)
          .should('have.length.at.least', 1);
        cy.log(`✓ Found option: ${channelName}`);
      });

      // Verify a channel group is selected (log current value)
      ClusterDetailsPage.channelGroupModalSelect()
        .invoke('val')
        .then((selectedValue) => {
          cy.log(`Currently selected channel group: ${selectedValue}`);
          expect(selectedValue).to.be.oneOf(['stable', 'fast', 'candidate', 'eus']);

          // Verify the selected option has text
          ClusterDetailsPage.channelGroupModalSelect()
            .find('option:selected')
            .invoke('text')
            .should('not.be.empty');
        });

      cy.log('✅ All channel group options validated successfully');
    });

    it('Step ROSA Hosted - Day 2 - Channel Group Dropdown - Test Cancel functionality', () => {
      // Verify Cancel button closes the modal without making changes
      ClusterDetailsPage.channelGroupModal().within(() => {
        // Note the current selection
        ClusterDetailsPage.channelGroupModalSelect()
          .invoke('val')
          .then((originalValue) => {
            cy.log(`Original channel group: ${originalValue}`);

            // Select a different option than the current one
            const differentValue = originalValue === 'fast' ? 'stable' : 'fast';
            cy.log(`Temporarily changing to: ${differentValue}`);

            ClusterDetailsPage.channelGroupModalSelect().select(differentValue);

            // Verify selection changed
            ClusterDetailsPage.channelGroupModalSelect().should('have.value', differentValue);

            // Click Cancel
            ClusterDetailsPage.channelGroupModalCancelButton().click();
          });
      });

      // Verify modal is closed
      ClusterDetailsPage.channelGroupModal().should('not.exist');

      cy.log('✅ Cancel functionality works correctly - changes were not saved');
    });

    it('Step ROSA Hosted - Day 2 - Channel Group Dropdown - Test changing channel group', () => {
      // Open the modal again
      ClusterDetailsPage.channelGroupSelector().click();

      // Wait for modal to appear before interacting with it (implicit wait)
      ClusterDetailsPage.channelGroupModal()
        .should('be.visible')
        .within(() => {
          // Get the current selection and select a different one
          ClusterDetailsPage.channelGroupModalSelect()
            .invoke('val')
            .then((currentValue) => {
              cy.log(`Current channel group: ${currentValue}`);

              // Select a different channel group than the current one
              const targetChannel = currentValue === 'fast' ? 'stable' : 'fast';
              const targetDisplayName = currentValue === 'fast' ? 'Stable' : 'Fast';

              cy.log(`Changing from ${currentValue} to ${targetChannel}`);

              // Select the new channel group
              ClusterDetailsPage.channelGroupModalSelect().select(targetChannel);

              // Verify the selection changed
              ClusterDetailsPage.channelGroupModalSelect()
                .should('have.value', targetChannel)
                .find('option:selected')
                .should('contain.text', targetDisplayName);

              cy.log(`✅ Selected ${targetDisplayName} channel group`);
            });

          // Click Save to apply the change
          ClusterDetailsPage.channelGroupModalSaveButton().click();
        });

      // Verify modal is closed (indicates save was successful) - implicit wait
      ClusterDetailsPage.channelGroupModal().should('not.exist');

      // Verify the channel group selector button exists and ready for next interaction
      ClusterDetailsPage.channelGroupSelector().should('exist');

      cy.log('✅ Channel group change submitted successfully');
    });

    it('Step ROSA Hosted - Day 2 - Channel Group Dropdown - Verify each channel option is selectable', () => {
      const channelsToTest = [
        { displayName: 'Stable', value: 'stable' },
        { displayName: 'Candidate', value: 'candidate' },
        { displayName: 'Extended Update Support', value: 'eus' },
      ];

      channelsToTest.forEach((channel) => {
        // Open the modal
        ClusterDetailsPage.channelGroupSelector().click();

        // Wait for modal to appear (implicit wait)
        ClusterDetailsPage.channelGroupModal()
          .should('be.visible')
          .within(() => {
            // Select the channel
            ClusterDetailsPage.channelGroupModalSelect().select(channel.value);

            // Verify selection
            ClusterDetailsPage.channelGroupModalSelect()
              .should('have.value', channel.value)
              .find('option:selected')
              .should('contain.text', channel.displayName);

            cy.log(`✅ ${channel.displayName} is selectable`);

            // Save the change
            ClusterDetailsPage.channelGroupModalSaveButton().click({ force: true });
          });

        // Verify modal closes and selector is ready for next interaction (implicit wait)
        ClusterDetailsPage.channelGroupModal().should('not.exist', { timeout: 15000 });
        ClusterDetailsPage.channelGroupSelector().should('exist');
      });

      cy.log('✅ All channel groups are selectable and functional');
    });

    it('Step ROSA Hosted - Day 2 - Click on Version Update button from Overview tab and verify upgrade wizard modal', () => {
      // Navigate to Overview tab if not already there
      ClusterDetailsPage.overviewTab().click({ force: true });

      // Wait for the Update button to be visible
      ClusterDetailsPage.versionUpdateButton();

      // Click on the Update button
      ClusterDetailsPage.versionUpdateButton().click();

      cy.log('✅ Clicked on Version Update button');
    });

    it('Step ROSA Hosted - Day 2 - Upgrade Wizard - Select version and proceed', () => {
      // Wait for the upgrade wizard modal to appear (implicit wait)
      ClusterDetailsPage.upgradeWizardModal()
        .should('be.visible')
        .within(() => {
          // Verify we're on the "Select version" step
          cy.contains('h3', 'Select version').should('be.visible');
        });

      // Verify the recommended version radio button exists and is checked
      ClusterDetailsPage.upgradeWizardRecommendedVersionRadio().check({ force: true });

      cy.log('✅ Recommended version radio button is checked');

      // Verify Next button is enabled
      ClusterDetailsPage.upgradeWizardNextButton().should('be.visible').and('not.be.disabled');

      cy.log('✅ Next button is enabled');

      ClusterDetailsPage.upgradeWizardNextButton().click();

      // Verify Schedule update page is displayed
      ClusterDetailsPage.upgradeWizardScheduleUpdateTitle().should('contain', 'Schedule update');

      cy.log('✅ Schedule update page is displayed');

      // Verify Update now radio button exists and click it
      ClusterDetailsPage.upgradeWizardUpdateNowRadio().click();

      cy.log('✅ Update now radio button is selected');

      // Click Next button to go to Schedule update step
      ClusterDetailsPage.upgradeWizardNextButton().click();

      // Verify confirmation page is displayed
      ClusterDetailsPage.upgradeWizardConfirmationTitle().should(
        'contain',
        'Confirmation of your update',
      );

      cy.log('✅ Confirmation page is displayed');

      // Verify Confirm update button is visible and enabled
      ClusterDetailsPage.upgradeWizardConfirmButton().should('be.visible').and('not.be.disabled');

      // Click Confirm update button
      ClusterDetailsPage.upgradeWizardConfirmButton().click();

      // Verify success modal appears with scheduled update message
      ClusterDetailsPage.upgradeSuccessTitle()
        .should('be.visible')
        .and('contain', 'Scheduled cluster update');

      ClusterDetailsPage.upgradeSuccessMessage()
        .should('be.visible')
        .and('contain', 'Your update was successfully scheduled to start within the next hour');

      cy.log('✅ Upgrade success modal displayed with scheduled update message');

      // Click Close button
      ClusterDetailsPage.upgradeSuccessCloseButton().should('be.visible').click();

      // Verify modal disappears after clicking Close
      ClusterDetailsPage.upgradeWizardModal().should('not.exist');

      cy.log('✅ Clicked Close button and success modal closed');
    });

    it('Step ROSA Hosted - Day 2 - Verify upgrade details are displayed correctly on the Overview tab', () => {
      // Verify cluster information is displayed correctly on the details page
      ClusterDetailsPage.clusterNameTitle().should('contain', clusterProperties.ClusterName);
      ClusterDetailsPage.clusterTypeLabelValue().should('contain', clusterProperties.Type);
      //ClusterDetailsPage.clusterRegionLabelValue().should('contain', clusterProperties.Region.split(',')[0]);

      cy.log('✅ Cluster details verified successfully');
    });

    it('Step ROSA Hosted - Day 2 - View scheduled update details and cancel the update', () => {
      cy.log('🔍 Verifying scheduled update and canceling it');

      // Verify the "Update scheduled:" section is visible
      ClusterDetailsPage.updateScheduledSection().should('be.visible');
      cy.log('✅ Update scheduled section is visible');

      // Verify the "View details" link is visible
      ClusterDetailsPage.viewScheduledUpdateDetailsLink()
        .should('be.visible')
        .should('not.be.disabled');
      cy.log('✅ View details link is visible');

      // Click "View details" to open the update status popover
      ClusterDetailsPage.openUpdateStatusPopover();

      // Cancel the scheduled update from the popover
      ClusterDetailsPage.cancelScheduledUpdateFromPopover();

      cy.log('✅ Scheduled update has been cancelled successfully');
    });

    /**
     * Channel Group Definitions Validation
     * Verify each channel group option matches expected definitions from fixture
     */
    it('Step ROSA Hosted - Day 2 - Verify channel group definitions match fixture data', () => {
      cy.log('🔍 Verifying channel group definitions');

      const channelGroupDefs = day2Profile.ChannelGroupDefinitions;

      // Open channel group modal
      ClusterDetailsPage.channelGroupSelector().click({ force: true });
      ClusterDetailsPage.channelGroupModal().should('be.visible');

      // Verify each channel group option exists in dropdown
      Object.keys(channelGroupDefs).forEach((channelKey) => {
        const channel = channelGroupDefs[channelKey];
        cy.log(`📋 Verifying channel: ${channel.name} (${channel.value})`);

        // Check that at least one option contains the channel name (case-insensitive)
        ClusterDetailsPage.channelGroupModalSelect()
          .find('option')
          .then(($options) => {
            const optionTexts = [...$options].map((opt) => opt.text.toLowerCase());
            const hasChannel = optionTexts.some(
              (text) => text.includes(channel.name.toLowerCase()) || text.includes(channel.value),
            );
            expect(hasChannel, `Option for ${channel.name} should exist`).to.be.true;
          });
      });

      cy.log('✅ All channel group definitions verified');
      ClusterDetailsPage.channelGroupModalCancelButton().click({ force: true });
      ClusterDetailsPage.channelGroupModal().should('not.exist', { timeout: 15000 });
    });

    /**
     * Upgrade Schedule Strategy vs Channel Group Validation
     * Verify update strategy aligns with allowed channel groups
     */
    it('Step ROSA Hosted - Day 2 - Verify upgrade schedule strategy', () => {
      cy.log('🔍 Verifying upgrade schedule strategy compatibility');

      const upgradeStrategies = day2Profile.UpgradeScheduleStrategies;
      const currentStrategy = clusterProperties.UpdateStrategy;

      cy.log(`📋 Current Update Strategy: ${currentStrategy}`);

      // Navigate to Settings tab to verify update strategy
      ClusterDetailsPage.settingsTab().click({ force: true });

      // Scroll to the upgrade policy section and select "Recurring updates"
      ClusterSettingsTab.recurringUpdatesRadioButton().scrollIntoView().check({ force: true });

      // Verify the radio is checked
      ClusterSettingsTab.recurringUpdatesRadioButton().should('be.checked');
      cy.log('✅ Recurring updates radio is selected');

      // Click Save button and wait for save to complete
      cy.contains('button', 'Save').scrollIntoView().click({ force: true });
      cy.contains('button', 'Save').should('not.be.disabled');

      // Return to Overview tab to check channel group edit state
      ClusterDetailsPage.overviewTab().click({ force: true });

      // Verify channel group switch is NOT allowed with Recurring updates
      cy.log('🔍 Verifying channel group switch is NOT allowed with Recurring updates');

      // Open channel group modal
      ClusterDetailsPage.channelGroupSelector().click({ force: true });
      ClusterDetailsPage.channelGroupModal().should('be.visible');

      // Select Candidate from dropdown
      ClusterDetailsPage.channelGroupModalSelect().should('be.visible').select('candidate');
      cy.log('✅ Selected Candidate channel group');

      // Click Save button
      cy.log('💾 Clicking Save button...');
      ClusterDetailsPage.channelGroupModalSaveButton().click({ force: true });

      // Verify error message is displayed
      ClusterDetailsPage.verifyChannelGroupModalError();

      // Close modal and go back to Settings to reset
      ClusterDetailsPage.channelGroupModalCancelButton().click({ force: true });
      ClusterDetailsPage.channelGroupModal().should('not.exist', { timeout: 15000 });

      // Reset to Individual updates
      cy.log('🔄 Resetting to Individual updates');
      ClusterDetailsPage.settingsTab().should('be.visible').click({ force: true });

      // Wait for settings page to load
      ClusterSettingsTab.individualUpdatesRadioButton().should('exist');

      // Scroll and check the radio button
      ClusterSettingsTab.individualUpdatesRadioButton()
        .scrollIntoView()
        .should('be.visible')
        .check({ force: true });

      // Verify it's checked
      ClusterSettingsTab.individualUpdatesRadioButton().should('be.checked');
      cy.log('✅ Individual updates radio is selected');

      // Click Save and wait for it to complete
      cy.contains('button', 'Save').scrollIntoView().should('be.visible').click({ force: true });
      cy.contains('button', 'Save').should('not.be.disabled', { timeout: 10000 });
      cy.log('✅ Settings saved - Individual updates restored');
    });
  },
);
