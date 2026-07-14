import { Locator, expect } from '@playwright/test';

import { BasePage } from './base-page';

/**
 * Shared wizard page object for OSD and ROSA create-cluster flows.
 *
 * Holds version/channel locators and common wizard actions that are identical
 * across products. Product-specific logic stays in:
 *   - CreateRosaWizardPage (ROSA-specific)
 *   - CreateOSDWizardPage (OSD-specific)
 *
 * Hierarchy:
 *   BasePage → BaseWizardPage → CreateOSDWizardPage | CreateRosaWizardPage
 */
export abstract class BaseWizardPage extends BasePage {

  wizardNextButton(): Locator {
    return this.page.getByTestId('wizard-next-button');
  }

  wizardBackButton(): Locator {
    return this.page.getByTestId('wizard-back-button');
  }

  wizardCancelButton(): Locator {
    return this.page.getByTestId('wizard-cancel-button');
  }

  async waitAndClick(buttonLocator: Locator, timeout: number = 60000): Promise<void> {
    await buttonLocator.waitFor({ state: 'visible', timeout });
    await buttonLocator.click();
  }

  async closePopoverDialogs(): Promise<void> {
    const closeButtons = this.page.locator('button[aria-label="Close"]');
    const count = await closeButtons.count();

    for (let i = 0; i < count; i++) {
      const button = closeButtons.nth(i);
      try {
        if (await button.isVisible()) {
          await button.click();
        }
      } catch {
        // Continue if a close button is not clickable
      }
    }
  }

  // ── Version (FuzzySelect) ─────────────────────────────────────────────────

  /** FuzzySelect MenuToggle for cluster version (`id="version-selector"`). */
  versionDropdownToggle(): Locator {
    return this.page.locator('#version-selector');
  }

  versionLoadingIndicator(): Locator {
    return this.page.getByLabel('Loading...');
  }

  /** Version options live in the FuzzySelect listbox, not native `<select>` options. */
  versionDropdownOption(version: string): Locator {
    return this.page
      .getByRole('listbox', { name: 'Select options list' })
      .getByRole('option', { name: version, exact: true });
  }

  /** Version dropdown option labels like "4.16.0 (fast)". */
  versionOptionsByChannel(channel: string): Locator {
    return this.page.getByRole('option', {
      name: new RegExp(`\\(${this.escapeRegExp(channel)}\\)`),
    });
  }

  versionFieldLabel(): Locator {
    return this.page.getByText('Version', { exact: true }).first();
  }

  /**
   * Product-specific: navigate back to Cluster details if needed.
   * Implemented by CreateOSDWizardPage / CreateRosaWizardPage.
   */
  abstract ensureClusterDetailsScreen(): Promise<void>;

  async waitForInstallableVersionsLoaded(): Promise<void> {
    await this.ensureClusterDetailsScreen();
    await this.versionDropdownToggle().waitFor({ state: 'visible', timeout: 90000 });
    const loading = this.versionLoadingIndicator();
    if (await loading.isVisible().catch(() => false)) {
      await loading.waitFor({ state: 'hidden', timeout: 120000 });
    }
  }

  async selectVersion(version: string): Promise<void> {
    if (version !== '') {
      await this.waitForInstallableVersionsLoaded();
      await this.versionDropdownToggle().click();
      await this.versionDropdownOption(version).click();
    }
  }

  // ── Channel (FormSelect / Y-stream) ───────────────────────────────────────

  /** Channel FormSelect (`getByRole` preferred over `getByLabel`). */
  channelSelect(): Locator {
    return this.page.getByRole('combobox', { name: 'Channel' });
  }

  /** Channel combobox options like "fast-4.16". */
  channelSelectOptionsByPrefix(prefix: string): Locator {
    return this.channelSelect().getByRole('option', {
      name: new RegExp(`^${this.escapeRegExp(prefix)}-`),
    });
  }

