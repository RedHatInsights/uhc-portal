import React from 'react';
import { Formik } from 'formik';

import { IMDSType } from '~/components/clusters/wizards/common/constants';
import * as wizardHooks from '~/components/clusters/wizards/hooks';
import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import * as useCanClusterAutoscale from '~/hooks/useCanClusterAutoscale';
import { IMDS_SELECTION } from '~/queries/featureGates/featureConstants';
import { checkAccessibility, mockUseFeatureGate, render, screen, userEvent } from '~/testUtils';

import ScaleSection from './ScaleSection';

const useFormStateMock = jest.spyOn(wizardHooks, 'useFormState');
const useCanClusterAutoscaleMock = jest.spyOn(useCanClusterAutoscale, 'default');

const formStateBaseMock = {
  values: {
    [FieldId.SelectedVpc]: null,
    [FieldId.Hypershift]: false,
    [FieldId.MultiAz]: false,
    [FieldId.MachineType]: null,
    [FieldId.CloudProviderId]: null,
    [FieldId.Product]: null,
    [FieldId.AutoscalingEnabled]: false,
    [FieldId.NodeLabels]: [],
    [FieldId.ClusterVersion]: {},
    [FieldId.MachinePoolsSubnets]: [],
    [FieldId.InstallerRoleArn]: null,
    [FieldId.Region]: null,
    [FieldId.BillingModel]: null,
    [FieldId.IMDS]: IMDSType.V1AndV2,
  },
  errors: {},
  validateForm: jest.fn(),
  getFieldProps: jest.fn(),
  setFieldValue: jest.fn(),
  setFieldTouched: jest.fn(),
  getFieldMeta: jest.fn().mockReturnValue({}),
  validateField: jest.fn(),
};

