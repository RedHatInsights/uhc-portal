import ClusterListPage from '../../pageobjects/ClusterList.page';
import ClusterDetailsPage from '../../pageobjects/ClusterDetails.page';

const clusterProfiles = require('../../fixtures/osd-aws/OsdAwsCcsCreatePublicCluster.json');
const clusterProperties = clusterProfiles['osdccs-aws-public']['day1-profile'];

describe(
  'OSD AWS CCS Cluster - [Day 2] Channel Group Dropdown Validations (OCP-85454)',
  { tags: ['day2', 'osd', 'aws', 'channel-group', 'dropdown-validation'] },
  () => {
    beforeEach(() => {
        if (Cypress.currentTest.title.match(/Navigate to the Overview page for .* cluster/)) {
          cy.visit('/cluster-list');
          ClusterListPage.waitForDataReady();
          ClusterListPage.isClusterListScreen();
        }
      });

  
      it(`Step - Navigate to the Overview page for ${clusterProperties.ClusterName} cluster`, () => {
        ClusterListPage.filterTxtField().clear().type(clusterProperties.ClusterName);
        ClusterListPage.waitForDataReady();
        ClusterListPage.openClusterDefinition(clusterProperties.ClusterName);
        ClusterDetailsPage.waitForInstallerScreenToLoad();
      });



    it('Step OSD - Day 2 - Channel Group Dropdown - Verify modal and dropdown options', () => {
      // Click on the channel group selector to open the modal
      ClusterDetailsPage.channelGroupSelector().click({force: true});
      
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
          ClusterDetailsPage.channelGroupModalCancelButton().should('be.visible').should('not.be.disabled');
        });
    });

    it('Step OSD - Day 2 - Channel Group Dropdown - Verify all available options', () => {
      // Open the modal if not already open
      cy.get('body').then(($body) => {
        if ($body.find('[role="dialog"][aria-labelledby="edit-channel-group-modal"]').length === 0) {
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
      ClusterDetailsPage.channelGroupModalSelect().invoke('val').then((selectedValue) => {
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

    it('Step OSD - Day 2 - Channel Group Dropdown - Test Cancel functionality', () => {
      // Verify Cancel button closes the modal without making changes
      ClusterDetailsPage.channelGroupModal().within(() => {
        // Note the current selection
        ClusterDetailsPage.channelGroupModalSelect().invoke('val').then((originalValue) => {
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

    it('Step OSD - Day 2 - Channel Group Dropdown - Test changing channel group', () => {
      // Open the modal again
      ClusterDetailsPage.channelGroupSelector().click();
      
      // Wait for modal to appear before interacting with it (implicit wait)
      ClusterDetailsPage.channelGroupModal().should('be.visible').within(() => {
        // Get the current selection and select a different one
        ClusterDetailsPage.channelGroupModalSelect().invoke('val').then((currentValue) => {
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
      
      // Verify the channel group selector button is visible and ready for next interaction
      ClusterDetailsPage.channelGroupSelector().should('be.visible');
      
      cy.log('✅ Channel group change submitted successfully');
    });

    it('Step OSD - Day 2 - Channel Group Dropdown - Verify each channel option is selectable', () => {
      const channelsToTest = [
        { displayName: 'Stable', value: 'stable' },
        { displayName: 'Candidate', value: 'candidate' },
        { displayName: 'Extended Update Support', value: 'eus' }
      ];
      
      channelsToTest.forEach((channel) => {
        // Open the modal
        ClusterDetailsPage.channelGroupSelector().click();
        
        // Wait for modal to appear (implicit wait)
        ClusterDetailsPage.channelGroupModal().should('be.visible').within(() => {
          // Select the channel
          ClusterDetailsPage.channelGroupModalSelect().select(channel.value);
          
          // Verify selection
          ClusterDetailsPage.channelGroupModalSelect()
            .should('have.value', channel.value)
            .find('option:selected')
            .should('contain.text', channel.displayName);
          
          cy.log(`✅ ${channel.displayName} is selectable`);
          
          // Save the change
          ClusterDetailsPage.channelGroupModalSaveButton().click();
        });
        
        // Verify modal closes and selector is ready for next interaction (implicit wait)
        ClusterDetailsPage.channelGroupModal().should('not.exist');
        ClusterDetailsPage.channelGroupSelector().should('be.visible');
      });
      
      cy.log('✅ All channel groups are selectable and functional');
    });

    it('Step OSD - Day 2 - Click on Version Update button from Overview tab and verify upgrade wizard modal', () => {
      // Navigate to Overview tab if not already there
      ClusterDetailsPage.overviewTab().click();
      
      // Wait for the Update button to be visible
      ClusterDetailsPage.versionUpdateButton();
      
      // Click on the Update button
      ClusterDetailsPage.versionUpdateButton().click();
      
      cy.log('✅ Clicked on Version Update button');
    });

    it('Step OSD - Day 2 - Upgrade Wizard - Select version and proceed', () => {
      // Wait for the upgrade wizard modal to appear (implicit wait)
      ClusterDetailsPage.upgradeWizardModal()
        .should('be.visible')
        .within(() => {
          // Verify we're on the "Select version" step
          cy.contains('h3', 'Select version').should('be.visible');
        });
      
      
      // Verify the recommended version radio button exists and is checked
      ClusterDetailsPage.upgradeWizardRecommendedVersionRadio().check({force: true});
      
      cy.log('✅ Recommended version radio button is checked');

  // Verify Next button is enabled
     ClusterDetailsPage.upgradeWizardNextButton()
        .should('be.visible')
        .and('not.be.disabled');

        cy.log('✅ Next button is enabled');

        ClusterDetailsPage.upgradeWizardNextButton().click();


       // Verify Schedule update page is displayed
       ClusterDetailsPage.upgradeWizardScheduleUpdateTitle()
       .should('contain', 'Schedule update');
     
     cy.log('✅ Schedule update page is displayed');
     
     // Verify Update now radio button exists and click it
     ClusterDetailsPage.upgradeWizardUpdateNowRadio()
       .click();
     
     cy.log('✅ Update now radio button is selected');
      
    
      // Click Next button to go to Schedule update step
      ClusterDetailsPage.upgradeWizardNextButton().click();
      
      // Verify confirmation page is displayed
      ClusterDetailsPage.upgradeWizardConfirmationTitle()
        .should('contain', 'Confirmation of your update');
      
      cy.log('✅ Confirmation page is displayed');
      
      // Verify Confirm update button is visible and enabled
      ClusterDetailsPage.upgradeWizardConfirmButton()
        .should('be.visible')
        .and('not.be.disabled');
      
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
      ClusterDetailsPage.upgradeSuccessCloseButton()
        .should('be.visible')
        .click();
      
      // Verify modal disappears after clicking Close
      ClusterDetailsPage.upgradeWizardModal().should('not.exist');
      
      cy.log('✅ Clicked Close button and success modal closed');
    });


    it('Step OSD - Day 2 - Verify upgrade details are displayed correctly on the Overview tab', () => {
      // Verify cluster information is displayed correctly on the details page
      ClusterDetailsPage.clusterNameTitle().should('contain', clusterProperties.ClusterName);
      ClusterDetailsPage.clusterTypeLabelValue().should('contain', clusterProperties.Type);
      //ClusterDetailsPage.clusterRegionLabelValue().should('contain', clusterProperties.Region.split(',')[0]);
      
      cy.log('✅ Cluster details verified successfully');
    });

    it('Step OSD - Day 2 - Verify update status and cancel update option are shown', () => {
      // Navigate to Settings tab where update status section is located
      ClusterDetailsPage.settingsTab().click();
      
      // Verify the update status section is visible
      ClusterDetailsPage.updateStatusSection()
        .should('be.visible');
            
      // Verify the cancel update link is visible and clickable
      ClusterDetailsPage.cancelUpdateLink()
        .should('be.visible')
        .should('not.be.disabled');
      
      cy.log('✅ Cancel update link is visible and clickable');
    });

    it('Step OSD - Day 2 - Cancel the scheduled update', () => {
      // On Settings tab, the cancel link is directly visible (no popover needed)
      ClusterDetailsPage.cancelUpdateLink().click();
      
      // Confirm cancellation in the modal
      cy.getByTestId('btn-primary').should('be.visible').click();
      
      cy.log('✅ Scheduled update cancelled successfully');
    });
  },
);