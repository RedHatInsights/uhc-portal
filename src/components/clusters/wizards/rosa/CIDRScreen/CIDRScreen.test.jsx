import React from 'react';
import { Formik } from 'formik';

import docLinks from '~/common/docLinks.mjs';
import { checkAccessibility, render, screen, within } from '~/testUtils';

import { FieldId } from '../constants';

import CIDRScreen from './CIDRScreen';

describe('<CIDRScreen />', () => {
  const build = (formValues = {}) => (
    <Formik
      initialValues={{
        [FieldId.CloudProvider]: 'aws',
        [FieldId.MultiAz]: false,
        [FieldId.InstallToVpc]: false,
        [FieldId.CidrDefaultValuesToggle]: false,
        ...formValues,
      }}
      onSubmit={jest.fn()}
    >
      <CIDRScreen />
    </Formik>
  );

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the title and CIDR fields', async () => {
    render(build());

    expect(screen.getByText('CIDR ranges')).toBeInTheDocument();
    // From CIDRFields
    expect(screen.getByLabelText('Use default values')).toBeInTheDocument();
    expect(screen.getByLabelText('Machine CIDR')).toBeInTheDocument();
    expect(screen.getByLabelText('Service CIDR')).toBeInTheDocument();
    expect(screen.getByLabelText('Pod CIDR')).toBeInTheDocument();
    expect(screen.getByLabelText('Host prefix')).toBeInTheDocument();
  });

  it('disables all CIDR inputs when "Use default values" is checked', async () => {
    const { user } = render(build());
    const toggle = screen.getByLabelText('Use default values');
    await user.click(toggle);

    expect(screen.getByLabelText('Machine CIDR')).toBeDisabled();
    expect(screen.getByLabelText('Service CIDR')).toBeDisabled();
    expect(screen.getByLabelText('Pod CIDR')).toBeDisabled();
    expect(screen.getByLabelText('Host prefix')).toBeDisabled();
  });

  it('shows OVN subnet fields for HCP when OpenShift version is 4.18 or higher', () => {
    render(
      build({
        [FieldId.Hypershift]: 'true',
        [FieldId.ClusterVersion]: { raw_id: '4.18.1' },
        [FieldId.OvnDefaultValuesToggle]: true,
        [FieldId.NetworkInternalJoinSubnet]: '100.64.0.0/16',
        [FieldId.NetworkInternalTransitSwitchSubnet]: '100.88.0.0/16',
        [FieldId.NetworkInternalMasqueradeSubnet]: '169.254.0.0/17',
      }),
    );

    expect(screen.getByRole('heading', { name: 'OVN SUBNETS' })).toBeInTheDocument();
    expect(screen.getByLabelText('Join subnet')).toBeInTheDocument();
    expect(screen.getByLabelText('Transit subnet')).toBeInTheDocument();
    expect(screen.getByLabelText('Masquerade subnet')).toBeInTheDocument();
    expect(screen.getAllByLabelText('Use default values')).toHaveLength(2);
  });

  it('hides OVN subnet fields for HCP when OpenShift version is below 4.18', () => {
    render(
      build({
        [FieldId.Hypershift]: 'true',
        [FieldId.ClusterVersion]: { raw_id: '4.17.5' },
      }),
    );

    expect(screen.queryByLabelText('Join subnet')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Transit subnet')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Masquerade subnet')).not.toBeInTheDocument();
  });

  it('hides OVN subnet fields for classic (non-HCP) clusters', () => {
    render(
      build({
        [FieldId.Hypershift]: 'false',
        [FieldId.ClusterVersion]: { raw_id: '4.18.1' },
      }),
    );

    expect(screen.queryByLabelText('Join subnet')).not.toBeInTheDocument();
  });

  it('is accessible', async () => {
    const { container } = render(build());
    await checkAccessibility(container);
  });

  describe('Documentation links', () => {
    it('renders correct link for CIDR ranges alert when hypershift', async () => {
      render(
        build({
          [FieldId.Hypershift]: 'true',
        }),
      );

      const link = screen.getByText('Learn more to avoid conflicts');
      expect(link).toHaveAttribute('href', docLinks.CIDR_RANGE_DEFINITIONS_ROSA);
    });

    it('renders correct link for CIDR ranges alert when classic', async () => {
      render(
        build({
          [FieldId.Hypershift]: 'false',
        }),
      );

      const link = screen.getByText('Learn more to avoid conflicts');
      expect(link).toHaveAttribute('href', docLinks.CIDR_RANGE_DEFINITIONS_ROSA_CLASSIC);
    });

    it.each([
      ['Machine CIDR', 'true', docLinks.ROSA_CIDR_MACHINE],
      ['Machine CIDR', 'false', docLinks.ROSA_CLASSIC_CIDR_MACHINE],
      ['Service CIDR', 'true', docLinks.ROSA_CIDR_SERVICE],
      ['Service CIDR', 'false', docLinks.ROSA_CLASSIC_CIDR_SERVICE],
      ['Pod CIDR', 'true', docLinks.ROSA_CIDR_POD],
      ['Pod CIDR', 'false', docLinks.ROSA_CLASSIC_CIDR_POD],
      ['Host prefix', 'true', docLinks.ROSA_CIDR_HOST],
      ['Host prefix', 'false', docLinks.ROSA_CLASSIC_CIDR_HOST],
    ])(
      'renders %s link when isHypershiftSelected %s',
      async (fieldLabel, isHypershiftSelected, expectedLink) => {
        const { user } = render(
          build({
            [FieldId.Hypershift]: isHypershiftSelected,
          }),
        );
        const formGroup = screen.getByLabelText(fieldLabel).closest('.pf-v6-c-form__group');
        const moreInfoBtn = within(formGroup).getByLabelText('More information');

        await user.click(moreInfoBtn);
        const link = screen.getByText('Learn more');
        expect(link).toHaveAttribute('href', expectedLink);
      },
    );
  });
});
