import React from 'react';
import axios from 'axios';

import apiRequest from '~/services/apiRequest';
import { checkAccessibility, render, screen } from '~/testUtils';

import ocpReleases from './__mocks__/ocpReleases';
import ReleaseChannel from './ReleaseChannel';

type MockedJest = jest.Mocked<typeof axios> & jest.Mock;
const apiRequestMock = apiRequest as unknown as MockedJest;

describe('<ReleaseChannel />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('is accessible', async () => {
    apiRequestMock.get.mockResolvedValue(ocpReleases);
    // Adding dl because the ReleaseChannel component would normally be wrapped in a dl element
    const { container } = render(
      <dl>
        <ReleaseChannel channel="stable-4.6" />
      </dl>,
    );

    expect(await screen.findByText('stable-4.6')).toBeInTheDocument();

    await checkAccessibility(container);
  });

  it('displays a link', async () => {
    apiRequestMock.get.mockResolvedValue(ocpReleases);

    render(<ReleaseChannel channel="stable-4.6" />);

    expect(await screen.findByText('stable-4.6')).toBeInTheDocument();

    expect(screen.getByRole('link')).toHaveTextContent('4.6.12');

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://docs.redhat.com/en/documentation/openshift_container_platform/4.6/html/release_notes/ocp-4-6-release-notes#ocp-4-6-12',
    );
    expect(apiRequestMock.get).toHaveBeenCalledTimes(1);
  });

  // 5.x release notes links must resolve the same way 4.x links do.
  it('displays a link for a 5.x version', async () => {
    apiRequestMock.get.mockResolvedValue({
      data: {
        nodes: [
          {
            version: '5.0.3',
            payload:
              'quay.io/openshift-release-dev/ocp-release@sha256:0000000000000000000000000000000000000000000000000000000000000',
          },
        ],
      },
    });

    render(<ReleaseChannel channel="stable-5.0" />);

    expect(await screen.findByText('stable-5.0')).toBeInTheDocument();

    expect(screen.getByRole('link')).toHaveTextContent('5.0.3');
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://docs.redhat.com/en/documentation/openshift_container_platform/5.0/html/release_notes/ocp-5-0-release-notes#ocp-5-0-3',
    );
  });

  // AC: "OCP 5.x version cards show a 'Learn more' candidate channel
  // link in the popover" — must render inside the actual popover, not just resolve
  // as a bare URL from the pure function.
  it('shows a "Learn more about candidate channels" popover link for a 5.x candidate channel', async () => {
    apiRequestMock.get.mockResolvedValue({
      data: {
        nodes: [
          {
            version: '5.0.3',
            payload:
              'quay.io/openshift-release-dev/ocp-release@sha256:0000000000000000000000000000000000000000000000000000000000000',
          },
        ],
      },
    });

    const { user } = render(<ReleaseChannel channel="candidate-5.0" />);

    expect(await screen.findByText('candidate-5.0')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'More information' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    const candidateLink = screen.getByRole('link', { name: /Learn more about candidate channels/ });
    expect(candidateLink).toHaveAttribute(
      'href',
      'https://docs.redhat.com/en/documentation/openshift_container_platform/5.0/html/updating_clusters/understanding-openshift-updates-1#understanding-update-channels-releases',
    );
  });

  // Same AC, existing 4.x behavior — must continue to work unchanged.
  it('shows a "Learn more about candidate channels" popover link for a 4.x candidate channel', async () => {
    apiRequestMock.get.mockResolvedValue(ocpReleases);

    const { user } = render(<ReleaseChannel channel="candidate-4.6" />);

    expect(await screen.findByText('candidate-4.6')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'More information' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    const candidateLink = screen.getByRole('link', { name: /Learn more about candidate channels/ });
    expect(candidateLink).toHaveAttribute(
      'href',
      'https://docs.redhat.com/en/documentation/openshift_container_platform/4.6/html/updating_clusters/understanding-upgrade-channels-releases#candidate-version-channel_understanding-upgrade-channels-releases',
    );
  });
});
