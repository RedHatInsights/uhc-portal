import React from 'react';

import { subscriptionCapabilities } from '~/common/subscriptionCapabilities';
import accountsService from '~/services/accountsService';
import { checkAccessibility, mockRestrictedEnv, render, screen, waitFor } from '~/testUtils';

import {
  architectures,
  channels,
  operatingSystems,
  tools,
  urls,
} from '../../../../common/installLinks.mjs';
import { architecturesForToolOS } from '../../downloadUtils';
import DownloadsPage from '../DownloadsPage';

const { linux, windows, mac } = operatingSystems;
const { arm, ppc, s390x, x86 } = architectures;

jest.mock('~/services/accountsService');

describe('architecturesForToolOS', () => {
  it('includes arm for odo Linux', () => {
    const values = architecturesForToolOS(urls, tools.ODO, channels.STABLE, linux).map(
      (o) => o.value,
    );
    expect(values).toEqual([x86, arm, ppc, s390x]);
  });

  it('has only x86 for odo Windows', () => {
    const values = architecturesForToolOS(urls, tools.ODO, channels.STABLE, windows).map(
      (o) => o.value,
    );
    expect(values).toEqual([x86]);
  });

  it('has only x86 for crc macOS', () => {
    const values = architecturesForToolOS(urls, tools.CRC, channels.STABLE, mac).map(
      (o) => o.value,
    );
    expect(values).toEqual([x86]);
  });
});

describe('<DownloadsPage>', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it.skip('is accessible', async () => {
    const { container } = render(<DownloadsPage />);
    // This fails with a   "IDs used in ARIA and labels must be unique (duplicate-id-aria)" error
    await checkAccessibility(container);
  });

  it('expand all', async () => {
    const { user } = render(<DownloadsPage />);

    const expandBtn = screen.getByRole('button', { name: /expand all/i });

    await user.click(expandBtn);

    const expandButtons = screen.getAllByRole('button', { name: /details/i });
    expandButtons.forEach((button) => {
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });
  });

  it('Fetches organization data', async () => {
    render(<DownloadsPage />);
    await waitFor(() => {
      expect(accountsService.getCurrentAccount).toHaveBeenCalled();
    });
    expect(accountsService.getOrganization).toHaveBeenCalled();
  });

  it('Hides api token section if using offline tokens is restricted', async () => {
    (accountsService.getOrganization as jest.Mock).mockResolvedValue({
      data: {
        organization: {
          capabilities: [
            {
              inherited: false,
              name: subscriptionCapabilities.ENABLE_DATA_SOVEREIGN_REGIONS,
              value: 'true',
            },
            {
              inherited: false,
              name: subscriptionCapabilities.RESTRICT_OFFLINE_TOKENS,
              value: 'true',
            },
            {
              inherited: false,
              name: subscriptionCapabilities.SUBSCRIBED_OCP,
              value: 'true',
            },
          ],
        },
      },
    });
    render(<DownloadsPage />);

    await waitFor(() => {
      expect(screen.queryByText('OpenShift Cluster Manager API Token')).not.toBeInTheDocument();
    });
  });

  describe('in restricted env', () => {
    const isRestrictedEnv = mockRestrictedEnv();
    afterEach(() => {
      isRestrictedEnv.mockReturnValue(false);
    });
    it('renders only OC/ROSA CLI and tokens', async () => {
      isRestrictedEnv.mockReturnValue(true);
      render(<DownloadsPage />);
      expect(await screen.findAllByTestId(/downloads-section-.*/)).toHaveLength(2);

      expect(screen.getByTestId('downloads-section-CLI')).toBeInTheDocument();
      expect(screen.getByTestId('downloads-section-TOKENS')).toBeInTheDocument();

      expect(screen.getAllByTestId(/expandable-row-.*/)).toHaveLength(4);
      expect(screen.getByTestId('expandable-row-oc')).toBeInTheDocument();
      expect(screen.getByTestId('expandable-row-rosa')).toBeInTheDocument();
    });
  });
});
