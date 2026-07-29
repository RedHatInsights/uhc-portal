import React from 'react';

import { BILLING_CONTRACT_NOTIFICATION } from '~/queries/featureGates/featureConstants';
import {
  checkAccessibility,
  mockUseFeatureGate,
  render,
  screen,
  waitFor,
  within,
} from '~/testUtils';

import AWSAccountSelection from '../AWSAccountSelection';
import {
  CONTRACT_ENABLED_DESCRIPTION,
  NO_CONTRACT_ENABLED_DESCRIPTION,
} from '../AWSBillingAccount/awsBillingAccountHelper';

import { defaultProps } from './AWSAccountSelection.fixtures';

const billingAccountsWithMixedContracts = [
  {
    cloud_account_id: '456456456456',
    cloud_provider_id: 'aws',
    contracts: [],
  },
  {
    cloud_account_id: '123123123123',
    cloud_provider_id: 'aws',
    contracts: [
      {
        dimensions: [{ name: 'four_vcpu_hour', value: '1' }],
        end_date: 'some-end-date',
        start_date: 'some-start-date',
      },
    ],
  },
  {
    cloud_account_id: '789789789789',
    cloud_provider_id: 'aws',
    contracts: [],
  },
];

describe('AWSAccountSelection tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('select aws account id', async () => {
    // render dropdown
    const onChangeMock = jest.fn();
    defaultProps.input.onChange = onChangeMock;
    const { container, user } = render(
      <AWSAccountSelection {...defaultProps} />, // get defaultProps by putting bp at top of AWSAccountSelection in dev mode and capturing the properties
    );

    // click it open
    const dropdown = screen.getByText(/select an account/i);
    user.click(dropdown);

    expect(await screen.findByPlaceholderText(/Filter by account id/i)).toBeInTheDocument();

    // // type something into search
    const searchbox = screen.getByPlaceholderText(/Filter by account id/i);
    await user.clear(searchbox);
    await user.type(searchbox, '74');

    // click option
    expect(
      await screen.findByRole('option', {
        name: /74 3358436160/i,
      }),
    ).toBeInTheDocument();

    const option = screen.getByRole('option', {
      name: /74 3358436160/i,
    });
    user.click(option);

    // value won't be in component until redux action stuffs it back in here
    await waitFor(() => expect(onChangeMock.mock.calls[0][0]).toBe('743358436160'));

    // Assert
    await checkAccessibility(container);
  });

  it('field is required if required prop is set to true', () => {
    const onChangeMock = jest.fn();

    defaultProps.input.onChange = onChangeMock;
    const newProps = {
      ...defaultProps,
      isBillingAccount: true,
      label: 'AWS billing account',
      required: true,
    };
    const { container } = render(<AWSAccountSelection {...newProps} />);

    // Unfortunately the only way to tell if the field is required is to find the hidden "*" in the label tag
    expect(container.querySelector('label')?.textContent).toEqual('AWS billing account *');
  });

  it('field is not required if required prop is set to false', () => {
    const onChangeMock = jest.fn();

    defaultProps.input.onChange = onChangeMock;
    const newProps = {
      ...defaultProps,
      isBillingAccount: true,
      label: 'AWS billing account',
      required: false,
    };
    const { container } = render(<AWSAccountSelection {...newProps} />);

    // Unfortunately the only way to tell if the field is required is to find the hidden "*" in the label tag
    expect(container.querySelector('label')?.textContent).toEqual('AWS billing account *');
  });

  it('field is required if required prop is not set (aka default to required)', () => {
    const onChangeMock = jest.fn();

    defaultProps.input.onChange = onChangeMock;
    const newProps = {
      ...defaultProps,
      isBillingAccount: true,
      label: 'AWS billing account',
    };
    expect(newProps.required).toBeUndefined();
    const { container } = render(<AWSAccountSelection {...newProps} />);

    // Unfortunately the only way to tell if the field is required is to find the hidden "*" in the label tag
    expect(container.querySelector('label')?.textContent).toEqual('AWS billing account *');
  });

  describe('billing contract notification enhancements', () => {
    it('sorts contracted accounts first with labels and a divider when the feature flag is enabled', async () => {
      mockUseFeatureGate([[BILLING_CONTRACT_NOTIFICATION, true]]);
      const { user } = render(
        <AWSAccountSelection
          {...defaultProps}
          isBillingAccount
          accounts={billingAccountsWithMixedContracts}
          label="AWS billing account"
        />,
      );

      await user.click(screen.getByText(/select an account/i));

      const options = await screen.findAllByRole('option');
      expect(options).toHaveLength(3);
      expect(options[0]).toHaveTextContent('123123123123');
      expect(within(options[0]).getByText(CONTRACT_ENABLED_DESCRIPTION)).toBeInTheDocument();
      // Secondary sort is shorter-first, then ascending localeCompare within each divider group
      expect(options[1]).toHaveTextContent('456456456456');
      expect(within(options[1]).getByText(NO_CONTRACT_ENABLED_DESCRIPTION)).toBeInTheDocument();
      expect(options[2]).toHaveTextContent('789789789789');
      expect(within(options[2]).getByText(NO_CONTRACT_ENABLED_DESCRIPTION)).toBeInTheDocument();
      // One divider under the search input, plus one between contract groups
      expect(screen.getAllByRole('separator')).toHaveLength(2);
    });

    it('does not show the no-contract label or group divider when the feature flag is disabled', async () => {
      mockUseFeatureGate([[BILLING_CONTRACT_NOTIFICATION, false]]);
      const { user } = render(
        <AWSAccountSelection
          {...defaultProps}
          isBillingAccount
          accounts={billingAccountsWithMixedContracts}
          label="AWS billing account"
        />,
      );

      await user.click(screen.getByText(/select an account/i));

      expect(await screen.findByText('123123123123')).toBeInTheDocument();
      expect(screen.getByText(CONTRACT_ENABLED_DESCRIPTION)).toBeInTheDocument();
      expect(screen.queryByText(NO_CONTRACT_ENABLED_DESCRIPTION)).not.toBeInTheDocument();
      // Only the search/menu divider is present
      expect(screen.getAllByRole('separator')).toHaveLength(1);
    });
  });
});
