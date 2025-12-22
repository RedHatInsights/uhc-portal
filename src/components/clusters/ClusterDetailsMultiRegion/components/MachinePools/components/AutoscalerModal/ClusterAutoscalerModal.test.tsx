import React from 'react';
import { Formik } from 'formik';

import { FieldId } from '~/components/clusters/wizards/common';
import { useDisableClusterAutoscaler } from '~/queries/ClusterDetailsQueries/MachinePoolTab/ClusterAutoscaler/useDisableClusterAutoscaler';
import { useEnableClusterAutoscaler } from '~/queries/ClusterDetailsQueries/MachinePoolTab/ClusterAutoscaler/useEnableClusterAutoscaler';
import { checkAccessibility, mockUseFormState, render, screen, userEvent } from '~/testUtils';

import { clusterAutoscalerData } from './ClusterAutoscaler.fixtures';
import { ClusterAutoscalerModal } from './ClusterAutoscalerModal';

jest.mock('~/components/clusters/wizards/hooks/useFormState');

jest.mock(
  '~/queries/ClusterDetailsQueries/MachinePoolTab/ClusterAutoscaler/useDisableClusterAutoscaler',
  () => ({
    useDisableClusterAutoscaler: jest.fn(() => ({
      data: undefined,
      mutate: jest.fn(),
      isPending: false,
    })),
  }),
);
jest.mock(
  '~/queries/ClusterDetailsQueries/MachinePoolTab/ClusterAutoscaler/useEnableClusterAutoscaler',
  () => ({
    useEnableClusterAutoscaler: jest.fn(() => ({
      data: undefined,
      mutate: jest.fn(),
      isPending: false,
    })),
  }),
);

const initalPropsWithoutAutoscalingMachinePools = {
  submitForm: jest.fn(),
  isUpdateClusterAutoscalerPending: false,
  clusterId: '123CLUSTERID',
  hasClusterAutoscaler: true,
  isRosa: true,
  isOpen: true,
  isWizard: false,
  dirty: false,
  hasAutoscalingMachinePools: false,
  isClusterAutoscalerRefetching: false,
  maxNodesTotalDefault: 180,
  isUpdateAutoscalerFormError: false,
  updateAutoscalerFormError: {
    isLoading: false,
    isError: false,
    error: null,
  },
};

const dirtyForm = {
  ...initalPropsWithoutAutoscalingMachinePools,
  dirty: true,
};

