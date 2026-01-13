/**
 * Test links helper - provides a clean API to access URLs from installLinks.mjs
 * This wrapper:
 * - Provides a simpler import for test files
 * - Adds helper functions for download URLs
 * - Isolates tests from installLinks.mjs structure changes
 */
import links, {
  urls,
  tools,
  channels,
  architectures,
  operatingSystems,
} from '../../src/common/installLinks.mjs';

// Re-export the main links object
export { default as links } from '../../src/common/installLinks.mjs';

// Helper types for download options
type Tool = 'rosa' | 'odo' | 'oc' | 'helm' | 'ocm';
type OS = 'linux' | 'mac' | 'windows';
type Arch = 'x86' | 'arm' | 'ppc' | 's390x';

// Map simplified names to installLinks constants
const osMap: Record<OS, string> = {
  linux: operatingSystems.linux,
  mac: operatingSystems.mac,
  windows: operatingSystems.windows,
};

const archMap: Record<Arch, string> = {
  x86: architectures.x86,
  arm: architectures.arm,
  ppc: architectures.ppc,
  s390x: architectures.s390x,
};

/**
 * Get download URL for a CLI tool
 * @example getDownloadUrl('rosa', 'linux', 'x86') // Returns ROSA Linux x86 download URL
 */
export function getDownloadUrl(tool: Tool, os: OS, arch: Arch = 'x86'): string {
  const toolMap: Record<Tool, string> = {
    rosa: tools.ROSA,
    odo: tools.ODO,
    oc: tools.OC,
    helm: tools.HELM,
    ocm: tools.OCM,
  };

  const toolKey = toolMap[tool];
  const osKey = osMap[os];
  const archKey = archMap[arch];

  return urls[toolKey]?.[channels.STABLE]?.[archKey]?.[osKey] ?? '';
}

// Commonly used link groups for tests
export const rosaLinks = {
  awsFedramp: links.ROSA_AWS_FEDRAMP,
  fedrampRequestForm: links.FEDRAMP_ACCESS_REQUEST_FORM,
  awsConsoleGetStarted: links.AWS_CONSOLE_ROSA_HOME_GET_STARTED,
  awsGetStarted: links.AWS_ROSA_GET_STARTED,
  cliDocs: links.ROSA_CLI_DOCS,
  awsCli: links.AWS_CLI,
  awsCliConfigure: links.AWS_CLI_CONFIGURATION_INSTRUCTIONS,
  loginSso: links.LEARN_MORE_SSO_ROSA,
  awsStsManual: links.AWS_CLI_GETTING_STARTED_MANUAL,
  createNetwork: links.ROSA_CREATE_NETWORK,
  createVpc: links.CREATE_VPC_WAYS,
  hcpCliUrl: links.ROSA_HCP_CLI_URL,
  terraformUrl: links.TERRAFORM_ROSA_HCP_URL,
  terraformRegistry: links.TERRAFORM_REGISTRY_ROSA_HCP,
  pricing: links.ROSA_PRICING,
  learnMore: links.AWS_OPENSHIFT_LEARN_MORE,
};

export const osdLinks = {
  googleMarketplace: links.OSD_GOOGLE_MARKETPLACE,
  interactiveWalkthrough: links.OSD_INTERACTIVE_WALKTHROUGH,
  quickstart: links.OSD_QUICKSTART,
  whatIsOsd: links.WHAT_IS_OSD,
  pricing: links.OSD_PRICING,
  learnMore: links.LEARN_MORE_OSD,
};

export const commonLinks = {
  whatIsOpenshift: links.WHAT_IS_OPENSHIFT,
  azureGetStarted: links.AZURE_OPENSHIFT_GET_STARTED,
  nonTestedPlatforms: links.INSTALL_GENERIC_NON_TESTED_PLATFORMS,
};
