import React from 'react';
import * as reactRedux from 'react-redux';

import { useGlobalState } from '~/redux/hooks';
import apiRequest from '~/services/apiRequest';
import { render, screen, UserEvent, userEvent, waitFor } from '~/testUtils';
import { UpgradePolicy } from '~/types/clusters_mgmt.v1';

import UpgradeAcknowledgeModal from '../UpgradeAcknowledgeModal/UpgradeAcknowledgeModal';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('~/redux/hooks', () => ({
  useGlobalState: jest.fn(),
}));

const ackWord = 'Acknowledge';
const approvalButton = 'Approve and continue';
const errMsg = 'Failed to save administrator acknowledgement.';

const clickSubmitButton = async (user: UserEvent) => {
  const inputBox = await screen.findByRole('textbox');
  await user.clear(inputBox);
  await user.type(inputBox, ackWord);
  await waitFor(() => {
    expect(screen.getByRole('button', { name: approvalButton })).toBeEnabled();
  });
  await user.click(screen.getByRole('button', { name: approvalButton }));
};

const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
const mockedDispatch = jest.fn();
useDispatchMock.mockReturnValue(mockedDispatch);

const mockedUseGlobalState = useGlobalState as jest.Mock;

interface TestModalData {
  fromVersion: string;
  toVersion: string;
  unmetAcknowledgements: Array<{ id: string }>;
  isHypershift: boolean;
  isSTSEnabled: boolean;
}

interface TestDefaultProps {
  clusterId: string;
  schedules: UpgradePolicy[];
}

