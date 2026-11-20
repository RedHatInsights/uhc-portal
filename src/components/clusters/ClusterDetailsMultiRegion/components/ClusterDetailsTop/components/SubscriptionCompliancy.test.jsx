import React from 'react';
import * as reactRedux from 'react-redux';

import { normalizedProducts } from '~/common/subscriptionTypes';
import { modalActions } from '~/components/common/Modal/ModalActions';
import { render, screen } from '~/testUtils';
import { SubscriptionCommonFieldsSupport_level as SubscriptionCommonFieldsSupportLevel } from '~/types/accounts_mgmt.v1';

import SubscriptionCompliancy from './SubscriptionCompliancy';

const { openModal } = modalActions;

jest.mock('react-redux', () => {
  const config = {
    __esModule: true,
    ...jest.requireActual('react-redux'),
  };
  return config;
});

const d = new Date();
d.setDate(d.getDate() - 5);

const defaultProps = {
  cluster: {
    creation_timestamp: d.toLocaleString(),
    canUpdateSubscription: true,
    subscription: {
      plan: { type: normalizedProducts.OCP },
      support_level: SubscriptionCommonFieldsSupportLevel.Eval,
    },
  },
  openModal,
  canSubscribeOCP: true,
};

describe('<SubscriptionCompliancy />', () => {
  const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
  const mockedDispatch = jest.fn();
  useDispatchMock.mockReturnValue(mockedDispatch);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('clicking on Edit subscription link opens modal', async () => {
    const { user } = render(<SubscriptionCompliancy {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Edit subscription settings' }));

    expect(mockedDispatch).toHaveBeenCalled();

    const mockedCalledWith = mockedDispatch.mock.calls[0][0];

    expect(mockedCalledWith.type).toEqual('OPEN_MODAL');
    expect(mockedCalledWith.payload.name).toEqual('edit-subscription-settings');
  });
});
