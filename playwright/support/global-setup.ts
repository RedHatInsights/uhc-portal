import { chromium, FullConfig } from '@playwright/test';
import { LoginPage } from '../page-objects/login-page';
import * as fs from 'fs';
import * as path from 'path';
import {
  STORAGE_STATE_PATH,
  DEFAULT_ACTION_TIMEOUT,
  DEFAULT_NAVIGATION_TIMEOUT,
} from './playwright-constants';

async function globalSetup(config: FullConfig) {
  const { baseURL, ignoreHTTPSErrors } = config.projects[0].use;

  // Ensure fixtures directory exists
  const fixturesDir = path.dirname(STORAGE_STATE_PATH);
  if (!fs.existsSync(fixturesDir)) {
    fs.mkdirSync(fixturesDir, { recursive: true });
  }

  // Create a browser instance
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }, // Similar to Cypress "macbook-13"
    baseURL: baseURL,
    ignoreHTTPSErrors: ignoreHTTPSErrors, // Use the same setting from main config
  });

  // Set default timeouts for the context (consistent with test configuration)
  context.setDefaultTimeout(DEFAULT_ACTION_TIMEOUT);
  context.setDefaultNavigationTimeout(DEFAULT_NAVIGATION_TIMEOUT);

  try {
    console.log('🔐 Starting GLOBAL authentication setup (ONCE for all tests)...');

    // Set cookies for disabling CookieConsent dialog (similar to Cypress session setup)
    await context.addCookies([
      {
        name: 'notice_gdpr_prefs',
        value: '0,1,2:',
        domain: '.redhat.com',
        path: '/',
        secure: true,
        httpOnly: false,
        sameSite: 'Lax',
      },
      {
        name: 'notice_preferences',
        value: '2:',
        domain: '.redhat.com',
        path: '/',
        secure: true,
        httpOnly: false,
        sameSite: 'Lax',
      },
    ]);

    const page = await context.newPage();

    // Filter known frontend errors to reduce noise during setup
    const loggedKnownErrors = new Set<string>();
    page.on('pageerror', (error) => {
      const knownErrors = ["Cannot read properties of null (reading 'map')", 'Failed to fetch'];

      const matchedKnownError = knownErrors.find((knownError) =>
        error.message.includes(knownError),
      );
      if (matchedKnownError) {
        if (!loggedKnownErrors.has(matchedKnownError)) {
          console.warn(`🚨 Known frontend error (ignoring): ${matchedKnownError}`);
          loggedKnownErrors.add(matchedKnownError);
        }
        return;
      }

      console.error(`Playwright caught page error: ${error.message}`);
    });

    // Perform login and save authentication state
    const loginPage = new LoginPage(page);
    const authUrl = baseURL ? new URL('/', baseURL).href : '/';
    await page.goto(authUrl, { timeout: DEFAULT_NAVIGATION_TIMEOUT * 1.5 });
    await loginPage.login();

    // Wait for session to establish after authentication
    await page.waitForTimeout(3000);

    const isGovCloud = process.env.GOV_CLOUD === 'true';
    if (!isGovCloud) {
      const urlPattern = /(console\..*\.redhat\.com|(stage|prod)\.foo\.redhat\.com:1337)/;
      await page.waitForURL(urlPattern, { timeout: DEFAULT_NAVIGATION_TIMEOUT / 2 });
    }

    await context.storageState({ path: STORAGE_STATE_PATH });
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