describe('<UpgradeAcknowledgeModal> ', () => {
  const modalData: TestModalData = {
    fromVersion: '1.2.3',
    toVersion: '1.3.4',
    unmetAcknowledgements: [{ id: 'unMetAck1' }, { id: 'unMetAck2' }],
    isHypershift: false,
    isSTSEnabled: false,
  };
  const defaultProps: TestDefaultProps = {
    clusterId: 'myClusterId',
    schedules: [
      {
        upgrade_type: 'OSD',
        schedule_type: 'automatic',
        id: 'myUpgradePolicyId',
      } as UpgradePolicy,
    ],
  };
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('API call for each gates calls action and y-stream approval', async () => {
    const apiReturnValue = { data: { enable_minor_version_upgrades: true } };
    (apiRequest.patch as jest.Mock).mockResolvedValue(apiReturnValue);
    (apiRequest.post as jest.Mock).mockResolvedValue(apiReturnValue);

    mockedUseGlobalState.mockReturnValue(modalData);

    render(<UpgradeAcknowledgeModal {...defaultProps} />);

    const user = await userEvent.setup({
      delay: null,
    });

    await clickSubmitButton(user);

    expect(apiRequest.patch).toHaveBeenCalledWith(
      '/api/clusters_mgmt/v1/clusters/myClusterId/upgrade_policies/myUpgradePolicyId',
      { enable_minor_version_upgrades: true },
    );
    expect(apiRequest.post).toHaveBeenNthCalledWith(
      1,
      '/api/clusters_mgmt/v1/clusters/myClusterId/gate_agreements',
      { version_gate: { id: 'unMetAck1' } },
    );
    expect(apiRequest.post).toHaveBeenNthCalledWith(
      2,
      '/api/clusters_mgmt/v1/clusters/myClusterId/gate_agreements',
      { version_gate: { id: 'unMetAck2' } },
    );
    expect(mockedDispatch).toHaveBeenCalledTimes(4);
    // Call updatePolicy (y-stream) action
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_CLUSTER_UPGRADE_POLICY',
      payload: {
        enable_minor_version_upgrades: true,
      },
    });

    // Call updateGate action
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_CLUSTER_UPGRADE_GATE',
      payload: 'unMetAck1',
    });
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_CLUSTER_UPGRADE_GATE',
      payload: 'unMetAck2',
    });

    // Since success, close modal
    expect(mockedDispatch).toHaveBeenCalledWith({ type: 'CLOSE_MODAL' });
    expect(screen.queryByRole('alert', { name: 'Danger Alert' })).not.toBeInTheDocument();
  });

  it('Error is shown for failed y-stream approval action', async () => {
    mockedUseGlobalState.mockReturnValue(modalData);
    const apiError = { reason: 'an error happened', errorMessage: 'error message' };
    (apiRequest.patch as jest.Mock).mockRejectedValue(apiError);

    const { rerender } = render(<UpgradeAcknowledgeModal {...defaultProps} />);
    const user = await userEvent.setup({
      delay: null,
    });

    await clickSubmitButton(user);

    expect(apiRequest.patch).toHaveBeenCalledTimes(1);
    expect(apiRequest.patch).toHaveBeenNthCalledWith(
      1,
      '/api/clusters_mgmt/v1/clusters/myClusterId/upgrade_policies/myUpgradePolicyId',
      { enable_minor_version_upgrades: true },
    );

    // Call updatePolicy (y-stream) action
    expect(mockedDispatch).not.toHaveBeenCalledWith({
      type: 'SET_CLUSTER_UPGRADE_POLICY',
      payload: {
        enable_minor_version_upgrades: true,
      },
    });
    expect(mockedDispatch).not.toHaveBeenCalled();
    // Call updateGate action
    expect(mockedDispatch).not.toHaveBeenCalledWith({
      type: 'SET_CLUSTER_UPGRADE_GATE',
      payload: 'unMetAck1',
    });
    expect(mockedDispatch).not.toHaveBeenCalledWith({
      type: 'SET_CLUSTER_UPGRADE_GATE',
      payload: 'unMetAck2',
    });
    // Since failure, don't close modal
    expect(mockedDispatch).not.toHaveBeenCalledWith({ type: 'CLOSE_MODAL' });

    rerender(<UpgradeAcknowledgeModal {...defaultProps} />);

    expect(screen.getByText(errMsg)).toBeInTheDocument();
  });

  it('Errors are shown for failed gates action', async () => {
    mockedUseGlobalState.mockReturnValue(modalData);
    const apiReturnValue = { data: { enable_minor_version_upgrades: true } };
    const apiError = {
      response: {
        data: { reason: 'an error happened' },
      },
    };
    (apiRequest.post as jest.Mock).mockRejectedValue(apiError);
    (apiRequest.patch as jest.Mock).mockResolvedValueOnce(apiReturnValue);

    render(<UpgradeAcknowledgeModal {...defaultProps} />);
    const user = await userEvent.setup({
      delay: null,
    });

    await clickSubmitButton(user);

    // API calls made
    expect(apiRequest.patch).toHaveBeenCalledTimes(1);
    expect(apiRequest.post).toHaveBeenCalledTimes(2);
    expect(apiRequest.patch).toHaveBeenNthCalledWith(
      1,
      '/api/clusters_mgmt/v1/clusters/myClusterId/upgrade_policies/myUpgradePolicyId',
      { enable_minor_version_upgrades: true },
    );
    expect(apiRequest.post).toHaveBeenNthCalledWith(
      1,
      '/api/clusters_mgmt/v1/clusters/myClusterId/gate_agreements',
      { version_gate: { id: 'unMetAck1' } },
    );
    expect(apiRequest.post).toHaveBeenNthCalledWith(
      2,
      '/api/clusters_mgmt/v1/clusters/myClusterId/gate_agreements',
      { version_gate: { id: 'unMetAck2' } },
    );

    // Call updatePolicy (y-stream) action
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_CLUSTER_UPGRADE_POLICY',
      payload: {
        enable_minor_version_upgrades: true,
      },
    });

    // Call updateGate action
    expect(mockedDispatch).not.toHaveBeenCalledWith({
      type: 'SET_CLUSTER_UPGRADE_GATE',
      payload: 'unMetAck1',
    });
    expect(mockedDispatch).not.toHaveBeenCalledWith({
      type: 'SET_CLUSTER_UPGRADE_GATE',
      payload: 'unMetAck2',
    });
    // Since failure, don't close modal
    expect(mockedDispatch).not.toHaveBeenCalledWith({ type: 'CLOSE_MODAL' });

    expect(
      await screen.findByRole('button', { name: /cancel/i, hidden: true }),
    ).toBeInTheDocument();
    expect(screen.queryAllByText(errMsg)).toHaveLength(2);
  });

  it('does not set enable_minor_version flag if isSTS', async () => {
    mockedUseGlobalState.mockReturnValue({ ...modalData, isSTSEnabled: true });

    const apiReturnValue = { data: {} };
    (apiRequest.patch as jest.Mock).mockResolvedValue(apiReturnValue);
    (apiRequest.post as jest.Mock).mockResolvedValue(apiReturnValue);

    const { user } = render(<UpgradeAcknowledgeModal {...defaultProps} />);

    await clickSubmitButton(user);

    expect(apiRequest.patch).not.toHaveBeenCalled();
    expect(apiRequest.post).toHaveBeenNthCalledWith(
      1,
      '/api/clusters_mgmt/v1/clusters/myClusterId/gate_agreements',
      { version_gate: { id: 'unMetAck1' } },
    );
    expect(apiRequest.post).toHaveBeenNthCalledWith(
      2,
      '/api/clusters_mgmt/v1/clusters/myClusterId/gate_agreements',
      { version_gate: { id: 'unMetAck2' } },
    );
    // Verify updatePolicy (y-stream) action was not called
    // Call updatePolicy (y-stream) action
    expect(mockedDispatch).not.toHaveBeenCalledWith({
      type: 'SET_CLUSTER_UPGRADE_POLICY',
      payload: {
        enable_minor_version_upgrades: true,
      },
    });

    // Call updateGate action
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_CLUSTER_UPGRADE_GATE',
      payload: 'unMetAck1',
    });
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_CLUSTER_UPGRADE_GATE',
      payload: 'unMetAck2',
    });
    expect(mockedDispatch).toHaveBeenCalledWith({ type: 'CLOSE_MODAL' });
    expect(screen.queryByRole('alert', { name: 'Danger Alert' })).not.toBeInTheDocument();
  });
});

