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

  it.skip('is accessible', async () => {
    apiRequestMock.get.mockResolvedValue(ocpReleases);

    const { container } = render(<ReleaseChannel channel="stable-4.6" />);

    expect(await screen.findByText('stable-4.6')).toBeInTheDocument();

    // fails with   "<dt> and <dd> elements must be contained by a <dl> (dlitem)" error
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
});
