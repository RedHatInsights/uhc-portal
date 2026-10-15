import React from 'react';

import clusterService from '~/services/clusterService';
import { render, screen, waitFor } from '~/testUtils';

import { CreateFirewallRulesModal } from './CreateFirewallRulesModal';

jest.mock('~/services/clusterService', () => ({
  __esModule: true,
  default: {
    createGcpFirewallRule: jest.fn(),
  },
}));

const createGcpFirewallRuleMock = clusterService.createGcpFirewallRule as jest.Mock;

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  onSuccess: jest.fn(),
  network: 'zac-vpc-6',
  projectId: 'ocm-ui-dev',
  wifConfigId: 'wif-1',
  profile: 'public',
};

describe('<CreateFirewallRulesModal />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the modal title with the VPC name and prefills machine CIDR', () => {
    render(<CreateFirewallRulesModal {...defaultProps} />);

    expect(screen.getByText('Add firewall rule for vpc zac-vpc-6')).toBeInTheDocument();
    expect(screen.getByLabelText(/Machine CIDR/i)).toHaveValue('10.0.0.0/16');
  });

  it('creates firewall rules and closes on success', async () => {
    createGcpFirewallRuleMock.mockResolvedValue({ data: { id: 'fw-new' } });
    const onClose = jest.fn();
    const onSuccess = jest.fn().mockResolvedValue(undefined);
    const { user } = render(
      <CreateFirewallRulesModal {...defaultProps} onClose={onClose} onSuccess={onSuccess} />,
    );

    await user.type(screen.getByLabelText(/Firewall rule name/i), 'za-fw-ui');
    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(createGcpFirewallRuleMock).toHaveBeenCalledWith({
        name: 'za-fw-ui',
        profile: 'public',
        wif_config: { id: 'wif-1' },
        gcp_network: {
          project_id: 'ocm-ui-dev',
          vpc_name: 'zac-vpc-6',
          machine_cidr: '10.0.0.0/16',
        },
        template: {
          version: 'v1',
          href: '/api/clusters_mgmt/v1/gcp/firewall_rule_templates/v1/profiles/public',
        },
      });
    });
    expect(onSuccess).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('keeps the modal open and shows an error when create fails', async () => {
    createGcpFirewallRuleMock.mockRejectedValue(new Error('backend denied'));

    const onClose = jest.fn();
    const { user } = render(<CreateFirewallRulesModal {...defaultProps} onClose={onClose} />);

    await user.type(screen.getByLabelText(/Firewall rule name/i), 'za-fw-ui');
    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(await screen.findByText(/backend denied/i)).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByText('Add firewall rule for vpc zac-vpc-6')).toBeInTheDocument();
  });
});