describe('<ScaleSection />', () => {
  beforeEach(() => {
    useFormStateMock.mockReturnValue(formStateBaseMock);
    useCanClusterAutoscaleMock.mockReturnValue(false);
    jest.clearAllMocks();
  });

  afterEach(() => {
    useFormStateMock.mockClear();
    useCanClusterAutoscaleMock.mockClear();
    jest.clearAllMocks();
  });

  it('is accessible', async () => {
    const { container } = render(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <ScaleSection />
      </Formik>,
    );
    await checkAccessibility(container);
  });

  describe('"instance type" section', () => {
    it('is rendered with initial state of "loading"', async () => {
      render(
        <Formik initialValues={{}} onSubmit={() => {}}>
          <ScaleSection />
        </Formik>,
      );
      const machineTypeSelectLoader = screen.getByText('Loading node types...');
      expect(machineTypeSelectLoader).toBeInTheDocument();
    });
  });

  describe('"autoscaling" section', () => {
    it('is rendered when `useCanClusterAutoscale` returns a truthy value', () => {
      useCanClusterAutoscaleMock.mockReturnValue(true);
      render(
        <Formik initialValues={{}} onSubmit={() => {}}>
          <ScaleSection />
        </Formik>,
      );
      const autoscalingSection = screen.getByText('Autoscaling');
      expect(autoscalingSection).toBeInTheDocument();
    });

    it('is not rendered when `useCanClusterAutoscale` returns a falsy value', () => {
      useCanClusterAutoscaleMock.mockReturnValue(null);
      render(
        <Formik initialValues={{}} onSubmit={() => {}}>
          <ScaleSection />
        </Formik>,
      );
      const autoscalingSection = screen.queryByText('Autoscaling');
      expect(autoscalingSection).not.toBeInTheDocument();
    });
  });

  describe('"compute node count" field', () => {
    it('is rendered by default', () => {
      render(
        <Formik initialValues={{}} onSubmit={() => {}}>
          <ScaleSection />
        </Formik>,
      );
      const nodeCount = screen.getByText('Compute node count');
      expect(nodeCount).toBeInTheDocument();
    });

    it('is not rendered when "enable autoscaling" form value is checked', () => {
      useFormStateMock.mockReturnValue({
        ...formStateBaseMock,
        values: {
          ...formStateBaseMock.values,
          [FieldId.AutoscalingEnabled]: true,
        },
      });
      render(
        <Formik initialValues={{}} onSubmit={() => {}}>
          <ScaleSection />
        </Formik>,
      );
      const nodeCount = screen.queryByText('Compute node count');
      expect(nodeCount).not.toBeInTheDocument();
    });

    it('is rendered with "(per zone)" appended to its label when "multi AZ" form value is checked', () => {
      useFormStateMock.mockReturnValue({
        ...formStateBaseMock,
        values: {
          ...formStateBaseMock.values,
          [FieldId.MultiAz]: 'true',
        },
      });
      render(
        <Formik initialValues={{}} onSubmit={() => {}}>
          <ScaleSection />
        </Formik>,
      );
      const nodeCount = screen.getByText('Compute node count (per zone)');
      expect(nodeCount).toBeInTheDocument();
    });

    it('is rendered with "(per machine pool)" appended to its label when "hypershift" form value is checked', () => {
      useFormStateMock.mockReturnValue({
        ...formStateBaseMock,
        values: {
          ...formStateBaseMock.values,
          [FieldId.Hypershift]: 'true',
        },
      });
      render(
        <Formik initialValues={{}} onSubmit={() => {}}>
          <ScaleSection />
        </Formik>,
      );
      const nodeCount = screen.getByText('Compute node count (per machine pool)');
      expect(nodeCount).toBeInTheDocument();
    });
  });

  describe('"imds" section', () => {
    it('is not rendered when "hypershift" form value is checked and feature gate is disabled', () => {
      // Disable the IMDS_SELECTION feature gate
      mockUseFeatureGate([[IMDS_SELECTION, false]]);
      useFormStateMock.mockReturnValue({
        ...formStateBaseMock,
        values: {
          ...formStateBaseMock.values,
          [FieldId.Hypershift]: 'true',
        },
      });
      render(
        <Formik initialValues={{}} onSubmit={() => {}}>
          <ScaleSection />
        </Formik>,
      );
      const imdsSection = screen.queryByText('Instance Metadata Service');
      expect(imdsSection).not.toBeInTheDocument();
    });

    it('is rendered when "hypershift" form value is checked and feature gate is enabled', () => {
      // Enable the IMDS_SELECTION feature gate
      mockUseFeatureGate([[IMDS_SELECTION, true]]);
      useFormStateMock.mockReturnValue({
        ...formStateBaseMock,
        values: {
          ...formStateBaseMock.values,
          [FieldId.Hypershift]: 'true',
        },
      });
      render(
        <Formik initialValues={{}} onSubmit={() => {}}>
          <ScaleSection />
        </Formik>,
      );
      const imdsSection = screen.queryByText('Instance Metadata Service');
      expect(imdsSection).toBeInTheDocument();
    });

    it('is not rendered when "hypershift" form value is checked and "imds" form value is selected', () => {
      mockUseFeatureGate([[IMDS_SELECTION, false]]);
      useFormStateMock.mockReturnValue({
        ...formStateBaseMock,
        values: {
          ...formStateBaseMock.values,
          [FieldId.IMDS]: 'optional',
          [FieldId.Hypershift]: 'true',
        },
      });
      render(
        <Formik initialValues={{}} onSubmit={() => {}}>
          <ScaleSection />
        </Formik>,
      );
      const imdsSection = screen.queryByText('Instance Metadata Service');
      expect(imdsSection).not.toBeInTheDocument();
    });

    it('is rendered when "hypershift" form value is not checked and "imds" form value is selected', () => {
      useFormStateMock.mockReturnValue({
        ...formStateBaseMock,
        values: {
          ...formStateBaseMock.values,
          [FieldId.IMDS]: 'optional',
        },
      });
      render(
        <Formik initialValues={{}} onSubmit={() => {}}>
          <ScaleSection />
        </Formik>,
      );
      const imdsSection = screen.getByText('Instance Metadata Service');
      expect(imdsSection).toBeInTheDocument();
    });

    it('invokes `setFieldValue` when "imds" selection changes', async () => {
      const formStateMock = {
        ...formStateBaseMock,
        values: {
          ...formStateBaseMock.values,
          [FieldId.IMDS]: 'optional',
          // a compatible cluster version needs to be specified in order to
          // render the imds field inner contents (i.e. the radio buttons)
          [FieldId.ClusterVersion]: { raw_id: '4.11.0' },
        },
      };
      useFormStateMock.mockReturnValue(formStateMock);
      render(
        <Formik initialValues={{}} onSubmit={() => {}}>
          <ScaleSection />
        </Formik>,
      );
      const imdsRadioSecondOption = screen.getByLabelText('Use IMDSv2 only');
      await userEvent.click(imdsRadioSecondOption);
      expect(formStateMock.setFieldValue).toHaveBeenLastCalledWith(
        'imds',
        'required',
        expect.anything(),
      );
    });

    it('invokes `setFieldValue` via the `onChangeImds` callback to reset "imds" value to its default when "imds" field is disabled', () => {
      const formStateMock = {
        ...formStateBaseMock,
        values: {
          ...formStateBaseMock.values,
          [FieldId.IMDS]: 'required',
          // the lack of a compatible cluster version will render the imds field as 'disabled'
        },
      };
      useFormStateMock.mockReturnValue(formStateMock);
      render(
        <Formik initialValues={{}} onSubmit={() => {}}>
          <ScaleSection />
        </Formik>,
      );
      expect(formStateMock.setFieldValue).toHaveBeenCalledWith('imds', 'optional');
    });
  });

  describe('"worker node disk size" section', () => {
    it('is rendered by default', () => {
      render(
        <Formik initialValues={{}} onSubmit={() => {}}>
          <ScaleSection />
        </Formik>,
      );
      const diskSize = screen.getByText('Root disk size');
      expect(diskSize).toBeInTheDocument();
    });

    it('is rendered when "hypershift" form value is checked', () => {
      useFormStateMock.mockReturnValue({
        ...formStateBaseMock,
        values: {
          ...formStateBaseMock.values,
          [FieldId.Hypershift]: 'true',
        },
      });
      render(
        <Formik initialValues={{}} onSubmit={() => {}}>
          <ScaleSection />
        </Formik>,
      );
      const diskSize = screen.getByText('Root disk size');
      expect(diskSize).toBeInTheDocument();
    });
  });

  describe('"add node labels" section', () => {
    it('is rendered by default', () => {
      render(
        <Formik initialValues={{}} onSubmit={() => {}}>
          <ScaleSection />
        </Formik>,
      );
      const nodeLabels = screen.getByText('Add node labels');
      expect(nodeLabels).toBeInTheDocument();
    });

    it('renders its expandable contents when toggled', async () => {
      render(
        <Formik initialValues={{}} onSubmit={() => {}}>
          <ScaleSection />
        </Formik>,
      );
      const nodeLabels = screen.getByText('Add node labels');
      await userEvent.click(nodeLabels);
      const nodeLabelsContent = screen.getByText(
        'Configure labels that will apply to all nodes in this machine pool.',
      );
      expect(nodeLabelsContent).toBeInTheDocument();
    });

    it('is not rendered when "hypershift" form value is checked', () => {
      useFormStateMock.mockReturnValue({
        ...formStateBaseMock,
        values: {
          ...formStateBaseMock.values,
          [FieldId.Hypershift]: 'true',
        },
      });
      render(
        <Formik initialValues={{}} onSubmit={() => {}}>
          <ScaleSection />
        </Formik>,
      );
      const nodeLabels = screen.queryByText('Add node labels');
      expect(nodeLabels).not.toBeInTheDocument();
    });
  });
});
