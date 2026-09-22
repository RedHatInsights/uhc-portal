import React from 'react';

import useAnalytics from '~/hooks/useAnalytics';
import {
  refetchGcpFirewallRules,
  useFetchGcpFirewallRules,
} from '~/queries/ClusterDetailsQueries/NetworkingTab/useFetchGcpFirewallRules';
import { render, screen } from '~/testUtils';

import { FirewallRulesSelect } from './FirewallRulesSelect';

jest.mock('~/hooks/useAnalytics');
jest.mock('~/queries/ClusterDetailsQueries/NetworkingTab/useFetchGcpFirewallRules', () => ({
  useFetchGcpFirewallRules: jest.fn(),
  refetchGcpFirewallRules: jest.fn(),
}));

const useFetchGcpFirewallRulesMock = useFetchGcpFirewallRules as jest.Mock;
const refetchGcpFirewallRulesMock = refetchGcpFirewallRules as jest.Mock;
const useAnalyticsMock = useAnalytics as jest.Mock;

const firewallRules = [
  {
    id: 'fw-1',
    name: 'prod-byo-firewall',
    gcp_network: {
      project_id: 'my-service-project',
      vpc_name: 'prod-us-east1-vpc',
    },
    wif_config: { id: 'wif-1' },
  },
  {
    id: 'fw-2',
    name: 'staging-fw-rules',
    gcp_network: {
      project_id: 'my-service-project',
      vpc_name: 'prod-us-east1-vpc',
    },
    wif_config: { id: 'wif-1' },
  },
];

const createDefaultProps = (overrides: Record<string, unknown> = {}) => ({
  selectedFirewallRules: { id: '' },
  wifConfigId: 'wif-1',
  projectId: 'my-service-project',
  network: 'prod-us-east1-vpc',
  profile: 'public',
  createFirewallRulesCommand:
    'ocm gcp create firewall-rules --name=<name> --wif-config=wif-1 --project=my-service-project --network=prod-us-east1-vpc',
  input: { name: '', value: '', onBlur: () => {}, onChange: jest.fn() },
  meta: { error: '', touched: false },
  ...overrides,
});

