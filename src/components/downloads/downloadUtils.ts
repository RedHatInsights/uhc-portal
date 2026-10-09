import { has } from 'lodash';

import {
  architectureOptions,
  architectures,
  operatingSystemOptions,
  operatingSystems,
  urls as URLS,
} from '~/common/installLinks.mjs';

/**
 * @returns User's OS (one of `operatingSystems` keys), or null if detection failed.
 */
const detectOS = (): string | null => {
  const { platform } = window.navigator;
  const macOSPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
  const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];

  if (macOSPlatforms.indexOf(platform) !== -1) {
    return operatingSystems.mac;
  }
  if (windowsPlatforms.indexOf(platform) !== -1) {
    return operatingSystems.windows;
  }
  if (/Linux/.test(platform)) {
    return operatingSystems.linux;
  }
  return null;
};

/**
 * Returns relevant subset from `architectureOptions`.
 */
const architecturesForToolOS = (
  urls: typeof URLS,
  tool: string,
  channel: string,
  OS: string | null,
): { value: string; label: string; path: string }[] =>
  architectureOptions.filter(({ value: architecture }) =>
    has(urls, [tool, channel, architecture, OS ?? '']),
  );

/**
 * Default architecture for a tool/OS.
 * On macOS, prefer arm (aarch64) when that binary exists; otherwise first available.
 */
const defaultArchitectureForOS = (
  urls: typeof URLS,
  tool: string,
  channel: string,
  OS: string | null,
): string | undefined => {
  const options = architecturesForToolOS(urls, tool, channel, OS);
  if (OS === operatingSystems.mac) {
    const armOption = options.find(({ value }) => value === architectures.arm);
    if (armOption) {
      return armOption.value;
    }
  }
  return options[0]?.value;
};

/**
 * Returns relevant subset of `architectureOptions`
 * (not all of them valid for currently chosen OS, but form _some_ OS).
 */
const allArchitecturesForTool = (urls: typeof URLS, tool: string, channel: string) =>
  architectureOptions.filter(({ value: architecture }) =>
    operatingSystemOptions.find(({ value: OS }) => has(urls, [tool, channel, architecture, OS])),
  );

/**
 * Returns relevant subset of `operatingSystemOptions`.
 */
const allOperatingSystemsForTool = (
  urls: typeof URLS,
  tool: string,
  channel: string,
): { value: string; label: string }[] =>
  operatingSystemOptions.filter(({ value: OS }) =>
    architectureOptions.find(({ value: architecture }) =>
      has(urls, [tool, channel, architecture, OS]),
    ),
  );

/**
 * @param tool - one of `installLinks.tools`.
 * @param detectedOS - result of detectOS(), injected for testing.
 * @returns {OS, architecture}
 */
const initialSelection = (
  urls: typeof URLS,
  tool: string,
  channel: string,
  detectedOS: string | null,
): { OS: string | null; architecture?: string } => {
  // Start with an OS and architecture chosen so that some users can
  // click Download directly without having to change selections.
  const OSes = allOperatingSystemsForTool(urls, tool, channel).map((os) => os.value);
  const OS = detectedOS && OSes.includes(detectedOS) ? detectedOS : OSes?.[0];
  const architecture = defaultArchitectureForOS(urls, tool, channel, OS);
  return { OS, architecture };
};

export {
  detectOS,
  architecturesForToolOS,
  defaultArchitectureForOS,
  allArchitecturesForTool,
  allOperatingSystemsForTool,
  initialSelection,
};
