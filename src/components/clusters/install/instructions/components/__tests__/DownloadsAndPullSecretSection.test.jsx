import React from 'react';

import { checkAccessibility, screen, withState } from '~/testUtils';

import { channels, tools } from '../../../../../../common/installLinks.mjs';
import githubReleasesMock from '../../../githubReleases.mock';
import DownloadsAndPullSecretSection from '../DownloadsAndPullSecretSection';

jest.mock('~/redux/actions', () => ({
  __esModule: true,
  tollboothActions: {
    createAuthToken: jest.fn().mockResolvedValue('foo'),
  },
  githubActions: {
    getLatestRelease: jest.fn(),
  },
}));

describe('<DownloadsAndPullSecretSection />', () => {
  const defaultProps = {
    tool: tools.X86INSTALLER,
    channel: channels.STABLE,
  };

  describe('with token', () => {
    const token = { auths: { foo: 'bar' } };
    it('is accessible', async () => {
      const { container } = withState(githubReleasesMock).render(
        <DownloadsAndPullSecretSection {...defaultProps} token={token} />,
      );

      expect(screen.getByRole('button', { name: 'Download pull secret' })).not.toHaveAttribute(
        'aria-disabled',
      );

      await checkAccessibility(container);
    });
  });

  describe('with error', () => {
    const badToken = { error: 'my error' };

    it('is accessible', async () => {
      const { container } = withState(githubReleasesMock).render(
        <DownloadsAndPullSecretSection {...defaultProps} token={badToken} />,
      );

      expect(screen.getByRole('button', { name: 'Download pull secret' })).not.toBeEnabled();

      await checkAccessibility(container);
    });
  });
});
