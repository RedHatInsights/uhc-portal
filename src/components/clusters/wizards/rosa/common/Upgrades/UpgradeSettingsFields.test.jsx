import React from 'react';
import { Form, Formik } from 'formik';

import links from '~/common/installLinks.mjs';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import { render, screen } from '~/testUtils';

import UpgradeSettingsFields from './UpgradeSettingsFields';

// Generated-by: Cursor - gemini-2.5-pro

jest.mock('~/components/clusters/wizards/hooks');

describe('UpgradeSettingsFields (ROSA)', () => {
  const mockSetFieldValue = jest.fn();
  const mockSetFieldTouched = jest.fn();

  const defaultValues = {
    [FieldId.UpgradePolicy]: 'manual',
    [FieldId.Hypershift]: 'false',
    [FieldId.AutomaticUpgradeSchedule]: '0 0 * * 0',
    [FieldId.NodeDrainGracePeriod]: 60,
  };

  const renderComponent = (values = {}) => {
    const testValues = { ...defaultValues, ...values };

    useFormState.mockReturnValue({
      values: testValues,
      setFieldValue: mockSetFieldValue,
      setFieldTouched: mockSetFieldTouched,
      getFieldProps: (fieldName) => ({
        name: fieldName,
        value: testValues[fieldName],
        onChange: (value) => {
          mockSetFieldValue(fieldName, value);
          // Manually update the value for the next interaction in the test
          testValues[fieldName] = value;
        },
        onBlur: jest.fn(),
      }),
    });

    return render(
      <Formik initialValues={testValues} onSubmit={() => {}}>
        <Form>
          <UpgradeSettingsFields />
        </Form>
      </Formik>,
    );
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('When the cluster is Rosa Classic (hypershift: "false")', () => {
    it('displays the "Node draining" section, allowing its configuration', () => {
      renderComponent({ [FieldId.Hypershift]: 'false' });
      expect(screen.getByText('Node draining')).toBeInTheDocument();
      expect(screen.getByTestId('grace-period-select')).toBeInTheDocument();
    });

    it('shows the standard "Recurring updates" description without Hypershift-specific language', () => {
      renderComponent({ [FieldId.Hypershift]: 'false', [FieldId.UpgradePolicy]: 'automatic' });
      expect(screen.getByLabelText('Recurring updates')).toBeInTheDocument();
      expect(
        screen.getByText(
          /The cluster will be automatically updated based on your preferred day and start time when new patch updates/,
          { exact: false },
        ),
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/The cluster control plane will be automatically updated/, {
          exact: false,
        }),
      ).not.toBeInTheDocument();
    });

    it('presents "Individual updates" as the first policy option, and it is selected if the policy value is "manual"', () => {
      renderComponent({ [FieldId.Hypershift]: 'false', [FieldId.UpgradePolicy]: 'manual' });
      const radios = screen.getAllByRole('radio');
      expect(radios[0]).toHaveAccessibleName('Individual updates');
      expect(radios[1]).toHaveAccessibleName('Recurring updates');
      expect(screen.getByLabelText('Individual updates')).toBeChecked();
    });
  });

  describe('When the cluster is Hypershift (hypershift: "true")', () => {
    it('does not display the "Node draining" section, preventing its configuration', () => {
      renderComponent({ [FieldId.Hypershift]: 'true' });
      expect(screen.queryByText('Node draining')).not.toBeInTheDocument();
      expect(screen.queryByTestId('grace-period-select')).not.toBeInTheDocument();
    });

    it('shows the Hypershift-specific "Recurring updates" description', () => {
      renderComponent({ [FieldId.Hypershift]: 'true', [FieldId.UpgradePolicy]: 'automatic' });
      expect(screen.getByLabelText('Recurring updates')).toBeInTheDocument();
      expect(
        screen.getByText(/The cluster control plane will be automatically updated/, {
          exact: false,
        }),
      ).toBeInTheDocument();
      expect(
        screen.queryByText(
          /The cluster will be automatically updated based on your preferred day and start time when new patch updates/,
          { exact: false },
        ),
      ).not.toBeInTheDocument();
    });

    it('presents "Recurring updates" (automatic) as the first policy option, and it is selected if the policy value is "automatic"', () => {
      renderComponent({ [FieldId.Hypershift]: 'true', [FieldId.UpgradePolicy]: 'automatic' });
      const radios = screen.getAllByRole('radio');
      expect(radios[0]).toHaveAccessibleName('Recurring updates');
      expect(radios[1]).toHaveAccessibleName('Individual updates');
      expect(screen.getByLabelText('Recurring updates')).toBeChecked();
    });
  });

  describe('When the "Recurring updates" (automatic) policy is active', () => {
    it('displays the UpgradeScheduleSelection for configuring the automatic upgrade schedule', () => {
      renderComponent({ [FieldId.UpgradePolicy]: 'automatic' });
      expect(screen.getByText('Select a day and start time')).toBeInTheDocument();
    });
  });

  describe('When the "Individual updates" (manual) policy is active', () => {
    it('does not display the UpgradeScheduleSelection for automatic scheduling', () => {
      renderComponent({ [FieldId.UpgradePolicy]: 'manual' });
      expect(screen.queryByText('Select a day and start time')).not.toBeInTheDocument();
    });
  });

  describe('User Interactions with Upgrade Policy Selection', () => {
    it('updates form values when user selects "Recurring updates" (automatic) policy', async () => {
      const { user } = renderComponent({ [FieldId.UpgradePolicy]: 'manual' });
      const recurringRadio = screen.getByLabelText('Recurring updates');
      await user.click(recurringRadio);
      expect(mockSetFieldValue).toHaveBeenCalledWith(FieldId.UpgradePolicy, 'automatic');
    });

    it('updates form values and resets schedule when user selects "Individual updates" (manual) policy', async () => {
      const { user } = renderComponent({ [FieldId.UpgradePolicy]: 'automatic' });
      const individualRadio = screen.getByLabelText('Individual updates');
      await user.click(individualRadio);
      expect(mockSetFieldValue).toHaveBeenCalledWith(FieldId.UpgradePolicy, 'manual');
      expect(mockSetFieldValue).toHaveBeenLastCalledWith(
        FieldId.AutomaticUpgradeSchedule,
        '0 0 * * 0',
      );
    });
  });

  describe('User Interactions with Schedule and Grace Period Fields', () => {
    it('updates form value when user changes the automatic upgrade schedule', async () => {
      const { user } = renderComponent({ [FieldId.UpgradePolicy]: 'automatic' });

      // Open the day dropdown and select a new day
      await user.click(screen.getByRole('button', { name: /Sunday/i }));
      await user.click(screen.getByRole('option', { name: /Wednesday/i }));

      // The mock doesn't re-render, so the component combines the new day with the original hour (0)
      expect(mockSetFieldValue).toHaveBeenCalledWith(
        FieldId.AutomaticUpgradeSchedule,
        '00 0 * * 3',
      );

      // Open the hour dropdown and select a new hour
      await user.click(screen.getByRole('button', { name: /00:00 UTC/i }));
      await user.click(screen.getByRole('option', { name: /13:00 UTC/i }));

      // The mock doesn't re-render, so the component combines the new hour with the original day (0)
      expect(mockSetFieldValue).toHaveBeenCalledWith(
        FieldId.AutomaticUpgradeSchedule,
        '00 13 * * 0',
      );
    });

    it('updates form value when user changes the node drain grace period', async () => {
      const { user } = renderComponent({
        [FieldId.Hypershift]: 'false',
        [FieldId.NodeDrainGracePeriod]: 60,
      });
      // Open the grace period dropdown and select a new value
      await user.click(screen.getByTestId('grace-period-select'));
      await user.click(screen.getByRole('option', { name: /2 hours/i }));

      // Verify that the form value was updated with the new grace period
      expect(mockSetFieldValue).toHaveBeenCalledWith(FieldId.NodeDrainGracePeriod, 120);
    });
  });

  describe('Verification of External Links in Descriptions', () => {
    it('renders an external link for z-stream details in the standard recurring update message', () => {
      renderComponent({
        [FieldId.Hypershift]: 'false',
        [FieldId.UpgradePolicy]: 'automatic',
      });
      const zStreamLink = screen.getByRole('link', { name: /z-stream/i });
      expect(zStreamLink).toHaveAttribute('href', links.ROSA_Z_STREAM);
    });

    it('renders an external link for z-stream details in the Hypershift recurring update message', () => {
      renderComponent({
        [FieldId.Hypershift]: 'true',
        [FieldId.UpgradePolicy]: 'automatic',
      });
      const zStreamLink = screen.getByRole('link', { name: /z-stream/i });
      expect(zStreamLink).toHaveAttribute('href', links.ROSA_Z_STREAM);
    });

    it('renders an external link for lifecycle policy details in the manual update message', () => {
      renderComponent({ [FieldId.UpgradePolicy]: 'manual' });
      const lifecycleLink = screen.getByRole('link', { name: /lifecycle policy/i });
      expect(lifecycleLink).toHaveAttribute('href', links.ROSA_LIFE_CYCLE);
    });
  });
});
