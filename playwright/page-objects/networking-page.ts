import { Page, Locator, expect } from '@playwright/test';

import { BasePage } from './base-page';

/**
 * Cluster Details → Networking tab page object for Playwright tests.
 */
export class NetworkingPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  networkingTab(): Locator {
    return this.page.getByRole('tab', { name: 'Networking' });
  }

  networkingTabPanel(): Locator {
    return this.page.getByRole('tabpanel', { name: 'Networking' });
  }

  async navigateToNetworkingTab(): Promise<void> {
    await this.networkingTab().click();
    await expect(
      this.networkingTabPanel().getByText('Cluster ingress', { exact: true }),
    ).toBeVisible({ timeout: 60000 });
  }

  editClusterIngressButton(): Locator {
    return this.page.getByRole('button', { name: 'Edit cluster ingress' });
  }

  editApplicationIngressButton(): Locator {
    return this.page.getByRole('button', { name: 'Edit application ingress' });
  }

  editClusterWideProxyButton(): Locator {
    return this.page.getByRole('button', { name: 'Edit cluster-wide proxy' });
  }

  networkingOpenConsoleLink(): Locator {
    return this.networkingTabPanel().getByRole('link', { name: 'Open console' });
  }

  /**
   * ClipboardCopy fields expose aria-label "Copyable input".
   * On the Networking tab, console URL is first and Control Plane API is second.
   */
  networkingConsoleUrlClipboard(): Locator {
    return this.networkingTabPanel().getByRole('textbox', { name: 'Copyable input' }).first();
  }

  networkingControlPlaneApiEndpointClipboard(): Locator {
    return this.networkingTabPanel().getByRole('textbox', { name: 'Copyable input' }).nth(1);
  }

  defaultApplicationRouterInput(): Locator {
    return this.networkingTabPanel().getByLabel('Default application router');
  }

  apiPrivacyLabel(privacy: string): Locator {
    return this.networkingTabPanel().getByText(`${privacy} API`, { exact: true });
  }

  applicationRouterPrivacyLabel(privacy: string): Locator {
    return this.networkingTabPanel().getByText(`${privacy} router`, { exact: true });
  }

  networkingConsoleUrlWithDomainPrefixPattern(domainPrefix: string): RegExp {
    return new RegExp(
      `https:\\/\\/console-openshift-console\\.apps\\.[^\\s]*${this.escapeRegExp(domainPrefix)}`,
    );
  }

  networkingApiEndpointWithDomainPrefixPattern(domainPrefix: string): RegExp {
    return new RegExp(`^https:\\/\\/api\\.${this.escapeRegExp(domainPrefix)}\\.`);
  }

  applicationRouterCardPattern(domainPrefix: string): RegExp {
    return new RegExp(`^\\*\\.apps\\.rosa\\.${this.escapeRegExp(domainPrefix)}`);
  }

  applicationRouterEditModalPattern(domainPrefix: string): RegExp {
    return new RegExp(`^(?:\\*\\.)?apps\\.rosa\\.${this.escapeRegExp(domainPrefix)}`);
  }

  /** OSD (non-ROSA) application router values include the domain prefix under *.apps. */
  osdApplicationRouterPattern(domainPrefix: string): RegExp {
    return new RegExp(`apps\\.[^\\s]*${this.escapeRegExp(domainPrefix)}`);
  }

  applicationIngressRouteSelectorCardInput(): Locator {
    return this.networkingTabPanel().getByRole('textbox', { name: 'Route selector' });
  }

  applicationIngressExcludedNamespacesCardInput(): Locator {
    return this.networkingTabPanel().getByRole('textbox', { name: 'Excluded namespaces' });
  }

  applicationIngressExcludeNamespaceSelectorsCardInput(): Locator {
    return this.networkingTabPanel().getByRole('textbox', {
      name: 'Exclude namespace selectors',
    });
  }

  editClusterIngressModal(): Locator {
    return this.page.getByRole('dialog', { name: 'Edit cluster ingress' });
  }

  editApplicationIngressModal(): Locator {
    return this.page.getByRole('dialog', { name: 'Edit application ingress' });
  }

  editClusterWideProxyModal(): Locator {
    return this.page.getByRole('dialog', { name: /Edit cluster-wide Proxy/i });
  }

  editClusterIngressPrivacyWarning(): Locator {
    return this.editClusterIngressModal().getByText(
      'Editing the privacy settings may require additional actions in your cloud provider account to maintain access.',
    );
  }

  editClusterIngressPrivacyLearnMoreLink(): Locator {
    return this.editClusterIngressModal().getByRole('link', {
      name: /Learn more about cluster privacy/i,
    });
  }

  editClusterIngressApiEndpointClipboard(): Locator {
    return this.editClusterIngressModal().getByRole('textbox', { name: 'Copyable input' });
  }

  makeApiPrivateCheckbox(): Locator {
    return this.editClusterIngressModal().getByRole('checkbox', { name: 'Make API private' });
  }

  editApplicationIngressRouterInput(): Locator {
    // Label is on a parent FormGroup; nested ReduxVerticalFormGroup input has no accessible name.
    return this.editApplicationIngressModal().locator('input[name="default_router_address"]');
  }

  /**
   * Formik route/excluded-namespace inputs: label is on a parent FormGroup without fieldId,
   * so no accessible name is exposed. Prefer role/label when product wiring improves.
   */
  editApplicationIngressRouteSelectorInput(): Locator {
    return this.editApplicationIngressModal().locator('input[name="defaultRouterSelectors"]');
  }

  editApplicationIngressExcludedNamespacesInput(): Locator {
    return this.editApplicationIngressModal().locator(
      'input[name="defaultRouterExcludedNamespacesFlag"]',
    );
  }

  editApplicationIngressExcludeNamespaceSelectorKeyInput(index = 0): Locator {
    return this.editApplicationIngressModal()
      .getByRole('textbox', {
        name: 'Exclude namespace selector key',
      })
      .nth(index);
  }

  editApplicationIngressExcludeNamespaceSelectorValuesInput(index = 0): Locator {
    return this.editApplicationIngressModal()
      .getByRole('textbox', {
        name: 'Exclude namespace selector values',
      })
      .nth(index);
  }

  addExcludeNamespaceSelectorButton(): Locator {
    return this.editApplicationIngressModal().getByRole('button', { name: 'Add selector' });
  }

  removeExcludeNamespaceSelectorButton(index = 0): Locator {
    return this.editApplicationIngressModal()
      .getByRole('button', { name: 'Remove item' })
      .nth(index);
  }

  async expectTextInEditApplicationIngressModal(
    text: string,
    present: boolean = true,
    count: number = 1,
  ): Promise<void> {
    const locator = this.editApplicationIngressModal().getByText(text);
    if (present) {
      await expect(locator).toHaveCount(count);
    } else {
      await expect(locator).toHaveCount(0);
    }
  }

  clusterWideProxyLearnMoreLink(): Locator {
    return this.editClusterWideProxyModal().getByRole('link', {
      name: /Learn more about configuring a cluster-wide proxy/i,
    });
  }

  httpProxyUrlInput(): Locator {
    return this.editClusterWideProxyModal().getByRole('textbox', { name: /HTTP Proxy URL/i });
  }

  httpsProxyUrlInput(): Locator {
    return this.editClusterWideProxyModal().getByRole('textbox', { name: /HTTPS Proxy URL/i });
  }

  noProxyDomainsInput(): Locator {
    return this.editClusterWideProxyModal().getByRole('textbox', { name: /No Proxy domains/i });
  }

  /**
   * Open Networking-tab edit dialog (application ingress, cluster ingress, or cluster-wide proxy).
   * Prefer this over a generic dialog role so Save/Cancel/hide waits stay scoped.
   */
  openNetworkingModal(): Locator {
    return this.page.getByRole('dialog', {
      name: /Edit (application ingress|cluster ingress|cluster-wide Proxy)/i,
    });
  }

  networkingModalSaveButton(): Locator {
    return this.openNetworkingModal().getByRole('button', { name: 'Save' });
  }

  networkingModalCancelButton(): Locator {
    return this.openNetworkingModal().getByRole('button', { name: /Cancel/i });
  }

  clusterWideProxyHeading(): Locator {
    return this.networkingTabPanel().getByRole('heading', { name: 'Cluster-wide Proxy' });
  }

  httpProxyUrlTerm(): Locator {
    // PatternFly DescriptionListTerm often has no computed accessible name for getByRole({ name }).
    return this.networkingTabPanel()
      .getByRole('term')
      .filter({ hasText: /^HTTP proxy URL$/ });
  }

  httpsProxyUrlTerm(): Locator {
    return this.networkingTabPanel()
      .getByRole('term')
      .filter({ hasText: /^HTTPS proxy URL$/ });
  }

  /**
   * Asserts the HTTP proxy URL definition value under Cluster-wide Proxy.
   * Pairs the HTTP proxy URL term with the matching definition text (no DOM parent/xpath).
   */
  async expectHttpProxyUrl(value: string): Promise<void> {
    await expect(this.clusterWideProxyHeading()).toBeVisible();
    await expect(this.httpProxyUrlTerm()).toBeVisible();
    await expect(
      this.networkingTabPanel()
        .getByRole('definition')
        .filter({ hasText: new RegExp(`^${this.escapeRegExp(value)}$`) })
        .first(),
    ).toHaveText(value);
  }

  async scrollToClusterWideProxySection(): Promise<void> {
    await this.editClusterWideProxyButton().scrollIntoViewIfNeeded();
    await expect(this.clusterWideProxyHeading()).toBeVisible({ timeout: 30000 });
  }

  async expectNetworkingCidrRanges(cidr: {
    MachineCIDR: string;
    ServiceCIDR: string;
    PodCIDR: string;
    Hostprefix: string;
  }): Promise<void> {
    const panel = this.networkingTabPanel();
    await expect(panel.getByText('CIDR ranges', { exact: true })).toBeVisible({
      timeout: 30000,
    });
    await expect(panel.getByText('Machine CIDR', { exact: true })).toBeVisible();
    await expect(panel.getByText(cidr.MachineCIDR, { exact: true })).toBeVisible();
    await expect(panel.getByText('Service CIDR', { exact: true })).toBeVisible();
    await expect(panel.getByText(cidr.ServiceCIDR, { exact: true })).toBeVisible();
    await expect(panel.getByText('Pod CIDR', { exact: true })).toBeVisible();
    await expect(panel.getByText(cidr.PodCIDR, { exact: true })).toBeVisible();
    await expect(panel.getByText('Host prefix', { exact: true })).toBeVisible();
    await expect(panel.getByText(cidr.Hostprefix, { exact: true })).toBeVisible();
  }

  async openEditClusterIngressModal(): Promise<void> {
    await this.editClusterIngressButton().click();
    await expect(this.editClusterIngressModal()).toBeVisible({ timeout: 30000 });
  }

  async openEditClusterWideProxyModal(): Promise<void> {
    await this.scrollToClusterWideProxySection();
    await this.editClusterWideProxyButton().click();
    await expect(this.editClusterWideProxyModal()).toBeVisible({ timeout: 30000 });
  }

  async openEditApplicationIngressModal(): Promise<void> {
    await this.editApplicationIngressButton().click();
    await expect(this.editApplicationIngressModal()).toBeVisible({ timeout: 30000 });
  }

  async fillApplicationIngressFields(fields: {
    routeSelector: string;
    excludedNamespaces: string;
    excludeNamespaceSelectorKey: string;
    excludeNamespaceSelectorValues: string;
  }): Promise<void> {
    await this.editApplicationIngressRouteSelectorInput().fill(fields.routeSelector);
    await this.editApplicationIngressExcludedNamespacesInput().fill(fields.excludedNamespaces);
    await this.fillExcludeNamespaceSelectorRow(0, {
      key: fields.excludeNamespaceSelectorKey,
      values: fields.excludeNamespaceSelectorValues,
    });
  }

  async fillExcludeNamespaceSelectorRow(
    index: number,
    fields: { key: string; values: string },
  ): Promise<void> {
    await this.editApplicationIngressExcludeNamespaceSelectorKeyInput(index).fill(fields.key);
    await this.editApplicationIngressExcludeNamespaceSelectorValuesInput(index).fill(fields.values);
  }

  async clearExcludeNamespaceSelectorRow(index = 0): Promise<void> {
    await this.editApplicationIngressExcludeNamespaceSelectorKeyInput(index).fill('');
    await this.editApplicationIngressExcludeNamespaceSelectorValuesInput(index).fill('');
  }

  async addExcludeNamespaceSelectorRow(fields: { key: string; values: string }): Promise<void> {
    const keyInputs = this.editApplicationIngressModal().getByRole('textbox', {
      name: 'Exclude namespace selector key',
    });
    const previousCount = await keyInputs.count();
    await this.addExcludeNamespaceSelectorButton().click();
    await expect(keyInputs).toHaveCount(previousCount + 1);
    await this.fillExcludeNamespaceSelectorRow(previousCount, fields);
  }

  async saveApplicationIngressFields(fields: {
    routeSelector: string;
    excludedNamespaces: string;
    excludeNamespaceSelectorKey: string;
    excludeNamespaceSelectorValues: string;
  }): Promise<void> {
    await this.openEditApplicationIngressModal();
    await this.fillApplicationIngressFields(fields);
    await expect(this.networkingModalSaveButton()).toBeEnabled();
    await this.saveNetworkingModal();
  }

  excludeNamespaceSelectorsCardValue(key: string, valuesCsv: string): string {
    if (!key) {
      return '';
    }
    const values = valuesCsv
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
    if (values.length <= 1) {
      return `${key}=${values[0] ?? ''}`;
    }
    return `${key}=[${values.join(', ')}]`;
  }

  excludeNamespaceSelectorsCardValues(
    selectors: { key: string; values: string }[],
  ): string {
    return selectors
      .filter((selector) => selector.key)
      .map((selector) => this.excludeNamespaceSelectorsCardValue(selector.key, selector.values))
      .join(', ');
  }

  async expectExcludeNamespaceSelectorsCard(
    selectors: { key: string; values: string }[],
  ): Promise<void> {
    await expect(this.applicationIngressExcludeNamespaceSelectorsCardInput()).toHaveValue(
      this.excludeNamespaceSelectorsCardValues(selectors),
      { timeout: 60000 },
    );
  }

  async expectApplicationIngressCardValues(fields: {
    routeSelector: string;
    excludedNamespaces: string;
    excludeNamespaceSelectorKey: string;
    excludeNamespaceSelectorValues: string;
  }): Promise<void> {
    await expect(this.applicationIngressRouteSelectorCardInput()).toHaveValue(fields.routeSelector, {
      timeout: 60000,
    });
    await expect(this.applicationIngressExcludedNamespacesCardInput()).toHaveValue(
      fields.excludedNamespaces,
    );
    await this.expectExcludeNamespaceSelectorsCard([
      {
        key: fields.excludeNamespaceSelectorKey,
        values: fields.excludeNamespaceSelectorValues,
      },
    ]);
  }

  async saveNetworkingModal(): Promise<void> {
    const modal = this.openNetworkingModal();
    await this.networkingModalSaveButton().click();
    await expect(modal).toBeHidden({ timeout: 60000 });
  }

  async cancelNetworkingModal(): Promise<void> {
    const modal = this.openNetworkingModal();
    await this.networkingModalCancelButton().click();
    await expect(modal).toBeHidden({ timeout: 30000 });
  }

  async dismissNetworkingModalIfOpen(): Promise<void> {
    const openDialog = this.openNetworkingModal();
    if (await openDialog.isVisible().catch(() => false)) {
      await this.cancelNetworkingModal();
    }
  }

  async setApiPrivacy(makePrivate: boolean): Promise<void> {
    await this.openEditClusterIngressModal();
    const checkbox = this.makeApiPrivateCheckbox();
    if (makePrivate) {
      await checkbox.check();
    } else {
      await checkbox.uncheck();
    }
    await this.saveNetworkingModal();
  }

  async ensureApiPrivacy(makePrivate: boolean): Promise<void> {
    const expectedLabel = makePrivate ? 'Private' : 'Public';
    try {
      await expect(this.apiPrivacyLabel(expectedLabel)).toBeVisible({ timeout: 5000 });
      return;
    } catch {
      // Label not present yet or privacy does not match — restore below.
    }
    await this.setApiPrivacy(makePrivate);
    await expect(this.apiPrivacyLabel(expectedLabel)).toBeVisible({ timeout: 60000 });
  }
}
