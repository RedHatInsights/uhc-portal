import React from 'react';
import type axios from 'axios';

import apiRequest from '~/services/apiRequest';
import { checkAccessibility, mockRestrictedEnv, render, screen, waitFor } from '~/testUtils';

import ocpLifeCycleStatuses from './__mocks__/ocpLifeCycleStatuses';
import Releases from './index';
import ReleaseChannel from './ReleaseChannel';

type MockedJest = jest.Mocked<typeof axios> & jest.Mock;
const apiRequestMock = apiRequest as unknown as MockedJest;

jest.mock('./ReleaseChannel', () => ({
  __esModule: true,
  namedExport: jest.fn(),
  default: jest.fn(),
}));

const MockReleaseChannel = ReleaseChannel as jest.Mock;

describe('<Releases />', () => {
  beforeEach(() => {
    apiRequestMock.get.mockResolvedValue(ocpLifeCycleStatuses);
  });
  beforeAll(() => {
    MockReleaseChannel.mockImplementation(
      ({ channel }: React.ComponentProps<typeof ReleaseChannel>) => (
        <dt className="pf-v6-c-description-list__term pf-v6-u-mt-md">{channel}</dt>
      ),
    );
  });

  // clear all mocks
  afterEach(() => {
    jest.clearAllMocks();
  });

  it.skip('is accessible', async () => {
    const { container } = render(<Releases />);
    expect(await screen.findByText('Learn more about updating channels')).toBeInTheDocument();

    expect(apiRequestMock.get).toHaveBeenCalledTimes(1);

    // Fails with  "<dl> elements must only directly contain properly-ordered <dt> and <dd> groups, <script>, <template> or <div> elements (definition-list)"
    await checkAccessibility(container);
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
        expect(apiRequestMock.get).toHaveBeenCalledTimes(1);
      });

      expect(screen.queryAllByText(/^stable/).length > 0).toBeTruthy();
      expect(screen.queryAllByText(/^fast/)).toHaveLength(0);
      expect(screen.queryAllByText(/^eus/).length > 0).toBeTruthy();
    });
  });
});
