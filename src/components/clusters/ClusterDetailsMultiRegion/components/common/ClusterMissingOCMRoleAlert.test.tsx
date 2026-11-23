import React from 'react';

import { useGlobalState } from '~/redux/hooks';
import { render, screen } from '~/testUtils';
import { ClusterFromSubscription } from '~/types/types';

import { ClusterMissingOCMRoleAlert } from './ClusterMissingOCMRoleAlert';

jest.mock('~/redux/hooks', () => ({
  useGlobalState: jest.fn(),
}));

jest.mock('./MissingOCMRoleAlert', () => ({
  MissingOCMRoleAlert: ({ awsAccountId }: { awsAccountId: string }) => (
    <div data-testid="missing-ocm-role-alert">OCM Role Alert {awsAccountId}</div>
  ),
}));

const mockUseGlobalState = useGlobalState as jest.Mock;

const CLUSTER_ORG_ID = '1MKVU4otCIuogoLtgtyU6wajxjW';
const DIFFERENT_ORG_ID = 'differentOrgId123';
const AWS_ACCOUNT_ID = '123456789012';

const rosaStsCluster = {
  product: { id: 'ROSA' },
  aws: { sts: { enabled: true } },
  subscription: {
    organization_id: CLUSTER_ORG_ID,
    cloud_account_id: AWS_ACCOUNT_ID,
  },
} as ClusterFromSubscription;

const mockUserOrg = (orgId?: string) => {
  mockUseGlobalState.mockImplementation((selector: (state: unknown) => unknown) =>
    selector({
      userProfile: { organization: { details: orgId ? { id: orgId } : undefined } },
    }),
  );
};

describe('<ClusterMissingOCMRoleAlert />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows the OCM role alert when the user is in the same org as the cluster', () => {
    mockUserOrg(CLUSTER_ORG_ID);

    render(<ClusterMissingOCMRoleAlert cluster={rosaStsCluster} />);

    expect(screen.getByTestId('missing-ocm-role-alert')).toHaveTextContent(AWS_ACCOUNT_ID);
  });

  it('does not show the OCM role alert when the user is in a different org than the cluster', () => {
    mockUserOrg(DIFFERENT_ORG_ID);

    render(<ClusterMissingOCMRoleAlert cluster={rosaStsCluster} />);

    expect(screen.queryByTestId('missing-ocm-role-alert')).not.toBeInTheDocument();
  });

  it('does not show the OCM role alert when the user org ID is not yet loaded', () => {
    mockUserOrg();

    render(<ClusterMissingOCMRoleAlert cluster={rosaStsCluster} />);

    expect(screen.queryByTestId('missing-ocm-role-alert')).not.toBeInTheDocument();
  });

  it('does not show the OCM role alert for a non-ROSA cluster', () => {
    mockUserOrg(CLUSTER_ORG_ID);

    render(
      <ClusterMissingOCMRoleAlert
        cluster={{ ...rosaStsCluster, product: { id: 'OSD' } } as ClusterFromSubscription}
      />,
    );

    expect(screen.queryByTestId('missing-ocm-role-alert')).not.toBeInTheDocument();
  });

  it('does not show the OCM role alert when STS is not enabled', () => {
    mockUserOrg(CLUSTER_ORG_ID);

    render(
      <ClusterMissingOCMRoleAlert
        cluster={{ ...rosaStsCluster, aws: { sts: { enabled: false } } } as ClusterFromSubscription}
      />,
    );

    expect(screen.queryByTestId('missing-ocm-role-alert')).not.toBeInTheDocument();
  });

  it('does not show the OCM role alert when there is no AWS account ID', () => {
    mockUserOrg(CLUSTER_ORG_ID);

    render(
      <ClusterMissingOCMRoleAlert
        cluster={
          {
            ...rosaStsCluster,
            subscription: { organization_id: CLUSTER_ORG_ID },
          } as ClusterFromSubscription
        }
      />,
    );

    expect(screen.queryByTestId('missing-ocm-role-alert')).not.toBeInTheDocument();
  });
});
