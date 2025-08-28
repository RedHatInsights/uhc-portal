import React from 'react';
import { Formik } from 'formik';

import { checkAccessibility, render, screen } from '~/testUtils';

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

  it('is accessible', async () => {
    const { container } = render(build());
    await checkAccessibility(container);
  });
});
