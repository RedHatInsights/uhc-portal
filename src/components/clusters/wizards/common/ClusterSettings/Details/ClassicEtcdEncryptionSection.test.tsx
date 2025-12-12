import React from 'react';
import { Formik } from 'formik';

import { FieldId } from '~/components/clusters/wizards/common';
import { checkAccessibility, render, screen } from '~/testUtils';

import { ClassicEtcdEncryptionSection } from './ClassicEtcdEncryptionSection';

describe('<ClassicEtcdEncryptionSection />', () => {
  it('is accessible', async () => {
    const { container } = render(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <ClassicEtcdEncryptionSection />
      </Formik>,
    );
    await checkAccessibility(container);
  });

  it('renders a custom learn more link', async () => {
    const { user } = render(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <ClassicEtcdEncryptionSection learnMoreLink="foobar.com/wat" />
      </Formik>,
    );
    await user.click(screen.getByRole('button', { name: 'More information' }));
    const popoverLink = screen.getByText('Learn more about etcd encryption');
    expect(popoverLink).toHaveAttribute('href', 'foobar.com/wat');
  });

  describe('when "FIPS cryptography" field is checked', () => {
    const formValues = {
      [FieldId.FipsCryptography]: 'true',
    };

    it('field is disabled', () => {
      render(
        <Formik initialValues={formValues} onSubmit={() => {}}>
          <ClassicEtcdEncryptionSection />
        </Formik>,
      );
      expect(screen.getByRole('checkbox')).toBeDisabled();
    });

    it('shows a "required" help-text', () => {
      render(
        <Formik initialValues={formValues} onSubmit={() => {}}>
          <ClassicEtcdEncryptionSection />
        </Formik>,
      );
      expect(screen.getByText('Required when FIPS cryptography is enabled')).toBeInTheDocument();
    });
  });
});
