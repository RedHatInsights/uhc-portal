import React from 'react';
import { Formik } from 'formik';

import type {
  QueryObserverLoadingErrorResult,
  QueryObserverPendingResult,
  QueryObserverSuccessResult,
} from '@tanstack/query-core';

import {
  CCSOneNodeRemainingQuotaList,
  CCSQuotaList,
  rhQuotaList,
} from '~/components/clusters/common/__tests__/quota.fixtures';
import { useFetchDefaultFlavour } from '~/queries/ClusterDetailsQueries/MachinePoolTab/MachineTypes/useFetchDefaultFlavour';
import { useGlobalState } from '~/redux/hooks';
import { mapMachineTypesById } from '~/redux/reducers/machineTypesReducer';
import { checkAccessibility, render, screen, within } from '~/testUtils';
import type { Flavour } from '~/types/clusters_mgmt.v1';

import {
  useMachineTypeSelection,
  type UseMachineTypeSelectionInput,
} from '../useMachineTypeSelection';

import {
  emptyMachineTypesResponse,
  errorData,
  fulfilledFlavoursState,
  machineTypes,
  machineTypesByRegionResponse,
  machineTypesResponse,
  organizationState,
  unknownCategoryMachineTypes,
} from './fixtures';
import { MachineTypeSelection } from './MachineTypeSelection';

const fulfilledRegionProps = {
  machineTypesByRegionResponse,
  machineTypesByRegionErrorResponse: undefined,
  machineTypesByRegionPending: false,
} satisfies Pick<
  UseMachineTypeSelectionInput,
  | 'machineTypesByRegionResponse'
  | 'machineTypesByRegionErrorResponse'
  | 'machineTypesByRegionPending'
>;

const pendingRegionProps = {
  machineTypesByRegionResponse: undefined,
  machineTypesByRegionErrorResponse: undefined,
  machineTypesByRegionPending: true,
} satisfies Pick<
  UseMachineTypeSelectionInput,
  | 'machineTypesByRegionResponse'
  | 'machineTypesByRegionErrorResponse'
  | 'machineTypesByRegionPending'
>;

const buildTestComponent = (children: React.ReactNode) => (
  <Formik initialValues={{}} onSubmit={jest.fn()}>
    {children}
  </Formik>
);

jest.mock('~/redux/hooks', () => ({
  useGlobalState: jest.fn(),
}));
const useGlobalStateMock = jest.mocked(useGlobalState);

jest.mock('~/queries/ClusterDetailsQueries/MachinePoolTab/MachineTypes/useFetchDefaultFlavour');
const useFetchDefaultFlavourMock = jest.mocked(useFetchDefaultFlavour);

const refetchDefaultFlavour = jest.fn();

const defaultFlavourQueryBase = {
  dataUpdatedAt: 0,
  errorUpdatedAt: 0,
  failureCount: 0,
  failureReason: null,
  errorUpdateCount: 0,
  isFetched: true,
  isFetchedAfterMount: true,
  isFetching: false,
  isInitialLoading: false,
  isPaused: false,
  isPlaceholderData: false,
  isRefetching: false,
  isStale: false,
  fetchStatus: 'idle' as const,
  refetch: refetchDefaultFlavour,
};

const defaultFlavourQuerySuccess = {
  ...defaultFlavourQueryBase,
  data: fulfilledFlavoursState.byID['osd-4'],
  error: null,
  isError: false,
  isPending: false,
  isLoading: false,
  isLoadingError: false,
  isRefetchError: false,
  isSuccess: true,
  status: 'success',
} satisfies QueryObserverSuccessResult<Flavour>;

const defaultFlavourQueryEmptySuccess = {
  ...defaultFlavourQueryBase,
  data: {},
  error: null,
  isError: false,
  isPending: false,
  isLoading: false,
  isLoadingError: false,
  isRefetchError: false,
  isSuccess: true,
  status: 'success',
} satisfies QueryObserverSuccessResult<Flavour>;

const defaultFlavourQueryError = {
  ...defaultFlavourQueryBase,
  data: undefined,
  error: new Error('Failed to fetch default flavour'),
  isError: true,
  isPending: false,
  isLoading: false,
  isLoadingError: true,
  isRefetchError: false,
  isSuccess: false,
  status: 'error',
} satisfies QueryObserverLoadingErrorResult<Flavour>;

const defaultFlavourQueryPending = {
  ...defaultFlavourQueryBase,
  data: undefined,
  error: null,
  isError: false,
  isPending: true,
  isLoading: false,
  isLoadingError: false,
  isRefetchError: false,
  isSuccess: false,
  status: 'pending',
} satisfies QueryObserverPendingResult<Flavour>;

