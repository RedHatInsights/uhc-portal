import React from 'react';

import { render, screen } from '~/testUtils';

import {
  DEFAULT_SPOT_INTERRUPTION_PREREQ_ALERT,
  ENHANCED_SPOT_DESCRIPTION,
  SIMPLE_SPOT_DESCRIPTION,
  SpotInterruptionMode,
  SPOT_INTERRUPTION_INTRO,
  SQS_QUEUE_URL_HELPER_TEXT,
  SQS_QUEUE_URL_PLACEHOLDER,
} from './spotInterruptionHandlingConstants';
import {
  SpotInterruptionHandlingFields,
  SpotInterruptionHandlingFieldsProps,
} from './SpotInterruptionHandlingFields';

const setupDocHref = 'https://example.com/spot-setup';

const getSqsQueueUrlInput = () => screen.getByPlaceholderText(SQS_QUEUE_URL_PLACEHOLDER);

const renderFields = (overrides: Partial<SpotInterruptionHandlingFieldsProps> = {}) => {
  const props: SpotInterruptionHandlingFieldsProps = {
    mode: SpotInterruptionMode.Simple,
    onModeChange: jest.fn(),
    sqsQueueUrl: '',
    onSqsQueueUrlChange: jest.fn(),
    setupDocumentationHref: setupDocHref,
    ...overrides,
  };

  return render(<SpotInterruptionHandlingFields {...props} />);
};

describe('<SpotInterruptionHandlingFields />', () => {
  describe('rendering', () => {
    it('displays the intro text when the component is rendered', () => {
      renderFields();

      expect(screen.getByText(SPOT_INTERRUPTION_INTRO, { exact: false })).toBeInTheDocument();
    });

    it('displays both Spot interruption mode options', () => {
      renderFields();

      expect(screen.getByRole('radio', { name: /Simple Spot instances/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /Enhanced Spot instances/i })).toBeInTheDocument();
    });

    it('displays option descriptions', () => {
      renderFields();

      expect(screen.getByText(SIMPLE_SPOT_DESCRIPTION)).toBeInTheDocument();
      expect(screen.getByText(ENHANCED_SPOT_DESCRIPTION)).toBeInTheDocument();
    });

    it('checks Simple when mode is simple', () => {
      renderFields({ mode: SpotInterruptionMode.Simple });

      expect(screen.getByRole('radio', { name: /Simple Spot instances/i })).toBeChecked();
      expect(screen.getByRole('radio', { name: /Enhanced Spot instances/i })).not.toBeChecked();
    });

    it('checks Enhanced when mode is enhanced', () => {
      renderFields({ mode: SpotInterruptionMode.Enhanced });

      expect(screen.getByRole('radio', { name: /Enhanced Spot instances/i })).toBeChecked();
      expect(screen.getByRole('radio', { name: /Simple Spot instances/i })).not.toBeChecked();
    });
  });

  describe('enhanced mode fields', () => {
    it('hides the SQS queue URL field when Simple is selected', () => {
      renderFields({ mode: SpotInterruptionMode.Simple });

      expect(screen.queryByPlaceholderText(SQS_QUEUE_URL_PLACEHOLDER)).not.toBeInTheDocument();
      expect(screen.queryByText(DEFAULT_SPOT_INTERRUPTION_PREREQ_ALERT)).not.toBeInTheDocument();
    });

    it('shows the SQS queue URL field when Enhanced is selected', () => {
      renderFields({ mode: SpotInterruptionMode.Enhanced });

      expect(getSqsQueueUrlInput()).toBeInTheDocument();
      expect(screen.getByText(SQS_QUEUE_URL_HELPER_TEXT)).toBeInTheDocument();
    });

    it('shows the prerequisite alert and setup documentation link when Enhanced is selected', () => {
      renderFields({ mode: SpotInterruptionMode.Enhanced });

      expect(screen.getByText(DEFAULT_SPOT_INTERRUPTION_PREREQ_ALERT)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /View setup documentation/i })).toHaveAttribute(
        'href',
        setupDocHref,
      );
    });

    it('hides the prerequisite alert when showPrereqAlert is false', () => {
      renderFields({ mode: SpotInterruptionMode.Enhanced, showPrereqAlert: false });

      expect(screen.queryByText(DEFAULT_SPOT_INTERRUPTION_PREREQ_ALERT)).not.toBeInTheDocument();
      expect(
        screen.queryByRole('link', { name: /View setup documentation/i }),
      ).not.toBeInTheDocument();
    });

    it('displays a custom prerequisite alert message when provided', () => {
      const customMessage = 'Configure AWS resources before enabling Enhanced Spot instances.';

      renderFields({
        mode: SpotInterruptionMode.Enhanced,
        prereqAlertMessage: customMessage,
      });

      expect(screen.getByText(customMessage)).toBeInTheDocument();
    });

    it('displays validation helper text when provided', () => {
      renderFields({
        mode: SpotInterruptionMode.Enhanced,
        sqsQueueUrlValidated: 'error',
        sqsQueueUrlHelperText: 'Enter a valid SQS queue URL.',
      });

      expect(screen.getByText('Enter a valid SQS queue URL.')).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('calls onModeChange with enhanced when Enhanced is selected', async () => {
      const onModeChange = jest.fn();
      const { user } = renderFields({ onModeChange });

      await user.click(screen.getByRole('radio', { name: /Enhanced Spot instances/i }));

      expect(onModeChange).toHaveBeenCalledWith(SpotInterruptionMode.Enhanced);
    });

    it('calls onModeChange with simple when Simple is selected', async () => {
      const onModeChange = jest.fn();
      const { user } = renderFields({
        mode: SpotInterruptionMode.Enhanced,
        onModeChange,
      });

      await user.click(screen.getByRole('radio', { name: /Simple Spot instances/i }));

      expect(onModeChange).toHaveBeenCalledWith(SpotInterruptionMode.Simple);
    });

    it('calls onSqsQueueUrlChange when the SQS queue URL is edited', async () => {
      const onSqsQueueUrlChange = jest.fn();
      const { user } = renderFields({
        mode: SpotInterruptionMode.Enhanced,
        onSqsQueueUrlChange,
      });

      await user.type(getSqsQueueUrlInput(), 'https://sqs.example.com/queue');

      expect(onSqsQueueUrlChange).toHaveBeenCalled();
    });
  });

  describe('disabled states', () => {
    it('disables both radios when isDisabled is true', () => {
      renderFields({ isDisabled: true });

      expect(screen.getByRole('radio', { name: /Simple Spot instances/i })).toBeDisabled();
      expect(screen.getByRole('radio', { name: /Enhanced Spot instances/i })).toBeDisabled();
    });

    it('disables both radios when isModeDisabled is true', () => {
      renderFields({ isModeDisabled: true });

      expect(screen.getByRole('radio', { name: /Simple Spot instances/i })).toBeDisabled();
      expect(screen.getByRole('radio', { name: /Enhanced Spot instances/i })).toBeDisabled();
    });

    it('disables the SQS queue URL input when isDisabled is true', () => {
      renderFields({ mode: SpotInterruptionMode.Enhanced, isDisabled: true });

      expect(getSqsQueueUrlInput()).toBeDisabled();
    });

    it('disables the SQS queue URL input when isSqsQueueUrlDisabled is true', () => {
      renderFields({
        mode: SpotInterruptionMode.Enhanced,
        isSqsQueueUrlDisabled: true,
      });

      expect(getSqsQueueUrlInput()).toBeDisabled();
    });
  });
});
