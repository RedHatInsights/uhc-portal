import React from 'react';
import { get } from 'lodash';

import { urls as URLS } from '~/common/installLinks.mjs';

import DownloadButton from '../clusters/install/instructions/components/DownloadButton';

import ArchitectureDropdown from './DownloadsPage/components/ArchitectureDropdown';
import OperatingSystemDropdown from './DownloadsPage/components/OperatingSystemDropdown';
import {
  allOperatingSystemsForTool,
  defaultArchitectureForOS,
  detectOS,
  initialSelection,
} from './downloadUtils';

/**
 * Renders choice dropdowns + download button with linked behavior.
 * Does not keep state - expects state + callbacks to be passed in.
 * This allows reuse on different pages with different layouts.
 * @param selections - { [tool]: { OS, architecture } }
 * @param setSelections - callback to replace whole `selections` map
 * @param url - either static `installLinks.urls` or result of urlsSelector() with github links.
 * @param tool - one of `tools`
 * @param channel - one of `channels`
 * @param downloadButtonProps - extra props for download button
 * @returns { osDropdown, archDropdown, downloadButton }
 */
const downloadChoice = (
  selections: { [index: string]: { OS: string | null; architecture: string } },
  setSelections: (selections: {}) => void,
  urls: typeof URLS,
  tool: string,
  channel: string,
  downloadButtonProps: { [index: string]: string },
) => {
  const { OS, architecture } =
    selections[tool] || initialSelection(urls, tool, channel, detectOS());
  // Callbacks for dropdowns:
  const onChangeOS = (event: React.FormEvent<HTMLSelectElement>, newOS: string | null) => {
    // Apply the same defaults as initialSelection (mac → arm when available, else first arch).
    const newArchitecture = defaultArchitectureForOS(urls, tool, channel, newOS) ?? architecture;
    setSelections({ ...selections, [tool]: { OS: newOS, architecture: newArchitecture } });
  };

  const onChangeArchitecture = (
    event: React.FormEvent<HTMLSelectElement>,
    newArchitecture: string,
  ) => {
    setSelections({ ...selections, [tool]: { OS, architecture: newArchitecture } });
  };

  // If Github API fetching of last release fails, we can't link to direct download,
  // fallback to navigating to last release page in new tab, where user will pick OS/arch.
  if (allOperatingSystemsForTool(urls, tool, channel).length === 0) {
    const fallback: string = get(urls, [tool, channel, 'fallbackNavigateURL']) as any as string;
    return {
      osDropdown: '', // hide dropdowns
      archDropdown: '',
      downloadButton: (
        <DownloadButton url={fallback} download={false} tool={tool} {...downloadButtonProps} />
      ),
    };
  }

  return {
    osDropdown: (
      <OperatingSystemDropdown
        urls={urls}
        tool={tool}
        channel={channel}
        OS={OS}
        setOS={onChangeOS}
      />
    ),
    archDropdown: (
      <ArchitectureDropdown
        urls={urls}
        tool={tool}
        channel={channel}
        OS={OS}
        architecture={architecture}
        setArchitecture={onChangeArchitecture}
      />
    ),
    downloadButton: (
      <DownloadButton
        url={get(urls, [tool, channel, architecture, OS ?? ''])}
        tool={tool}
        {...downloadButtonProps}
      />
    ),
  };
};

export { downloadChoice };
