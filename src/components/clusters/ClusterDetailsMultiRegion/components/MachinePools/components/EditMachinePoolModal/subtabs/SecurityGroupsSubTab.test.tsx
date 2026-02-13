import { mockUseFormState, render, renderHook, screen } from '~/testUtils';
import { ClusterFromSubscription } from '~/types/types';

import { useSecurityGroupsSubTab } from './SecurityGroupsSubTab';

// Mock dependencies
jest.mock('~/components/clusters/wizards/hooks/useFormState');

jest.mock('~/components/clusters/common/useAWSVPCFromCluster', () => ({
  useAWSVPCFromCluster: () => ({ isLoading: true }),
}));

describe('SecurityGroupsSubTab', () => {
  const mockCluster: ClusterFromSubscription = {
    id: 'test-cluster',
    cloud_provider: { id: 'aws' },
    aws: {
      subnet_ids: ['subnet-01234567890123456', 'subnet-01234567890123457'],
    },
  } as ClusterFromSubscription;

  const defaultProps = {
    cluster: mockCluster,
    isReadOnly: false,
    tabKey: 4,
    initialTabContentShown: true,
  };

  const checkForError = (show: boolean) => {
    if (show) {
      expect(screen.getByLabelText('Validation error on this tab')).toBeInTheDocument();
    } else {
      expect(screen.queryByLabelText('Validation error on this tab')).not.toBeInTheDocument();
    }
  };

  beforeEach(() => {
    mockUseFormState({
      values: { securityGroupIds: ['sg-01234567890123456'] },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('tab', () => {
    it('displays tab when aws cluster with subnets', () => {
      const { result } = renderHook(() => useSecurityGroupsSubTab(defaultProps));
      const [tabs] = result.current;

      render(tabs({}));
      expect(screen.getByRole('tab', { name: 'Security groups' })).toBeInTheDocument();
      checkForError(false);
    });

    it('does not display tab when cluster is not AWS', () => {
      const nonAWSCluster = { ...mockCluster, cloud_provider: { id: 'gcp' }, aws: undefined };
      const { result } = renderHook(() =>
        useSecurityGroupsSubTab({ ...defaultProps, cluster: nonAWSCluster }),
      );
      const [tabs] = result.current;

      const { container } = render(tabs({}));
      expect(container).toBeEmptyDOMElement();
    });

    it('shows error when a validation error is on tab', () => {
      const { result } = renderHook(() => useSecurityGroupsSubTab(defaultProps));
      const [tabs] = result.current;

      render(tabs({ securityGroupIds: ['some error'] }));
      expect(screen.getByRole('tab')).toBeInTheDocument();
      checkForError(true);
    });

    it('does not show error when no validation error is on tab', () => {
      const { result } = renderHook(() => useSecurityGroupsSubTab(defaultProps));
      const [tabs] = result.current;

      render(tabs({ myOtherField: ['some error'] }));
      expect(screen.getByRole('tab')).toBeInTheDocument();
      checkForError(false);
    });
  });

  describe('tab content', () => {
    it('displays the correct content when  aws cluster with subnets', () => {
      const { result } = renderHook(() => useSecurityGroupsSubTab(defaultProps));
      const [_tab, content] = result.current;

      render(content());

      expect(screen.getByRole('tabpanel')).toBeInTheDocument();

      expect(screen.getByText('Loading security groups')).toBeInTheDocument();
    });

    it('does to display the correct content when not aws cluster', () => {
      const nonAWSCluster = { ...mockCluster, cloud_provider: { id: 'gcp' }, aws: undefined };
      const { result } = renderHook(() =>
        useSecurityGroupsSubTab({ ...defaultProps, cluster: nonAWSCluster }),
      );
      const [_tabs, content] = result.current;

      const { container } = render(content());
      expect(container).toBeEmptyDOMElement();
    });
  });
});
