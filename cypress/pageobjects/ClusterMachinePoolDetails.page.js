import Page from './page';

class ClusterMachinePoolDetails extends Page {
  addMachinePoolDetailsButton = () =>
    cy.contains('button', /add.*machine.*pool|create.*pool|new.*pool/i);

  enableAmazonEC2SpotInstanceCheckbox = () =>
    cy.contains('Spot instances').find('input[type="checkbox"]').scrollIntoView().check();

  addMachinePoolButtonFromModal = () => cy.contains('button', 'Add machine pool');

  cancelMachinePoolDetailsButton = () => cy.getByTestId('cancel-btn');

  closeMachinePoolDetailsButton = () => cy.get('button[aria-label="Close"]');

  addMachinePoolLink = () => cy.contains('Add machine pool').should('be.exist');

  machinePoolNameInput = () => cy.get('input[id="name"]');

  inputMachineRootDiskSize = () => cy.get('input[type="number"]').last();

  addMachinePoolNodeLabelLink = () => cy.contains('button', 'Add label');

  addMachinePoolTaintLabelLink = () => cy.contains('button', 'Add taint');

  useOnDemandInstancePriceRadio = () => cy.get('input[id="spotinstance-ondemand"]');

  useSetMaxPriceRadio = () => cy.get('input[id="spotinstance-max"]');

  setMaxPriceInput = () => cy.get('div[id="maxPrice"] input[type="number"]');

  setMaxPriceMinusButton = () => cy.get('div[name="maxPrice"] button[aria-label="Minus"]');

  setMaxPricePlusButton = () => cy.get('div[name="maxPrice"] button[aria-label="Plus"]');

  submitMachinePoolDetailsButton = () => cy.getByTestId('submit-btn');

  enableMachinePoolAutoscalingCheckbox = () => cy.get('input[id="autoscaling"]');

  minimumNodeInputAutoScaling = () => cy.get('div[id="autoscaleMin"] input[aria-label="Input"]');

  maximumNodeInputAutoScaling = () => cy.get('div[id="autoscaleMax"] input[aria-label="Input"]');

  minimumNodeCountMachinePoolMinusButton = () =>
    cy.get('div[name="autoscaleMin"] button[aria-label="Minus"]');

  minimumNodeCountMachinePoolPlusButton = () =>
    cy.get('div[name="autoscaleMin"] button[aria-label="Plus"]');

  maximumNodeCountMachinePoolMinusButton = () =>
    cy.get('div[name="autoscaleMax"] button[aria-label="Maximum nodes minus"]');

  maximumNodeCountMachinePoolPlusButton = () =>
    cy.get('div[name="autoscaleMax"] button[aria-label="Maximum nodes plus"]');

  minimumMachineNodesCountInput = () =>
    cy.get('div[name="autoscaleMin"] input[aria-label="input"]');

  maximumMachineNodesCountInput = () =>
    cy.get('div[name="autoscaleMax"] input[aria-label="input"]');

  workerMachinePoolTableData = () => cy.get('table[aria-label="Machine pools"]');

  setMinimumNodeInputAutoScaling(nodeCount) {
    this.minimumNodeInputAutoScaling().type('{selectAll}').type(nodeCount);
  }

  setMaximumNodeInputAutoScaling(nodeCount) {
    this.maximumNodeInputAutoScaling().type('{selectAll}').type(nodeCount);
  }

  editMachinePoolClusterAutoScalingButton = () =>
    cy.get('button[id="edit-existing-cluster-autoscaling"]');

  editMachineConfigurationButton = () => cy.get('button[id="edit-machine-configuration"]');

  pidLimitRangeInput = () => cy.get('input[aria-label="PIDs limit"]');

  pidMinusButton = () => cy.get('button[aria-label="minus"]');

  pidPlusButton = () => cy.get('button[aria-label="plus"]');

  selectMachinePoolComputeNodeCount(computeNodeCount) {
    cy.getByTestId('select-effect').first().click({ force: true });

    cy.get('div').contains(computeNodeCount).click({ force: true });
  }

  selectSecurityGroups() {
    cy.getByTestId('securitygroups-id').click({ force: true });
    cy.get('ul[role="menu"] li[role="menuitem"]').click({ multiple: true });
  }

  clickTab(tabName) {
    cy.get('button').contains(tabName).click({ force: true });
  }

  verifyAllMachinePoolTableHeaders(headerName) {
    cy.get('th').contains(headerName).should('be.visible');
  }

  selectComputeNodeType(computeNodeType) {
    cy.get('button[aria-label="Machine type select toggle"]').click();
    cy.get('input[aria-label="Machine type select search field"]').clear().type(computeNodeType);
    cy.get('div').contains(computeNodeType).click({ force: true });
  }

  verifyMachinePoolTableDefaultElementValues(property) {
    cy.get('tbody[role="rowgroup"]').contains(property);
  }
  addMachinePoolNodeLabelKey(key = '', index = 0) {
    cy.get(`input[name="labels[${index}].key"]`).clear().type(key);
  }
  addMachinePoolNodeLabelValue(value = '', index = 0) {
    cy.get(`input[name="labels[${index}].value"]`).clear().type(value);
  }

  editMachinePoolNodeLabelsandTaintsLink() {
    cy.contains('button', 'Edit node labels and taints').click();
  }

