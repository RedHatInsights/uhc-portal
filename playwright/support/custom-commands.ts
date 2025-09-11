import { Page, Locator } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile } from 'fs/promises';

const execAsync = promisify(exec);

export class CustomCommands {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Custom getByTestId method (equivalent to Cypress.Commands.add('getByTestId'))
  getByTestId(selector: string): Locator {
    return this.page.locator(`[data-testid="${selector}"]`);
  }

  // Additional helper methods similar to Cypress commands
  async waitForSelector(selector: string, options?: { timeout?: number }): Promise<Locator> {
    const locator = this.page.locator(selector);
    await locator.waitFor(options);
    return locator;
  }

  async waitForTestId(testId: string, options?: { timeout?: number }): Promise<Locator> {
    const locator = this.getByTestId(testId);
    await locator.waitFor(options);
    return locator;
  }

  async executeRosaCmd(cmd: string): Promise<void> {
    await this.executeCustomCmd(cmd);
  }

  async rosaLoginViaOfflineToken(token: string, env: string): Promise<void> {
    const cmd = `rosa login --env ${env} --token ${token}`;
    await this.executeCustomCmd(cmd);
  }

  async rosaLoginViaServiceAccount(
    clientId: string,
    clientSecret: string,
    env: string,
  ): Promise<void> {
    const cmd = `rosa login --env ${env} --client-id ${clientId} --client-secret ${clientSecret}`;
    await this.executeCustomCmd(cmd);
  }

  async executeCustomCmd(cmd: string): Promise<any> {
    const fileName = process.env.ROSACLI_LOGS || 'cli-logs.txt';

    try {
      const result = await execAsync(cmd);

      // Log the command and results
      await writeFile(fileName, '\n------------------', { flag: 'a+' });
      await writeFile(fileName, `\ncommand : ${cmd}`, { flag: 'a+' });
      await writeFile(fileName, `\nresult : ${result.stdout}`, { flag: 'a+' });
      await writeFile(fileName, `\nerror : ${result.stderr || 'none'}`, { flag: 'a+' });
      await writeFile(fileName, '\n------------------', { flag: 'a+' });

      return result;
    } catch (error) {
      // Log the error
      await writeFile(fileName, '\n------------------', { flag: 'a+' });
      await writeFile(fileName, `\ncommand : ${cmd}`, { flag: 'a+' });
      await writeFile(fileName, `\nerror : ${error}`, { flag: 'a+' });
      await writeFile(fileName, '\n------------------', { flag: 'a+' });

      throw error;
    }
  }
}
