import React from 'react';
import { Formik } from 'formik';
import * as reactRedux from 'react-redux';

import * as helpers from '~/common/helpers';
import {
  checkAccessibility,
  mockUseFormState,
  render,
  screen,
  waitFor,
  within,
  withState,
} from '~/testUtils';
import { CloudAccount } from '~/types/accounts_mgmt.v1';

import { FieldId, initialValues } from '../../constants';

import AWSBillingAccount from './AWSBillingAccount';

const defaultProps = {
  selectedAWSBillingAccountID: '123',
  selectedAWSAccountID: '123',
};

const defaultState = {
  userProfile: {
    organization: {
      quotaList: {
        items: [
          {
            allowed: 2020,
            cloud_accounts: [
              {
                cloud_account_id: '123',
                cloud_provider_id: 'aws',
                contracts: [],
              },
            ],
            quota_id: 'cluster|byoc|moa|marketplace',
          },
        ],
      },
    },
  },
  rosaReducer: {
    getAWSBillingAccountsResponse: {
      data: [
        {
          cloud_account_id: '123',
          cloud_provider_id: 'aws',
          contracts: [],
        },
        {
          cloud_account_id: '111',
          cloud_provider_id: 'aws',
          contracts: [],
        },
        {
          cloud_account_id: '222',
          cloud_provider_id: 'aws',
          contracts: [],
        },
        {
          cloud_account_id: '333',
          cloud_provider_id: 'aws',
          contracts: [],
        },
      ],
      fulfilled: true,
      pending: false,
      error: false,
    },
  },
};

jest.mock('react-redux', () => {
  const config = {
    __esModule: true,
    ...jest.requireActual('react-redux'),
  };
  return config;
});

const buildTestComponent = (children: React.ReactNode, formValues = {}) => (
  <Formik
    initialValues={{
      ...initialValues,
      ...formValues,
    }}
    onSubmit={() => {}}
  >
    {children}
  </Formik>
);

