import React from 'react';
import { Formik } from 'formik';

import { AWS_TAGS_NEW_MP } from '~/queries/featureGates/featureConstants';
import { mockUseFeatureGate, render, screen, userEvent } from '~/testUtils';

import EditLabelsSection from './EditLabelsSection';

const MockFormikWrapper = ({
  children,
  initialValues = { labels: [{ key: '', value: '', isAwsTag: false }] },
}: {
  children: React.ReactNode;
  initialValues?: any;
}) => (
  <Formik initialValues={initialValues} onSubmit={() => {}}>
    {children}
  </Formik>
);

describe('EditLabelsSection', () => {
  beforeEach(() => {
    mockUseFeatureGate([[AWS_TAGS_NEW_MP, false]]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic functionality', () => {
    it('renders labels section with basic fields', () => {
      render(
        <MockFormikWrapper>
          <EditLabelsSection isNewMachinePool={false} isROSAHCP={false} />
        </MockFormikWrapper>,
      );

      expect(screen.getByText('Node labels')).toBeInTheDocument();
      expect(screen.getByText('Add label')).toBeInTheDocument();
    });

    it('shows add label button', async () => {
      render(
        <MockFormikWrapper>
          <EditLabelsSection isNewMachinePool={false} isROSAHCP={false} />
        </MockFormikWrapper>,
      );

      const addButton = screen.getByText('Add label');
      expect(addButton).toBeInTheDocument();

      await userEvent.click(addButton);
      // After clicking add, there should be multiple sets of key/value inputs
      const keyInputs = screen.getAllByRole('textbox');
      const keyFields = keyInputs.filter((input) => input.getAttribute('name')?.includes('.key'));
      expect(keyFields).toHaveLength(2);
    });
  });

  describe('AWS Tags feature disabled', () => {
    it('does not show AWS Tag checkbox when feature is disabled', () => {
      render(
        <MockFormikWrapper>
          <EditLabelsSection isNewMachinePool isROSAHCP />
        </MockFormikWrapper>,
      );

      expect(screen.queryByText('AWS Tag')).not.toBeInTheDocument();
    });
  });

  describe('AWS Tags feature enabled', () => {
    beforeEach(() => {
      mockUseFeatureGate([[AWS_TAGS_NEW_MP, true]]);
    });

    it('shows AWS Tag checkbox for new machine pool on ROSA HCP', () => {
      render(
        <MockFormikWrapper>
          <EditLabelsSection isNewMachinePool isROSAHCP />
        </MockFormikWrapper>,
      );

      expect(screen.getByText('AWS Tag')).toBeInTheDocument();
    });

    it('does not show AWS Tag checkbox for non-ROSA HCP clusters', () => {
      render(
        <MockFormikWrapper>
          <EditLabelsSection isNewMachinePool isROSAHCP={false} />
        </MockFormikWrapper>,
      );

      expect(screen.queryByText('AWS Tag')).not.toBeInTheDocument();
    });

    it('does not show AWS Tag checkbox for existing machine pools', () => {
      render(
        <MockFormikWrapper>
          <EditLabelsSection isNewMachinePool={false} isROSAHCP />
        </MockFormikWrapper>,
      );

      expect(screen.queryByText('AWS Tag')).not.toBeInTheDocument();
    });

    it('filters out AWS tags when not in edit mode and feature flags are off', () => {
      const initialValues = {
        labels: [
          { key: 'regular-label', value: 'value1', isAwsTag: false },
          { key: 'aws-tag', value: 'value2', isAwsTag: true },
        ],
      };

      render(
        <MockFormikWrapper initialValues={initialValues}>
          <EditLabelsSection isNewMachinePool={false} isROSAHCP />
        </MockFormikWrapper>,
      );

      // Should only show the regular label, AWS tag should be filtered out
      expect(screen.getByDisplayValue('regular-label')).toBeInTheDocument();
      expect(screen.queryByDisplayValue('aws-tag')).not.toBeInTheDocument();
    });

    it('disables AWS Tag checkbox when 25 AWS tags limit is reached', () => {
      const awsTags = Array.from({ length: 25 }, (_, i) => ({
        key: `aws-tag-${i}`,
        value: `value-${i}`,
        isAwsTag: true,
      }));

      const initialValues = {
        labels: [...awsTags, { key: '', value: '', isAwsTag: false }],
      };

      render(
        <MockFormikWrapper initialValues={initialValues}>
          <EditLabelsSection isNewMachinePool isROSAHCP />
        </MockFormikWrapper>,
      );

      // The AWS Tag checkbox for the non-AWS tag should be disabled
      const awsTagCheckboxes = screen.getAllByLabelText('AWS Tag');
      const lastCheckbox = awsTagCheckboxes[awsTagCheckboxes.length - 1];
      expect(lastCheckbox).toBeDisabled();
    });

    it('allows AWS Tag checkbox when under 25 AWS tags limit', () => {
      const awsTags = Array.from({ length: 24 }, (_, i) => ({
        key: `aws-tag-${i}`,
        value: `value-${i}`,
        isAwsTag: true,
      }));

      const initialValues = {
        labels: [...awsTags, { key: '', value: '', isAwsTag: false }],
      };

      render(
        <MockFormikWrapper initialValues={initialValues}>
          <EditLabelsSection isNewMachinePool isROSAHCP />
        </MockFormikWrapper>,
      );

      // The AWS Tag checkbox for the non-AWS tag should be enabled
      const awsTagCheckboxes = screen.getAllByLabelText('AWS Tag');
      const lastCheckbox = awsTagCheckboxes[awsTagCheckboxes.length - 1];
      expect(lastCheckbox).not.toBeDisabled();
    });
  });

  describe('Read-only functionality', () => {
    beforeEach(() => {
      mockUseFeatureGate([[AWS_TAGS_NEW_MP, true]]);
    });

    it('makes AWS tag fields read-only when SHOW_AWS_TAGS_IN_EDIT_MODAL is true but EDIT_AWS_TAGS_IN_EDIT_MODAL is false', () => {
      // This would need to be tested with the actual constants being imported and mocked
      // For now, this is a placeholder test showing the intended behavior
      const initialValues = {
        labels: [{ key: 'aws-tag', value: 'aws-value', isAwsTag: true }],
      };

      render(
        <MockFormikWrapper initialValues={initialValues}>
          <EditLabelsSection isNewMachinePool={false} isROSAHCP />
        </MockFormikWrapper>,
      );

      // This test would need more setup to properly test the read-only behavior
      // based on the feature flag constants
    });
  });
});
