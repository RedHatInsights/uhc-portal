import { FormikErrors } from 'formik';

import { render, screen } from '~/testUtils';

import { EditMachinePoolValues } from '../hooks/useMachinePoolFormik';

import { hasErrors, tabTitle } from './subTabHelpers';

describe('subTabHelpers', () => {
  describe('hasErrors', () => {
    it('returns true when there is match between fields list and errors', () => {
      const fieldsInTab = ['myMatchingField', 'otherField'];

      const errors = {
        myMatchingField: 'some error',
        myOtherError: 'some other error',
      } as FormikErrors<EditMachinePoolValues>;

      expect(hasErrors(errors, fieldsInTab)).toBeTruthy();
    });

    it('returns false when there is match between fields list and errors', () => {
      const fieldsInTab = ['myNoMatchField', 'otherField'];

      const errors = {
        randomField: 'some error',
        myOtherError: 'some other error',
      } as FormikErrors<EditMachinePoolValues>;

      expect(hasErrors(errors, fieldsInTab)).toBeFalsy();
    });
  });

  describe('tabTitle', () => {
    it('shows danger icon when errors', () => {
      render(tabTitle('My Tab Title', true));

      expect(screen.getByText('My Tab Title')).toBeInTheDocument();
      expect(screen.getByLabelText('Validation error on this tab')).toBeInTheDocument();
    });

    it('does not show danger icons in absence of errors', () => {
      render(tabTitle('My Tab Title', false));

      expect(screen.getByText('My Tab Title')).toBeInTheDocument();
      expect(screen.queryByLabelText('Validation error on this tab')).not.toBeInTheDocument();
    });
  });
});