  channelGroupSelect(): Locator {
    return this.page.getByRole('combobox', { name: 'Channel group' });
  }

  channelFieldLabel(): Locator {
    return this.page.getByText('Channel', { exact: true });
  }

  async selectChannel(channel: string): Promise<void> {
    await this.channelSelect().waitFor({ state: 'visible', timeout: 90000 });
    await this.channelSelect().selectOption(channel);
  }

  /** Visible `<option>` values on the Channel select (excludes empty placeholder). */
  async channelSelectOptionValues(): Promise<string[]> {
    const select = this.channelSelect();
    await select.waitFor({ state: 'visible', timeout: 90000 });
    return select
      .locator('option')
      .evaluateAll((opts) =>
        opts.map((o) => (o as HTMLOptionElement).value.trim()).filter((value) => value.length > 0),
      );
  }

  channelSelectPlaceholder(): Locator {
    return this.channelSelect().getByRole('option', { name: 'Select a channel' });
  }

  channelSelectEmptyMessage(): Locator {
    return this.channelSelect().getByRole('option', {
      name: 'No channels available for the selected version',
    });
  }

  channelInfoIcon(): Locator {
    return this.page.getByRole('button', { name: 'Update channels information' });
  }

  channelPopover(): Locator {
    return this.page.getByRole('dialog', { name: 'help' }).filter({ hasText: /Channels provide/i });
  }

  channelPopoverLearnMoreLink(): Locator {
    return this.channelPopover().getByRole('link', { name: 'Learn more' });
  }

  async followChannelPopoverLearnMoreLink(docUrlFragment: string): Promise<void> {
    const learnMore = this.channelPopoverLearnMoreLink();
    await expect(learnMore).toHaveAttribute('href', new RegExp(docUrlFragment));

    const popupPromise = this.page.waitForEvent('popup', { timeout: 60000 });
    await learnMore.click();
    const docPage = await popupPromise;
    await docPage.waitForLoadState('domcontentloaded');
    await expect(docPage).toHaveURL(new RegExp(docUrlFragment));
    await docPage.close();
  }

  reviewChannelValue(): Locator {
    return this.page.getByTestId('Channel').locator('motion.div, div');
  }

  reviewVersionValue(): Locator {
    return this.page.getByTestId('Version').locator('motion.div, div');
  }

  async assertVersionFieldAppearsBeforeChannelField(): Promise<void> {
    const versionBox = await this.versionFieldLabel().boundingBox();
    const channelBox = await this.channelFieldLabel().boundingBox();
    expect(versionBox).not.toBeNull();
    expect(channelBox).not.toBeNull();
    expect(versionBox!.y).toBeLessThan(channelBox!.y);
  }

  async assertYStreamChannelUiWithoutChannelGroup(): Promise<void> {
    await expect(this.channelGroupSelect()).not.toBeVisible();
    await expect(this.channelSelect()).toBeVisible();
  }

  async assertChannelSelectPlaceholderIsEmpty(placeholderLabel: string): Promise<void> {
    const placeholder = this.channelSelectPlaceholder();
    await expect(placeholder).toHaveAttribute('value', '');
    await expect(placeholder).toHaveText(placeholderLabel);
  }

  async assertChannelOptionValuesMatchAvailableChannelsPattern(): Promise<void> {
    const optionValues = await this.channelSelectOptionValues();
    expect(optionValues.length).toBeGreaterThan(0);
    for (const value of optionValues) {
      expect(value).toMatch(/^(stable|fast|candidate|eus)-\d+\.\d+$/);
    }
  }

  /** Clears channel selection on Cluster details. */
  async resetClusterDetailsSelections(): Promise<void> {
    await this.ensureClusterDetailsScreen();

    const channelSelect = this.channelSelect();
    if (await channelSelect.isEnabled()) {
      await channelSelect.selectOption('');
      await expect(channelSelect).toHaveValue('');
    }
  }
}
