import React from 'react';

import { useFetchGcpDnsDomains } from '~/queries/ClusterDetailsQueries/NetworkingTab/useFetchGcpDnsDomains';
import { render, screen } from '~/testUtils';

import DnsZoneSelect from './DnsZoneSelect';

jest.mock('~/queries/ClusterDetailsQueries/NetworkingTab/useFetchGcpDnsDomains', () => ({
  useFetchGcpDnsDomains: jest.fn(),
}));

const useFetchGcpDnsDomainsMock = useFetchGcpDnsDomains as jest.Mock;

const defaultProps = {
  selectedDnsZone: { id: '' },
  domainPrefix: 'prefix1',
  organizationId: 'testOrg1',
  input: { name: '', value: '', onBlur: () => {}, onChange: () => {} },
  meta: { error: '', touched: false },
};

const dnsDomains = [
  {
    Kind: 'DnsDomain',
    id: 'dnsDomainId1',
    user_defined: true,
    cluster_arch: 'classic',
    cloud_provider: 'gcp',
    gcp: {
      domain_prefix: 'prefix1',
      project_id: 'project1',
      network_id: 'vpc1',
    },
    organization: {
      id: 'testOrg1',
    },
  },
  {
    Kind: 'DnsDomain',
    id: 'dnsDomainId2',
    user_defined: true,
    cluster_arch: 'classic',
    cloud_provider: 'gcp',
    gcp: {
      domain_prefix: 'prefix1',
      project_id: 'project1',
      network_id: 'vpc1',
    },
    organization: {
      id: 'testOrg1',
    },
  },
  {
    Kind: 'DnsDomain',
    id: 'dnsDomainId3',
    user_defined: true,
    cluster_arch: 'classic',
    cloud_provider: 'gcp',
    gcp: {
      domain_prefix: 'prefix1',
      project_id: 'project1',
      network_id: 'vpc1',
    },
    organization: {
      id: 'testOrg1',
    },
  },
  {
    Kind: 'DnsDomain',
    id: 'dnsDomainId4',
    user_defined: true,
    cluster_arch: 'classic',
    cloud_provider: 'gcp',
    gcp: {
      domain_prefix: 'prefix1',
      project_id: 'project1',
      network_id: 'vpc1',
    },
    organization: {
      id: 'testOrg1',
    },
  },
  {
    Kind: 'DnsDomain',
    id: 'dnsDomainId5',
    user_defined: true,
    cluster_arch: 'classic',
    cloud_provider: 'gcp',
    gcp: {
      domain_prefix: 'prefix1',
      project_id: 'project1',
      network_id: 'vpc1',
    },
    organization: {
      id: 'testOrg2',
    },
  },
];

describe('<DnsZoneSelect />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows refresh when data is loaded', () => {
    useFetchGcpDnsDomainsMock.mockReturnValue({
      isFetching: false,
      data: dnsDomains,
      isSuccess: true,
    });

    render(<DnsZoneSelect {...defaultProps} />);

    expect(screen.getByRole('button', { name: 'Refresh' })).toBeEnabled();
  });

  it('shows search in select dns zone dropdown', async () => {
    useFetchGcpDnsDomainsMock.mockReturnValue({
      isFetching: false,
      data: dnsDomains,
      isSuccess: true,
    });

    const { user } = render(<DnsZoneSelect {...defaultProps} />);

    expect(await screen.findByText(/^select a dns zone$/i)).toBeInTheDocument();

    const selectDropdown = screen.getByRole('button', { name: 'Options menu' });
    await user.click(selectDropdown);

    expect(screen.getByPlaceholderText('Filter by DNS zone name')).toBeInTheDocument();
  });

  it('shows properly formatted dns zone names and only dns zones from users org', async () => {
    useFetchGcpDnsDomainsMock.mockReturnValue({
      isFetching: false,
      data: dnsDomains,
      isSuccess: true,
    });

    const { user } = render(<DnsZoneSelect {...defaultProps} />);
    expect(await screen.findByText(/^select a dns zone$/i)).toBeInTheDocument();

    const selectDropdown = screen.getByRole('button', { name: 'Options menu' });
    await user.click(selectDropdown);

    expect(screen.getByText('prefix1.dnsDomainId1 (project1)')).toBeInTheDocument();
    expect(screen.getByText('prefix1.dnsDomainId2 (project1)')).toBeInTheDocument();
    expect(screen.getByText('prefix1.dnsDomainId3 (project1)')).toBeInTheDocument();
    expect(screen.getByText('prefix1.dnsDomainId4 (project1)')).toBeInTheDocument();
    expect(screen.queryByText('prefix1.dnsDomainId5 (project1)')).toBeInTheDocument();
  });

  it('shows loading message ', async () => {
    useFetchGcpDnsDomainsMock.mockReturnValue({
      isFetching: true,
      data: [],
      isSuccess: true,
    });

    render(<DnsZoneSelect {...defaultProps} />);

    expect(await screen.findByText(/Loading.../i)).toBeInTheDocument();
  });

  it('shows message that no DNS zones were found', async () => {
    useFetchGcpDnsDomainsMock.mockReturnValue({
      isFetching: false,
      data: [],
      isSuccess: true,
    });

    render(<DnsZoneSelect {...defaultProps} />);

    expect(await screen.findByText(/No DNS Zones found/i)).toBeInTheDocument();
  });
});
