import React from 'react';
import { Formik } from 'formik';

import * as machinePoolUtils from '~/components/clusters/common/machinePools/utils';
import { MAX_NODES_TOTAL_249 } from '~/queries/featureGates/featureConstants';
import { mockUseFeatureGate, render, screen, waitFor } from '~/testUtils';
import { ClusterFromSubscription } from '~/types/types';

import useMachinePoolFormik from '../../hooks/useMachinePoolFormik';
import {
  defaultCluster,
  defaultMachinePool,
  defaultMachinePools,
  defaultMachineTypes,
} from '../../hooks/useMachinePoolFormik.fixtures';
import * as useOrganization from '../../hooks/useOrganization';
import NodeCountField from '../NodeCountField';

const singleZoneCluster: ClusterFromSubscription = {
  product: { id: 'osd' },
  multi_az: false,
} as ClusterFromSubscription;

const rosaCluster: ClusterFromSubscription = {
  product: { id: 'MOA' },
  multi_az: false,
} as ClusterFromSubscription;

const multiZoneCluster: ClusterFromSubscription = {
  product: { id: 'osd' },
  multi_az: true,
} as ClusterFromSubscription;

const FormikWrapper = ({
  children,
  initialReplicas = 4,
}: {
  children: React.ReactNode;
  initialReplicas?: number;
}) => (
  <Formik initialValues={{ replicas: initialReplicas }} onSubmit={jest.fn()}>
    {children}
  </Formik>
);

const MOCK_MAX_NODES = 10;

const mockUseOrganization = () => {
  jest.spyOn(useOrganization, 'default').mockImplementation(() => ({
    pending: false,
    fulfilled: true,
    error: false,
    timestamp: -1,
    details: {},
    quotaList: undefined,
  }));
};

const mockGetMaxNodeCount = () => {
  jest.spyOn(machinePoolUtils, 'getMaxNodeCountForMachinePool').mockReturnValue(MOCK_MAX_NODES);
};

type ValidatedNodeCountFieldProps = {
  cluster?: ClusterFromSubscription;
  mpAvailZones?: number;
};

const ValidatedNodeCountField = ({
  cluster = defaultCluster,
  mpAvailZones = 1,
}: ValidatedNodeCountFieldProps) => {
  const { initialValues, validationSchema } = useMachinePoolFormik({
    cluster,
    machinePool: defaultMachinePool,
    machineTypes: defaultMachineTypes,
    machinePools: defaultMachinePools,
  });

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={jest.fn()}>
      <NodeCountField
        minNodesRequired={0}
        maxNodes={MOCK_MAX_NODES}
        cluster={cluster}
        mpAvailZones={mpAvailZones}
      />
    </Formik>
  );
};

