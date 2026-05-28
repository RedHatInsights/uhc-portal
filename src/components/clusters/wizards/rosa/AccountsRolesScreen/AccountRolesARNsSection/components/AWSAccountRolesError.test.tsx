import React, { ComponentProps } from 'react';

import { render, screen } from '~/testUtils';

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
};

describe('<AWSAccountRolesError />', () => {
  describe('no_console role', () => {
    it('shows danger alert when isNoConsoleRole is true', () => {
      render(<AWSAccountRolesError {...defaultProps} isNoConsoleRole />);

      expect(screen.getByText('OCM role has limited permissions')).toBeInTheDocument();
      expect(screen.getByText(/was created without console permissions/i)).toBeInTheDocument();
      expect(screen.getByLabelText('Copyable rosa create ocm-role command')).toBeInTheDocument();
      expect(screen.getByText('Learn more about OCM role permissions')).toBeInTheDocument();
    });

    it('does not show no_console alert when isNoConsoleRole is false', () => {
      render(<AWSAccountRolesError {...defaultProps} isNoConsoleRole={false} />);

      expect(screen.queryByText('OCM role has limited permissions')).not.toBeInTheDocument();
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
});
