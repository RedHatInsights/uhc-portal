import React, { ComponentProps } from 'react';

import { render, screen, userEvent } from '~/testUtils';

import AWSAccountRolesError from './AWSAccountRolesError';

const defaultProps: ComponentProps<typeof AWSAccountRolesError> = {
  getAWSAccountRolesARNsResponse: {
    fulfilled: true,
    error: false,
    pending: false,
    data: [],
  },
  isHypershiftSelected: false,
  isMissingOCMRole: false,
  onRefreshOCMRole: jest.fn(),
};

describe('<AWSAccountRolesError />', () => {
  describe('no_console role', () => {
    it('shows danger alert when isNoConsoleRole is true', () => {
      render(<AWSAccountRolesError {...defaultProps} isNoConsoleRole />);

      expect(screen.getByText('OCM role has limited permissions')).toBeInTheDocument();
      expect(screen.getByText(/was created without console permissions/i)).toBeInTheDocument();
      expect(screen.getByText('Learn more about OCM role permissions')).toBeInTheDocument();
    });

    it('does not show no_console alert when isNoConsoleRole is false', () => {
      render(<AWSAccountRolesError {...defaultProps} isNoConsoleRole={false} />);

      expect(screen.queryByText('OCM role has limited permissions')).not.toBeInTheDocument();
    });

    it('shows Refresh OCM role button and calls onRefreshOCMRole when clicked', async () => {
      const onRefreshOCMRole = jest.fn();
      render(
        <AWSAccountRolesError
          {...defaultProps}
          isNoConsoleRole
          onRefreshOCMRole={onRefreshOCMRole}
        />,
      );

      const button = screen.getByRole('button', { name: /refresh ocm role/i });
      expect(button).toBeInTheDocument();
      await userEvent.click(button);
      expect(onRefreshOCMRole).toHaveBeenCalledTimes(1);
    });

    it('disables Refresh OCM role button while OCM role is pending', () => {
      render(
        <AWSAccountRolesError
          {...defaultProps}
          isNoConsoleRole
          onRefreshOCMRole={jest.fn()}
          isOCMRolePending
        />,
      );

      expect(screen.getByRole('button', { name: /refresh ocm role/i })).toBeDisabled();
    });

    it('takes precedence over isOCMRoleError', () => {
      render(<AWSAccountRolesError {...defaultProps} isNoConsoleRole isOCMRoleError />);

      expect(screen.getByText('OCM role has limited permissions')).toBeInTheDocument();
      expect(screen.queryByText('Cannot detect an OCM role')).not.toBeInTheDocument();
    });

    it('takes precedence over other error states', () => {
      render(
        <AWSAccountRolesError
          {...defaultProps}
          getAWSAccountRolesARNsResponse={{
            pending: false,
            fulfilled: false,
            error: true,
            internalErrorCode: 'CLUSTERS-MGMT-400',
          }}
          isMissingOCMRole
          isNoConsoleRole
        />,
      );

      expect(screen.getByText('OCM role has limited permissions')).toBeInTheDocument();
      expect(screen.queryByText('Cannot detect an OCM role')).not.toBeInTheDocument();
    });
  });

  describe('isOCMRoleError', () => {
    it('shows cannot-detect-OCM-role alert when isOCMRoleError is true', () => {
      render(<AWSAccountRolesError {...defaultProps} isOCMRoleError />);

      expect(screen.getByText('Cannot detect an OCM role')).toBeInTheDocument();
    });

    it('does not show OCM role error when isOCMRoleError is false', () => {
      render(<AWSAccountRolesError {...defaultProps} isOCMRoleError={false} />);

      expect(screen.queryByText('Cannot detect an OCM role')).not.toBeInTheDocument();
    });
  });
});
