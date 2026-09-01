import React from 'react';

import supportLinks from '~/common/supportLinks.mjs';
import { useFetchGetOCMRole } from '~/queries/RosaWizardQueries/useFetchGetOCMRole';
import { checkAccessibility, render, screen } from '~/testUtils';

import { MissingOCMRoleAlert, MissingOCMRoleAlertContent } from './MissingOCMRoleAlert';

jest.mock('~/queries/RosaWizardQueries/useFetchGetOCMRole', () => ({
  useFetchGetOCMRole: jest.fn(),
}));

const mockUseFetchGetOCMRole = useFetchGetOCMRole as jest.Mock;

const AWS_ACCOUNT_ID = '123456789012';

const ocmRoleResponse = ({
  isError = false,
  errorCode,
}: {
  isError?: boolean;
  errorCode?: number;
} = {}) => ({
  data: isError ? undefined : { arn: 'arn:aws:iam::123456789012:role/OCM-Role' },
  isError,
  error: isError ? { errorCode } : null,
  isPending: false,
  isSuccess: !isError,
  status: isError ? 'error' : 'success',
});

describe('<MissingOCMRoleAlertContent />', () => {
  it('shows the warning banner copy and knowledge base link', () => {
    render(<MissingOCMRoleAlertContent />);

    expect(
      screen.getByRole('heading', {
        name: /The organization that owns this cluster does not currently have an OCM Role configured for the AWS account the cluster is deployed to/,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/The OCM role is required by October 1, 2026/i)).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: `${supportLinks.OCM_ROLE_KB} (new window or tab)`,
      }),
    ).toHaveAttribute('href', supportLinks.OCM_ROLE_KB);
  });

  it('is accessible', async () => {
    const { container } = render(<MissingOCMRoleAlertContent />);

    await checkAccessibility(container);
  });
});

describe('<MissingOCMRoleAlert />', () => {
  beforeEach(() => {
    mockUseFetchGetOCMRole.mockReturnValue(ocmRoleResponse());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows the warning banner when a ROSA STS cluster has no linked OCM role', () => {
    mockUseFetchGetOCMRole.mockReturnValue(ocmRoleResponse({ isError: true, errorCode: 404 }));

    render(<MissingOCMRoleAlert isRosaSts awsAccountId={AWS_ACCOUNT_ID} />);

    expect(
      screen.getByText(
        'The organization that owns this cluster does not currently have an OCM Role configured for the AWS account the cluster is deployed to.',
      ),
    ).toBeInTheDocument();
  });

  it('does not show the banner when an OCM role is already linked', () => {
    render(<MissingOCMRoleAlert isRosaSts awsAccountId={AWS_ACCOUNT_ID} />);

    expect(
      screen.queryByText(
        'The organization that owns this cluster does not currently have an OCM Role configured for the AWS account the cluster is deployed to.',
      ),
    ).not.toBeInTheDocument();
  });

  it('does not show the banner for OSD (AWS) clusters', () => {
    mockUseFetchGetOCMRole.mockReturnValue(ocmRoleResponse({ isError: true, errorCode: 404 }));

    render(<MissingOCMRoleAlert isRosaSts={false} awsAccountId={AWS_ACCOUNT_ID} />);

    expect(mockUseFetchGetOCMRole).toHaveBeenCalledWith('');
    expect(
      screen.queryByText(
        'The organization that owns this cluster does not currently have an OCM Role configured for the AWS account the cluster is deployed to.',
      ),
    ).not.toBeInTheDocument();
  });

  it('does not show the banner when getOCMRole fails with a non-404 error', () => {
    mockUseFetchGetOCMRole.mockReturnValue(ocmRoleResponse({ isError: true, errorCode: 400 }));

    render(<MissingOCMRoleAlert isRosaSts awsAccountId={AWS_ACCOUNT_ID} />);

    expect(
      screen.queryByText(
        'The organization that owns this cluster does not currently have an OCM Role configured for the AWS account the cluster is deployed to.',
      ),
    ).not.toBeInTheDocument();
  });

  it('requests the OCM role using the cluster AWS account ID when the cluster is ROSA STS', () => {
    render(<MissingOCMRoleAlert isRosaSts awsAccountId={AWS_ACCOUNT_ID} />);

    expect(mockUseFetchGetOCMRole).toHaveBeenCalledWith(AWS_ACCOUNT_ID);
  });
});
