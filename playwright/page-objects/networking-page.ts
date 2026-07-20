import { expect, Locator, Page } from '@playwright/test';

import { BasePage } from './base-page';

/**
 * Cluster details Networking tab page object for Playwright tests
 */
export class NetworkingPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  networkingTab(): Locator {
    return this.page.getByRole('tab', { name: 'Networking' });
  }

  async goToNetworkingTab(): Promise<void> {
    await this.networkingTab().click();
    await expect(this.networkingTab()).toHaveAttribute('aria-selected', 'true');
    await expect(this.page.getByText('CIDR ranges')).toBeVisible({ timeout: 30000 });
  }

  networkConfigurationCard(): Locator {
    return this.page
      .locator('.ocm-c-networking-network-configuration__card')
      .filter({ hasText: 'CIDR ranges' });
  }

  vpcDetailsCard(): Locator {
    return this.page.locator('.ocm-c-networking-vpc-details__card');
  }

  vpcSubnetsCard(): Locator {
    return this.page
      .locator('.ocm-c-networking-network-configuration__card')
      .filter({ hasText: 'VPC subnets' });
  }

  applicationIngressCard(): Locator {
    return this.page.locator('.ocm-c-networking-application-ingress__card');
  }

  descriptionListValue(container: Locator, term: string): Locator {
    return container
      .locator('.pf-v6-c-description-list__group')
      .filter({ hasText: term })
      .locator('.pf-v6-c-description-list__description');
  }

  defaultApplicationRouterInput(): Locator {
    return this.applicationIngressCard().locator('#default_router_address');
  }

  routeSelectorDisplayInput(): Locator {
    return this.applicationIngressCard().locator('#defaultRouterSelectors');
  }

  excludedNamespacesDisplayInput(): Locator {
    return this.applicationIngressCard().locator('#defaultRouterExcludedNamespacesFlag');
  }

  editApplicationIngressButton(): Locator {
    return this.applicationIngressCard().getByRole('button', { name: 'Edit application ingress' });
  }

  editApplicationIngressModal(): Locator {
    return this.page.getByRole('dialog').filter({
      has: this.page.getByRole('heading', { name: 'Edit application ingress' }),
    });
  }

  editModalRouteSelectorInput(): Locator {
    return this.editApplicationIngressModal().locator('input[name="defaultRouterSelectors"]');
  }

  editModalExcludedNamespacesInput(): Locator {
    return this.editApplicationIngressModal().locator(
      'input[name="defaultRouterExcludedNamespacesFlag"]',
    );
  }

  editModalSaveButton(): Locator {
    return this.editApplicationIngressModal().getByRole('button', { name: 'Save' });
  }

  editModalCancelButton(): Locator {
    return this.editApplicationIngressModal().getByRole('button', { name: 'Cancel' });
  }

  async openEditApplicationIngressModal(): Promise<void> {
    await this.editApplicationIngressButton().click();
    await expect(this.editApplicationIngressModal()).toBeVisible({ timeout: 30000 });
  }

  async closeEditApplicationIngressModal(): Promise<void> {
    await this.editModalCancelButton().click();
    await expect(this.editApplicationIngressModal()).not.toBeVisible({ timeout: 30000 });
  }

  async blurRouteSelectorField(): Promise<void> {
    await this.editModalRouteSelectorInput().blur();
  }

  async blurExcludedNamespacesField(): Promise<void> {
    await this.editModalExcludedNamespacesInput().blur();
  }
}
