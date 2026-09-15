import React from 'react';

import { OCP5_SUPPORT } from '~/queries/featureGates/featureConstants';
import getOCPLifeCycleStatus from '~/services/productLifeCycleService';
import { checkAccessibility, mockUseFeatureGate, render, screen } from '~/testUtils';

import { SupportStatusLabel } from './SupportStatusLabel';

jest.mock('~/services/productLifeCycleService');

const getOCPLifeCycleStatusMock = getOCPLifeCycleStatus as jest.Mock;

const supportVersions = [
  { name: '5.0', type: 'Full Support' },
  { name: '4.5', type: 'Full Support' },
  { name: '4.4', type: 'Maintenance Support' },
  { name: '4.3', type: 'Extended Update Support' },
  { name: '4.2', type: 'End Of Life' },
  { name: '4.1', type: 'some other status' },
];

const mockSuccessResponse = (versions = supportVersions) =>
  getOCPLifeCycleStatusMock.mockResolvedValue({
    data: { data: [{ versions }] },
  });

describe('<SupportStatusLabel />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('is accessible', async () => {
    mockSuccessResponse();

    const { container } = render(<SupportStatusLabel clusterVersion="4.5" />);
    await screen.findByText('Full support');

    await checkAccessibility(container);
  });

  it('fetches lifecycle data using the feature flag (flag OFF)', async () => {
    mockSuccessResponse();

    render(<SupportStatusLabel clusterVersion="4.5" />);
    await screen.findByText('Full support');

    expect(getOCPLifeCycleStatusMock).toHaveBeenCalledWith(false);
  });

  it('fetches lifecycle data using the v2 endpoint when OCP5_SUPPORT is enabled', async () => {
    mockUseFeatureGate([[OCP5_SUPPORT, true]]);
    mockSuccessResponse();

    render(<SupportStatusLabel clusterVersion="5.0" />);
    await screen.findByText('Full support');

    expect(getOCPLifeCycleStatusMock).toHaveBeenCalledWith(true);
  });

  it('renders the support status badge for a 5.x cluster when OCP5_SUPPORT is enabled', async () => {
    mockUseFeatureGate([[OCP5_SUPPORT, true]]);
    mockSuccessResponse();

    render(<SupportStatusLabel clusterVersion="5.0" />);

    expect(await screen.findByText('Full support')).toHaveClass('pf-v6-c-label__text');
  });

  it('shows a loading skeleton while fetching', () => {
    // Never resolves — keeps the component in loading state
    getOCPLifeCycleStatusMock.mockReturnValue(new Promise(() => {}));

    const { container } = render(<SupportStatusLabel clusterVersion="4.5" />);

    expect(container.querySelector('.inline-skeleton')).toBeInTheDocument();
  });

  it('shows an error alert when the lifecycle API is unavailable', async () => {
    getOCPLifeCycleStatusMock.mockRejectedValue(new Error('Network error'));

    render(<SupportStatusLabel clusterVersion="4.5" />);

    expect(await screen.findByText('Unable to load support status')).toBeInTheDocument();
  });

  it('shows N/A when the cluster version has no lifecycle entry', async () => {
    mockSuccessResponse([]);

    render(<SupportStatusLabel clusterVersion="4.5" />);

    expect(await screen.findByText('N/A')).toBeInTheDocument();
  });

  it('shows N/A for a pre-release version', async () => {
    mockSuccessResponse();

    render(<SupportStatusLabel clusterVersion="4.5.0-0.nightly-2020-07-14-052310" />);

    expect(await screen.findByText('N/A')).toBeInTheDocument();
  });

  describe('renders the correct badge for every supported status', () => {
    beforeEach(() => {
      mockSuccessResponse();
    });

    it('Full Support', async () => {
      render(<SupportStatusLabel clusterVersion="4.5" />);
      expect(await screen.findByText('Full support')).toHaveClass('pf-v6-c-label__text');
    });

    it('Maintenance Support', async () => {
      render(<SupportStatusLabel clusterVersion="4.4" />);
      expect(await screen.findByText('Maintenance support')).toHaveClass('pf-v6-c-label__text');
    });

    it('Extended Update Support', async () => {
      render(<SupportStatusLabel clusterVersion="4.3" />);
      expect(await screen.findByText('Extended update support')).toHaveClass('pf-v6-c-label__text');
    });

    it('End of Life', async () => {
      render(<SupportStatusLabel clusterVersion="4.2" />);
      expect(await screen.findByText('End of life')).toHaveClass('pf-v6-c-label__text');
    });

    it('unrecognized status', async () => {
      render(<SupportStatusLabel clusterVersion="4.1" />);
      expect(await screen.findByText('some other status')).toHaveClass('pf-v6-c-label__text');
    });
  });
});
