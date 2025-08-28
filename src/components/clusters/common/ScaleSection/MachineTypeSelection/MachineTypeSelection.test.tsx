import React from 'react';
import { Formik, FormikValues } from 'formik';

import {
  CCSOneNodeRemainingQuotaList,
  CCSQuotaList,
  rhQuotaList,
} from '~/components/clusters/common/__tests__/quota.fixtures';
import { useGlobalState } from '~/redux/hooks';
import { mapMachineTypesById } from '~/redux/reducers/machineTypesReducer';
import { checkAccessibility, render, screen, within } from '~/testUtils';
import { MachineType } from '~/types/clusters_mgmt.v1';

import {
  baseFlavoursState,
  baseState,
  errorFlavoursState,
  errorState,
  fulfilledFlavoursState,
  fulfilledMachineByRegionState,
  fulfilledMachineState,
  machineTypes,
  newMachineTypes,
  organizationState,
  pendingFlavoursState,
  pendingState,
  unknownCategoryMachineTypes,
} from './fixtures';
import { MachineTypeSelection, MachineTypeSelectionProps } from './MachineTypeSelection';

// Formik Wrapper:
const buildTestComponent = (
  initialValues: FormikValues,
  children: React.ReactNode,
  onSubmit: () => void = jest.fn(),
  formValues = {},
) => (
  <Formik
    initialValues={{
      ...initialValues,
      ...formValues,
    }}
    onSubmit={onSubmit}
  >
    {children}
  </Formik>
);

jest.mock('~/redux/hooks', () => ({
  useGlobalState: jest.fn(),
}));
const useGlobalStateMock = useGlobalState as jest.Mock;

