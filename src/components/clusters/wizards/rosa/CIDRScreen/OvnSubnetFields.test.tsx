import React from 'react';
import { Formik } from 'formik';

import {
  JOIN_SUBNET_DEFAULT,
  MASQUERADE_SUBNET_DEFAULT,
  TRANSIT_SUBNET_DEFAULT,
} from '~/components/clusters/common/networkingConstants';
import { checkAccessibility, render, screen } from '~/testUtils';

import { FieldId, ovnSubnetInitialValues } from '../constants';

import { OvnSubnetFields } from './OvnSubnetFields';

describe('<OvnSubnetFields />', () => {
  const build = (formValues = {}) => (
    <Formik
      initialValues={{
        ...ovnSubnetInitialValues,
        ...formValues,
      }}
      onSubmit={jest.fn()}
    >
      <OvnSubnetFields />
    </Formik>
  );

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders Join, Transit, and Masquerade subnet fields with the OVN defaults toggle', () => {
    render(build());

    expect(screen.getByRole('heading', { name: 'OVN SUBNETS' })).toBeInTheDocument();
    expect(screen.getByLabelText('Use default values')).toBeInTheDocument();
    expect(screen.getByLabelText('Join subnet')).toBeInTheDocument();
    expect(screen.getByLabelText('Transit subnet')).toBeInTheDocument();
    expect(screen.getByLabelText('Masquerade subnet')).toBeInTheDocument();
  });

  it('disables OVN subnet inputs when "Use default values" is checked', () => {
    render(
      build({
        [FieldId.OvnDefaultValuesToggle]: true,
      }),
    );

    expect(screen.getByLabelText('Join subnet')).toBeDisabled();
    expect(screen.getByLabelText('Transit subnet')).toBeDisabled();
    expect(screen.getByLabelText('Masquerade subnet')).toBeDisabled();
  });

  it('enables OVN subnet inputs when "Use default values" is unchecked', async () => {
    const { user } = render(
      build({
        [FieldId.OvnDefaultValuesToggle]: true,
      }),
    );

    await user.click(screen.getByLabelText('Use default values'));

    expect(screen.getByLabelText('Join subnet')).toBeEnabled();
    expect(screen.getByLabelText('Transit subnet')).toBeEnabled();
    expect(screen.getByLabelText('Masquerade subnet')).toBeEnabled();
  });

  it('restores default OVN values when "Use default values" is re-checked', async () => {
    const { user } = render(
      build({
        [FieldId.OvnDefaultValuesToggle]: false,
        [FieldId.NetworkInternalJoinSubnet]: '100.70.0.0/16',
        [FieldId.NetworkInternalTransitSwitchSubnet]: '100.90.0.0/16',
        [FieldId.NetworkInternalMasqueradeSubnet]: '169.254.0.0/17',
      }),
    );

    await user.click(screen.getByLabelText('Use default values'));

    expect(screen.getByLabelText('Join subnet')).toHaveValue(JOIN_SUBNET_DEFAULT);
    expect(screen.getByLabelText('Transit subnet')).toHaveValue(TRANSIT_SUBNET_DEFAULT);
    expect(screen.getByLabelText('Masquerade subnet')).toHaveValue(MASQUERADE_SUBNET_DEFAULT);
  });

  it('is accessible', async () => {
    const { container } = render(build());
    await checkAccessibility(container);
  });
});
