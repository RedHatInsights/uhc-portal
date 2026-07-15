import {
  CONTRACT_ENABLED_DESCRIPTION,
  createBillingAccountSortFn,
  DIVIDER_GROUP_CONTRACTED,
  DIVIDER_GROUP_NON_CONTRACTED,
  getBillingAccountSelectOptions,
  getContract,
  getDimensionValue,
  NO_CONTRACT_ENABLED_DESCRIPTION,
  shouldShowBillingContractNotification,
} from './awsBillingAccountHelper';

const getTestDimensions = (testDimension: string) => [
  {
    name: 'unused dimension',
    value: '4',
  },
  {
    name: testDimension,
    value: '1',
  },
];

const getCloudAccountWithDimension = (testDimension: string) => ({
  cloud_account_id: '123',
  cloud_provider_id: 'aws',
  contracts: [
    {
      dimensions: getTestDimensions(testDimension),
      end_date: 'some-end-date',
      start_date: 'some-start-date',
    },
  ],
});

describe('getContract', () => {
  it('should find contract if cpu time is pre-purchased', () => {
    const resultContract = getContract(getCloudAccountWithDimension('four_vcpu_hour'));
    expect(resultContract?.start_date).toBe('some-start-date');
  });
  it('should find contract if control planes are pre-purchased', () => {
    const resultContract = getContract(getCloudAccountWithDimension('control_plane'));
    expect(resultContract?.start_date).toBe('some-start-date');
  });
  it('should not find contract if only premium support is pre-purchased', () => {
    const resultContract = getContract(getCloudAccountWithDimension('premium_support'));
    expect(resultContract).toBe(null);
  });
  it('should not find any contract', () => {
    const dataWithNoContracts = {
      cloud_account_id: '123',
      cloud_provider_id: 'aws',
      contracts: [],
    };
    expect(getContract(dataWithNoContracts)).toBe(null);
  });
});

describe('shouldShowBillingContractNotification', () => {
  const accountWithContract = getCloudAccountWithDimension('four_vcpu_hour');
  const accountWithoutContract = {
    cloud_account_id: '456',
    cloud_provider_id: 'aws',
    contracts: [],
  };

  it('returns false when the selected account has a contract', () => {
    expect(
      shouldShowBillingContractNotification(
        [accountWithContract, accountWithoutContract],
        accountWithContract.cloud_account_id,
      ),
    ).toBe(false);
  });

  it('returns false when no accounts have contracts', () => {
    expect(
      shouldShowBillingContractNotification(
        [accountWithoutContract, { ...accountWithoutContract, cloud_account_id: '789' }],
        accountWithoutContract.cloud_account_id,
      ),
    ).toBe(false);
  });

  it('returns true when the selected account has no contract and another account does', () => {
    expect(
      shouldShowBillingContractNotification(
        [accountWithContract, accountWithoutContract],
        accountWithoutContract.cloud_account_id,
      ),
    ).toBe(true);
  });

  it('returns false when there is only one account', () => {
    expect(
      shouldShowBillingContractNotification(
        [accountWithoutContract],
        accountWithoutContract.cloud_account_id,
      ),
    ).toBe(false);
  });

  it('returns false when the account list is empty', () => {
    expect(shouldShowBillingContractNotification([], accountWithoutContract.cloud_account_id)).toBe(
      false,
    );
  });
});

describe('getDimensionValue', () => {
  it('should return the correct value if the resource exists', () => {
    const testDimensions = getTestDimensions('four_vcpu_hour');
    expect(getDimensionValue(testDimensions, 'four_vcpu_hour')).toBe('1');
  });
  it('should return 0 if the resource does not exist', () => {
    const testDimensions = getTestDimensions('four_vcpu_hour');
    expect(getDimensionValue(testDimensions, 'control_plane')).toBe(0);
  });
});

describe('getBillingAccountSelectOptions', () => {
  const accountWithContract = getCloudAccountWithDimension('four_vcpu_hour');
  const accountWithoutContract = {
    cloud_account_id: '456',
    cloud_provider_id: 'aws',
    contracts: [],
  };

  it('returns options with contract labels and divider groups', () => {
    const options = getBillingAccountSelectOptions([accountWithoutContract, accountWithContract]);

    expect(options).toEqual([
      {
        entryId: '456',
        label: '456',
        description: NO_CONTRACT_ENABLED_DESCRIPTION,
        dividerGroup: DIVIDER_GROUP_NON_CONTRACTED,
      },
      {
        entryId: '123',
        label: '123',
        description: CONTRACT_ENABLED_DESCRIPTION,
        dividerGroup: DIVIDER_GROUP_CONTRACTED,
      },
    ]);
  });
});

describe('createBillingAccountSortFn', () => {
  it('sorts contracted accounts before non-contracted accounts', () => {
    const sortFn = createBillingAccountSortFn((a, b) => a.label.localeCompare(b.label));
    const options = [
      {
        entryId: '2',
        label: '2',
        dividerGroup: DIVIDER_GROUP_NON_CONTRACTED,
      },
      {
        entryId: '1',
        label: '1',
        dividerGroup: DIVIDER_GROUP_CONTRACTED,
      },
      {
        entryId: '3',
        label: '3',
        dividerGroup: DIVIDER_GROUP_NON_CONTRACTED,
      },
    ];

    expect([...options].sort(sortFn).map((option) => option.entryId)).toEqual(['1', '2', '3']);
  });
});
