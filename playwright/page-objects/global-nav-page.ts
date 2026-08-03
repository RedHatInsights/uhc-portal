import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Global Navigation page object for Playwright tests
 */
export class GlobalNavPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  globalNavigation(): Locator {
    return this.page.getByRole('button', { name: 'Global navigation' });
  }

  clustersNavigation(): Locator {
    return this.page.getByRole('link', { name: 'Clusters', exact: true });
  }

  overviewNavigation(): Locator {
    return this.page.getByRole('link', { name: 'Overview', exact: true });
  }

  releasesNavigation(): Locator {
    return this.page.getByRole('link', { name: 'Releases', exact: true });
  }

  downloadsNavigation(): Locator {
    return this.page.getByRole('link', { name: 'Downloads', exact: true });
  }

  subscriptionsNavigation(): Locator {
    return this.page.getByRole('button', { name: 'Subscriptions' });
  }

  subscriptionsAnnualNavigation(): Locator {
    return this.page.getByRole('link', { name: /Annual|Subscriptions/i }).first();
  }

  subscriptionsOnDemandNavigation(): Locator {
    return this.page.getByRole('link', { name: /On-Demand|resource limits/i });
  }

  /** Ensures the Insights side navigation is open before clicking nav links. */
  async closeSideBar(): Promise<void> {
    const sideNav = this.page.getByRole('navigation', { name: /Global Navigation/i });
    if (!(await sideNav.isVisible().catch(() => false))) {
      await this.globalNavigation().click();
    }
  }

  async navigateTo(text: string): Promise<void> {
    await this.closeSideBar();
    const link = this.page.getByRole('link', { name: text });
    await link.waitFor({ state: 'visible', timeout: 60000 });
    await link.click();
  }

  async closeSideBarNav(): Promise<void> {
    await this.closeSideBar();
  }

  breadcrumbItem(item: string): Locator {
    return this.page
      .getByRole('navigation', { name: 'Breadcrumb' })
      .getByRole('listitem')
      .filter({ hasText: item });
  }
}
