/**
 * Helper for constructing CLI tool download URLs from installLinks.mjs.
 * Wraps the nested url lookup (tool → channel → arch → os) with a typed API.
 */
import {
  urls,
  tools,
  channels,
  architectures,
  operatingSystems,
} from '../../src/common/installLinks.mjs';

type Tool = 'rosa' | 'odo' | 'oc' | 'helm' | 'ocm';
type OS = 'linux' | 'mac' | 'windows';
type Arch = 'x86' | 'arm' | 'ppc' | 's390x';

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
 * Get download URL for a CLI tool.
 * @example getDownloadUrl('rosa', 'linux', 'x86')
 * @throws Error if URL mapping is not found (fail fast on misconfiguration)
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

  const url = urls[toolKey]?.[channels.STABLE]?.[archKey]?.[osKey];

  if (!url) {
    throw new Error(
      `Download URL not found for tool="${tool}", os="${os}", arch="${arch}". ` +
        `Check installLinks.mjs configuration for missing mapping.`,
    );
  }

  return url;
}
