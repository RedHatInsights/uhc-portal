import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Running global teardown...');

  // Cleanup any global resources if needed
  // No additional cleanup needed since we're using storageState

  console.log('✅ Global teardown completed');
}

export default globalTeardown;
