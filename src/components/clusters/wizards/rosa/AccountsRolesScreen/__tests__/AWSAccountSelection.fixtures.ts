import { AWSAccountSelectionProps } from '../AWSAccountSelection';

export const defaultProps: AWSAccountSelectionProps = {
  label: 'Associated AWS infrastructure account',
  refresh: {
    text: 'Refresh to view newly associated AWS accounts and account-roles.',
    onRefresh: undefined,
  },
  accounts: [
    { cloud_account_id: '193684028217', cloud_provider_id: '', contracts: [] },
    { cloud_account_id: '800455929323', cloud_provider_id: '', contracts: [] },
    { cloud_account_id: '993442462734', cloud_provider_id: '', contracts: [] },
    { cloud_account_id: '743358436160', cloud_provider_id: '', contracts: [] },
    { cloud_account_id: '804939427164', cloud_provider_id: '', contracts: [] },
    { cloud_account_id: '097740742588', cloud_provider_id: '', contracts: [] },
  ],

  isLoading: false,
  isDisabled: false,
  input: {
    name: '',
    value: undefined,
    onChange: jest.fn(),
    onBlur: jest.fn(),
  },
  extendedHelpText: '',
  meta: {
    touched: false,
    error: '',
  },
  clearGetAWSAccountIDsResponse: () => {},
  openDrawer: jest.fn(),
};