describe('MachineTypeSelection', () => {
  // Arrange
  const defaultProps = {
    machineTypesResponse: baseState,
    isMultiAz: false,
    isBYOC: false,
    cloudProviderID: 'aws',
    isMachinePool: false,
    productId: 'OSD',
    billingModel: 'standard',
    allExpanded: true,
    inModal: false,
  } as MachineTypeSelectionProps;

  const pendingProps = {
    ...defaultProps,
    machineTypesResponse: pendingState,
  };

  const errorProps = {
    ...defaultProps,
    machineTypesResponse: errorState,
  };

  const quotaAvailableProps = {
    ...defaultProps,
    machineTypesResponse: fulfilledMachineState,
    isMultiAz: true,
  } as MachineTypeSelectionProps;

  const previousSelectionProps = {
    ...defaultProps,
    machineTypesResponse: fulfilledMachineState,
    isMultiAz: true,
  } as MachineTypeSelectionProps;

  const byocProps = {
    ...defaultProps,
    machineTypesResponse: { ...fulfilledMachineState, types: newMachineTypes } as any,
    isMultiAz: true,
    isBYOC: true,
  } as MachineTypeSelectionProps;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when the machine types list is available', () => {
    describe('byoc with sufficient byoc quota available', () => {
      afterEach(() => {
        jest.clearAllMocks();
      });

      // Arrange
      beforeEach(() => {
        useGlobalStateMock.mockReturnValue({
          flavours: fulfilledFlavoursState,
          machineTypesByRegion: fulfilledMachineByRegionState,
          organization: organizationState,
          quota: CCSQuotaList,
        });
      });

      it('displays only machine types with quota', async () => {
        // Act
        const { user } = render(buildTestComponent({}, <MachineTypeSelection {...byocProps} />));

        // Assert
        const optionsMenu = screen.getByLabelText('Machine type select toggle');
        await user.click(optionsMenu);

        expect(
          await screen.findByText('m5.xlarge - 4 vCPU 16 GiB RAM', { exact: false }),
        ).toBeInTheDocument();
      });
    });

    describe('with an error loading flavours', () => {
      // Arrange
      useGlobalStateMock.mockReturnValue({
        flavours: { ...errorFlavoursState, error: true },
        machineTypesByRegion: fulfilledMachineByRegionState,
        organization: organizationState,
      });

      it('displays "Not enough quota" error', async () => {
        // Act
        const { container } = render(
          buildTestComponent({}, <MachineTypeSelection {...defaultProps} />),
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
      it('does not display ccs_only machine types, only machines with quota', async () => {
        // Arrange
        useGlobalStateMock.mockReturnValue({
          flavours: fulfilledFlavoursState,
          machineTypesByRegion: fulfilledMachineByRegionState,
          organization: organizationState,
          quota: rhQuotaList,
        });

        // Act
        const { user } = render(
          buildTestComponent({}, <MachineTypeSelection {...quotaAvailableProps} />),
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
      it('is accessible', async () => {
        // Act
        const { container } = render(
          buildTestComponent({}, <MachineTypeSelection {...previousSelectionProps} />),
        );
        await checkAccessibility(container);
      });

      it('does not display ccs_only machine types, only machines with quota', async () => {
        // Arrange
        useGlobalStateMock.mockReturnValue({
          flavours: baseFlavoursState,
          machineTypesByRegion: fulfilledMachineByRegionState,
          organization: organizationState,
          quota: rhQuotaList,
        });

        // Act
        const { user } = render(
          buildTestComponent({}, <MachineTypeSelection {...previousSelectionProps} />),
        );

        // Assert
        expect(screen.queryByText('m5.xlarge', { exact: false })).not.toBeInTheDocument();

        await user.click(screen.getByLabelText('Machine type select toggle'));

        expect(screen.getByText('m5.xlarge')).toBeInTheDocument();
        expect(screen.getByText('m5.4xlarge')).toBeInTheDocument();
        expect(screen.queryByText('m5.12xlarge')).not.toBeInTheDocument();
      });
    });

    describe('with rhinfra quota not covering previous selection', () => {
      it('does not display ccs_only machine types, only machines with quota', async () => {
        // Arrange
        useGlobalStateMock.mockReturnValue({
          flavours: fulfilledFlavoursState,
          machineTypesByRegion: fulfilledMachineByRegionState,
          organization: organizationState,
          quota: rhQuotaList,
        });

        // Act
        const { user } = render(
          buildTestComponent({}, <MachineTypeSelection {...previousSelectionProps} />),
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

    describe('byoc lacking enough byoc node quota', () => {
      it('displays an alert', () => {
        // Arrange
        useGlobalStateMock.mockReturnValue({
          flavours: fulfilledFlavoursState,
          machineTypesByRegion: fulfilledMachineByRegionState,
          organization: organizationState,
          quota: CCSOneNodeRemainingQuotaList,
        });

        // Act
        render(buildTestComponent({}, <MachineTypeSelection {...byocProps} />));

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
    it('displays an error alert', async () => {
      // Arrange
      useGlobalStateMock.mockReturnValue({
        flavours: fulfilledFlavoursState,
        machineTypesByRegion: errorState,
        organization: organizationState,
      });

      // Act
      render(buildTestComponent({}, <MachineTypeSelection {...errorProps} />));

      // Assert
      expect(within(screen.getByRole('alert')).getByText('This is an error message'));
    });

    it('is accessible', async () => {
      // Arrange
      useGlobalStateMock.mockReturnValue({
        flavours: fulfilledFlavoursState,
        machineTypesByRegion: errorState,
        organization: organizationState,
      });

      // Act
      const { container } = render(
        buildTestComponent({}, <MachineTypeSelection {...errorProps} />),
      );

      // Assert
      await checkAccessibility(container);
    });
  });

  describe('when the machine types list contains unknown categories', () => {
    // Arrange
    const moreTypes = {
      aws: [...machineTypes.aws, ...unknownCategoryMachineTypes],
    };

    const state = {
      ...baseState,
      fulfilled: true,
      types: moreTypes,
      typesByID: mapMachineTypesById(moreTypes as { [id: string]: MachineType[] }),
    };

    const unknownCategoryProps = {
      ...defaultProps,
      machineTypesResponse: state,
      isMultiAz: true,
      isBYOC: true,
    } as MachineTypeSelectionProps;

    describe('byoc with sufficient byoc quota available', () => {
      it('displays only machine types with quota from known categories', async () => {
        // Arrange
        useGlobalStateMock.mockReturnValue({
          flavours: fulfilledFlavoursState,
          machineTypesByRegion: fulfilledMachineByRegionState,
          organization: organizationState,
          quota: CCSQuotaList,
        });

        // Act
        const { user } = render(
          buildTestComponent({}, <MachineTypeSelection {...unknownCategoryProps} />),
        );

        // Assert
        const optionsMenu = await screen.findByLabelText('Machine type select toggle');
        await user.click(optionsMenu);

        const options = screen
          .getAllByRole('treeitem')
          .map((option) => option.querySelector('.pf-v6-l-stack__item')?.textContent);

        expect(options).toContain('m5.xlarge');
        expect(options).not.toContain('foo.2xbar');
      });
    });
  });

  describe('when the request is pending', () => {
    it('renders correctly', () => {
      // Arrange
      useGlobalStateMock.mockReturnValue({
        flavours: pendingFlavoursState,
        machineTypesByRegion: pendingState,
        organization: organizationState,
      });

      // Act
      render(buildTestComponent({}, <MachineTypeSelection {...pendingProps} />));

      // Assert
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByText('Loading node types...')).toBeInTheDocument();
    });

    it('is accessible', async () => {
      // Arrange
      useGlobalStateMock.mockReturnValue({
        flavours: pendingFlavoursState,
        machineTypesByRegion: pendingState,
        organization: organizationState,
      });

      // Act
      const { container } = render(
        buildTestComponent({}, <MachineTypeSelection {...pendingProps} />),
      );

      // Assert
      await checkAccessibility(container);
    });
  });
});
