import { AWS_TAGS_NEW_MP } from '~/queries/featureGates/featureConstants';
import { MachineTypesResponse } from '~/queries/types';
import { mockUseFeatureGate, render, renderHook, screen } from '~/testUtils';
import { MachinePool } from '~/types/clusters_mgmt.v1';
import { ClusterFromSubscription } from '~/types/types';

import { useLabelsTagsTaintsSubTab } from './LabelsTagsTaintsSubTab';

jest.mock('formik', () => ({
  ...jest.requireActual('formik'),
  useField: jest.fn().mockReturnValue([
    {
      name: 'labels',
      value: [],
    },
  ]),
}));

describe('LabelsTagsTaintsSubTab', () => {
  const mockCluster: ClusterFromSubscription = {
    id: 'test-cluster',
    cloud_provider: { id: 'aws' },
  } as ClusterFromSubscription;

  const mockMachinePools: MachinePool[] = [
    {
      id: 'mp-1',
      instance_type: 'm5.large',
    } as MachinePool,
  ];

  const mockMachineTypes: MachineTypesResponse = {
    machine_types: [
      {
        id: 'm5.large',
        name: 'm5.large',
      },
    ],
  } as MachineTypesResponse;

  const defaultProps = {
    cluster: mockCluster,
    machinePools: mockMachinePools,
    currentMachinePoolId: 'mp-1',
    machineTypes: mockMachineTypes,
    tabKey: 3,
    initialTabContentShown: true,
    isROSAHCP: true,
    isNewMachinePool: true,
  };

  const checkForError = (show: boolean) => {
    if (show) {
      expect(screen.getByLabelText('Validation error on this tab')).toBeInTheDocument();
    } else {
      expect(screen.queryByLabelText('Validation error on this tab')).not.toBeInTheDocument();
    }
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('tab', () => {
    it('displays tab with standard title when AWS Tags feature is disabled', () => {
      mockUseFeatureGate([[AWS_TAGS_NEW_MP, false]]);
      const { result } = renderHook(() => useLabelsTagsTaintsSubTab(defaultProps));
      const [tabs] = result.current;

      render(tabs({}));
      expect(screen.getByRole('tab')).toHaveTextContent('Labels and Taints');
      checkForError(false);
    });

    it('displays tab with AWS Tags title when AWS Tags feature is enabled', () => {
      mockUseFeatureGate([[AWS_TAGS_NEW_MP, true]]);
      const { result } = renderHook(() => useLabelsTagsTaintsSubTab(defaultProps));
      const [tabs] = result.current;

      render(tabs({}));
      expect(screen.getByRole('tab')).toHaveTextContent('Labels, Taints and AWS Tags');
      checkForError(false);
    });

    it('shows error when a validation error is on labels field', () => {
      mockUseFeatureGate([[AWS_TAGS_NEW_MP, false]]);
      const { result } = renderHook(() => useLabelsTagsTaintsSubTab(defaultProps));
      const [tabs] = result.current;

      render(tabs({ labels: 'some error' }));
      expect(screen.getByRole('tab')).toBeInTheDocument();
      checkForError(true);
    });

    it('does not show error when validation error is on field outside of tab', () => {
      mockUseFeatureGate([[AWS_TAGS_NEW_MP, false]]);
      const { result } = renderHook(() => useLabelsTagsTaintsSubTab(defaultProps));
      const [tabs] = result.current;

      render(tabs({ myOtherField: 'some error' }));
      expect(screen.getByRole('tab')).toBeInTheDocument();
      checkForError(false);
    });
  });

  describe('tab content', () => {
    it('displays the correct content', () => {
      mockUseFeatureGate([[AWS_TAGS_NEW_MP, false]]);
      const { result } = renderHook(() => useLabelsTagsTaintsSubTab(defaultProps));
      const [_tab, content] = result.current;

      render(content());
      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
      expect(screen.getByText('Node labels')).toBeInTheDocument();
      expect(screen.getByText('Taints')).toBeInTheDocument();
    });
  });
});
