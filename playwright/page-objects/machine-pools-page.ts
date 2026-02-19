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
    return this.page.locator('#edit-mp-modal');
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
    return this.page.locator('input[id="capacityReservationId"]');
  }

  capacityReservationHintButton(): Locator {
    return this.page.getByRole('button', { name: 'Capacity reservation information' });
  }

  capacityReservationHintPopover(): Locator {
    return this.page.getByRole('dialog', { name: 'help' });
  }

  privateSubnetToggle(): Locator {
    return this.page.locator('#privateSubnetId');
  }

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
    return this.page.locator('button[aria-label="Machine type select toggle"]');
  }

  instanceTypeSearchInput(): Locator {
    return this.page.locator('input[aria-label="Machine type select search field"]');
  }

  machinePoolTable(): Locator {
    return this.page.locator('table').filter({ hasText: 'Machine pool' });
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

  async selectInstanceType(instanceType: string): Promise<void> {
    await this.instanceTypeSelectButton().click();
    await this.instanceTypeSearchInput().clear();
    await this.instanceTypeSearchInput().fill(instanceType);
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
    return this.page.locator('tr').filter({ has: this.page.locator(`td:has-text("${id}")`) });
  }

  async editMachinePool(id: string): Promise<void> {
    const row = this.page.getByRole('row').filter({ hasText: id });
    await row.locator('button[aria-label="Kebab toggle"]').click();
    await this.page.getByRole('menuitem', { name: 'Edit' }).click();
    await expect(this.machinePoolModal()).toBeVisible({ timeout: 30000 });
  }

  async deleteMachinePool(id: string): Promise<void> {
    const row = this.page.getByRole('row').filter({ hasText: id });
    await row.locator('button[aria-label="Kebab toggle"]').click();
    await this.page.getByRole('menuitem', { name: 'Delete' }).click();
    // Confirm deletion in modal
    const dialog = this.page.getByRole('dialog', {
      name: 'Permanently delete machine pool?',
    });
    await expect(dialog.getByText(`"${id}" will be lost`)).toBeVisible();
    // Click Delete and wait for the API call to complete
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          response.request().method() === 'DELETE' &&
          response.url().includes(`/node_pools/${id}`),
        { timeout: 30000 },
      ),
      dialog.getByRole('button', { name: 'Delete' }).click(),
    ]);
    // Wait for dialog to close
    await expect(dialog).toBeHidden({ timeout: 30000 });
    // Then wait for the row to be removed from the DOM
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
}
