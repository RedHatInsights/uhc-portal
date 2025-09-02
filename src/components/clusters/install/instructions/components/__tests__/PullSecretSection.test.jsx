import React from 'react';

import { checkAccessibility, screen, withState } from '~/testUtils';

import githubReleasesMock from '../../../githubReleases.mock';
import PullSecretSection from '../PullSecretSection';

jest.mock('~/redux/actions', () => ({
  __esModule: true,
  tollboothActions: {
    createAuthToken: jest.fn().mockResolvedValue('foo'),
  },
  githubActions: {
    getLatestRelease: jest.fn(),
  },
}));

describe('<PullSecretSection />', () => {
  describe('with token', () => {
    const token = { auths: { foo: 'bar' } };

    it('is accessible ', async () => {
      const { container } = withState(githubReleasesMock).render(
        <PullSecretSection token={token} />,
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
        <PullSecretSection token={badToken} />,
      );

      expect(screen.getByRole('button', { name: 'Download pull secret' })).not.toBeEnabled();

      await checkAccessibility(container);
    });
  });
});
