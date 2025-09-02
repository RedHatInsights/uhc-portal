import Page from './page';

class ClusterMachinePoolDetails extends Page {
  addMachinePoolDetailsButton = () => cy.get('button[id="add-machine-pool"]');

  enableAmazonEC2SpotInstanceCheckbox = () =>
    cy.get('input[name="useSpotInstances"]').scrollIntoView().check();

  addMachinePoolButtonFromModal = () => cy.getByTestId('submit-btn');

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
    cy.getByTestId('compute-node-count')
      .find('button[aria-haspopup="listbox"]')
      .click({ force: true });

    cy.get('ul[id="replicas"][role="listbox"]').find('button').contains(computeNodeCount).click();
  }

  selectComputeNodeType(computeNodeType) {
    cy.get('button[aria-label="Machine type select toggle"]').click();
    cy.get('input[aria-label="Machine type select search field"]').clear().type(computeNodeType);
    cy.get('div').contains(computeNodeType).click({ force: true }).blur();
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
    cy.get('div button[id="effect-toggle-id"]').click({ multiple: true });
    cy.get(`ul[id="taints[${index}].effect"]`).find('button').contains(effectOption).click();
    index = index + 1;
  }

  verifyMachinePoolTableHeaderElements(header) {
    cy.getByTestId('header-machinepool', { timeout: 20000 })
      .contains(header)
      .should('be.visible')
      .click({ force: true });
  }

  clickMachinePoolExpandableCollapsible(index = 0, rowIndex = 1) {
    let machinePoolIndex = index + rowIndex;
    cy.get(`td button[id="expandable-toggle${machinePoolIndex}"]`).click();
  }

  validateTextforCreatedSpotInstances(spotinstance) {
    cy.get('h4').should('contain', 'Spot instance pricing');
    cy.getByTestId('spotinstance-id').should('contain', `Maximum hourly price: ${spotinstance}`);
  }

  validateTextforCreatedLabels(keys, values) {
    cy.contains('h4', 'Labels');
    cy.getByTestId('labels-id').children('div span').should('contain', `${keys} = ${values}`);
  }

  validateTextforCreatedTaints(taints, values, effect) {
    cy.contains('h4', 'Taints');
    cy.getByTestId('taintstext-id')
      .children('div span')
      .should('contain', `${taints} = ${values}:${effect}`);
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
    cy.get('td[data-label="Machine pool"]').contains(workerMachinePoolName);
    cy.get('button[aria-label="Kebab toggle"]').last().click();
    cy.get('button[role="menuitem"][type="button"]').contains('Delete').click({ force: true });
    cy.getByTestId('btn-primary').click();
  }

  isOverviewClusterPropertyMatchesMinAndMaxNodeCount(property, autoScaleNodes) {
    cy.get('div').contains(property).parent().contains(autoScaleNodes);
  }

  isOverviewClusterPropertyMatchesValue(property, value) {
    cy.get('span.pf-v6-c-description-list__text')
      .contains(property)
      .parent()
      .siblings()
      .find('div')
      .contains(value);
  }
}

export default new ClusterMachinePoolDetails();
