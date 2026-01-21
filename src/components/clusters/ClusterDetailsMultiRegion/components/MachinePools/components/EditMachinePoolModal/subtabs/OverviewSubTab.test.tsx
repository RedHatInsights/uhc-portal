import React from 'react';
import { Formik } from 'formik';

import {
  GCP_SECURE_BOOT,
  IMDS_SELECTION,
  MAX_NODES_TOTAL_249,
} from '~/queries/featureGates/featureConstants';
import { MachineTypesResponse } from '~/queries/types';
import { mockUseFeatureGate, render, renderHook, screen } from '~/testUtils';
import { MachinePool } from '~/types/clusters_mgmt.v1';
import { ClusterFromSubscription } from '~/types/types';

import { useOverviewSubTab } from './OverviewSubTab';

jest.mock('formik', () => ({
  ...jest.requireActual('formik'),
  useField: jest.fn().mockReturnValue([
    {}, // field
    {
      value: '',
      instanceType: '',
      touched: false,
      error: '',
    },
    { setValue: jest.fn(), setTouched: jest.fn() },
  ]),
  setFieldValue: jest.fn(),
  setValue: jest.fn(),
}));

describe('OverviewSubTab', () => {
  const mockCluster: ClusterFromSubscription = {
    id: 'test-cluster',
    cloud_provider: { id: 'aws' },
    product: { id: 'ROSA' },
    hypershift: { enabled: false },
  } as ClusterFromSubscription;

  const mockGCPCluster: ClusterFromSubscription = {
    id: 'test-cluster',
    cloud_provider: { id: 'gcp' },
  } as ClusterFromSubscription;

  const mockHypershiftCluster: ClusterFromSubscription = {
    id: 'test-cluster',
    cloud_provider: { id: 'aws' },
    hypershift: { enabled: true },
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
    isEdit: false,
    region: 'us-east-1',
    currentMachinePool: mockMachinePools[0],
    setCurrentMPId: jest.fn(),
    machineTypesResponse: mockMachineTypes,
    machineTypesLoading: false,
    tabKey: 1,
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
    mockUseFeatureGate([
      [MAX_NODES_TOTAL_249, false],
      [GCP_SECURE_BOOT, false],
      [IMDS_SELECTION, false],
    ]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('tab', () => {
    it('displays tab with Overview title', () => {
      const { result } = renderHook(() => useOverviewSubTab(defaultProps));
      const [tabs] = result.current;

      render(tabs({}));
      expect(screen.getByRole('tab')).toHaveTextContent('Overview');
      checkForError(false);
    });

    it('shows error when a validation error is on instanceType field', () => {
      const { result } = renderHook(() => useOverviewSubTab(defaultProps));
      const [tabs] = result.current;

      render(tabs({ instanceType: 'some error' }));
      expect(screen.getByRole('tab')).toBeInTheDocument();
      checkForError(true);
    });

    it('shows error when a validation error is on replicas field', () => {
      const { result } = renderHook(() => useOverviewSubTab(defaultProps));
      const [tabs] = result.current;

      render(tabs({ replicas: 'some error' }));
      expect(screen.getByRole('tab')).toBeInTheDocument();
      checkForError(true);
    });

    it('does not show error when validation error is on field outside of tab', () => {
      const { result } = renderHook(() => useOverviewSubTab(defaultProps));
      const [tabs] = result.current;

      render(tabs({ myOtherField: 'some error' }));
      expect(screen.getByRole('tab')).toBeInTheDocument();
      checkForError(false);
    });
  });

  describe('tab content', () => {
    it('displays the correct content', () => {
      const { result } = renderHook(() => useOverviewSubTab(defaultProps));
      const [_tab, content] = result.current;

      render(
        <Formik onSubmit={jest.fn()} initialValues={{}}>
          {content({ setFieldValue: jest.fn(), imdsValue: 'v1' })}
        </Formik>,
      );
      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
      expect(screen.getByText('Machine pool name')).toBeInTheDocument();
      expect(screen.getByText('Compute node count')).toBeInTheDocument();
      expect(screen.getByText('Root disk size')).toBeInTheDocument();
    });

    it('displays IMDS section when feature enabled and not editing hypershift cluster', () => {
      mockUseFeatureGate([
        [MAX_NODES_TOTAL_249, false],
        [GCP_SECURE_BOOT, false],
        [IMDS_SELECTION, true],
      ]);

      const { result } = renderHook(() =>
        useOverviewSubTab({
          ...defaultProps,
          cluster: mockHypershiftCluster,
          isEdit: false,
        }),
      );
      const [_tab, content] = result.current;

      render(
        <Formik onSubmit={jest.fn()} initialValues={{}}>
          {content({ setFieldValue: jest.fn(), imdsValue: 'v1' })}
        </Formik>,
      );
      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
      expect(screen.getByText('Instance Metadata Service')).toBeInTheDocument();
    });

    it('does not display IMDS section when editing', () => {
      mockUseFeatureGate([
        [MAX_NODES_TOTAL_249, false],
        [GCP_SECURE_BOOT, false],
        [IMDS_SELECTION, true],
      ]);

      const { result } = renderHook(() =>
        useOverviewSubTab({
          ...defaultProps,
          cluster: mockHypershiftCluster,
          isEdit: true,
        }),
      );
      const [_tab, content] = result.current;

      render(
        <Formik onSubmit={jest.fn()} initialValues={{}}>
          {content({ setFieldValue: jest.fn(), imdsValue: 'v1' })}
        </Formik>,
      );
      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
      expect(screen.queryByText('Instance Metadata Service')).not.toBeInTheDocument();
    });

    it('displays ShieldedVM section for GCP cluster when feature enabled', () => {
      mockUseFeatureGate([
        [MAX_NODES_TOTAL_249, false],
        [GCP_SECURE_BOOT, true],
        [IMDS_SELECTION, false],
      ]);

      const { result } = renderHook(() =>
        useOverviewSubTab({
          ...defaultProps,
          cluster: mockGCPCluster,
        }),
      );
      const [_tab, content] = result.current;

      render(
        <Formik onSubmit={jest.fn()} initialValues={{}}>
          {content({ setFieldValue: jest.fn(), imdsValue: 'v1' })}
        </Formik>,
      );
      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
      expect(screen.getByText('Shielded VM')).toBeInTheDocument();
      expect(screen.queryByText('Instance Metadata Service')).not.toBeInTheDocument();
    });

    it('does not display ShieldedVM section for non-GCP cluster', () => {
      mockUseFeatureGate([
        [MAX_NODES_TOTAL_249, false],
        [GCP_SECURE_BOOT, true],
        [IMDS_SELECTION, false],
      ]);

      const { result } = renderHook(() => useOverviewSubTab(defaultProps));
      const [_tab, content] = result.current;

      render(
        <Formik onSubmit={jest.fn()} initialValues={{}}>
          {content({ setFieldValue: jest.fn(), imdsValue: 'v1' })}
        </Formik>,
      );
      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
      expect(screen.queryByText('Shielded VM')).not.toBeInTheDocument();
    });
  });
});
