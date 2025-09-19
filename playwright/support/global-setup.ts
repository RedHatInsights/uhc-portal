import { chromium, FullConfig } from '@playwright/test';
import { LoginPage } from '../page-objects/login-page';
import * as fs from 'fs';
import * as path from 'path';

async function globalSetup(config: FullConfig) {
  const { baseURL, ignoreHTTPSErrors } = config.projects[0].use;
  console.log('🔍 Base URL from config:', baseURL);
  console.log('🔒 Ignore HTTPS errors:', ignoreHTTPSErrors);
  const storageStatePath = 'playwright/fixtures/storageState.json';

  // Ensure fixtures directory exists
  const fixturesDir = path.dirname(storageStatePath);
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

    console.log('🍪 Set session cookies to disable cookie consent dialog');

    const page = await context.newPage();
    // Handle uncaught exceptions (similar to Cypress)
    const loggedKnownErrors = new Set<string>();
    page.on('pageerror', (error) => {
      // Filter out known frontend errors from the Red Hat console
      const knownErrors = ["Cannot read properties of null (reading 'map')", 'Failed to fetch'];

      const matchedKnownError = knownErrors.find((knownError) =>
        error.message.includes(knownError),
      );
      if (matchedKnownError) {
        // Only log each type of known error once
        if (!loggedKnownErrors.has(matchedKnownError)) {
          console.warn(`🚨 Known frontend error (ignoring): ${matchedKnownError}`);
          loggedKnownErrors.add(matchedKnownError);
        }
        return;
      }

      console.error(`Playwright caught page error: ${error.message}`);
      // Don't fail the setup on uncaught exceptions
    });

    // Perform login and save authentication state
    const loginPage = new LoginPage(page);
    console.log('🌐 Navigating to:', baseURL || '/');
    await page.goto('/', { timeout: 90000 });
    await loginPage.login();

    // Wait a bit after authentication to ensure session is established
    await page.waitForTimeout(3000);

    // Check if we're in GOV_CLOUD environment (similar to Cypress condition)
    const isGovCloud = process.env.GOV_CLOUD === 'true';
    if (!isGovCloud) {
      // Wait for navigation to complete after login
      // Accommodate both standard console URLs and prod.foo.redhat.com:1337
      const urlPattern = /(console\..*\.redhat\.com|prod\.foo\.redhat\.com:1337)/;
      await page.waitForURL(urlPattern, { timeout: 30000 });
      console.log('✅ Verified console page navigation for non-GOV_CLOUD environment');
    } else {
      console.log('🏛️ GOV_CLOUD environment detected, skipping overview page verification');
    }

    // Save signed-in state to 'storageState.json'
    await context.storageState({ path: storageStatePath });
    console.log('✅ GLOBAL authentication state saved - will be reused by ALL tests');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