describe('<UpgradeAcknowledgeModal>  with hosted control plane(hypershift)', () => {
  const modalData: TestModalData = {
    fromVersion: '1.2.3',
    toVersion: '1.3.4',
    unmetAcknowledgements: [{ id: 'unMetAck1' }, { id: 'unMetAck2' }],
    isHypershift: true,
    isSTSEnabled: false,
  };
  const defaultPropsHypershift: TestDefaultProps = {
    clusterId: 'myClusterId',
    schedules: [
      {
        upgrade_type: 'OSD',
        schedule_type: 'automatic',
        id: 'myUpgradePolicyId',
      } as UpgradePolicy,
    ],
  };
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('(HCP) API call for each gates calls action and y-stream approval', async () => {
    mockedUseGlobalState.mockReturnValue(modalData);
    const apiReturnValue = { data: { enable_minor_version_upgrades: true } };
    (apiRequest.patch as jest.Mock).mockResolvedValue(apiReturnValue);
    (apiRequest.post as jest.Mock).mockResolvedValue(apiReturnValue);

    render(<UpgradeAcknowledgeModal {...defaultPropsHypershift} />);

    const user = await userEvent.setup({
      delay: null,
    });

    await clickSubmitButton(user);

    expect(apiRequest.patch).toHaveBeenCalledWith(
      '/api/clusters_mgmt/v1/clusters/myClusterId/control_plane/upgrade_policies/myUpgradePolicyId',
      { enable_minor_version_upgrades: true },
    );
    expect(apiRequest.post).toHaveBeenNthCalledWith(
      1,
      '/api/clusters_mgmt/v1/clusters/myClusterId/gate_agreements',
      { version_gate: { id: 'unMetAck1' } },
    );
    expect(apiRequest.post).toHaveBeenNthCalledWith(
      2,
      '/api/clusters_mgmt/v1/clusters/myClusterId/gate_agreements',
      { version_gate: { id: 'unMetAck2' } },
    );
    expect(mockedDispatch).toHaveBeenCalledTimes(4);
    // Call updatePolicy (y-stream) action
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_CLUSTER_UPGRADE_POLICY',
      payload: {
        enable_minor_version_upgrades: true,
      },
    });

    // Call updateGate action
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_CLUSTER_UPGRADE_GATE',
      payload: 'unMetAck1',
    });
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_CLUSTER_UPGRADE_GATE',
      payload: 'unMetAck2',
    });

    // Since success, close modal
    expect(mockedDispatch).toHaveBeenCalledWith({ type: 'CLOSE_MODAL' });
    expect(screen.queryByRole('alert', { name: 'Danger Alert' })).not.toBeInTheDocument();
  });

  it('(HCP) Error is shown for failed y-stream approval action', async () => {
    mockedUseGlobalState.mockReturnValue(modalData);
    const apiError = { error: { reason: 'an error happened', errorMessage: 'error message' } };
    (apiRequest.patch as jest.Mock).mockRejectedValueOnce(apiError).mockResolvedValue({ data: {} });

    const { rerender } = render(<UpgradeAcknowledgeModal {...defaultPropsHypershift} />);
    const user = await userEvent.setup({
      delay: null,
    });

    await clickSubmitButton(user);

    expect(apiRequest.patch).toHaveBeenCalledTimes(1);
    expect(apiRequest.patch).toHaveBeenNthCalledWith(
      1,
      '/api/clusters_mgmt/v1/clusters/myClusterId/control_plane/upgrade_policies/myUpgradePolicyId',
      { enable_minor_version_upgrades: true },
    );

    // Call updatePolicy (y-stream) action
    expect(mockedDispatch).not.toHaveBeenCalledWith({
      type: 'SET_CLUSTER_UPGRADE_POLICY',
      payload: {
        enable_minor_version_upgrades: true,
      },
    });
    expect(mockedDispatch).not.toHaveBeenCalled();
    // Call updateGate action
    expect(mockedDispatch).not.toHaveBeenCalledWith({
      type: 'SET_CLUSTER_UPGRADE_GATE',
      payload: 'unMetAck1',
    });
    expect(mockedDispatch).not.toHaveBeenCalledWith({
      type: 'SET_CLUSTER_UPGRADE_GATE',
      payload: 'unMetAck2',
    });
    // Since failure, don't close modal
    expect(mockedDispatch).not.toHaveBeenCalledWith({ type: 'CLOSE_MODAL' });

    rerender(<UpgradeAcknowledgeModal {...defaultPropsHypershift} />);

    expect(screen.getByText(errMsg)).toBeInTheDocument();
  });

  it('(HCP) Errors are shown for failed gates action', async () => {
    const apiReturnValue = { data: { enable_minor_version_upgrades: true } };
    const apiError = {
      response: {
        data: { reason: 'an error happened' },
      },
    };
    (apiRequest.post as jest.Mock).mockRejectedValue(apiError);
    (apiRequest.patch as jest.Mock).mockResolvedValueOnce(apiReturnValue);

    render(<UpgradeAcknowledgeModal {...defaultPropsHypershift} />);
    const user = await userEvent.setup({
      delay: null,
    });

    await clickSubmitButton(user);

    // API calls made
    expect(apiRequest.patch).toHaveBeenCalledTimes(1);
    expect(apiRequest.post).toHaveBeenCalledTimes(2);
    expect(apiRequest.patch).toHaveBeenNthCalledWith(
      1,
      '/api/clusters_mgmt/v1/clusters/myClusterId/control_plane/upgrade_policies/myUpgradePolicyId',
      { enable_minor_version_upgrades: true },
    );
    expect(apiRequest.post).toHaveBeenNthCalledWith(
      1,
      '/api/clusters_mgmt/v1/clusters/myClusterId/gate_agreements',
      { version_gate: { id: 'unMetAck1' } },
    );
    expect(apiRequest.post).toHaveBeenNthCalledWith(
      2,
      '/api/clusters_mgmt/v1/clusters/myClusterId/gate_agreements',
      { version_gate: { id: 'unMetAck2' } },
    );

    // Call updatePolicy (y-stream) action
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_CLUSTER_UPGRADE_POLICY',
      payload: {
        enable_minor_version_upgrades: true,
      },
    });

    // Call updateGate action
    expect(mockedDispatch).not.toHaveBeenCalledWith({
      type: 'SET_CLUSTER_UPGRADE_GATE',
      payload: 'unMetAck1',
    });
    expect(mockedDispatch).not.toHaveBeenCalledWith({
      type: 'SET_CLUSTER_UPGRADE_GATE',
      payload: 'unMetAck2',
    });
    // Since failure, don't close modal
    expect(mockedDispatch).not.toHaveBeenCalledWith({ type: 'CLOSE_MODAL' });

    expect(
      await screen.findByRole('button', { name: /cancel/i, hidden: true }),
    ).toBeInTheDocument();
    expect(screen.queryAllByText(errMsg)).toHaveLength(2);
  });
});
