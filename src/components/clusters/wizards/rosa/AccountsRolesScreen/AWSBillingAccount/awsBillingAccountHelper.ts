import { FuzzyEntryType } from '~/components/common/FuzzySelect/types';
import { CloudAccount, Contract, ContractDimension } from '~/types/accounts_mgmt.v1';

const resources = ['control_plane', 'four_vcpu_hour'];

export const CONTRACT_ENABLED_DESCRIPTION = 'Contract enabled';
export const NO_CONTRACT_ENABLED_DESCRIPTION = 'No contract enabled';
export const DIVIDER_GROUP_CONTRACTED = 'contracted';
export const DIVIDER_GROUP_NON_CONTRACTED = 'non-contracted';

// For a contract to be valid as a BillingContract, it must include dimensions
export type BillingContract = Contract & Required<Pick<Contract, 'dimensions'>>;

const getContract = (cloudAccount: CloudAccount): BillingContract | null => {
  const { contracts } = cloudAccount;
  if (!contracts || contracts.length === 0) {
    return null;
  }
  const contract = contracts[0];
  const dimensions = contract.dimensions || [];
  const isBillingContract = dimensions.some(
    (dimension: ContractDimension) =>
      resources.includes(dimension.name || '') && Number(dimension.value || 0) > 0,
  );
  return isBillingContract ? (contract as BillingContract) : null;
};

const getDimensionValue = (dimensions: ContractDimension[], resource: string) =>
  dimensions.find((dimension: ContractDimension) => dimension?.name === resource)?.value || 0;

const shouldShowBillingContractNotification = (
  cloudAccounts: CloudAccount[],
  selectedAccountId: string,
): boolean => {
  if (!cloudAccounts.length || !selectedAccountId) {
    return false;
  }

  const selectedAccount = cloudAccounts.find(
    (account) => account.cloud_account_id === selectedAccountId,
  );

  if (!selectedAccount || getContract(selectedAccount)) {
    return false;
  }

  return cloudAccounts.some(
    (account) => account.cloud_account_id !== selectedAccountId && getContract(account) !== null,
  );
};

const getBillingAccountSelectOptions = (accounts: CloudAccount[]): FuzzyEntryType[] =>
  accounts.map((cloudAccount) => {
    const accountId = cloudAccount.cloud_account_id as string;
    const hasContract = !!getContract(cloudAccount);

    return {
      entryId: accountId,
      label: accountId,
      description: hasContract ? CONTRACT_ENABLED_DESCRIPTION : NO_CONTRACT_ENABLED_DESCRIPTION,
      dividerGroup: hasContract ? DIVIDER_GROUP_CONTRACTED : DIVIDER_GROUP_NON_CONTRACTED,
    };
  });

const createBillingAccountSortFn =
  (secondarySortFn: (a: FuzzyEntryType, b: FuzzyEntryType) => number) =>
  (a: FuzzyEntryType, b: FuzzyEntryType): number => {
    const aRank = a.dividerGroup === DIVIDER_GROUP_CONTRACTED ? 0 : 1;
    const bRank = b.dividerGroup === DIVIDER_GROUP_CONTRACTED ? 0 : 1;
    if (aRank !== bRank) {
      return aRank - bRank;
    }
    return secondarySortFn(a, b);
  };

export {
  createBillingAccountSortFn,
  getBillingAccountSelectOptions,
  getContract,
  getDimensionValue,
  shouldShowBillingContractNotification,
};
