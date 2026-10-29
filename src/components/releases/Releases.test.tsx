import React from 'react';
import type axios from 'axios';

import { OCP5_SUPPORT } from '~/queries/featureGates/featureConstants';
import apiRequest from '~/services/apiRequest';
import {
  checkAccessibility,
  mockRestrictedEnv,
  mockUseFeatureGate,
  render,
  screen,
  waitFor,
} from '~/testUtils';

import ocpLifeCycleStatuses from './__mocks__/ocpLifeCycleStatuses';
import Releases from './Releases';

type MockedJest = jest.Mocked<typeof axios> & jest.Mock;
const apiRequestMock = apiRequest as unknown as MockedJest;

describe('<Releases />', () => {
  beforeEach(() => {
    apiRequestMock.get.mockResolvedValue(ocpLifeCycleStatuses);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is accessible', async () => {
    const { container } = render(<Releases />);
    expect(await screen.findByText('Learn more about updating channels')).toBeInTheDocument();

    expect(apiRequestMock.get).toHaveBeenCalled();

    await checkAccessibility(container);
  });

  it('renders OCP 5.x versions when OCP5_SUPPORT is enabled', async () => {
    mockUseFeatureGate([[OCP5_SUPPORT, true]]);

    render(<Releases />);

    expect(await screen.findByText('Releases')).toBeInTheDocument();
    expect(screen.getByText('OpenShift 5.0')).toBeInTheDocument();
    // 5.0 has concrete EUS dates in the mock; 5.1 does not
    expect(screen.getByText('eus-5.0')).toBeInTheDocument();
    expect(screen.getByText('No 5.1 EUS channel')).toBeInTheDocument();
    // 4.x versions still render alongside 5.x when flag is on
    expect(screen.getByText('eus-4.12')).toBeInTheDocument();
    expect(screen.getByText('No 4.11 EUS channel')).toBeInTheDocument();
  });

  // 4.x and 5.x doc links must both resolve correctly on the same page,
  // each version card generating its own major.minor URL independently.
  it('resolves correct, distinct release notes links for 4.x and 5.x cards on the same page', async () => {
    mockUseFeatureGate([[OCP5_SUPPORT, true]]);

    render(<Releases />);

    const link5 = (await screen.findByText('OpenShift 5.0')).closest('a');
    expect(link5).toHaveAttribute(
      'href',
      'https://docs.redhat.com/en/documentation/openshift_container_platform/5.0/html/release_notes/ocp-5-0-release-notes',
    );

    const link4 = screen.getByText('OpenShift 4.12').closest('a');
    expect(link4).toHaveAttribute(
      'href',
      'https://docs.redhat.com/en/documentation/openshift_container_platform/4.12/html/release_notes/ocp-4-12-release-notes',
    );
  });

  // No hardcoded '4.7' fallback — the real latest version is used in the
  // "Channels" description once lifecycle data has loaded.
  it('shows the actual latest version in the "for example" text when version data is available', async () => {
    apiRequestMock.get.mockResolvedValue({
      data: { data: [{ versions: [{ name: '4.99', type: 'Full Support' }] }] },
    });

    render(<Releases />);

    expect(await screen.findByText(/for example 4\.99/)).toBeInTheDocument();
  });

  // No hardcoded '4.7' fallback — omit the "Learn more" link entirely
  // when lifecycle data hasn't loaded / is unavailable.
  it('omits the "Learn more about updating channels" link when there is no version data', async () => {
    apiRequestMock.get.mockResolvedValue({ data: { data: [{ versions: [] }] } });

    render(<Releases />);

    await waitFor(() => {
      expect(apiRequestMock.get).toHaveBeenCalled();
    });

    expect(screen.queryByText('Learn more about updating channels')).not.toBeInTheDocument();
  });

  it('shows an error alert when release versions fail to load', async () => {
    apiRequestMock.get.mockRejectedValue(new Error('Network error'));

    render(<Releases />);

    expect(
      await screen.findByText('There was an issue getting release versions.'),
    ).toBeInTheDocument();
  });

  describe('in restricted env', () => {
    const isRestrictedEnv = mockRestrictedEnv();
    afterAll(() => {
      isRestrictedEnv.mockReturnValue(false);
    });

    it('should render only stable releases', async () => {
      isRestrictedEnv.mockReturnValue(true);

      render(<Releases />);
      await waitFor(() => {
        expect(apiRequestMock.get).toHaveBeenCalled();
      });

      expect(screen.queryAllByText(/^stable/).length > 0).toBeTruthy();
      expect(screen.queryAllByText(/^fast/)).toHaveLength(0);
      expect(screen.queryAllByText(/^eus/).length > 0).toBeTruthy();
    });
  });
});
