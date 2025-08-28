import * as React from 'react';

import { subscriptionCapabilities } from '~/common/subscriptionCapabilities';
import { CLI_SSO_AUTHORIZATION } from '~/queries/featureGates/featureConstants';
import accountsService from '~/services/accountsService';
import { mockRestrictedEnv, mockUseChrome, mockUseFeatureGate, render, screen } from '~/testUtils';

import StepCreateAWSAccountRoles from './StepCreateAWSAccountRoles';

jest.mock('~/services/accountsService');

describe('<StepCreateAWSAccountRoles />', () => {
  mockUseChrome();

  it('should display ROSA CLI SSO login command', () => {
    (accountsService.getOrganization as jest.Mock).mockResolvedValue({
      data: {
        organization: {
          capabilities: [
            {
              name: subscriptionCapabilities.RESTRICT_OFFLINE_TOKENS,
              value: 'false',
            },
          ],
        },
      },
    });

    mockUseFeatureGate([[CLI_SSO_AUTHORIZATION, true]]);
    const props = {
      offlineToken: 'fake-token',
      setOfflineToken: jest.fn(),
    };

    render(<StepCreateAWSAccountRoles {...props} />);
    const ROSACLILoginCommand = screen.getByText(
      'To authenticate, run this command and enter your Red Hat login credentials via SSO:',
    );
    expect(ROSACLILoginCommand).toBeInTheDocument();
  });

  it('should not display offline tokens deprecation message', () => {
    mockUseFeatureGate([[CLI_SSO_AUTHORIZATION, false]]);
    const props = {
      offlineToken: 'fake-token',
      setOfflineToken: jest.fn(),
    };

    render(<StepCreateAWSAccountRoles {...props} />);
    const DeprecationAlert = screen.queryByText(
      'Logging in with offline tokens is being deprecated',
    );
    expect(DeprecationAlert).not.toBeInTheDocument();
  });

  describe('in Restricted env', () => {
    const isRestrictedEnv = mockRestrictedEnv();

    const getRefreshTokenMock = jest.fn(() =>
      Promise.resolve({
        data: {
          scope: 'scope',
          refresh_token: 'refresh_token',
        },
      }),
    );

    mockUseChrome({
      auth: {
        getRefreshToken: getRefreshTokenMock,
        getAuthToken: jest.fn(),
      },
    });

    afterEach(() => {
      isRestrictedEnv.mockReturnValue(true);
    });

    it('should not display offline tokens deprecation message', () => {
      mockUseFeatureGate([[CLI_SSO_AUTHORIZATION, false]]);
      const props = {
        offlineToken: 'fake-token',
        setOfflineToken: jest.fn(),
      };

      isRestrictedEnv.mockReturnValue(true);
      render(<StepCreateAWSAccountRoles {...props} />);

      const DeprecationAlert = screen.queryByText('Logging in with offline tokens is deprecated');
      expect(DeprecationAlert).not.toBeInTheDocument();
    });

    it('should not display ROSA SSO link', () => {
      const props = {
        offlineToken: 'fake-token',
        setOfflineToken: jest.fn(),
      };

      isRestrictedEnv.mockReturnValue(true);
      render(<StepCreateAWSAccountRoles {...props} />);

      const ROSACliLink = screen.queryByText(
        'To authenticate, run this command and enter your Red Hat login credentials via SSO:',
      );
      expect(ROSACliLink).not.toBeInTheDocument();
    });
  });
});
