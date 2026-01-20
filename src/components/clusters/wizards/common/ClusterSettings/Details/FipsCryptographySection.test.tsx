import React from 'react';
import { Formik } from 'formik';

import { FieldId } from '~/components/clusters/wizards/common';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { checkAccessibility, render, screen } from '~/testUtils';

import { FipsCryptographySection } from './FipsCryptographySection';

jest.mock('~/components/clusters/wizards/hooks', () => ({
  useFormState: jest.fn(),
}));

const mockFormState = {
  getFieldProps: jest.fn(),
  setFieldValue: jest.fn(),
  validateForm: jest.fn(),
};

describe('<FipsCryptographySection />', () => {
  beforeEach(() => {
    const mockedUseFormState = useFormState as jest.Mock;
    mockedUseFormState.mockReturnValue(mockFormState);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is accessible', async () => {
    const { container } = render(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <FipsCryptographySection />
      </Formik>,
    );
    await checkAccessibility(container);
  });

  describe('on "checked" event', () => {
    it('sets its own field value', async () => {
      const { user } = render(
        <Formik initialValues={{}} onSubmit={() => {}}>
          <FipsCryptographySection />
        </Formik>,
      );
      await user.click(screen.getByRole('checkbox'));
      expect(mockFormState.setFieldValue).toHaveBeenCalledWith(
        FieldId.FipsCryptography,
        true,
        false,
      );
    });

    it('sets the value of the dependent field "etcd encryption", and triggers form validation', async () => {
      const { user } = render(
        <Formik initialValues={{}} onSubmit={() => {}}>
          <FipsCryptographySection />
        </Formik>,
      );
      await user.click(screen.getByRole('checkbox'));
      expect(mockFormState.setFieldValue).toHaveBeenCalledWith(FieldId.EtcdEncryption, true, false);
      expect(mockFormState.validateForm).toHaveBeenCalledTimes(1);
    });
  });
});