describe('<FirewallRulesSelect />', () => {
  const trackMock = jest.fn();

  beforeEach(() => {
    useAnalyticsMock.mockReturnValue(trackMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows refresh when data is loaded', () => {
    useFetchGcpFirewallRulesMock.mockReturnValue({
      isFetching: false,
      data: firewallRules,
      isSuccess: true,
    });

    render(<FirewallRulesSelect {...createDefaultProps()} />);

    expect(screen.getByRole('button', { name: 'Refresh' })).toBeEnabled();
  });

  it('shows search in firewall rules dropdown', async () => {
    useFetchGcpFirewallRulesMock.mockReturnValue({
      isFetching: false,
      data: firewallRules,
      isSuccess: true,
    });

    const { user } = render(<FirewallRulesSelect {...createDefaultProps()} />);

    expect(await screen.findByText(/^select firewall rules$/i)).toBeInTheDocument();

    const selectDropdown = screen.getByRole('button', { name: 'Options menu' });
    await user.click(selectDropdown);

    expect(screen.getByPlaceholderText('Filter by firewall rule name')).toBeInTheDocument();
  });

  it('shows properly formatted firewall rule names', async () => {
    useFetchGcpFirewallRulesMock.mockReturnValue({
      isFetching: false,
      data: firewallRules,
      isSuccess: true,
    });

    const { user } = render(<FirewallRulesSelect {...createDefaultProps()} />);
    expect(await screen.findByText(/^select firewall rules$/i)).toBeInTheDocument();

    const selectDropdown = screen.getByRole('button', { name: 'Options menu' });
    await user.click(selectDropdown);

    expect(
      screen.getByText('prod-byo-firewall (my-service-project / prod-us-east1-vpc)'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('staging-fw-rules (my-service-project / prod-us-east1-vpc)'),
    ).toBeInTheDocument();
  });

  it('shows loading message', async () => {
    useFetchGcpFirewallRulesMock.mockReturnValue({
      isFetching: true,
      data: [],
      isSuccess: true,
    });

    render(<FirewallRulesSelect {...createDefaultProps()} />);

    expect(await screen.findByText(/Loading.../i)).toBeInTheDocument();
  });

  it('shows message that no firewall rules were found', async () => {
    useFetchGcpFirewallRulesMock.mockReturnValue({
      isFetching: false,
      data: [],
      isSuccess: true,
    });

    render(<FirewallRulesSelect {...createDefaultProps()} />);

    expect(await screen.findByText(/No firewall rules found/i)).toBeInTheDocument();
  });

  it('shows create firewall rules CLI command', async () => {
    useFetchGcpFirewallRulesMock.mockReturnValue({
      isFetching: false,
      data: firewallRules,
      isSuccess: true,
    });

    const props = createDefaultProps();
    const { user } = render(<FirewallRulesSelect {...props} />);

    await user.click(screen.getByText('Create Firewall Rules'));

    expect(screen.getByDisplayValue(props.createFirewallRulesCommand)).toBeInTheDocument();
  });

  it('calls onChange and tracks analytics when a firewall rule is selected', async () => {
    useFetchGcpFirewallRulesMock.mockReturnValue({
      isFetching: false,
      data: firewallRules,
      isSuccess: true,
    });

    const onChange = jest.fn();
    const { user } = render(
      <FirewallRulesSelect
        {...createDefaultProps({ input: { name: '', value: '', onBlur: () => {}, onChange } })}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Options menu' }));
    await user.click(
      screen.getByText('prod-byo-firewall (my-service-project / prod-us-east1-vpc)'),
    );

    expect(onChange).toHaveBeenCalledWith(firewallRules[0]);
    expect(trackMock).toHaveBeenCalledWith(
      expect.objectContaining({ link_name: 'firewall_rules_selected' }),
      {
        customProperties: {
          module: 'openshift',
          firewall_rules_id: 'fw-1',
          gcp_project_id: 'my-service-project',
        },
      },
    );
  });

  it('clears the selection when the clear control is clicked', async () => {
    useFetchGcpFirewallRulesMock.mockReturnValue({
      isFetching: false,
      data: firewallRules,
      isSuccess: true,
    });

    const onChange = jest.fn();
    const { user } = render(
      <FirewallRulesSelect
        {...createDefaultProps({
          selectedFirewallRules: firewallRules[0],
          input: { name: '', value: '', onBlur: () => {}, onChange },
        })}
      />,
    );

    await user.click(await screen.findByRole('button', { name: 'Clear selection' }));

    expect(onChange).toHaveBeenCalledWith({ id: '' });
  });

  it('syncs onChange when the selected firewall rule is present in fetched data', () => {
    useFetchGcpFirewallRulesMock.mockReturnValue({
      isFetching: false,
      data: firewallRules,
      isSuccess: true,
    });

    const onChange = jest.fn();
    render(
      <FirewallRulesSelect
        {...createDefaultProps({
          selectedFirewallRules: { id: 'fw-1' },
          input: { name: '', value: '', onBlur: () => {}, onChange },
        })}
      />,
    );

    expect(onChange).toHaveBeenCalledWith(firewallRules[0]);
  });

  it('clears the selection when the previously selected rule is no longer available', () => {
    useFetchGcpFirewallRulesMock.mockReturnValue({
      isFetching: false,
      data: firewallRules,
      isSuccess: true,
    });

    const onChange = jest.fn();
    render(
      <FirewallRulesSelect
        {...createDefaultProps({
          selectedFirewallRules: { id: 'missing-fw' },
          input: { name: '', value: '', onBlur: () => {}, onChange },
        })}
      />,
    );

    expect(onChange).toHaveBeenCalledWith({ id: '' });
  });

  it('refreshes firewall rules and tracks analytics on Refresh click', async () => {
    useFetchGcpFirewallRulesMock.mockReturnValue({
      isFetching: false,
      data: firewallRules,
      isSuccess: true,
    });

    const { user } = render(<FirewallRulesSelect {...createDefaultProps()} />);

    await user.click(screen.getByRole('button', { name: 'Refresh' }));

    expect(refetchGcpFirewallRulesMock).toHaveBeenCalled();
    expect(trackMock).toHaveBeenCalledWith(
      expect.objectContaining({ link_name: 'firewall_rules_refresh_clicked' }),
      {
        customProperties: {
          module: 'openshift',
          rules_count: 2,
        },
      },
    );
  });

  it('clears a deleted selection when Refresh is clicked', async () => {
    useFetchGcpFirewallRulesMock.mockReturnValue({
      isFetching: false,
      data: firewallRules,
      isSuccess: true,
    });

    const onChange = jest.fn();
    const { user } = render(
      <FirewallRulesSelect
        {...createDefaultProps({
          selectedFirewallRules: { id: 'missing-fw' },
          input: { name: '', value: '', onBlur: () => {}, onChange },
        })}
      />,
    );

    onChange.mockClear();
    await user.click(screen.getByRole('button', { name: 'Refresh' }));

    expect(onChange).toHaveBeenCalledWith({ id: '' });
  });

  it('disables the select while fetching', () => {
    useFetchGcpFirewallRulesMock.mockReturnValue({
      isFetching: true,
      data: [],
      isSuccess: false,
    });

    render(<FirewallRulesSelect {...createDefaultProps()} />);

    expect(screen.getByRole('button', { name: 'Options menu' })).toBeDisabled();
    expect(screen.getByText('Refresh').closest('button')).toBeDisabled();
  });
});
