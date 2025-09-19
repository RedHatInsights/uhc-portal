import React from 'react';
import { Formik } from 'formik';

import { checkAccessibility, render, screen, userEvent } from '~/testUtils';
import { CloudVpc } from '~/types/clusters_mgmt.v1';

import { FieldId } from '../../constants';

import { SecurityGroupsSectionHCP } from './SecurityGroupsSectionHCP';

const mockVPC: CloudVpc = {
  id: 'vpc-12345',
  name: 'Test VPC',
  aws_security_groups: [
    { id: 'sg-1', name: 'Security Group 1' },
    { id: 'sg-2', name: 'Security Group 2' },
  ],
};

const emptyVPC: CloudVpc = {
  id: 'vpc-empty',
  name: 'Empty VPC',
  aws_security_groups: [],
};

const noIdVPC: CloudVpc = {
  id: '',
  name: 'No ID VPC',
  aws_security_groups: [],
};

const buildTestComponent = (
  props: {
    openshiftVersion?: string;
    selectedVPC?: CloudVpc;
    isHypershiftSelected?: boolean;
  } = {},
  formValues = {},
) => {
  const defaultProps = {
    openshiftVersion: '4.14.0',
    selectedVPC: mockVPC,
    isHypershiftSelected: true,
    ...props,
  };

  return (
    <Formik
      initialValues={{
        [FieldId.SecurityGroups]: {
          worker: [],
        },
        ...formValues,
      }}
      onSubmit={() => {}}
    >
      <SecurityGroupsSectionHCP {...defaultProps} />
    </Formik>
  );
};

describe('<SecurityGroupsSectionHCP />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('is accessible', async () => {
    const { container } = render(buildTestComponent());
    await checkAccessibility(container);
  });

  describe('Rendering', () => {
    it('renders the expandable section with correct toggle text', () => {
      render(buildTestComponent());

      expect(screen.getByText('Additional security groups')).toBeInTheDocument();
    });

    it('renders SecurityGroupsNoEditAlert and SecurityGroupField when VPC has security groups', () => {
      render(buildTestComponent());

      // Should show the no-edit alert with actual PatternFly Alert
      expect(screen.getByText(/You cannot add or edit security groups/)).toBeInTheDocument();
      expect(screen.getByText('View more information')).toBeInTheDocument();
      expect(screen.getByText('AWS security groups console')).toBeInTheDocument();

      // Should show the security group field
      expect(screen.getByText('Security groups')).toBeInTheDocument();
    });

    it('renders SecurityGroupsEmptyAlert when VPC has no security groups', () => {
      render(buildTestComponent({ selectedVPC: emptyVPC }));

      expect(
        screen.getByText('There are no security groups for this Virtual Private Cloud'),
      ).toBeInTheDocument();
      expect(screen.getByText(/To add security groups, go to the/)).toBeInTheDocument();
    });

    it('renders nothing when VPC has no ID', () => {
      const { container } = render(buildTestComponent({ selectedVPC: noIdVPC }));

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Hypershift behavior', () => {
    it('shows hypershift-specific message when hypershift is selected', () => {
      render(buildTestComponent({ isHypershiftSelected: true }));

      expect(
        screen.getByText(/machine pools that were created during cluster creation/),
      ).toBeInTheDocument();
    });
  });

  describe('Expandable functionality', () => {
    it('renders expandable toggle button', async () => {
      const user = userEvent.setup();
      render(buildTestComponent());

      const toggleButton = screen.getByRole('button', { name: /additional security groups/i });
      expect(toggleButton).toBeInTheDocument();

      // Verify the button is clickable
      await user.click(toggleButton);
      // Just verify no errors occur when clicking
      expect(toggleButton).toBeInTheDocument();
    });
  });
});
