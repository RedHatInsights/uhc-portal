import React from 'react';
import * as reactRedux from 'react-redux';

import { checkAccessibility, render, screen } from '~/testUtils';

import { openModal } from '../../../../../../common/Modal/ModalActions';
import { managedIntegration } from '../../__tests__/AddOns.fixtures';
import AddOnsPrimaryButton from '../AddOnsDrawerPrimaryButton';

jest.mock('react-redux', () => {
  const config = {
    __esModule: true,
    ...jest.requireActual('react-redux'),
  };
  return config;
});

jest.mock('../../../../../../common/Modal/ModalActions', () => ({
  openModal: jest.fn(),
}));

describe('<AddOnsPrimaryButton />', () => {
  const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
  const mockedDispatch = jest.fn();

  const addClusterAddOn = jest.fn();
  const addClusterAddOnResponse = {};
  const subscriptionModels = {
    [managedIntegration.id]: {
      addOn: managedIntegration.id,
      billingModel: 'standard',
      cloudAccount: '',
    },
  };

  const props = {
    activeCard: managedIntegration,
    activeCardRequirementsFulfilled: true,
    addClusterAddOn,
    addClusterAddOnResponse,
    cluster: {
      canEdit: true,
      id: 'fake id',
      state: 'ready',
      console: { url: 'https://example.com/veryfakeconsole' },
    },
    hasQuota: true,
    installedAddOn: { state: 'ready', operator_version: '0.0.1', csv_name: 'fake-addon.0.0.1' },
    openModal,
    subscriptionModels,
    updateClusterAddOn: jest.fn(),
  };

  beforeEach(() => {
    useDispatchMock.mockReturnValue(mockedDispatch);
  });

  afterEach(() => {
    addClusterAddOn.mockClear();
    openModal.mockClear();
  });

  it('is accessible', async () => {
    const { container } = render(<AddOnsPrimaryButton {...props} />);
    await checkAccessibility(container);
  });

  it('should render both open and uninstall buttons for ready cluster', () => {
    render(<AddOnsPrimaryButton {...props} />);

    expect(screen.getByRole('link', { name: 'Open in Console' })).toHaveAttribute(
      'href',
      'https://example.com/veryfakeconsole/k8s/ns/redhat-rhmi-operator/operators.coreos.com~v1alpha1~ClusterServiceVersion/fake-addon.0.0.1',
    );

    expect(screen.getByRole('link', { name: 'Open in Console' })).not.toHaveAttribute(
      'aria-disabled',
    );

    expect(screen.getByRole('button', { name: 'Uninstall' })).not.toHaveAttribute('aria-disabled');
  });

  it('uninstall button should open uninstall modal', async () => {
    expect(openModal).not.toHaveBeenCalled();

    const { user } = render(<AddOnsPrimaryButton {...props} />);
    await user.click(screen.getByRole('button', { name: 'Uninstall' }));

    expect(mockedDispatch).toHaveBeenCalledWith(
      openModal('add-ons-delete-modal', {
        addOnName: managedIntegration.name,
        addOnID: managedIntegration.id,
        clusterID: 'fake id',
      }),
    );
  });

  it('expect contact support button if addon failed', () => {
    const failedProps = {
      ...props,
      installedAddOn: { state: 'failed', operator_version: '0.0.1' },
    };

    render(<AddOnsPrimaryButton {...failedProps} />);

    expect(screen.getByRole('link', { name: 'Contact support' })).toHaveAttribute(
      'href',
      'https://access.redhat.com/support/cases/#/case/new',
    );
  });

  it('expect install button to be disabled if cluster is not ready', () => {
    const notReadyProps = {
      ...props,
      installedAddOn: null,
      cluster: {
        canEdit: true,
        id: 'fake id',
        state: 'installing',
        console: { url: 'https://example.com/veryfakeconsole' },
      },
    };

    render(<AddOnsPrimaryButton {...notReadyProps} />);

    expect(screen.getByRole('button', { name: 'Install' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('expect install button to be disabled if no cluster edit', () => {
    const noEditProps = {
      ...props,
      installedAddOn: null,
      cluster: {
        canEdit: false,
        id: 'fake id',
        state: 'ready',
        console: { url: 'https://example.com/veryfakeconsole' },
      },
    };

    render(<AddOnsPrimaryButton {...noEditProps} />);

    expect(screen.getByRole('button', { name: 'Install' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('expect install button to be disabled if cluster addon is pending', () => {
    const pendingProps = {
      ...props,
      isAddClusterAddOnPending: true,
      installedAddOn: null,
      cluster: {
        canEdit: true,
        id: 'fake id',
        state: 'ready',
        console: { url: 'https://example.com/veryfakeconsole' },
      },
    };
    render(<AddOnsPrimaryButton {...pendingProps} />);

    expect(screen.getByRole('button', { name: 'Install' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('expect install button to be disabled if cluster addon requirements are not met', () => {
    const reqsNotMeetProps = {
      ...props,
      installedAddOn: null,
      addClusterAddOnResponse: {},
      activeCardRequirementsFulfilled: false,
      cluster: {
        canEdit: true,
        id: 'fake id',
        state: 'ready',
        console: { url: 'https://example.com/veryfakeconsole' },
      },
    };

    render(<AddOnsPrimaryButton {...reqsNotMeetProps} />);

    expect(screen.getByRole('button', { name: 'Install' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('expect to be able to install if user has permission and cluster is ready', async () => {
    const canInstallProps = {
      ...props,
      installedAddOn: null,
      addClusterAddOnResponse: { pending: false },
      activeCardRequirementsFulfilled: true,
      cluster: {
        canEdit: true,
        id: 'fake id',
        state: 'ready',
        console: { url: 'https://example.com/veryfakeconsole' },
      },
    };

    const { user } = render(<AddOnsPrimaryButton {...canInstallProps} />);

    expect(screen.getByRole('button', { name: 'Install' })).not.toHaveAttribute('aria-disabled');

    await user.click(screen.getByRole('button', { name: 'Install' }));

    expect(mockedDispatch).toHaveBeenCalledWith(
      openModal('add-ons-parameters-modal', {
        addOn: managedIntegration,
        isUpdateForm: false,
        clusterID: 'fake id',
      }),
    );
  });
});
