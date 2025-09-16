import React from 'react';

import { subscriptionCapabilities } from '~/common/subscriptionCapabilities';
import { CLI_SSO_AUTHORIZATION } from '~/queries/featureGates/featureConstants';
import {
  checkAccessibility,
  mockRestrictedEnv,
  mockUseFeatureGate,
  render,
  screen,
} from '~/testUtils';

import CLILoginPage from './CLILoginPage';
import useOrganization from './useOrganization';

jest.mock('./useOrganization');

describe('CLILoginPage tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  const mockUseOrganization = useOrganization as jest.Mock;
  const isRestrictedEnv = mockRestrictedEnv();
  mockUseFeatureGate([[CLI_SSO_AUTHORIZATION, true]]);

  it('is accessible', async () => {
    mockUseOrganization.mockReturnValue({
      organization: null,
      isLoading: true,
      error: null,
    });
    const { container } = render(<CLILoginPage showToken={false} showPath="test" isRosa={false} />);
    expect(await screen.findByRole('progressbar')).toBeInTheDocument();

    await checkAccessibility(container);
  });

  it('SSO Alert is shown when user is not restricted to offline tokens', async () => {
    isRestrictedEnv.mockReturnValue(false);
    mockUseOrganization.mockReturnValue({
      organization: {
        capabilities: [
          {
            inherited: false,
            name: subscriptionCapabilities.RESTRICT_OFFLINE_TOKENS,
            value: 'false',
          },
        ],
      },
      isLoading: false,
      error: null,
    });
    render(<CLILoginPage showToken={false} showPath="test" isRosa={false} />);

    expect(
      screen.getByText('Still need access to API tokens to authenticate?'),
    ).toBeInTheDocument();
  });

  it('SSO Alert is not shown when user is restricted to offline tokens', async () => {
    isRestrictedEnv.mockReturnValue(false);
    mockUseOrganization.mockReturnValue({
      organization: {
        capabilities: [
          {
            name: subscriptionCapabilities.RESTRICT_OFFLINE_TOKENS,
            value: 'true',
          },
        ],
      },
      isLoading: false,
      error: null,
    });
    render(<CLILoginPage showToken={false} showPath="test" isRosa={false} />);

    expect(screen.queryByText('Still need access to API tokens to authenticate?')).toBeNull();
  });
});