describe('Cluster autoscaler modal', () => {
  beforeEach(() => {
    mockUseFormState({
      values: { [FieldId.ClusterAutoscaling]: { ...clusterAutoscalerData } },
      errors: { [FieldId.ClusterAutoscaling]: 'Error message' },
    });
  });

  const useDisableClusterAutoscalerMock = useDisableClusterAutoscaler as jest.Mock;
  const useEnableClusterAutoscalerMock = useEnableClusterAutoscaler as jest.Mock;
  it('is accessible', async () => {
    const { container } = render(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <ClusterAutoscalerModal {...initalPropsWithoutAutoscalingMachinePools} />
      </Formik>,
    );

    await checkAccessibility(container);
  });

  it("won't autscale because no machine pools with autoscaling warning", () => {
    render(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <ClusterAutoscalerModal {...initalPropsWithoutAutoscalingMachinePools} />
      </Formik>,
    );

    expect(
      screen.getByText(
        /The cluster autoscaling settings will not have any effect as no machine pools are set to autoscale./i,
      ),
    ).toBeInTheDocument();
  });

  it('Changing default value results in save button', async () => {
    const { rerender } = render(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <ClusterAutoscalerModal {...initalPropsWithoutAutoscalingMachinePools} />
      </Formik>,
    );

    const inputElement = screen.getByRole('textbox', { name: /max-node-provision-time/i });
    await userEvent.clear(inputElement);
    await userEvent.type(inputElement, '18m');

    rerender(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <ClusterAutoscalerModal {...dirtyForm} />
      </Formik>,
    );

    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('Switch cluster autoscaler off', async () => {
    const mutateDisableMock = jest.fn();

    useDisableClusterAutoscalerMock.mockReturnValue({
      isPending: false,
      mutate: mutateDisableMock,
    });

    render(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <ClusterAutoscalerModal {...initalPropsWithoutAutoscalingMachinePools} />
      </Formik>,
    );

    const clusterSwitch = screen.getByRole('switch', { name: /Autoscale cluster/i });

    await userEvent.click(clusterSwitch);

    expect(mutateDisableMock).toHaveBeenCalled();
  });

  it('Switch cluster autoscaler on', async () => {
    const mutateEnableMock = jest.fn();
    useEnableClusterAutoscalerMock.mockReturnValue({
      isPeding: false,
      mutate: mutateEnableMock,
    });

    render(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <ClusterAutoscalerModal
          {...initalPropsWithoutAutoscalingMachinePools}
          hasClusterAutoscaler={false}
        />
      </Formik>,
    );

    const clusterSwitch = screen.getByRole('switch', { name: /Autoscale cluster/i });

    await userEvent.click(clusterSwitch);
    expect(mutateEnableMock).toHaveBeenCalled();
  });

  it('Shows an error message', async () => {
    const mutateEnableMock = jest.fn();
    useEnableClusterAutoscalerMock.mockReturnValue({
      isPeding: false,
      mutate: mutateEnableMock,
      error: false,
    });
    const mutateDisableMock = jest.fn();
    useDisableClusterAutoscalerMock.mockReturnValue({
      isPending: false,
      mutate: mutateDisableMock,
      error: false,
    });

    const errorProps = {
      ...initalPropsWithoutAutoscalingMachinePools,
      isUpdateAutoscalerFormError: true,
      updateAutoscalerFormError: {
        isLoading: false,
        isError: true,
        error: {
          pending: false,
          error: true,
          fulfilled: false,
          errorCode: 400,
          errorMessage:
            "CLUSTERS-MGMT-400: The total number of compute nodes for a single cluster '2' cannot exceed the maximum worker nodes allowed by the cluster autoscaler '-4'. Reduce the total compute nodes from the cluster or increase the maximum worker nodes allowed by the cluster autoscaler.",
          reason:
            "The total number of compute nodes for a single cluster '2' cannot exceed the maximum worker nodes allowed by the cluster autoscaler '-4'. Reduce the total compute nodes from the cluster or increase the maximum worker nodes allowed by the cluster autoscaler.",
          internalErrorCode: 'CLUSTERS-MGMT-400',
          operationID: 'ef56fb84-f6d9-4f9d-9d1d-7400059f24c9',
        },
      },
    };
    render(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <ClusterAutoscalerModal {...errorProps} hasClusterAutoscaler={false} />
      </Formik>,
    );
    expect(screen.getByTestId('alert-error')).toBeInTheDocument();
  });

  it('Reset to default resets the form', async () => {
    render(
      <Formik initialValues={{}} onSubmit={() => {}}>
        <ClusterAutoscalerModal
          {...initalPropsWithoutAutoscalingMachinePools}
          hasClusterAutoscaler
          hasAutoscalingMachinePools
        />
      </Formik>,
    );

    const clusterSwitch = screen.getByRole('switch', { name: /Autoscale cluster/i });

    await userEvent.click(clusterSwitch);

    const userInputbox = screen.getByRole('textbox', { name: /max-node-provision-time/i });
    await userEvent.type(userInputbox, 'testValue');

    const revertToDefaultsBtn = screen.getByRole('button', { name: /Revert all to defaults/i });
    const closeSaveBtn = screen
      .getAllByRole('button', { name: /Close/i })
      .find((btn) => btn.getAttribute('type') === 'submit');

    expect(closeSaveBtn).toBeDisabled();
    expect(revertToDefaultsBtn).not.toBeDisabled();
  });
});
