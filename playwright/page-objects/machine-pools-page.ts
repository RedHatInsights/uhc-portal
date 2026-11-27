import { expect, Locator, Page } from '@playwright/test';

import { BasePage } from './base-page';

// Shape of the HCP node pool body sent by the Add machine pool modal.
export type NodePoolCreateRequest = {
  id?: string;
  auto_repair?: boolean;
  labels?: Record<string, string>;
  taints?: { key?: string; value?: string; effect?: string }[];
  management_upgrade?: { max_surge?: string; max_unavailable?: string };
  node_drain_grace_period?: { value?: number | string };
  aws_node_pool?: {
    ec2_metadata_http_tokens?: string;
    additional_security_group_ids?: string[];
    root_volume?: { size?: number | string };
    tags?: Record<string, string>;
  };
};

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
    return this.machinePoolModal().getByRole('button', { name: 'Cancel' });
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
    return this.page.getByRole('grid').or(this.page.getByRole('table')).filter({
      hasText: 'Machine pool',
    });
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

  machinePoolOverviewTab(): Locator {
    return this.machinePoolModal().getByRole('tab', { name: 'Overview' });
  }

  costSavingsTab(): Locator {
    return this.machinePoolModal().getByRole('tab', { name: 'Cost savings' });
  }

  // TabTitleIcon aria-label is included in the tab accessible name when the tab has errors.
  costSavingsTabValidationError(): Locator {
    return this.machinePoolModal().getByRole('tab', {
      name: /Validation error on this tab\s*Cost savings/,
    });
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
    return this.page.getByText('This option cannot be edited from its original setting selection.');
  }

  securityGroupsEmptyMessage(): Locator {
    return this.page.getByText('This machine pool does not have additional security groups.');
  }

  securityGroupsLabel(): Locator {
    return this.page.getByLabel('Security groups');
  }

  securityGroupsDocsLink(): Locator {
    return this.machinePoolModal().getByRole('link', { name: 'View more information' });
  }

  securityGroupsAwsConsoleLink(): Locator {
    return this.machinePoolModal().getByRole('link', { name: 'AWS security groups console' });
  }

  selectedSecurityGroup(name: string): Locator {
    return this.visibleMachinePoolTabPanel().getByText(name, { exact: true });
  }

  // Inactive machine pool tabs stay in the DOM with the hidden attribute.
  visibleMachinePoolTabPanel(): Locator {
    return this.machinePoolModal().getByRole('tabpanel');
  }

  async selectFirstSecurityGroup(): Promise<void> {
    await this.securityGroupsToggle().click();
    await this.page.getByRole('menuitem').first().click();
    await this.securityGroupsToggle().click();
  }

  async goToSecurityGroupsTab(): Promise<void> {
    await this.securityGroupsTab().click();
    // VPC security groups load after the tab opens.
    await expect(this.securityGroupsNoChangeAlert()).toBeVisible({ timeout: 30000 });
  }

  // Select options render as menuitem, menuitemcheckbox, or option depending on PatternFly Select.
  // Names longer than 50 characters are shown with the same truncation as EditSecurityGroups.
  async selectSecurityGroup(name: string): Promise<void> {
    const toggle = this.securityGroupsToggle();
    if ((await toggle.getAttribute('aria-expanded')) !== 'true') {
      await toggle.click();
    }
    const option = this.page
      .getByRole('menuitem')
      .or(this.page.getByRole('menuitemcheckbox'))
      .or(this.page.getByRole('option'))
      .filter({ has: this.page.getByText(this.displayedMachinePoolItem(name), { exact: true }) });
    await option.click();
    if ((await toggle.getAttribute('aria-expanded')) === 'true') {
      await toggle.click();
    }
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

  async verifyMaxNodeCount(
    input: Locator,
    maxNodes: number,
    validValue = String(maxNodes - 1),
    invalidValue = String(maxNodes + 1),
  ): Promise<void> {
    const errorText = `Input cannot be more than ${maxNodes}.`;

    await input.fill(validValue);
    await input.blur();
    await expect(this.getByText(errorText)).toBeHidden();
    await expect(this.addMachinePoolSubmitButton()).toBeEnabled();

    await input.fill(invalidValue);
    await input.blur();
    await expect(this.getByText(errorText)).toBeVisible();
    await expect(this.addMachinePoolSubmitButton()).toBeDisabled();
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

  // The expanded details row can repeat the pool id inside AWS tags. Match the name cell only.
  getMachinePoolRow(id: string): Locator {
    const idCell = this.page
      .getByRole('gridcell', { name: id, exact: true })
      .or(this.page.getByRole('cell', { name: id, exact: true }));
    return this.page.getByRole('row').filter({ has: idCell });
  }

  async firstExistingMachinePoolId(): Promise<string> {
    const row = this.page.getByRole('row', { name: /Kebab toggle/ }).first();
    await expect(row).toBeVisible({ timeout: 30000 });
    const nameCell = row.getByRole('gridcell').nth(1).or(row.getByRole('cell').nth(1));
    const name = (await nameCell.innerText()).trim().split('\n')[0];
    if (!name) {
      throw new Error('Could not read a machine pool name from the table');
    }
    return name;
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
    return this.machinePoolModal().getByRole('checkbox', {
      name: 'Use Amazon EC2 Spot Instance',
    });
  }

  onDemandPriceRadio(): Locator {
    return this.machinePoolModal().getByRole('radio', { name: 'Use On-Demand instance price' });
  }

  setMaxPriceRadio(): Locator {
    return this.machinePoolModal().getByRole('radio', { name: /Set maximum price/i });
  }

  // MaxPriceField's FormGroup has no label prop; the Formik-stable id="maxPrice"
  // on the NumberInput wrapper is the only available identifier.
  maxPriceInput(): Locator {
    return this.machinePoolModal().locator('#maxPrice').getByRole('spinbutton');
  }

  // PF Label has no distinct accessible name; data-testid is set on the component.
  spotInterruptionHandlingMode(): Locator {
    return this.machinePoolModal().getByTestId('spotInterruptionHandlingMode');
  }

  // PatternFly Alert title is exposed as a heading ("Warning alert: …"), not role="alert".
  spotInstanceWarningAlert(): Locator {
    return this.machinePoolModal().getByRole('heading', {
      name: /Your Spot Instance may be interrupted at any time/,
    });
  }

  spotCapacityReservationConflictTooltip(): Locator {
    return this.page.getByRole('tooltip', {
      name: /Spot Instances and Capacity Reservations cannot both be enabled on the same machine pool/,
    });
  }

  spotInstanceImmutableTooltip(): Locator {
    return this.page.getByRole('tooltip', {
      name: /This option cannot be edited from its original setting selection/,
    });
  }

  async goToCostSavingsTab(): Promise<void> {
    await this.costSavingsTab().click();
    await expect(this.spotInstanceCheckbox()).toBeVisible();
  }

  async goToMachinePoolOverviewTab(): Promise<void> {
    await this.machinePoolOverviewTab().click();
    await expect(this.machinePoolIdInput()).toBeVisible();
  }

  async hoverSpotInstanceCheckbox(): Promise<void> {
    // Disabled checkboxes fail Playwright actionability; force is required to open the tooltip.
    await this.spotInstanceCheckbox().hover({ force: true });
  }

  async hoverCapacityReservationPreference(): Promise<void> {
    // Disabled selects fail Playwright actionability; force is required to open the tooltip.
    await this.capacityReservationPreferenceSelect().hover({ force: true });
  }

  async dismissMachinePoolModalIfOpen(): Promise<void> {
    const modal = this.machinePoolModal();
    if (await modal.isVisible()) {
      await this.cancelMachinePoolModalButton().click();
      await expect(modal).toBeHidden({ timeout: 15000 });
    }
  }

  closeMachinePoolModalButton(): Locator {
    return this.page.getByRole('button', { name: 'Close' });
  }

  rootDiskSizeInput(): Locator {
    return this.machinePoolModal().getByRole('spinbutton', {
      name: 'Root disk size',
      exact: true,
    });
  }

  rootDiskSizeHintButton(): Locator {
    return this.machinePoolModal().getByRole('button', {
      name: 'More info for Root disk size field',
    });
  }

  // `description` is the popover body. Several help dialogs share the name "help".
  helpPopover(description?: string): Locator {
    return this.page.getByRole(
      'dialog',
      description ? { name: 'help', description } : { name: 'help' },
    );
  }

  // Clicking the hint button again does not dismiss the popover. PatternFly keeps a
  // focus trap on click-triggered popovers, and that trap swallows the toggle click.
  async closeHelpPopover(): Promise<void> {
    const popover = this.helpPopover();
    await popover.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(popover).toBeHidden();
  }

  immutableSettingTooltip(): Locator {
    return this.page.getByRole('tooltip', {
      name: /This option cannot be edited from its original setting selection/,
    });
  }

  // The same warning is mounted on more than one tab. Only the selected tabpanel is visible.
  securityGroupsImmutableAlert(): Locator {
    return this.visibleMachinePoolTabPanel().getByText(
      'This option cannot be edited from its original setting selection.',
    );
  }

  awsTagsImmutableAlert(): Locator {
    return this.visibleMachinePoolTabPanel().getByText(
      'This option cannot be edited from its original setting selection.',
    );
  }

  maintenanceTab(): Locator {
    return this.machinePoolModal().getByRole('tab', { name: /Maintenance/ });
  }

  autoRepairCheckbox(): Locator {
    return this.machinePoolModal().getByRole('checkbox', { name: /Enable AutoRepair/ });
  }

  maxSurgeInput(): Locator {
    return this.machinePoolModal().getByRole('spinbutton', { name: 'Max surge', exact: true });
  }

  maxUnavailableInput(): Locator {
    return this.machinePoolModal().getByRole('spinbutton', {
      name: 'Max unavailable',
      exact: true,
    });
  }

  nodeDrainTimeoutInput(): Locator {
    return this.machinePoolModal().getByRole('spinbutton', {
      name: 'Node drain timeout',
      exact: true,
    });
  }

  maxSurgeHintButton(): Locator {
    return this.machinePoolModal().getByRole('button', { name: 'More info for Max surge field' });
  }

  maxUnavailableHintButton(): Locator {
    return this.machinePoolModal().getByRole('button', {
      name: 'More info for Max unavailable field',
    });
  }

  nodeDrainTimeoutHintButton(): Locator {
    return this.machinePoolModal().getByRole('button', {
      name: 'More info for Node drain timeout field',
    });
  }

  imdsV2OnlyRadio(): Locator {
    return this.machinePoolModal().getByRole('radio', { name: /IMDSv2 only/ });
  }

  imdsV1AndV2Radio(): Locator {
    return this.machinePoolModal().getByRole('radio', { name: /IMDSv1 and IMDSv2/ });
  }

  // Each row reuses the Key and Value column labels, so the row index selects among them.
  awsTagKeyInput(index: number): Locator {
    return this.machinePoolModal().getByRole('textbox', { name: 'Key', exact: true }).nth(index);
  }

  awsTagValueInput(index: number): Locator {
    return this.machinePoolModal().getByRole('textbox', { name: 'Value', exact: true }).nth(index);
  }

  addAwsTagButton(): Locator {
    return this.page.getByRole('button', { name: 'Add AWS Tag' });
  }

  labelKeyInput(index: number): Locator {
    return this.machinePoolModal()
      .getByRole('textbox', { name: 'Node label key', exact: true })
      .nth(index);
  }

  labelValueInput(index: number): Locator {
    return this.machinePoolModal()
      .getByRole('textbox', { name: 'Node label value', exact: true })
      .nth(index);
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
    await expect(this.page.getByRole('rowgroup').getByText(String(value)).first()).toBeVisible();
  }

  async selectComputeNodeCount(count: string): Promise<void> {
    await this.computeNodeCountDropdown().click({ force: true });
    await this.page.getByRole('listbox').getByRole('option', { name: count }).click();
  }

  // Labels and AWS tags are maps. The edit form lists them in API key order,
  // which is not the order they were entered.
  async labelRowIndex(key: string): Promise<number> {
    return this.rowIndexByKey(
      this.machinePoolModal().getByRole('textbox', { name: 'Node label key', exact: true }),
      key,
    );
  }

  // AWS tag keys are the only textboxes named "Key". Node label keys use a distinct name.
  async awsTagRowIndex(key: string): Promise<number> {
    return this.rowIndexByKey(
      this.machinePoolModal().getByRole('textbox', { name: 'Key', exact: true }),
      key,
    );
  }

  private async rowIndexByKey(keys: Locator, key: string): Promise<number> {
    const values = await keys.evaluateAll((inputs: HTMLInputElement[]) =>
      inputs.map((input) => input.value),
    );
    const index = values.indexOf(key);
    if (index === -1) {
      throw new Error(`No row with key "${key}" was found`);
    }
    return index;
  }

  // Label helpers
  async setLabel(index: number, key: string, value: string): Promise<void> {
    await this.labelKeyInput(index).clear();
    await this.labelKeyInput(index).fill(key);
    await this.labelValueInput(index).clear();
    await this.labelValueInput(index).fill(value);
  }

  async setAwsTag(index: number, key: string, value: string): Promise<void> {
    await this.awsTagKeyInput(index).clear();
    await this.awsTagKeyInput(index).fill(key);
    await this.awsTagValueInput(index).clear();
    await this.awsTagValueInput(index).fill(value);
  }

  async goToMaintenanceTab(): Promise<void> {
    await this.maintenanceTab().click();
    await expect(this.autoRepairCheckbox()).toBeVisible();
  }

  async fillHostedMachinePoolBasics(
    id: string,
    privateSubnetName: string,
    autoscaleMin: string,
    autoscaleMax: string,
  ): Promise<void> {
    await this.goToMachinePoolOverviewTab();
    await this.machinePoolIdInput().fill(id);
    await this.selectPrivateSubnet(privateSubnetName);
    await this.setAutoscalingRange(autoscaleMin, autoscaleMax);
  }

  async hoverRootDiskSize(): Promise<void> {
    // Disabled number inputs do not receive hover unless the action is forced.
    await this.rootDiskSizeInput().hover({ force: true });
  }

  async submitNewNodePool(): Promise<NodePoolCreateRequest> {
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' && /\/node_pools(?:\?|$)/.test(response.url()),
      { timeout: 60000 },
    );
    await this.clickAddMachinePoolSubmitButton();
    const response = await responsePromise;
    if (!response.ok()) {
      throw new Error(
        `Creating the machine pool failed (${response.status()}): ${await response.text()}`,
      );
    }
    await expect(this.machinePoolModal()).toBeHidden({ timeout: 60000 });
    return response.request().postDataJSON();
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
    return this.getMachinePoolRow(id).locator(
      'xpath=following-sibling::tr[@data-testid="expandable-row"][1]',
    );
  }

  // Each label group list is named so its overflow button stays with that group.
  private labelGroupOverflow(expanded: Locator, caption: string): Locator {
    return expanded
      .getByRole('list', { name: caption, exact: true })
      .getByRole('button', { name: /remaining/ });
  }

  // EditSecurityGroups and MachinePoolItemList both truncate past 50 characters
  // with truncateTextWithEllipsis: the first 16 characters, "... ", then the last 33.
  private displayedMachinePoolItem(text: string): string {
    const maxLength = 50;
    if (!text || text.length <= maxLength) {
      return text;
    }
    return `${text.slice(0, maxLength / 3)}... ${text.slice((-maxLength * 2) / 3)}`;
  }

  private async expandCollapsedLabelGroup(expanded: Locator, caption: string): Promise<void> {
    const overflow = this.labelGroupOverflow(expanded, caption);
    if (await overflow.isVisible()) {
      await overflow.click();
    }
  }

  async verifyLabels(id: string, key: string, value: string): Promise<void> {
    const expanded = this.expandedRowContent(id);
    await expect(expanded.getByRole('heading', { name: /Labels/ })).toBeVisible();
    await this.expandCollapsedLabelGroup(expanded, 'Labels');
    const labels = expanded.getByRole('list', { name: 'Labels', exact: true });
    await expect(labels.getByText(`${key} = ${value}`, { exact: true })).toBeVisible();
  }

  async verifyTaints(id: string, key: string, value: string, effect: string): Promise<void> {
    const expanded = this.expandedRowContent(id);
    await expect(expanded.getByRole('heading', { name: 'Taints' })).toBeVisible();
    await expect(expanded.getByText(`${key} = ${value}:${effect}`, { exact: true })).toBeVisible();
  }

  async verifySecurityGroup(id: string, name: string): Promise<void> {
    const expanded = this.expandedRowContent(id);
    await expect(expanded.getByRole('heading', { name: 'Security groups' })).toBeVisible();
    await expect(
      expanded.getByText(this.displayedMachinePoolItem(name), { exact: true }),
    ).toBeVisible();
  }

  async verifyAwsTag(id: string, key: string, value: string): Promise<void> {
    const expanded = this.expandedRowContent(id);
    await expect(expanded.getByRole('heading', { name: 'Labels and AWS tags' })).toBeVisible();
    await this.expandCollapsedLabelGroup(expanded, 'AWS tags');
    const awsTags = expanded.getByRole('list', { name: 'AWS tags', exact: true });
    await expect(awsTags.getByText(`${key} = ${value}`, { exact: true })).toBeVisible();
  }

  async verifyAutoRepair(id: string, state: 'Enabled' | 'Disabled'): Promise<void> {
    const expanded = this.expandedRowContent(id);
    await expect(expanded.getByRole('heading', { name: 'AutoRepair' })).toBeVisible();
    await expect(expanded.getByText(state, { exact: true })).toBeVisible();
  }

  async verifySpotInstancePricing(id: string, maxPrice: string): Promise<void> {
    const expanded = this.expandedRowContent(id);
    await expect(expanded.getByRole('heading', { name: 'Spot instance pricing' })).toBeVisible();
    await expect(expanded.getByText(`Maximum hourly price: ${maxPrice}`)).toBeVisible();
  }

  async verifySpotOnDemandPricing(id: string): Promise<void> {
    const expanded = this.expandedRowContent(id);
    await expect(expanded.getByRole('heading', { name: 'Spot instance pricing' })).toBeVisible();
    // On-Demand is a text node next to the heading, not its own element.
    await expect(expanded).toContainText('On-Demand');
  }

  private async getAutoscaleValue(expanded: Locator, headingName: string): Promise<string> {
    const heading = expanded.getByRole('heading', { name: headingName });
    await expect(heading).toBeVisible();
    return heading.evaluate((el) => el.nextSibling?.textContent?.trim() ?? '');
  }

  async verifySingleZoneAutoscaling(id: string, minNodes: string, maxNodes: string): Promise<void> {
    const expanded = this.expandedRowContent(id);
    await expect(expanded.getByRole('heading', { name: 'Autoscaling' })).toBeVisible();
    expect(await this.getAutoscaleValue(expanded, 'Min nodes')).toBe(minNodes);
    expect(await this.getAutoscaleValue(expanded, 'Max nodes')).toBe(maxNodes);
  }

  async verifyMultiZoneAutoscaling(id: string, minNodes: string, maxNodes: string): Promise<void> {
    const expanded = this.expandedRowContent(id);
    await expect(expanded.getByRole('heading', { name: 'Autoscaling' })).toBeVisible();
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
