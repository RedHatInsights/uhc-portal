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

  getMachinePoolRow(id: string): Locator {
    return this.page.locator('tr').filter({ has: this.page.locator(`td:has-text("${id}")`) });
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
    await dialog.getByTestId('btn-primary').click();
    // Wait for row to disappear
    await expect(row).toBeHidden({ timeout: 60000 });
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
