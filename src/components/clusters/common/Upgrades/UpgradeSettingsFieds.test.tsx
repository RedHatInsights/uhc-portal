import React from 'react';
import { Formik } from 'formik';

import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import { mockUseFormState, render, screen } from '~/testUtils';

import UpgradeSettingsFields from './UpgradeSettingsFields';

describe('<UpgradeSettingsFields />', () => {
  const defaultProps = {
    isDisabled: false,
    showDivider: true,
    isRosa: true,
    initialScheduleValue: '',
  };

  beforeEach(() => {
    mockUseFormState({
      values: {
        [FieldId.UpgradePolicy]: 'manual',
      },
    });
  });

  describe('Node draining grace period', () => {
    it('is shown if not hypershift', () => {
      const newProps = {
        ...defaultProps,
        isHypershift: false,
      };
      render(
        <Formik initialValues={{}} onSubmit={() => {}}>
          <UpgradeSettingsFields {...newProps} />
        </Formik>,
      );
      expect(screen.getByText('Node draining')).toBeInTheDocument();
    });
    it('is hidden if hypershift', () => {
      const newProps = {
        ...defaultProps,
        isHypershift: true,
      };
      render(
        <Formik initialValues={{}} onSubmit={() => {}}>
          <UpgradeSettingsFields {...newProps} />
        </Formik>,
      );
      expect(screen.queryByText('Node draining')).not.toBeInTheDocument();
    });
  });
});
