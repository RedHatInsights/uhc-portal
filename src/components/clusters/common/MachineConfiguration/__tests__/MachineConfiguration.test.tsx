import React from 'react';
import { AxiosResponse } from 'axios';

import {
  MachineConfiguration,
  MachineConfigurationProps,
} from '~/components/clusters/common/MachineConfiguration';
import { checkAccessibility, render, screen, waitFor } from '~/testUtils';
import { KubeletConfig } from '~/types/clusters_mgmt.v1';

import {
  defaultProps,
  existingConfigResponse,
  ResponseError404,
} from './MachineConfiguration.fixtures';

describe('<MachineConfiguration />', () => {
  const errorMessage = 'Please enter a value between 4,096 - 16,384';
  const errorMessageOverride = 'Please enter a value between 4,096 - 3,694,303';
  const helperText = 'The safe PIDs limit range is 4,096 - 16,384';
  const unsafeMessage =
    /Setting a PIDs limit higher than 16,384 on your cluster could potentially cause your workloads to fail unexpectedly/i;
  const pidsInputLabel = 'PIDs limit';

  it('is accessible', async () => {
    const { container } = render(<MachineConfiguration {...defaultProps} />);

    expect(await screen.findByLabelText(pidsInputLabel)).toBeInTheDocument();
    await checkAccessibility(container);
  });

  it('shows a loading animation while fetching the existing configuration', async () => {
    const props: MachineConfigurationProps = {
      ...defaultProps,
      getMachineConfiguration: () => new Promise<AxiosResponse<KubeletConfig>>((_resolve) => {}),
    };
    render(<MachineConfiguration {...props} />);

    expect((await screen.findByText('Save changes')).parentElement).toBeDisabled();
    expect(screen.queryByLabelText(pidsInputLabel)).not.toBeInTheDocument();
    expect(screen.getByText('Loading PIDs limit')).toBeInTheDocument();
  });

  it('shows the default PIDs limit value when a configuration does not exists', async () => {
    const props: MachineConfigurationProps = {
      ...defaultProps,
      getMachineConfiguration: () =>
        new Promise<AxiosResponse<KubeletConfig>>((_resolve, reject) => {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject({ response: { ...ResponseError404 } });
        }),
    };
    render(<MachineConfiguration {...props} />);

    expect(await screen.findByLabelText(pidsInputLabel)).toBeInTheDocument();
    expect(await screen.findByLabelText(pidsInputLabel)).toHaveValue(4096);
  });

  it('shows existing configuration value in the PIDs limit input', async () => {
    render(<MachineConfiguration {...defaultProps} />);

    expect(await screen.findByLabelText(pidsInputLabel)).toBeInTheDocument();
    expect(await screen.findByLabelText(pidsInputLabel)).toHaveValue(
      existingConfigResponse.data.pod_pids_limit,
    );
  });

  it('shows an error message when the user enters an invalid value', async () => {
    const { user } = render(<MachineConfiguration {...defaultProps} />);

    expect(await screen.findByLabelText(pidsInputLabel)).toBeInTheDocument();
    expect(screen.getByText(helperText)).toBeInTheDocument();
    expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();

    await user.clear(screen.getByLabelText(pidsInputLabel));
    await user.type(screen.getByLabelText(pidsInputLabel), '15');

    expect(screen.queryByText(helperText)).not.toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();

    // valid value
    await user.clear(screen.getByLabelText(pidsInputLabel));
    await user.type(screen.getByLabelText(pidsInputLabel), '5_000');

    expect(screen.getByText(helperText)).toBeInTheDocument();
    expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();

    // invalid value above range
    await user.clear(screen.getByLabelText(pidsInputLabel));
    await user.type(screen.getByLabelText(pidsInputLabel), '100_000');

    expect(screen.queryByText(helperText)).not.toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('lets the user enter a value above the safe limit, if they have the capability', async () => {
    const props: MachineConfigurationProps = { ...defaultProps, canBypassPIDsLimit: true };
    const { user } = render(<MachineConfiguration {...props} />);

    expect(await screen.findByLabelText(pidsInputLabel)).toBeInTheDocument();
    expect(screen.getByText(helperText)).toBeInTheDocument();
    expect(screen.queryByText(unsafeMessage)).not.toBeInTheDocument();

    await user.clear(screen.getByLabelText(pidsInputLabel));
    await user.type(screen.getByLabelText(pidsInputLabel, { selector: 'input' }), '100_000');

    expect(await screen.findByText(unsafeMessage)).toBeInTheDocument();
    expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
  });

  it('shows the override max limit error only when the provided value is higher', async () => {
    const props: MachineConfigurationProps = { ...defaultProps, canBypassPIDsLimit: true };
    const { user } = render(<MachineConfiguration {...props} />);

    expect(await screen.findByLabelText(pidsInputLabel)).toBeInTheDocument();
    expect(screen.getByText(helperText)).toBeInTheDocument();
    expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
    expect(screen.queryByText(errorMessageOverride)).not.toBeInTheDocument();

    await user.clear(screen.getByLabelText(pidsInputLabel));
    await user.type(screen.getByLabelText(pidsInputLabel), '100_000_000');

    expect(screen.queryByText(helperText)).not.toBeInTheDocument();
    expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
    expect(screen.getByText(errorMessageOverride)).toBeInTheDocument();
  });

  it('allows the user to change the PIDs limit value using increment buttons', async () => {
    const initialLimitValue = existingConfigResponse.data.pod_pids_limit ?? 0;
    const props: MachineConfigurationProps = {
      ...defaultProps,
    };
    const { user } = render(<MachineConfiguration {...props} />);

    expect(await screen.findByLabelText(pidsInputLabel)).toBeInTheDocument();
    expect(screen.getByLabelText(pidsInputLabel)).toHaveValue(initialLimitValue);

    await user.click(screen.getByLabelText('plus'));

    expect(screen.getByLabelText(pidsInputLabel)).toHaveValue(initialLimitValue + 1);

    await user.click(screen.getByLabelText('minus'));

    expect(screen.getByLabelText(pidsInputLabel)).toHaveValue(initialLimitValue);
  });

  it('autocorrect values out of range when PIDs limit input loses focus', async () => {
    const props: MachineConfigurationProps = {
      ...defaultProps,
    };
    const { user } = render(<MachineConfiguration {...props} />);

    expect(await screen.findByLabelText(pidsInputLabel)).toBeInTheDocument();

    await user.clear(screen.getByLabelText(pidsInputLabel));
    await user.type(screen.getByLabelText(pidsInputLabel), '100_000');

    (await screen.findByLabelText(pidsInputLabel)).focus();
    expect(screen.getByLabelText(pidsInputLabel)).toHaveValue(100_000);

    await waitFor(() => {
      screen.getByLabelText(pidsInputLabel).blur();
    });

    expect(screen.getByLabelText(pidsInputLabel)).toHaveValue(16_384);
  });

  it('enables the save button only when the PIDs limit value was changed', async () => {
    const props: MachineConfigurationProps = {
      ...defaultProps,
    };
    const { user } = render(<MachineConfiguration {...props} />);

    expect(await screen.findByLabelText(pidsInputLabel)).toBeInTheDocument();
    expect(screen.getByText('Save changes').parentElement).toBeDisabled();

    await user.clear(screen.getByLabelText(pidsInputLabel));
    await user.type(screen.getByLabelText(pidsInputLabel), '10_000');

    expect(await screen.findByText('Save changes')).toBeEnabled();

    await user.clear(screen.getByLabelText(pidsInputLabel));
    await user.type(
      screen.getByLabelText(pidsInputLabel),
      `${existingConfigResponse.data.pod_pids_limit}`,
    );

    expect(screen.getByText('Save changes').parentElement).toBeDisabled();
  });

  it('save changes by creating a new configuration if one does not exist yet', async () => {
    const props: MachineConfigurationProps = {
      ...defaultProps,
      getMachineConfiguration: () =>
        new Promise<AxiosResponse<KubeletConfig>>((_resolve, reject) => {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject({ response: { ...ResponseError404 } });
        }),
      createMachineConfiguration: jest.fn(() =>
        Promise.resolve({ data: {} } as AxiosResponse<KubeletConfig>),
      ),
    };
    const { user } = render(<MachineConfiguration {...props} />);

    expect(await screen.findByLabelText(pidsInputLabel)).toBeInTheDocument();

    await user.clear(screen.getByLabelText(pidsInputLabel));
    await user.type(screen.getByLabelText(pidsInputLabel), '5000');

    expect(props.updateMachineConfiguration).toHaveBeenCalledTimes(0);
    expect(props.createMachineConfiguration).toHaveBeenCalledTimes(0);

    await user.click(screen.getByText('Save changes'));

    await waitFor(() => {
      expect(props.createMachineConfiguration).toHaveBeenCalledTimes(1);
    });

    expect(props.createMachineConfiguration).toHaveBeenCalledWith(props.clusterID, {
      pod_pids_limit: 5000,
    });
    expect(props.updateMachineConfiguration).toHaveBeenCalledTimes(0);
  });

  it('save changes by updating the existing kubelet configuration', async () => {
    const props = {
      ...defaultProps,
      updateMachineConfiguration: jest.fn(() =>
        Promise.resolve({ data: {} } as AxiosResponse<KubeletConfig>),
      ),
      onClose: jest.fn(),
    };
    const { user } = render(<MachineConfiguration {...props} />);

    expect(await screen.findByLabelText(pidsInputLabel)).toBeInTheDocument();

    await user.clear(screen.getByLabelText(pidsInputLabel));
    await user.type(screen.getByLabelText(pidsInputLabel), '5000');

    expect(props.createMachineConfiguration).toHaveBeenCalledTimes(0);
    expect(props.updateMachineConfiguration).toHaveBeenCalledTimes(0);

    await user.click(screen.getByText('Save changes'));

    await waitFor(() => {
      expect(props.updateMachineConfiguration).toHaveBeenCalledTimes(1);
    });

    expect(props.updateMachineConfiguration).toHaveBeenCalledWith(props.clusterID, {
      pod_pids_limit: 5000,
    });
    expect(props.createMachineConfiguration).toHaveBeenCalledTimes(0);
  });

  it('disables the action buttons while saving changes', async () => {
    const props = {
      ...defaultProps,
      updateMachineConfiguration: jest.fn(
        () => new Promise<AxiosResponse<KubeletConfig>>((_resolve) => {}),
      ),
      onClose: jest.fn(),
    };
    const { user } = render(<MachineConfiguration {...props} />);

    expect(await screen.findByLabelText(pidsInputLabel)).toBeInTheDocument();
    expect(screen.getByText('Save changes').parentElement).toBeDisabled();
    expect(screen.getByText('Cancel').parentElement).toBeEnabled();

    await user.clear(screen.getByLabelText(pidsInputLabel));
    await user.type(screen.getByLabelText(pidsInputLabel), '5000');

    expect(screen.getByText('Save changes')).toBeEnabled();

    await user.click(screen.getByText('Save changes'));

    expect((await screen.findByText('Save changes')).parentElement).toBeDisabled();
    expect((await screen.findByText('Cancel')).parentElement).toBeDisabled();
  });

  it('calls the onClose callback when clicking the "Cancel" button', async () => {
    const props = { ...defaultProps, onClose: jest.fn() };
    const { user } = render(<MachineConfiguration {...props} />);

    expect(await screen.findByLabelText(pidsInputLabel)).toBeInTheDocument();
    expect(props.onClose).toHaveBeenCalledTimes(0);

    await user.click(screen.getByText('Cancel'));

    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('shows an error message when an error occurs while fetching existing configuration', async () => {
    const props: MachineConfigurationProps = {
      ...defaultProps,
      getMachineConfiguration: () =>
        new Promise<AxiosResponse<KubeletConfig>>((_resolve, reject) => {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject({ response: { status: 500, statusText: '', config: {}, headers: {} } });
        }),
      onClose: jest.fn(),
    };
    const { user } = render(<MachineConfiguration {...props} />);

    expect(await screen.findByText('Unable to retrieve configuration')).toBeInTheDocument();
    expect(screen.queryByLabelText(pidsInputLabel)).not.toBeInTheDocument();
    expect(screen.queryByText('Loading PIDs limit')).not.toBeInTheDocument();
    expect(props.onClose).toHaveBeenCalledTimes(0);

    await user.click(screen.getByText('Close'));

    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('shows an error message when an error occurs while saving the machine configuration', async () => {
    const savingErrorMessage = 'There was an error saving the machine configuration';
    const errorData = {
      kind: 'Error',
      id: '500',
      href: '/api/clusters_mgmt/v1/errors/500',
      code: 'CLUSTERS-MGMT-500',
      reason: savingErrorMessage,
      operation_id: '1fca1997-d505-48d8-bc7a-a179ea28c6d3',
    };
    const props: MachineConfigurationProps = {
      ...defaultProps,
      updateMachineConfiguration: () =>
        new Promise<AxiosResponse<KubeletConfig>>((_resolve, reject) => {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject({
            response: {
              status: 500,
              statusText: '',
              config: {},
              headers: {},
              data: errorData,
            },
          });
        }),
      onClose: jest.fn(),
    };
    const { user } = render(<MachineConfiguration {...props} />);

    expect(await screen.findByLabelText(pidsInputLabel)).toBeInTheDocument();
    expect(screen.queryByText(savingErrorMessage)).not.toBeInTheDocument();

    await user.clear(screen.getByLabelText(pidsInputLabel));
    await user.type(screen.getByLabelText(pidsInputLabel), '8000');

    await user.click(screen.getByText('Save changes'));

    expect(await screen.findByText(savingErrorMessage)).toBeInTheDocument();
  });
});