  addMachinePoolTaintsKey(key = '', index = 0) {
    cy.get(`input[name="taints[${index}].key"]`).clear().type(key);
  }

  addMachinePoolTaintsValue(value = '', index = 0) {
    cy.get(`input[name="taints[${index}].value"]`).clear().type(value);
  }

  selectMachinePoolTaintsEffectType(effectOption = '', index = 0) {
    cy.getByTestId('select-effect').last().click({ force: true });

    // Step 2: Select the desired option by text
    cy.contains('button', effectOption).click({ force: true });
    index = index + 1;
  }

  verifyMachinePoolTableHeaderElements(header) {
    cy.get('table th, table [role="columnheader"]', { timeout: 20000 })
      .contains(header)
      .should('be.visible')
      .click({ force: true });
  }
  clickAWSMachinePoolExpandableCollapsible(workerName, index = 0, rowIndex = 1) {
    let machinePoolIndex = index + rowIndex;
    cy.get(`button[id="${workerName}${machinePoolIndex}"]`).click({ force: true });
  }

  clickMachinePoolExpandableCollapsible(workerName) {
    cy.contains('td', workerName).parent().find('button[aria-label="Details"]').click();
  }

  validateTextforCreatedSpotInstances(spotinstance) {
    cy.get('h4').should('contain', 'Spot instance pricing');
    cy.contains(`Maximum hourly price: ${spotinstance}`);
  }

  validateTextforCreatedLabels(keys, values) {
    cy.contains('h4', 'Labels');
    cy.getByTestId('labels-id').children('div span').contains(`${keys} = ${values}`);
  }

  validateTextforCreatedTaints(taints, values, effect) {
    cy.contains('h4', 'Taints');
    cy.getByTestId('taints-id').get('span').contains(`${taints} = ${values}:${effect}`);
  }

  validateTextforSingleZoneAutoScaling(minNodes, maxNodes) {
    cy.contains('h4', 'Autoscaling');
    cy.contains('Min nodes').parent().should('contain', `${minNodes}`);
    cy.contains('Max nodes').parent().should('contain', `${maxNodes}`);
  }

  validateTextforMultiZoneAutoScaling(minNodes, maxNodes) {
    cy.contains('h4', 'Autoscaling');
    cy.contains('Min nodes per zone').parent().should('contain', `${minNodes}`);
    cy.contains('Max nodes per zone').parent().should('contain', `${maxNodes}`);
  }

  deleteWorkerMachinePool(workerMachinePoolName) {
    cy.get('td').contains(workerMachinePoolName);
    cy.get('button[aria-label="Kebab toggle"]').last().click();
    cy.get('button[role="menuitem"][type="button"]').contains('Delete').click({ force: true });
    cy.getByTestId('btn-primary').click();
  }

  isOverviewClusterPropertyMatchesMinAndMaxNodeCount(property, autoScaleNodes) {
    cy.get('div').contains(property).parent().contains(autoScaleNodes);
  }

  isOverviewClusterPropertyMatchesValue(property, value) {
    cy.get('span').contains(property).parent().siblings().find('div').contains(value);
  }

  // Machine Pool Modal Verification Methods
  verifyMachinePoolModalIsOpen() {
    // Verify the modal is visible and accessible
    cy.get('#edit-mp-modal').should('be.visible');

    return this;
  }

  verifyMachinePoolModalTitle(expectedTitle) {
    // Verify modal title matches expected text
    cy.get('h1').contains(expectedTitle);
  }

  verifySubTabExists(tabName) {
    // Use regex for flexible matching, especially for "Labels" in "Labels and Taints"
    if (tabName.toLowerCase().includes('labels')) {
      const labelsRegex = /^Labels\b/i;
      cy.get('[role="tab"]').contains(labelsRegex).should('be.visible');
    } else {
      cy.get('[role="tab"]').contains(tabName).should('be.visible');
    }
    return this;
  }

  selectMachinePoolSubTab(tabName) {
    // Use regex for flexible matching for Labels tab
    if (tabName.toLowerCase().includes('labels')) {
      const labelsRegex = /^Labels\b/i;
      cy.get('[role="tab"]').contains(labelsRegex).click();
    } else {
      cy.get('[role="tab"]').contains(tabName).click({ force: true });
    }
    return this;
  }

  verifySubTabContent() {
    cy.get('[role="tabpanel"]').should('be.visible');
    return this;
  }

  // Content verification methods for specific tabs
  verifyOverviewTabContent() {
    this.verifySubTabContent();
    cy.contains('Machine pool name').should('be.visible');
    cy.contains('Compute node count').should('be.visible');

    return this;
  }

  verifyLabelsTagsTaintsTabContent() {
    this.verifySubTabContent();
    cy.contains('Node labels').should('be.visible');
    cy.get('span').contains('Taints').should('be.visible');
    return this;
  }

  verifyCostSavingsTabContent() {
    this.verifySubTabContent();
    cy.contains('Cost saving').should('be.visible');
    return this;
  }

  verifySecurityGroupsTabContent() {
    this.verifySubTabContent();
    cy.contains('Security groups').should('be.visible');
    return this;
  }

  verifyMaintenanceTabContent() {
    this.verifySubTabContent();
    cy.contains('AutoRepair').should('be.visible');
    return this;
  }
}

export default new ClusterMachinePoolDetails();