describe('<NodeCountField />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders "Compute node count" label for single-zone', () => {
    render(
      <FormikWrapper>
        <NodeCountField
          minNodesRequired={2}
          maxNodes={100}
          cluster={singleZoneCluster}
          mpAvailZones={1}
        />
      </FormikWrapper>,
    );

    expect(screen.getByText('Compute node count')).toBeInTheDocument();
  });

  it('renders "per zone" label for multi-zone machine pool', () => {
    render(
      <FormikWrapper>
        <NodeCountField
          minNodesRequired={6}
          maxNodes={300}
          cluster={multiZoneCluster}
          mpAvailZones={3}
        />
      </FormikWrapper>,
    );

    expect(screen.getByText('Compute node count (per zone)')).toBeInTheDocument();
  });

  it('shows zone multiplier helper text for multi-zone', () => {
    render(
      <FormikWrapper initialReplicas={3}>
        <NodeCountField
          minNodesRequired={6}
          maxNodes={300}
          cluster={multiZoneCluster}
          mpAvailZones={3}
        />
      </FormikWrapper>,
    );

    expect(screen.getByText('x 3 zones = 9')).toBeInTheDocument();
  });

  it('disables input when maxNodes < minNodesRequired', () => {
    render(
      <FormikWrapper>
        <NodeCountField
          minNodesRequired={10}
          maxNodes={5}
          cluster={singleZoneCluster}
          mpAvailZones={1}
        />
      </FormikWrapper>,
    );

    expect(screen.getByLabelText('Compute nodes')).toBeDisabled();
  });

  it('does not disable input when quota is sufficient', () => {
    render(
      <FormikWrapper>
        <NodeCountField
          minNodesRequired={2}
          maxNodes={100}
          cluster={singleZoneCluster}
          mpAvailZones={1}
        />
      </FormikWrapper>,
    );

    expect(screen.getByLabelText('Compute nodes')).not.toBeDisabled();
  });

  it('shows ROSA doc link in popover for ROSA clusters', async () => {
    const { user } = render(
      <FormikWrapper>
        <NodeCountField
          minNodesRequired={2}
          maxNodes={100}
          cluster={rosaCluster}
          mpAvailZones={1}
        />
      </FormikWrapper>,
    );

    await user.click(screen.getByLabelText('More information'));

    expect(screen.getByText('Learn more about worker/compute node count')).toBeInTheDocument();
  });

  it('does not show ROSA doc link in popover for non-ROSA clusters', async () => {
    const { user } = render(
      <FormikWrapper>
        <NodeCountField
          minNodesRequired={2}
          maxNodes={100}
          cluster={singleZoneCluster}
          mpAvailZones={1}
        />
      </FormikWrapper>,
    );

    await user.click(screen.getByLabelText('More information'));

    expect(
      screen.queryByText('Learn more about worker/compute node count'),
    ).not.toBeInTheDocument();
  });

  it('increments value when plus button is clicked', async () => {
    const { user } = render(
      <FormikWrapper initialReplicas={4}>
        <NodeCountField
          minNodesRequired={2}
          maxNodes={100}
          cluster={singleZoneCluster}
          mpAvailZones={1}
        />
      </FormikWrapper>,
    );

    await user.click(screen.getByLabelText('Increment compute nodes'));

    expect(screen.getByLabelText('Compute nodes')).toHaveValue(5);
  });

  it('decrements value when minus button is clicked', async () => {
    const { user } = render(
      <FormikWrapper initialReplicas={4}>
        <NodeCountField
          minNodesRequired={2}
          maxNodes={100}
          cluster={singleZoneCluster}
          mpAvailZones={1}
        />
      </FormikWrapper>,
    );

    await user.click(screen.getByLabelText('Decrement compute nodes'));

    expect(screen.getByLabelText('Compute nodes')).toHaveValue(3);
  });

  describe('initialization when maxNodes < 2', () => {
    const hypershiftCluster: ClusterFromSubscription = {
      product: { id: 'ROSA' },
      cloud_provider: { id: 'aws' },
      hypershift: { enabled: true },
    } as ClusterFromSubscription;

    it('does not override value when isEdit is true', () => {
      render(
        <FormikWrapper initialReplicas={2}>
          <NodeCountField
            minNodesRequired={0}
            maxNodes={1}
            cluster={hypershiftCluster}
            mpAvailZones={1}
          />
        </FormikWrapper>,
      );

      expect(screen.getByLabelText('Compute nodes')).toHaveValue(2);
    });

    it('does not override value when cluster is not hypershift', () => {
      render(
        <FormikWrapper initialReplicas={2}>
          <NodeCountField
            minNodesRequired={0}
            maxNodes={1}
            cluster={singleZoneCluster}
            mpAvailZones={1}
          />
        </FormikWrapper>,
      );

      expect(screen.getByLabelText('Compute nodes')).toHaveValue(2);
    });

    it('does not override value when maxNodes >= 2', () => {
      render(
        <FormikWrapper initialReplicas={2}>
          <NodeCountField
            minNodesRequired={0}
            maxNodes={5}
            cluster={hypershiftCluster}
            mpAvailZones={1}
          />
        </FormikWrapper>,
      );

      expect(screen.getByLabelText('Compute nodes')).toHaveValue(2);
    });
  });
});

describe('replicas validation via useMachinePoolFormik', () => {
  beforeEach(() => {
    mockUseFeatureGate([[MAX_NODES_TOTAL_249, false]]);
    mockUseOrganization();
    mockGetMaxNodeCount();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows error when value exceeds maximum', async () => {
    const { user } = render(<ValidatedNodeCountField />);

    const input = screen.getByLabelText('Compute nodes');
    await user.clear(input);
    await user.type(input, '99999');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(`Input cannot be more than ${MOCK_MAX_NODES}.`)).toBeInTheDocument();
    });
  });

  it('shows error for decimal values', async () => {
    const { user } = render(<ValidatedNodeCountField />);

    const input = screen.getByLabelText('Compute nodes');
    await user.clear(input);
    await user.type(input, '3.5');
    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByText('Decimals are not allowed. Enter a whole number.'),
      ).toBeInTheDocument();
    });
  });

  it('shows no error for a valid value within range', async () => {
    const { user } = render(<ValidatedNodeCountField />);

    const input = screen.getByLabelText('Compute nodes');
    await user.clear(input);
    await user.type(input, '5');
    await user.tab();

    await waitFor(() => {
      expect(screen.queryByText(/Input cannot be/)).not.toBeInTheDocument();
    });
    await waitFor(() => {
      expect(
        screen.queryByText('Decimals are not allowed. Enter a whole number.'),
      ).not.toBeInTheDocument();
    });
  });
});
