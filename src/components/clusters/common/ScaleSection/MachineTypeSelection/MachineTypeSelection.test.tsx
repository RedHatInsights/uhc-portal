import React from 'react';
import { Formik } from 'formik';

import {
  CCSOneNodeRemainingQuotaList,
  CCSQuotaList,
  rhQuotaList,
} from '~/components/clusters/common/__tests__/quota.fixtures';
import { useGlobalState } from '~/redux/hooks';
import { mapMachineTypesById } from '~/redux/reducers/machineTypesReducer';
import { checkAccessibility, render, screen, within } from '~/testUtils';

import {
  baseFlavoursState,
  emptyMachineTypesResponse,
  errorData,
  errorFlavoursState,
  errorState,
  fulfilledFlavoursState,
  fulfilledMachineByRegionState,
  machineTypes,
  machineTypesResponse,
  organizationState,
  pendingFlavoursState,
  pendingState,
  unknownCategoryMachineTypes,
} from './fixtures';
import { MachineTypeSelection, MachineTypeSelectionProps } from './MachineTypeSelection';

const buildTestComponent = (children: React.ReactNode) => (
  <Formik initialValues={{}} onSubmit={jest.fn()}>
    {children}
  </Formik>
);

jest.mock('~/redux/hooks', () => ({
  useGlobalState: jest.fn(),
}));
const useGlobalStateMock = useGlobalState as jest.Mock;

const defaultProps: MachineTypeSelectionProps = {
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

const errorProps: MachineTypeSelectionProps = {
  ...defaultProps,
  machineTypesErrorResponse: errorData,
};

const quotaAvailableProps: MachineTypeSelectionProps = {
  ...defaultProps,
  machineTypesResponse,
  isMultiAz: true,
};

const previousSelectionProps: MachineTypeSelectionProps = {
  ...defaultProps,
  machineTypesResponse,
  isMultiAz: true,
};

const byocProps: MachineTypeSelectionProps = {
  ...defaultProps,
  machineTypesResponse,
  isMultiAz: true,
  isBYOC: true,
};

describe('MachineTypeSelection', () => {
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
        const { user } = render(buildTestComponent(<MachineTypeSelection {...byocProps} />));

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
          flavours: { ...errorFlavoursState, error: true },
          machineTypesByRegion: fulfilledMachineByRegionState,
          organization: organizationState,
        });

        // Act
        const { container } = render(
          buildTestComponent(<MachineTypeSelection {...defaultProps} />),
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
          flavours: fulfilledFlavoursState,
          machineTypesByRegion: fulfilledMachineByRegionState,
          organization: organizationState,
          quota: rhQuotaList,
        });

        // Act
        const { user } = render(
          buildTestComponent(<MachineTypeSelection {...quotaAvailableProps} />),
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
          buildTestComponent(<MachineTypeSelection {...previousSelectionProps} />),
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
          buildTestComponent(<MachineTypeSelection {...previousSelectionProps} />),
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
          flavours: fulfilledFlavoursState,
          machineTypesByRegion: fulfilledMachineByRegionState,
          organization: organizationState,
          quota: rhQuotaList,
        });

        // Act
        const { user } = render(
          buildTestComponent(<MachineTypeSelection {...previousSelectionProps} />),
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
          flavours: fulfilledFlavoursState,
          machineTypesByRegion: fulfilledMachineByRegionState,
          organization: organizationState,
          quota: CCSOneNodeRemainingQuotaList,
        });

        // Act
        render(buildTestComponent(<MachineTypeSelection {...byocProps} />));

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
        flavours: fulfilledFlavoursState,
        machineTypesByRegion: fulfilledMachineByRegionState,
        organization: organizationState,
      });

      // Act
      render(buildTestComponent(<MachineTypeSelection {...errorProps} />));

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
      const { container } = render(buildTestComponent(<MachineTypeSelection {...defaultProps} />));

      // Assert
      await checkAccessibility(container);
    });
  });

  describe('when the machine types list contains unknown categories', () => {
    const moreTypes = {
      aws: [...(machineTypes?.aws ?? []), ...unknownCategoryMachineTypes],
    };
    const unknownCategoryProps = {
      ...defaultProps,
      machineTypesResponse: {
        types: moreTypes,
        typesByID: mapMachineTypesById(moreTypes),
      },
      isMultiAz: true,
      isBYOC: true,
    };

    describe('byoc with sufficient byoc quota available', () => {
      afterEach(() => {
        jest.clearAllMocks();
      });

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
          buildTestComponent(<MachineTypeSelection {...unknownCategoryProps} />),
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
        flavours: pendingFlavoursState,
        machineTypesByRegion: pendingState,
        organization: organizationState,
      });

      // Act
      render(buildTestComponent(<MachineTypeSelection {...defaultProps} />));

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
      const { container } = render(buildTestComponent(<MachineTypeSelection {...defaultProps} />));

      // Assert
      await checkAccessibility(container);
    });
  });
});
