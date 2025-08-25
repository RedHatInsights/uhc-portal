import * as React from 'react';
import { Formik } from 'formik';

import { initialValues as osdInitialValues } from '~/components/clusters/wizards/osd/constants';
import {
  initialValues as rosaInitialValues,
  initialValuesRestrictedEnv,
} from '~/components/clusters/wizards/rosa/constants';
import { mockRestrictedEnv, render, userEvent, screen } from '~/testUtils';

import { ClassicEtcdFipsSection } from './ClassicEtcdFipsSection';

describe('<ClassicEtcdFipsSection />', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  it('displays correctly for ROSA Classic', async () => {
    const defaultValues = {
      ...rosaInitialValues,
    };
    const { container } = render(
      <Formik initialValues={defaultValues} onSubmit={() => {}}>
        <ClassicEtcdFipsSection isRosa />
      </Formik>,
    );

    const fipsCheckbox = container.querySelector('#fips');
    const etcdCheckbox = container.querySelector('#etcd_encryption');

    // FIPS and etcd should be initially unchecked
    expect(fipsCheckbox).not.toBeChecked();
    expect(etcdCheckbox).not.toBeChecked();

    // Check FIPS
    await userEvent.click(fipsCheckbox!);
    screen.debug(undefined, Infinity);
    // Etcd should also be automatically checked and disabled
    expect(fipsCheckbox).toBeChecked();
    expect(etcdCheckbox).toHaveClass('pf-m-disabled');

    // Uncheck FIPS
    await userEvent.click(fipsCheckbox!);
    // Etcd should still be checked but no longer disabled
    expect(fipsCheckbox).not.toBeChecked();
    expect(etcdCheckbox).toBeChecked();
    expect(etcdCheckbox).not.toBeDisabled();

    // Can independently uncheck/check etcd without affecting FIPS
    // Check etcd
    await userEvent.click(etcdCheckbox!);
    expect(fipsCheckbox).not.toBeChecked();
    expect(etcdCheckbox).not.toBeChecked();

    // Check FIPS once more
    await userEvent.click(fipsCheckbox!);
    // Etcd should also be automatically checked and disabled
    expect(fipsCheckbox).toBeChecked();
    expect(etcdCheckbox).toBeChecked();
    expect(etcdCheckbox).toBeDisabled();
  });

  it('displays correctly for OSD', async () => {
    const defaultValues = {
      ...osdInitialValues,
    };
    const { container } = render(
      <Formik initialValues={defaultValues} onSubmit={() => {}}>
        <ClassicEtcdFipsSection isRosa={false} />
      </Formik>,
    );

    const fipsCheckbox = container.querySelector('#fips');
    const etcdCheckbox = container.querySelector('#etcd_encryption');

    // FIPS and etcd should be initially unchecked
    expect(fipsCheckbox).not.toBeChecked();
    expect(etcdCheckbox).not.toBeChecked();

    // Check FIPS
    await userEvent.click(fipsCheckbox!);
    // Etcd should also be automatically checked and disabled
    expect(fipsCheckbox).toBeChecked();
    expect(etcdCheckbox).toBeChecked();
    expect(etcdCheckbox).toBeDisabled();

    // Uncheck FIPS
    await userEvent.click(fipsCheckbox!);
    // Etcd should still be checked but no longer disabled
    expect(fipsCheckbox).not.toBeChecked();
    expect(etcdCheckbox).toBeChecked();
    expect(etcdCheckbox).not.toBeDisabled();

    // Can independently uncheck/check etcd without affecting FIPS
    // Check etcd
    await userEvent.click(etcdCheckbox!);
    expect(fipsCheckbox).not.toBeChecked();
    expect(etcdCheckbox).not.toBeChecked();

    // Check FIPS once more
    await userEvent.click(fipsCheckbox!);
    // Etcd should also be automatically checked and disabled
    expect(fipsCheckbox).toBeChecked();
    expect(etcdCheckbox).toBeChecked();
    expect(etcdCheckbox).toBeDisabled();
  });

  it('displays correctly for ROSA classic in restricted env', async () => {
    // simulate restricted env
    mockRestrictedEnv(true);

    const defaultValues = {
      ...initialValuesRestrictedEnv,
    };
    const { container } = render(
      <Formik initialValues={defaultValues} onSubmit={() => {}}>
        <ClassicEtcdFipsSection isRosa />
      </Formik>,
    );

    const fipsCheckbox = container.querySelector('#fips');
    const etcdCheckbox = container.querySelector('#etcd_encryption');

    // FIPS and etcd should be initially checked and disabled
    expect(fipsCheckbox).toBeChecked();
    expect(fipsCheckbox).toBeDisabled();
    expect(etcdCheckbox).toBeChecked();
    expect(etcdCheckbox).toBeDisabled();
  });
});