const MachineTypeSelectionWithState = (props: UseMachineTypeSelectionInput) => {
  const renderProps = useMachineTypeSelection(props);
  return <MachineTypeSelection {...renderProps} />;
};

const defaultProps: UseMachineTypeSelectionInput = {
  fieldId: 'machine_type',
  machineTypesResponse: emptyMachineTypesResponse,
  isMultiAz: false,
  isBYOC: false,
  cloudProviderID: 'aws',
  isMachinePool: false,
  productId: 'OSD',
  billingModel: 'standard',
  allExpanded: true,
  inModal: false,
};

const errorProps: UseMachineTypeSelectionInput = {
  ...defaultProps,
  machineTypesErrorResponse: errorData,
};

const quotaAvailableProps: UseMachineTypeSelectionInput = {
  ...defaultProps,
  machineTypesResponse,
  isMultiAz: true,
};

const previousSelectionProps: UseMachineTypeSelectionInput = {
  ...defaultProps,
  machineTypesResponse,
  isMultiAz: true,
};

const byocProps: UseMachineTypeSelectionInput = {
  ...defaultProps,
  machineTypesResponse,
  isMultiAz: true,
  isBYOC: true,
  ...fulfilledRegionProps,
};

describe('MachineTypeSelection', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    useFetchDefaultFlavourMock.mockReturnValue(defaultFlavourQuerySuccess);
  });

  describe('when the machine types list is available', () => {
    describe('byoc with sufficient byoc quota available', () => {
      afterEach(() => {
        jest.clearAllMocks();
      });

      // Arrange
      beforeEach(() => {
        useGlobalStateMock.mockReturnValue({
          organization: organizationState,
          quota: CCSQuotaList,
        });
      });

      it('displays only machine types with quota', async () => {
        // Act
        const { user } = render(
          buildTestComponent(<MachineTypeSelectionWithState {...byocProps} />),
        );

        // Assert
        const optionsMenu = screen.getByLabelText('Machine type select toggle');
        await user.click(optionsMenu);

        expect(
          await screen.findByText('m5.xlarge - 4 vCPU 16 GiB RAM', { exact: false }),
        ).toBeInTheDocument();
      });
    });

    describe('with an error loading flavours', () => {
      afterEach(() => {
        jest.clearAllMocks();
      });

      it('displays "Not enough quota" error', async () => {
        // Arrange
        useGlobalStateMock.mockReturnValue({
          organization: organizationState,
        });
        useFetchDefaultFlavourMock.mockReturnValue(defaultFlavourQueryError);

        // Act
        const { container } = render(
          buildTestComponent(<MachineTypeSelectionWithState {...defaultProps} />),
        );

        // Assert
        expect(
          within(screen.getByRole('alert')).getByText(
            'You do not have enough quota to create a cluster with the minimum required worker capacity.',
            { exact: false },
          ),
        ).toBeInTheDocument();
        await checkAccessibility(container);
      });
    });

    describe('with rhinfra quota available', () => {
      afterEach(() => {
        jest.clearAllMocks();
      });

      it('does not display ccs_only machine types, only machines with quota', async () => {
        // Arrange
        useGlobalStateMock.mockReturnValue({
          organization: organizationState,
          quota: rhQuotaList,
        });

        // Act
        const { user } = render(
          buildTestComponent(<MachineTypeSelectionWithState {...quotaAvailableProps} />),
        );

        // Assert
        const optionsMenu = screen.getByLabelText('Machine type select toggle');
        await user.click(optionsMenu);

        const options = screen
          .getAllByRole('treeitem')
          .map((option) => option.querySelector('.pf-v6-l-stack__item')?.textContent);

        expect(options).not.toContain('m5.12xlarge');
        expect(options).not.toContain('g4dn.2xlarge');
      });
    });

    describe('with rhinfra quota covering previous selection', () => {
      afterEach(() => {
        jest.clearAllMocks();
      });

      it('is accessible', async () => {
        // Act
        const { container } = render(
          buildTestComponent(<MachineTypeSelectionWithState {...previousSelectionProps} />),
        );
        await checkAccessibility(container);
      });

      it('does not display ccs_only machine types, only machines with quota', async () => {
        // Arrange
        useGlobalStateMock.mockReturnValue({
          organization: organizationState,
          quota: rhQuotaList,
        });
        useFetchDefaultFlavourMock.mockReturnValue(defaultFlavourQueryEmptySuccess);

        // Act
        const { user } = render(
          buildTestComponent(<MachineTypeSelectionWithState {...previousSelectionProps} />),
        );

        expect(screen.queryByText('m5.xlarge', { exact: false })).not.toBeInTheDocument();

        await user.click(screen.getByLabelText('Machine type select toggle'));

        // Assert
        expect(screen.getByText('m5.xlarge')).toBeInTheDocument();
        expect(screen.getByText('m5.4xlarge')).toBeInTheDocument();
        expect(screen.queryByText('m5.12xlarge')).not.toBeInTheDocument();
      });
    });

    describe('with rhinfra quota not covering previous selection', () => {
      afterEach(() => {
        jest.clearAllMocks();
      });

      it('does not display ccs_only machine types, only machines with quota', async () => {
        // Arrange
        useGlobalStateMock.mockReturnValue({
          organization: organizationState,
          quota: rhQuotaList,
        });

        // Act
        const { user } = render(
          buildTestComponent(<MachineTypeSelectionWithState {...previousSelectionProps} />),
        );

        const optionsMenu = screen.getByLabelText('Machine type select toggle');
        await user.click(optionsMenu);

        const options = screen
          .getAllByRole('treeitem')
          .map((option) => option.querySelector('.pf-v6-l-stack__item')?.textContent);

        // Assert
        expect(options).not.toContain('m5.12xlarge');
        expect(options).not.toContain('g4dn.2xlarge');
      });
    });

    describe('byoc lacking enough byoc node quota', () => {
      afterEach(() => {
        jest.clearAllMocks();
      });

      it('displays an alert', () => {
        // Arrange
        useGlobalStateMock.mockReturnValue({
          organization: organizationState,
          quota: CCSOneNodeRemainingQuotaList,
        });

        // Act
        render(buildTestComponent(<MachineTypeSelectionWithState {...byocProps} />));

        // Assert
        expect(
          within(screen.getByRole('alert')).getByText(
            'You do not have enough quota to create a cluster with the minimum required worker capacity.',
            { exact: false },
          ),
        ).toBeInTheDocument();
      });
    });
  });

  describe('with an error loading machineTypes', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('displays an error alert when machine-types response has an error', () => {
      // Arrange
      useGlobalStateMock.mockReturnValue({
        organization: organizationState,
      });

      // Act
      render(buildTestComponent(<MachineTypeSelectionWithState {...errorProps} />));

      // Assert
      expect(within(screen.getByRole('alert')).getByText('This is an error message'));
    });

    it('is accessible', async () => {
      // Arrange
      useGlobalStateMock.mockReturnValue({
        organization: organizationState,
      });

      // Act
      const { container } = render(
        buildTestComponent(<MachineTypeSelectionWithState {...defaultProps} />),
      );

      // Assert
      await checkAccessibility(container);
    });
  });

  describe('when the machine types list contains unknown categories', () => {
    const moreTypes = {
      aws: [...(machineTypes?.aws ?? []), ...unknownCategoryMachineTypes],
    };
    const unknownCategoryProps: UseMachineTypeSelectionInput = {
      ...byocProps,
      machineTypesResponse: {
        types: moreTypes,
        typesByID: mapMachineTypesById(moreTypes),
      },
    };

    describe('byoc with sufficient byoc quota available', () => {
      afterEach(() => {
        jest.clearAllMocks();
      });

      it('displays only machine types with quota from known categories', async () => {
        // Arrange
        useGlobalStateMock.mockReturnValue({
          organization: organizationState,
          quota: CCSQuotaList,
        });

        // Act
        const { user } = render(
          buildTestComponent(<MachineTypeSelectionWithState {...unknownCategoryProps} />),
        );

        const optionsMenu = await screen.findByLabelText('Machine type select toggle');
        await user.click(optionsMenu);

        const options = screen
          .getAllByRole('treeitem')
          .map((option) => option.querySelector('.pf-v6-l-stack__item')?.textContent);

        // Assert
        expect(options).toContain('m5.xlarge');
        expect(options).not.toContain('foo.2xbar');
      });
    });
  });

  describe('when the request is pending', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('renders correctly', () => {
      // Arrange
      useGlobalStateMock.mockReturnValue({
        organization: organizationState,
      });
      useFetchDefaultFlavourMock.mockReturnValue(defaultFlavourQueryPending);

      // Act
      render(
        buildTestComponent(
          <MachineTypeSelectionWithState {...byocProps} {...pendingRegionProps} />,
        ),
      );

      // Assert
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByText('Loading node types...')).toBeInTheDocument();
    });

    it('is accessible', async () => {
      // Arrange
      useGlobalStateMock.mockReturnValue({
        organization: organizationState,
      });
      useFetchDefaultFlavourMock.mockReturnValue(defaultFlavourQueryPending);

      // Act
      const { container } = render(
        buildTestComponent(
          <MachineTypeSelectionWithState {...byocProps} {...pendingRegionProps} />,
        ),
      );

      // Assert
      await checkAccessibility(container);
    });
  });
});
