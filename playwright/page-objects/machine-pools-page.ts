import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

export class MachinePoolsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Locators
  machinePoolsTab(): Locator {
    return this.page.getByRole('tab', { name: 'Machine pools' });
  }

  addMachinePoolButton(): Locator {
    return this.page.getByRole('button', { name: 'Add machine pool' });
  }

  machinePoolModal(): Locator {
    return this.page.getByRole('dialog', { name: /(Add|Edit) machine pool/i });
  }

  cancelMachinePoolModalButton(): Locator {
    return this.page.getByRole('button', { name: 'Cancel' });
  }

  machinePoolIdInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Machine pool name' });
  }

  capacityReservationPreferenceSelect(): Locator {
    return this.page.getByRole('button', { name: 'Reservation Preference' });
  }

  capacityReservationPreferenceOption(name: string): Locator {
    return this.page.getByRole('option', { name: name });
  }

  capacityReservationIdInput(): Locator {
    return this.page.getByLabel('Reservation Id');
  }

  capacityReservationHintButton(): Locator {
    return this.page.getByRole('button', { name: 'Capacity reservation information' });
  }

  capacityReservationHintPopover(): Locator {
    return this.page.getByRole('dialog', { name: 'help' });
  }

  // Formik-controlled select scoped by stable field ID; no accessible label is rendered.
  privateSubnetToggle(): Locator {
    return this.page.locator('#privateSubnetId');
  }

  // FuzzySelect internal option ID; no accessible role or label available.
  viewUsedSubnetsButton(): Locator {
    return this.page.locator('#view-more-used-subnets');
  }

  subnetFilterInput(): Locator {
    return this.page.getByLabel('Filter by subnet ID / name');
  }

  addMachinePoolSubmitButton(): Locator {
    return this.page.getByTestId('submit-btn');
  }

  instanceTypeSelectButton(): Locator {
    return this.page.getByRole('button', { name: 'Machine type select toggle' });
  }

  instanceTypeSearchInput(): Locator {
    return this.page.getByLabel('Machine type select search field');
  }

  machinePoolTable(): Locator {
    return this.page.getByRole('table').filter({ hasText: 'Machine pool' });
  }

  // Windows License Included locators
  windowsLicenseIncludedCheckbox(): Locator {
    return this.page.getByRole('checkbox', {
      name: 'Enable machine pool for Windows License Included',
    });
  }

  windowsLicenseIncludedLabel(): Locator {
    return this.page.getByText('Enable machine pool for Windows License Included');
  }

  windowsLicenseDisabledTooltip(): Locator {
    return this.page.getByText('This instance type is not Windows License Included compatible.');
  }

  windowsLicenseEnabledText(): Locator {
    return this.page.getByText('This machine pool is Windows LI enabled');
  }

  windowsLicensePopoverHintButton(): Locator {
    return this.page.getByLabel('More information').first();
  }

  windowsLicensePopoverAWSDocsLink(): Locator {
    return this.page.getByRole('link', { name: 'Microsoft licensing on AWS' });
  }

  windowsLicensePopoverRedHatDocsLink(): Locator {
    return this.page.getByRole('link', { name: 'how to work with AWS-Windows-LI hosts' });
  }

  windowsLicensePopoverDescription(): Locator {
    return this.page.getByText(
      'When enabled, the machine pool is AWS License Included for Windows with associated fees.',
    );
  }

  autoscalingCheckbox(): Locator {
    return this.page.getByRole('checkbox', { name: /autoscaling/i });
  }

  autoscaleMinGroup(): Locator {
    return this.page.getByTestId('autoscale-min-group');
  }

  autoscaleMaxGroup(): Locator {
    return this.page.getByTestId('autoscale-max-group');
  }

  autoscaleMinInput(): Locator {
    return this.autoscaleMinGroup().getByRole('spinbutton');
  }

  autoscaleMaxInput(): Locator {
    return this.autoscaleMaxGroup().getByRole('spinbutton');
  }

  autoscaleMinMinusButton(): Locator {
    return this.autoscaleMinGroup().getByRole('button', { name: 'Minus' });
  }

  autoscaleMaxMinusButton(): Locator {
    return this.autoscaleMaxGroup().getByRole('button', { name: 'Minus' });
  }

  nodeCountInput(): Locator {
    return this.page.getByRole('spinbutton', { name: 'Compute nodes' });
  }

  nodeCountMinusButton(): Locator {
    return this.page.getByRole('button', { name: 'Decrement compute nodes' });
  }

  editNodeLabelsAndTaintsButton(): Locator {
    return this.page.getByRole('button', { name: 'Edit node labels and taints' });
  }

  labelsAndTaintsTab(): Locator {
    return this.page.getByRole('tab', { name: /Labels.*Taints/i });
  }

  costSavingsTab(): Locator {
    return this.page.getByRole('tab', { name: 'Cost savings' });
  }

  securityGroupsTab(): Locator {
    return this.page.getByRole('tab', { name: 'Security groups' });
  }

  securityGroupsSelect(): Locator {
    return this.page.getByTestId('securitygroups-id');
  }

  securityGroupsToggle(): Locator {
    return this.machinePoolModal().getByRole('button', { name: 'Options menu' });
  }

  securityGroupsNoChangeAlert(): Locator {
    return this.page.getByText(
      'You cannot add or edit security groups to the machine pool nodes after they are created.',
    );
  }

  securityGroupsNoEditWarning(): Locator {
    return this.page.getByText(
      'This option cannot be edited from its original setting selection.',
    );
  }

  securityGroupsEmptyMessage(): Locator {
    return this.page.getByText(
      'This machine pool does not have additional security groups.',
    );
  }

  securityGroupsLabel(): Locator {
    return this.page.getByLabel('Security groups');
  }

  async selectFirstSecurityGroup(): Promise<void> {
    await this.securityGroupsToggle().click();
    await this.page.getByRole('menuitem').first().click();
    await this.securityGroupsToggle().click();
  }

  // Taint fields lack accessible labels in the source (TextField/TaintEffectField);
  // Formik-stable name/id attributes are the only reliable selectors available.
  taintKeyInput(index: number): Locator {
    return this.page.locator(`input[name="taints[${index}].key"]`);
  }

  taintValueInput(index: number): Locator {
    return this.page.locator(`input[name="taints[${index}].value"]`);
  }

  // PF6 Select renders the MenuToggle as a sibling to the Menu (which gets the id);
  // the toggle uses the default aria-label "select menu". Taint effects are the only
  // "select menu" buttons in the modal, so nth() by index is reliable.
  taintEffectToggle(index: number): Locator {
    return this.machinePoolModal().getByRole('button', { name: 'select menu' }).nth(index);
  }

  taintEffectOption(effect: string): Locator {
    return this.page.getByRole('option', { name: effect, exact: true });
  }

  async clickAddMachinePoolSubmitButton(): Promise<void> {
    await expect(this.addMachinePoolSubmitButton()).toBeEnabled();
    await this.addMachinePoolSubmitButton().click();
  }

  // Actions
  async goToMachinePoolsTab(): Promise<void> {
    await this.machinePoolsTab().click();
    await expect(this.addMachinePoolButton()).toBeVisible({ timeout: 30000 });
  }

  async openAddMachinePoolModal(): Promise<void> {
    await this.addMachinePoolButton().click();
    await expect(this.machinePoolModal()).toBeVisible({ timeout: 30000 });
  }

  async selectCapacityReservationPreference(preference: string): Promise<void> {
    await this.capacityReservationPreferenceSelect().click();
    await this.page.getByRole('option', { name: preference }).click();
  }

  async fillCapacityReservationId(id: string): Promise<void> {
    await this.capacityReservationIdInput().fill(id);
  }

  async selectPrivateSubnet(subnetIdOrName: string): Promise<void> {
    await this.privateSubnetToggle().click();
    const viewUsed = this.viewUsedSubnetsButton();
    if (await viewUsed.isVisible()) {
      await viewUsed.click();
    }
    await this.subnetFilterInput().fill(subnetIdOrName);
    await this.page.getByRole('option', { name: subnetIdOrName }).click();
  }

  async closeCapacityReservationPopover(): Promise<void> {
    await this.pressKey('Escape');
  }

  async setAutoscalingRange(min: string, max: string): Promise<void> {
    await this.autoscalingCheckbox().check();
    await this.autoscaleMinInput().fill(min);
    await this.autoscaleMaxInput().fill(max);
  }

  async openTaintsSection(): Promise<void> {
    const taintsTab = this.labelsAndTaintsTab();
    if (await taintsTab.isVisible().catch(() => false)) {
      await taintsTab.click();
    } else {
      const toggle = this.editNodeLabelsAndTaintsButton();
      const expanded = await toggle.getAttribute('aria-expanded');
      if (expanded !== 'true') {
        await toggle.click();
      }
    }
  }

  async setTaint(index: number, key: string, value: string, effect?: string): Promise<void> {
    await this.taintKeyInput(index).fill(key);
    await this.taintValueInput(index).fill(value);
    if (effect) {
      await this.taintEffectToggle(index).click();
      await this.taintEffectOption(effect).click();
    }
  }

  async selectInstanceType(instanceType: string): Promise<void> {
    await this.instanceTypeSelectButton().click();
    await this.instanceTypeSearchInput().clear();
    await this.instanceTypeSearchInput().fill(instanceType);
    // PatternFly Select option li uses the instance type as its DOM id;
    // option text includes extra metadata so the id gives an exact match.
    await this.page.locator(`li[id="${instanceType}"]`).click();
  }

  async waitForMachinePoolsTabLoad(): Promise<void> {
    await this.page.getByRole('progressbar', { name: 'Loading...' }).waitFor({
      state: 'detached',
      timeout: 80000,
    });
  }

  async hoverWindowsLicenseCheckbox(): Promise<void> {
    await this.windowsLicenseIncludedCheckbox().hover();
  }

  getMachinePoolRow(id: string): Locator {
    return this.page.getByRole('row').filter({ hasText: id });
  }

  async editMachinePool(id: string): Promise<void> {
    const row = this.getMachinePoolRow(id);
    await row.getByRole('button', { name: 'Kebab toggle' }).click();
    await this.page.getByRole('menuitem', { name: 'Edit' }).click();
    await expect(this.machinePoolModal()).toBeVisible({ timeout: 30000 });
  }

  async resetMachinePoolAutoscaling(id: string, min: string, max: string): Promise<void> {
    await this.editMachinePool(id);
    await this.autoscalingCheckbox().check();
    const currentMin = await this.autoscaleMinInput().inputValue();
    const currentMax = await this.autoscaleMaxInput().inputValue();

    if (currentMin === min && currentMax === max) {
      await this.cancelMachinePoolModalButton().click();
      return;
    }

    if (currentMin !== min) {
      await this.autoscaleMinInput().fill(min);
    }
    if (currentMax !== max) {
      await this.autoscaleMaxInput().fill(max);
    }

    await this.clickAddMachinePoolSubmitButton();
    await expect(this.machinePoolModal()).toBeHidden({ timeout: 60000 });
  }

  async verifyDeleteEnabled(id: string): Promise<void> {
    const row = this.getMachinePoolRow(id);
    await row.getByRole('button', { name: 'Kebab toggle' }).click();
    const deleteItem = this.page.getByRole('menuitem', { name: 'Delete' });
    await expect(deleteItem).not.toHaveAttribute('aria-disabled', 'true');
    await this.page.keyboard.press('Escape');
  }

  async verifyDeleteDisabled(id: string, tooltipText?: string): Promise<void> {
    const row = this.getMachinePoolRow(id);
    await row.getByRole('button', { name: 'Kebab toggle' }).click();
    const deleteItem = this.page.getByRole('menuitem', { name: 'Delete' });
    await expect(deleteItem).toHaveAttribute('aria-disabled', 'true');
    if (tooltipText) {
      await deleteItem.hover();
      await expect(this.page.getByText(tooltipText)).toBeVisible();
    }
    // Close the kebab menu by pressing Escape
    await this.page.keyboard.press('Escape');
  }

  async deleteMachinePool(id: string): Promise<void> {
    const row = this.getMachinePoolRow(id);
    await row.getByRole('button', { name: 'Kebab toggle' }).click();
    await this.page.getByRole('menuitem', { name: 'Delete' }).click();
    const dialog = this.page.getByRole('dialog', {
      name: 'Permanently delete machine pool?',
    });
    await expect(dialog.getByText(`"${id}" will be lost`)).toBeVisible();
    // Classic uses /machine_pools/, HCP uses /node_pools/
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          response.request().method() === 'DELETE' &&
          (response.url().includes(`/machine_pools/${id}`) ||
            response.url().includes(`/node_pools/${id}`)),
        { timeout: 30000 },
      ),
      dialog.getByRole('button', { name: 'Delete' }).click(),
    ]);
    await expect(dialog).toBeHidden({ timeout: 30000 });
    await expect(row).toHaveCount(0, { timeout: 60000 });
  }

  async verifyCapacityReservationDetail(
    machinePoolId: string,
    expectedPreference: string,
    expectedReservationId: string,
  ): Promise<void> {
    const rowGroup = this.page.getByRole('rowgroup').filter({ hasText: machinePoolId });
    const detailsButton = rowGroup.getByRole('button', {
      name: 'Details',
    });
    await detailsButton.click();
    await expect(rowGroup.getByText(`Reservation Preference: ${expectedPreference}`)).toBeVisible();
    await expect(rowGroup.getByText(`Reservation Id: ${expectedReservationId}`)).toBeVisible();
    await detailsButton.click();
  }

  spotInstanceCheckbox(): Locator {
    return this.page.getByRole('checkbox', { name: 'Use Amazon EC2 Spot Instance' });
  }

  onDemandPriceRadio(): Locator {
    return this.page.getByRole('radio', { name: 'Use On-Demand instance price' });
  }

  setMaxPriceRadio(): Locator {
    return this.page.getByRole('radio', { name: /Set maximum price/i });
  }

  // MaxPriceField's FormGroup has no label prop; the Formik-stable id="maxPrice"
  // on the NumberInput wrapper is the only available identifier.
  maxPriceInput(): Locator {
    return this.page.locator('#maxPrice').getByRole('spinbutton');
  }

  closeMachinePoolModalButton(): Locator {
    return this.page.getByRole('button', { name: 'Close' });
  }

  // FormGroup label="Root disk size" wraps multiple sibling NumberInputs;
  // the Formik-stable id="diskSize" on the NumberInput wrapper is the only unique identifier.
  rootDiskSizeInput(): Locator {
    return this.page.locator('#diskSize').getByRole('spinbutton');
  }

  // Label fields lack accessible labels in the source (TextField);
  // Formik-stable name attributes are the only reliable selectors available.
  labelKeyInput(index: number): Locator {
    return this.page.locator(`input[name="labels[${index}].key"]`);
  }

  labelValueInput(index: number): Locator {
    return this.page.locator(`input[name="labels[${index}].value"]`);
  }

  addLabelButton(): Locator {
    return this.page.getByRole('button', { name: 'Add label' });
  }

  addTaintButton(): Locator {
    return this.page.getByRole('button', { name: 'Add taint' });
  }

  computeNodeCountDropdown(): Locator {
    return this.page.getByTestId('compute-node-count').getByRole('button');
  }

  editClusterAutoscalingButton(): Locator {
    return this.page.getByRole('button', { name: 'Edit cluster autoscaling' });
  }

  async verifyTableHeader(header: string): Promise<void> {
    const headerCell = this.page.getByRole('columnheader', { name: header });
    await expect(headerCell).toBeVisible({ timeout: 20000 });
  }

  async verifyTableContainsValue(value: string | number): Promise<void> {
    await expect(
      this.page.getByRole('rowgroup').getByText(String(value)).first(),
    ).toBeVisible();
  }

  async selectComputeNodeCount(count: string): Promise<void> {
    await this.computeNodeCountDropdown().click({ force: true });
    await this.page.getByRole('listbox').getByRole('option', { name: count }).click();
  }

  // Label helpers
  async setLabel(index: number, key: string, value: string): Promise<void> {
    await this.labelKeyInput(index).clear();
    await this.labelKeyInput(index).fill(key);
    await this.labelValueInput(index).clear();
    await this.labelValueInput(index).fill(value);
  }

  async expandMachinePoolRow(id: string): Promise<void> {
    const row = this.getMachinePoolRow(id);
    await row.waitFor({ state: 'visible' });
    const expandButton = row.getByRole('button', { name: 'Details' });
    await expect(async () => {
      const isExpanded = await expandButton.getAttribute('aria-expanded');
      if (isExpanded !== 'true') {
        await expandButton.click();
      }
      await expect(expandButton).toHaveAttribute('aria-expanded', 'true');
    }).toPass({ timeout: 30000 });
  }

  expandedRowContent(id: string): Locator {
    return this.getMachinePoolRow(id)
      .locator('xpath=following-sibling::tr[@data-testid="expandable-row"][1]');
  }

  async verifyLabels(id: string, key: string, value: string): Promise<void> {
    const expanded = this.expandedRowContent(id);
    await expect(expanded.getByRole('heading', { name: /Labels/ })).toBeVisible();

    const expandButton = expanded.getByRole('button', { name: /remaining/ });
    if (await expandButton.isVisible()) {
      await expandButton.click();
    }
    await expect(expanded.getByText(`${key} = ${value}`, { exact: true })).toBeVisible();
  }

  async verifyTaints(id: string, key: string, value: string, effect: string): Promise<void> {
    const expanded = this.expandedRowContent(id);
    await expect(
      expanded.getByRole('heading', { name: 'Taints' }),
    ).toBeVisible();
    await expect(
      expanded.getByText(`${key} = ${value}:${effect}`, { exact: true }),
    ).toBeVisible();
  }

  async verifySpotInstancePricing(id: string, maxPrice: string): Promise<void> {
    const expanded = this.expandedRowContent(id);
    await expect(
      expanded.getByRole('heading', { name: 'Spot instance pricing' }),
    ).toBeVisible();
    await expect(expanded.getByText(`Maximum hourly price: ${maxPrice}`)).toBeVisible();
  }

  private async getAutoscaleValue(expanded: Locator, headingName: string): Promise<string> {
    const heading = expanded.getByRole('heading', { name: headingName });
    await expect(heading).toBeVisible();
    return heading.evaluate((el) => el.nextSibling?.textContent?.trim() ?? '');
  }

  async verifySingleZoneAutoscaling(id: string, minNodes: string, maxNodes: string): Promise<void> {
    const expanded = this.expandedRowContent(id);
    await expect(
      expanded.getByRole('heading', { name: 'Autoscaling' }),
    ).toBeVisible();
    expect(await this.getAutoscaleValue(expanded, 'Min nodes')).toBe(minNodes);
    expect(await this.getAutoscaleValue(expanded, 'Max nodes')).toBe(maxNodes);
  }

  async verifyMultiZoneAutoscaling(
    id: string,
    minNodes: string,
    maxNodes: string,
  ): Promise<void> {
    const expanded = this.expandedRowContent(id);
    await expect(
      expanded.getByRole('heading', { name: 'Autoscaling' }),
    ).toBeVisible();
    expect(await this.getAutoscaleValue(expanded, 'Min nodes per zone')).toBe(minNodes);
    expect(await this.getAutoscaleValue(expanded, 'Max nodes per zone')).toBe(maxNodes);
  }

  async verifyOverviewProperty(property: string, value: string): Promise<void> {
    const term = this.page.getByRole('term').filter({ hasText: property });
    await expect(term).toBeVisible();
    // Adjacent sibling selector targets the <dd> paired with this <dt>.
    await expect(term.locator('+ dd')).toContainText(value);
  }

  async verifyOverviewMinMaxNodeCount(label: string, count?: number): Promise<void> {
    const definition = this.page.getByRole('definition').filter({ hasText: label });
    await expect(definition).toBeVisible();
    if (count !== undefined) {
      await expect(definition).toContainText(String(count));
    }
  }
}
