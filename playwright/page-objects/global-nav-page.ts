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
    return this.page.locator('button[aria-label="Global navigation"]');
  }

  clustersNavigation(): Locator {
    return this.page.locator('a[data-quickstart-id="openshift"]');
  }

  overviewNavigation(): Locator {
    return this.page.locator('a[data-quickstart-id="openshift_overview"]');
  }

  releasesNavigation(): Locator {
    return this.page.locator('a[data-quickstart-id="openshift_releases"]');
  }

  downloadsNavigation(): Locator {
    return this.page.locator('a[data-quickstart-id="openshift_downloads"]');
  }

  subscriptionsNavigation(): Locator {
    return this.page.locator('li[data-quickstart-id="Subscriptions"]');
  }

  subscriptionsAnnualNavigation(): Locator {
    return this.page.locator('a[data-quickstart-id="openshift_quota"]');
  }

  subscriptionsOnDemandNavigation(): Locator {
    return this.page.locator('a[data-quickstart-id="openshift_quota_resource-limits"]');
  }

  async closeSideBar(): Promise<void> {
    const sideBar = this.page.locator('#chr-c-sidebar');
    const isVisible = await sideBar.isVisible();
    if (!isVisible) {
      await this.page.locator('#nav-toggle').click();
    }
  }

  async navigateTo(text: string): Promise<void> {
    await this.closeSideBar();
    await this.page.locator('.pf-v6-c-skeleton').waitFor({ state: 'detached' });
    await this.page.locator('a.pf-v6-c-nav__link').filter({ hasText: text }).click();
  }

  async closeSideBarNav(): Promise<void> {
    await this.closeSideBar();
  }

  breadcrumbItem(item: string): Locator {
    return this.page.locator('ol.pf-v6-c-breadcrumb__list > li').filter({ hasText: item });
  }
}
