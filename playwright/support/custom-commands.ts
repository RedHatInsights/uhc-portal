import { Page, Locator } from '@playwright/test';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { writeFile } from 'fs/promises';

const execFileAsync = promisify(execFile);

// Validation helpers to prevent command injection
function validateRosaCommand(cmd: string): string[] {
  // Whitelist of allowed ROSA commands
  const allowedCommands = [
    'rosa',
    'list',
    'describe',
    'create',
    'delete',
    'login',
    'logout',
    'version',
    'whoami',
  ];

  // Parse the command string into parts
  const parts = cmd.trim().split(/\s+/);

  if (parts.length === 0) {
    throw new Error('Empty command not allowed');
  }

  // Verify the first part is 'rosa'
  if (parts[0] !== 'rosa') {
    throw new Error(`Only 'rosa' commands are allowed, got: ${parts[0]}`);
  }

  // Check if the subcommand is in the allowlist
  if (parts.length > 1 && !allowedCommands.includes(parts[1])) {
    throw new Error(`ROSA subcommand '${parts[1]}' is not in the allowlist`);
  }

  return parts;
}

function validateParameter(param: string, paramName: string): string {
  if (!param || typeof param !== 'string') {
    throw new Error(`${paramName} must be a non-empty string`);
  }

  // Check for shell metacharacters that could be used for command injection
  const dangerousChars = /[;&|`$()<>\\"\n\r]/;
  if (dangerousChars.test(param)) {
    throw new Error(`${paramName} contains invalid characters`);
  }

  return param.trim();
}

function validateEnvironment(env: string): string {
  // Whitelist allowed environments
  const allowedEnvs = ['production', 'staging', 'integration', 'stage', 'prod', 'int'];
  const validatedEnv = validateParameter(env, 'environment');

  if (!allowedEnvs.includes(validatedEnv.toLowerCase())) {
    throw new Error(
      `Environment '${env}' is not in the allowlist. Allowed: ${allowedEnvs.join(', ')}`,
    );
  }

  return validatedEnv;
}

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
    // Validate the ROSA command before execution
    const commandParts = validateRosaCommand(cmd);
    await this.executeCustomCmd(commandParts);
  }

  async rosaLoginViaOfflineToken(token: string, env: string): Promise<void> {
    // Validate inputs
    const validatedToken = validateParameter(token, 'token');
    const validatedEnv = validateEnvironment(env);

    // Use array format to prevent command injection
    const commandParts = ['rosa', 'login', '--env', validatedEnv, '--token', validatedToken];
    await this.executeCustomCmd(commandParts);
  }

  async rosaLoginViaServiceAccount(
    clientId: string,
    clientSecret: string,
    env: string,
  ): Promise<void> {
    // Validate inputs
    const validatedClientId = validateParameter(clientId, 'clientId');
    const validatedClientSecret = validateParameter(clientSecret, 'clientSecret');
    const validatedEnv = validateEnvironment(env);

    // Use array format to prevent command injection
    const commandParts = [
      'rosa',
      'login',
      '--env',
      validatedEnv,
      '--client-id',
      validatedClientId,
      '--client-secret',
      validatedClientSecret,
    ];
    await this.executeCustomCmd(commandParts);
  }

  async executeCustomCmd(commandParts: string[]): Promise<any> {
    const fileName = process.env.ROSACLI_LOGS || 'cli-logs.txt';
    const commandString = commandParts.join(' ');

    try {
      // Use execFile instead of exec - it doesn't spawn a shell, making it immune to shell injection
      const [command, ...args] = commandParts;
      const result = await execFileAsync(command, args);

      // Log the command and results
      await writeFile(fileName, '\n------------------', { flag: 'a+' });
      await writeFile(fileName, `\ncommand : ${commandString}`, { flag: 'a+' });
      await writeFile(fileName, `\nresult : ${result.stdout}`, { flag: 'a+' });
      await writeFile(fileName, `\nerror : ${result.stderr || 'none'}`, { flag: 'a+' });
      await writeFile(fileName, '\n------------------', { flag: 'a+' });

      return result;
    } catch (error) {
      // Log the error
      await writeFile(fileName, '\n------------------', { flag: 'a+' });
      await writeFile(fileName, `\ncommand : ${commandString}`, { flag: 'a+' });
      await writeFile(fileName, `\nerror : ${error}`, { flag: 'a+' });
      await writeFile(fileName, '\n------------------', { flag: 'a+' });

      throw error;
    }
  }
}
