/* eslint-disable camelcase */
import React from 'react';
import * as reactRedux from 'react-redux';

import { checkAccessibility, render, screen } from '~/testUtils';
import { SubscriptionCommonFieldsCluster_billing_model } from '~/types/accounts_mgmt.v1';

import AddOnsSubscription from './AddOnsSubscription';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

describe('AddOnsSubscription', () => {
  const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
  const mockedDispatch = jest.fn();
  useDispatchMock.mockReturnValue(mockedDispatch);

  afterEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    activeCardId: 'card1',
    billingQuota: {
      standard: {
        consumed: 0,
        cost: 0,
        allowed: 100,
      },
      marketplace: {
        consumed: 0,
        cost: 0,
        allowed: 100,
        cloudAccounts: {
          aws: [],
          rhm: [],
          azure: [],
        },
      },
    },
    installedAddOn: null,
    subscriptionModels: {
      card1: {
        addOn: 'card1',
        billingModel: SubscriptionCommonFieldsCluster_billing_model.standard,
      },
    },
  };

  it('displays subscription radio subscription buttons when there is both standard and marketplace quota', async () => {
    const newProps = { ...defaultProps, subscriptionModels: {} };

    const { container } = render(<AddOnsSubscription {...newProps} />);

    expect(screen.getByText('Subscription type')).toBeInTheDocument();

    expect(screen.getByRole('radio', { name: 'Standard' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Marketplace' })).toBeInTheDocument();

    await checkAccessibility(container);
  });

  it('hides radio subscription buttons when only standard quota is available', () => {
    const newProps = {
      ...defaultProps,
      billingQuota: { standard: { allowed: 100, consumed: 0, cost: 0 } },
    };

    render(<AddOnsSubscription {...newProps} />);

    expect(screen.getByText('Subscription type')).toBeInTheDocument();

    expect(screen.queryByRole('radio', { name: 'Standard' })).not.toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: 'Marketplace' })).not.toBeInTheDocument();

    expect(screen.getByText('Red Hat Standard')).toBeInTheDocument();
    expect(screen.getByText('Fixed capacity subscription.')).toBeInTheDocument();
  });

  it('hides radio subscription buttons when only marketplace quota is available', () => {
    // also check to see if marketplace card is showing
    const newProps = {
      ...defaultProps,
      billingQuota: {
        marketplace: {
          consumed: 0,
          cost: 0,
          allowed: 100,
          cloudAccounts: {
            aws: [],
            rhm: [],
            azure: [],
          },
        },
      },
      subscriptionModels: {
        card1: {
          addOn: 'card1',
          billingModel: SubscriptionCommonFieldsCluster_billing_model.marketplace,
        },
      },
    };

    render(<AddOnsSubscription {...newProps} />);

    expect(screen.getByText('Subscription type')).toBeInTheDocument();

    expect(screen.queryByRole('radio', { name: 'Standard' })).not.toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: 'Marketplace' })).not.toBeInTheDocument();

    expect(screen.getByText('AWS Marketplace')).toBeInTheDocument();
    expect(
      screen.getByText('Flexible usage. Pay only for the services you use.'),
    ).toBeInTheDocument();
  });

  it('displays "Not enough quota" when subscription model is standard, but user has no quota', () => {
    const newProps = {
      ...defaultProps,
      billingQuota: {
        marketplace: {
          allowed: 100,
          consumed: 0,
          cost: 0,
          cloudAccounts: {
            aws: [],
            rhm: [],
            azure: [],
          },
        },
      },
      subscriptionModels: {
        card1: {
          addOn: 'card1',
          billingModel: SubscriptionCommonFieldsCluster_billing_model.standard,
        },
      },
    };

    render(<AddOnsSubscription {...newProps} />);

    expect(screen.getByText('Not enough quota', { exact: false })).toBeInTheDocument();
  });

  it('displays "Not enough quota" when subscription model is marketplace, but user has no quota', () => {
    const newProps = {
      ...defaultProps,
      billingQuota: { standard: { allowed: 100, consumed: 0, cost: 0 } },
      subscriptionModels: {
        card1: {
          addOn: 'card1',
          billingModel: SubscriptionCommonFieldsCluster_billing_model.marketplace,
        },
      },
    };

    render(<AddOnsSubscription {...newProps} />);

    expect(screen.getByText('Not available', { exact: false })).toBeInTheDocument();
  });
});