describe('<AWSBillingAccount />', () => {
  const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');
  const shouldRefreshQuotaMock = jest.spyOn(helpers, 'shouldRefetchQuota');

  beforeEach(() => {
    mockUseFormState({
      getFieldProps: jest.fn().mockReturnValue({
        name: FieldId.BillingAccountId,
        value: '',
        onBlur: jest.fn(),
        onChange: jest.fn(),
      }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  afterAll(() => {
    jest.resetAllMocks();
  });

  it('is accessible', async () => {
    // Arrange
    shouldRefreshQuotaMock.mockReturnValue(false);

    const { container } = withState(defaultState).render(
      buildTestComponent(<AWSBillingAccount {...defaultProps} />),
    );
    // await act(() => Promise.resolve());

    // Assert
    await checkAccessibility(container);
  });

  it('calls dispatch to get billing account IDs when shouldRefreshQuota returns true called on load', async () => {
    // Arrange
    const dummyDispatch = jest.fn();
    useDispatchMock.mockReturnValue(dummyDispatch);
    shouldRefreshQuotaMock.mockReturnValue(true);

    render(buildTestComponent(<AWSBillingAccount {...defaultProps} />));
    // await act(() => Promise.resolve());

    // Assert
    await waitFor(() => {
      expect(dummyDispatch).toHaveBeenCalledTimes(1);
    });
  });

  it('does not call dispatch to get billing account IDs when shouldRefreshQuota returns false called on load', async () => {
    // Arrange
    const dummyDispatch = jest.fn();
    useDispatchMock.mockReturnValue(dummyDispatch);
    shouldRefreshQuotaMock.mockReturnValue(false);

    withState(defaultState).render(buildTestComponent(<AWSBillingAccount {...defaultProps} />));

    // Assert
    await waitFor(() => {
      expect(dummyDispatch).toHaveBeenCalledTimes(0);
    });
  });

  it('populates the billing account id drop down with accounts in Redux state', async () => {
    const accountInState = defaultState.rosaReducer.getAWSBillingAccountsResponse.data;
    const { user } = withState(defaultState).render(
      buildTestComponent(<AWSBillingAccount {...defaultProps} />),
    );
    // await act(() => Promise.resolve());
    await user.click(await screen.findByRole('button', { name: 'Options menu' })); // expand drop-down

    // Assert
    expect(screen.getAllByRole('option')).toHaveLength(accountInState.length);

    accountInState.forEach((account: CloudAccount) => {
      expect(screen.getByRole('option', { name: account.cloud_account_id })).toBeInTheDocument();
    });
  });

  it('makes call to set billing account to "" if selected billing account is not accounts in Redux state', async () => {
    // Arrange
    const setFieldValueMock = jest.fn();
    const setFieldTouchedMock = jest.fn();
    mockUseFormState({
      setFieldValue: setFieldValueMock,
      setFieldTouched: setFieldTouchedMock,
      getFieldProps: jest.fn().mockReturnValue({
        name: FieldId.BillingAccountId,
        value: '',
        onBlur: jest.fn(),
        onChange: jest.fn(),
      }),
    });

    shouldRefreshQuotaMock.mockReturnValue(false);
    const newProps = {
      ...defaultProps,
      selectedAWSBillingAccountID: 'notAnAccount',
    };
    withState(defaultState).render(buildTestComponent(<AWSBillingAccount {...newProps} />));

    // Assert
    await waitFor(() => {
      expect(setFieldValueMock).toHaveBeenCalledTimes(1);
    });

    expect(setFieldValueMock).toHaveBeenCalledWith(FieldId.BillingAccountId, '');
    expect(setFieldTouchedMock).toHaveBeenCalledWith(FieldId.BillingAccountId);
  });

  it('makes call to set billing account single account in Redux if selected billing account is not accounts in Redux state and there is only one account', async () => {
    // Arrange
    const setFieldValueMock = jest.fn();
    shouldRefreshQuotaMock.mockReturnValue(false);
    // Start with empty prop so auto-select logic triggers when there's only one account
    const newProps = {
      ...defaultProps,
      selectedAWSBillingAccountID: '',
    };

    const newState = {
      ...defaultState,
      rosaReducer: {
        getAWSBillingAccountsResponse: {
          data: [
            {
              cloud_account_id: '123',
              cloud_provider_id: 'aws',
              contracts: [],
            },
          ],
          fulfilled: true,
          pending: false,
          error: false,
        },
      },
    };

    mockUseFormState({
      setFieldValue: setFieldValueMock,
      getFieldProps: jest.fn().mockReturnValue({
        name: FieldId.BillingAccountId,
        value: '',
        onBlur: jest.fn(),
        onChange: jest.fn(),
      }),
    });

    withState(newState).render(buildTestComponent(<AWSBillingAccount {...newProps} />));

    // Assert
    await waitFor(() => {
      expect(setFieldValueMock).toHaveBeenCalledTimes(1);
    });

    expect(setFieldValueMock).toHaveBeenCalledWith(FieldId.BillingAccountId, '123');
  });

  it('displays an error if get organization returns an error and is accessible', async () => {
    const newState = {
      ...defaultState,
      userProfile: {
        ...defaultState.userProfile,
        organization: {
          ...defaultState.userProfile.organization,
          error: true,
          errorMessage: 'I am an org error',
        },
      },
    };

    shouldRefreshQuotaMock.mockReturnValue(false);
    const { container } = withState(newState).render(
      buildTestComponent(<AWSBillingAccount {...defaultProps} />),
    );
    // await act(() => Promise.resolve());

    // Assert
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(
      within(screen.getByRole('alert')).getByText('I am an org error', { exact: false }),
    ).toBeInTheDocument();

    await checkAccessibility(container);
  });

  it('displays an error if getting billing account returns an error and is accessible', async () => {
    const newState = {
      ...defaultState,
      rosaReducer: {
        getAWSBillingAccountsResponse: {
          error: true,
          errorMessage: 'I am a billing account error',
        },
      },
    };

    shouldRefreshQuotaMock.mockReturnValue(false);
    const { container } = withState(newState).render(
      buildTestComponent(<AWSBillingAccount {...defaultProps} />),
    );
    // await act(() => Promise.resolve());

    // Assert
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(
      within(screen.getByRole('alert')).getByText('I am a billing account error', { exact: false }),
    ).toBeInTheDocument();

    await checkAccessibility(container);
  });

  it('displays info alert if the billing and infrastructure account are different and is accessible', async () => {
    const newProps = {
      ...defaultProps,
      selectedAWSBillingAccountID: '123',
      selectedAWSAccountID: '456',
    };
    shouldRefreshQuotaMock.mockReturnValue(false);
    const { container } = withState(defaultState).render(
      buildTestComponent(<AWSBillingAccount {...newProps} />),
    );
    // await act(() => Promise.resolve());

    // Assert
    expect(await screen.findByRole('alert')).toBeInTheDocument();

    expect(
      within(screen.getByRole('alert')).getByText(
        'The selected AWS billing account is a different account than your AWS infrastructure account.',
        { exact: false },
      ),
    ).toBeInTheDocument();

    await checkAccessibility(container);
  });

  it('hides info alert if billing and infrastructure are the same', async () => {
    // Arrange
    const newProps = {
      ...defaultProps,
      selectedAWSBillingAccountID: '123',
      selectedAWSAccountID: '123',
    };
    shouldRefreshQuotaMock.mockReturnValue(false);
    withState(defaultState).render(buildTestComponent(<AWSBillingAccount {...newProps} />));
    // await act(() => Promise.resolve());

    // Assert
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  it('hides info alert if a billing account has not been selected', async () => {
    // Arrange
    const newProps = {
      ...defaultProps,
      selectedAWSBillingAccountID: '',
      selectedAWSAccountID: '123',
    };
    shouldRefreshQuotaMock.mockReturnValue(false);
    withState(defaultState).render(buildTestComponent(<AWSBillingAccount {...newProps} />));
    // await act(() => Promise.resolve());

    // Assert
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  it('hides info alert if a infrastructure account has not been selected', async () => {
    // Arrange
    const newProps = {
      ...defaultProps,
      selectedAWSBillingAccountID: '123',
      selectedAWSAccountID: '',
    };
    shouldRefreshQuotaMock.mockReturnValue(false);
    withState(defaultState).render(buildTestComponent(<AWSBillingAccount {...newProps} />));
    // await act(() => Promise.resolve());

    // Assert
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
