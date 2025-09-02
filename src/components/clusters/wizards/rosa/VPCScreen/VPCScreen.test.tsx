import React from 'react';

import { useFormState } from '~/components/clusters/wizards/hooks';
import { checkAccessibility, render, screen } from '~/testUtils';

import { FieldId } from '../constants';

import { InstallToVPC } from './InstallToVPC';
import { VPCScreen } from './VPCScreen';

jest.mock('./InstallToVPC');
jest.mock('~/components/clusters/wizards/hooks');

const mockInstallToVPC = InstallToVPC as jest.Mock;
mockInstallToVPC.mockImplementation(() => <div>InstallToVPC</div>);

const defaultFieldValues = {
  [FieldId.ClusterName]: 'test-cluster',
  [FieldId.ClusterVersion]: { raw_id: '4.10' },
  [FieldId.SharedVpc]: { is_selected: false, base_dns_domain: '' },
  [FieldId.SelectedVpc]: { id: 'vpc-12345' },
  [FieldId.MachinePoolsSubnets]: [],
  [FieldId.MultiAz]: 'false',
  [FieldId.Region]: 'us-east-1',
  [FieldId.CloudProvider]: 'aws',
  [FieldId.Hypershift]: 'false',
};

const defaultMockReturnValues = {
  values: { ...defaultFieldValues },
  setFieldValue: jest.fn(),
  setFieldTouched: jest.fn(),
};

describe('<VPCScreen />', () => {
  // Arrange
  const mockedUseFormState = useFormState as jest.Mock;

  afterEach(() => {
    jest.clearAllMocks();
  });

  // There is no difference in the component rendering based on the `privateLinkSelected` prop
  describe('renders InstallToVPC component given an openshiftVersion', () => {
    it('renders correctly with default values', async () => {
      // Arrange
      mockedUseFormState.mockReturnValue({ ...defaultMockReturnValues });
      // Act
      render(<VPCScreen privateLinkSelected />);

      // Assert
      expect(screen.getByText('Virtual Private Cloud (VPC) subnet settings')).toBeInTheDocument();

      // Should show InstallToVPC component
      expect(screen.getByText('InstallToVPC')).toBeInTheDocument();

      // Should not show no cluster version Alert
      expect(screen.queryByText('No cluster version')).not.toBeInTheDocument();
    });

    it('renders with custom field values including MultiAZ, Hypershift and a shared VPC', async () => {
      // Arrange
      const customFieldValues = {
        ...defaultFieldValues,
        [FieldId.SharedVpc]: { is_selected: true, base_dns_domain: '' },
        [FieldId.MultiAz]: 'true',
        [FieldId.Hypershift]: 'true',
      };
      mockedUseFormState.mockReturnValue({
        ...defaultMockReturnValues,
        values: customFieldValues,
      });

      // Act
      render(<VPCScreen privateLinkSelected />);

      // Assert
      expect(screen.getByText('Virtual Private Cloud (VPC) subnet settings')).toBeInTheDocument();
      expect(screen.getByText('InstallToVPC')).toBeInTheDocument();
    });

    it('renders with custom field values and a base dns domain in shared VPC', async () => {
      // Arrange
      const customFieldValues = {
        ...defaultFieldValues,
        [FieldId.SharedVpc]: { is_selected: true, base_dns_domain: '<some-base-dns-domain>' },
      };
      mockedUseFormState.mockReturnValue({
        ...defaultMockReturnValues,
        values: customFieldValues,
      });

      // Act
      render(<VPCScreen privateLinkSelected />);

      // Assert
      expect(screen.getByText('Virtual Private Cloud (VPC) subnet settings')).toBeInTheDocument();
      expect(screen.getByText('InstallToVPC')).toBeInTheDocument();
    });

    it('renders with multi-AZ subnets', async () => {
      // Arrange
      const customFieldValues = {
        ...defaultFieldValues,
        [FieldId.MachinePoolsSubnets]: [
          { availabilityZone: 'us-east-1a' },
          { availabilityZone: 'us-east-1b' },
          { availabilityZone: 'us-east-1c' },
        ],
        [FieldId.MultiAz]: 'true',
      };
      mockedUseFormState.mockReturnValue({
        ...defaultMockReturnValues,
        values: customFieldValues,
      });

      // Act
      render(<VPCScreen privateLinkSelected />);

      // Assert
      expect(screen.getByText('Virtual Private Cloud (VPC) subnet settings')).toBeInTheDocument();
      expect(screen.getByText('InstallToVPC')).toBeInTheDocument();
    });

    it('triggers useEffect to reset subnets when VPC is not selected', async () => {
      // Arrange
      const customFieldValues = {
        ...defaultFieldValues,
        [FieldId.SelectedVpc]: { id: '' }, // Simulate no VPC selected
        [FieldId.MachinePoolsSubnets]: [
          { availabilityZone: 'us-east-1a' },
          { availabilityZone: 'us-east-1b' },
          { availabilityZone: 'us-east-1c' },
        ],
        [FieldId.MultiAz]: 'true',
      };
      mockedUseFormState.mockReturnValue({
        ...defaultMockReturnValues,
        values: customFieldValues,
      });

      // Act
      render(<VPCScreen privateLinkSelected />);

      // Assert
      expect(mockedUseFormState().setFieldValue).toHaveBeenCalledWith(FieldId.MachinePoolsSubnets, [
        { availabilityZone: '', privateSubnetId: '', publicSubnetId: '' },
        { availabilityZone: '', privateSubnetId: '', publicSubnetId: '' },
        { availabilityZone: '', privateSubnetId: '', publicSubnetId: '' },
      ]);
    });
  });

  it('renders no cluster versions Alert component when missing openshiftVersion', async () => {
    // Arrange
    mockedUseFormState.mockReturnValue({
      ...defaultMockReturnValues,
      values: { ...defaultFieldValues, [FieldId.ClusterVersion]: '' },
    });
    // Act
    render(<VPCScreen privateLinkSelected />);

    // Assert
    expect(screen.getByText('Virtual Private Cloud (VPC) subnet settings')).toBeInTheDocument();

    // Should show no cluster versions Alert
    expect(screen.getByText('No cluster version')).toBeInTheDocument();
    expect(
      screen.getByText(
        'No cluster version defined. Please select a cluster version before proceeding with the VPC configuration.',
      ),
    );

    // Should not show InstallToVPC component
    expect(screen.queryByText('InstallToVPC')).not.toBeInTheDocument();
  });

  it.todo('verifies form submission handling');

  it('is accessible', async () => {
    // Arrange
    mockedUseFormState.mockReturnValue({ ...defaultMockReturnValues });
    // Act
    const { container } = render(<VPCScreen privateLinkSelected />);

    // Assert
    await checkAccessibility(container);
  });
});
