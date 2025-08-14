import * as React from 'react';
import { Formik } from 'formik';

import { waitFor } from '@testing-library/react';

import { acknowledgePrerequisites } from '~/common/validators';
import { checkAccessibility, render, screen } from '~/testUtils';

import { CheckboxField, CheckboxFieldProps } from './CheckboxField';

type CheckboxFieldOptionalProps = Omit<CheckboxFieldProps, 'name'>;

const label =
  "I've read and completed all the prerequisites and am ready to continue creating my cluster.";
const validationError = 'Acknowledge that you have read and completed all prerequisites.';
const prepareComponent = (additionalProps?: CheckboxFieldOptionalProps) => (
  <Formik
    initialValues={{
      fieldName: false,
    }}
    initialTouched={{
      fieldName: true,
    }}
    validateOnChange={false}
    onSubmit={() => {}}
  >
    {(props) => (
      <>
        <CheckboxField
          name="fieldName"
          label={label}
          validate={acknowledgePrerequisites}
          {...additionalProps}
        />
        <button type="submit" onClick={() => props.handleSubmit()}>
          Submit
        </button>
      </>
    )}
  </Formik>
);

describe('<CheckboxField />', () => {
  it('is accessible', async () => {
    const { container } = render(prepareComponent());

    await checkAccessibility(container);
  });

  describe('Required Checkbox field', () => {
    it('shows a validation error if the checkbox has not been checked', async () => {
      const { user } = render(prepareComponent());

      expect(await screen.findByText(label)).toBeInTheDocument();

      expect(screen.queryByText(validationError)).not.toBeInTheDocument();

      expect(
        screen.getByRole('checkbox', {
          name: label,
        }),
      ).not.toBeChecked();

      await user.click(screen.getByRole('button', { name: 'Submit' }));

      expect(await screen.findByText(validationError)).toBeInTheDocument();
    });

    it('validates the field after checking it', async () => {
      const { user } = render(prepareComponent());

      expect(await screen.findByText(label)).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Submit' }));

      expect(await screen.findByText(validationError)).toBeInTheDocument();

      expect(
        screen.getByRole('checkbox', {
          name: label,
        }),
      ).not.toBeChecked();

      await user.click(
        screen.getByRole('checkbox', {
          name: label,
        }),
      );

      expect(
        screen.getByRole('checkbox', {
          name: label,
        }),
      ).toBeChecked();

      expect(await screen.findByText(validationError)).not.toBeInTheDocument();
    });

    it('validates the field consistently after multiple value changes', async () => {
      const { user } = render(prepareComponent());

      expect(await screen.findByText(label)).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Submit' }));

      expect(await screen.findByText(validationError)).toBeInTheDocument();

      await user.click(screen.getByText(label));

      expect(
        screen.getByRole('checkbox', {
          name: label,
        }),
      ).toBeChecked();

      expect(await screen.findByText(validationError)).not.toBeInTheDocument();

      await user.click(screen.getByText(label));

      expect(
        screen.getByRole('checkbox', {
          name: label,
        }),
      ).not.toBeChecked();

      expect(await screen.findByText(validationError)).toBeInTheDocument();

      await user.click(screen.getByText(label));

      expect(
        screen.getByRole('checkbox', {
          name: label,
        }),
      ).toBeChecked();

      await waitFor(() => {
        expect(screen.queryByText(validationError)).not.toBeInTheDocument();
      });
    });

    describe('With Tooltip', () => {
      it('should present a tooltip when showTooltip is true', async () => {
        // Arrange
        const additionalProps = {
          showTooltip: true,
          tooltip: 'some tooltip content',
        };

        const { user } = render(prepareComponent(additionalProps));

        // Act
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeInTheDocument();

        user.hover(checkbox);

        // Assert
        expect(await screen.findByText('some tooltip content')).toBeInTheDocument();
      });

      it('should not present a tooltip when showTooltip is false', async () => {
        // Arrange
        const additionalProps = {
          showTooltip: false,
          tooltip: 'some tooltip content',
        };

        const { user } = render(prepareComponent(additionalProps));

        // Act
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeInTheDocument();

        user.hover(checkbox);

        // Assert
        expect(screen.queryByText('some tooltip content')).not.toBeInTheDocument();
      });
    });

    describe('With PopoverHint', () => {
      it('should present a PopoverHint when receives a hint', async () => {
        // Arrange
        const additionalProps = {
          hint: 'some hint content',
        };

        const { user } = render(prepareComponent(additionalProps));

        // Act
        const button = screen.getByLabelText('More information');
        expect(button).toBeInTheDocument();

        user.click(button);

        // Assert
        expect(await screen.findByText('some hint content')).toBeInTheDocument();
      });

      it('should not present a hint when hint is an empty string', async () => {
        // Arrange
        const additionalProps = {
          hint: '',
        };

        render(prepareComponent(additionalProps));

        // Assert
        expect(screen.queryByLabelText('More information')).not.toBeInTheDocument();
      });

      it('should not present a hint when hint is undefined', async () => {
        // Arrange
        const additionalProps = {
          hint: undefined,
        };

        render(prepareComponent(additionalProps));

        // Assert
        expect(screen.queryByLabelText('More information')).not.toBeInTheDocument();
      });
    });
  });
});
