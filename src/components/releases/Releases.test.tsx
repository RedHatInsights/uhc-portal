import React from 'react';
import type axios from 'axios';

import apiRequest from '~/services/apiRequest';
import { checkAccessibility, mockRestrictedEnv, render, screen, waitFor } from '~/testUtils';

import ocpLifeCycleStatuses from './__mocks__/ocpLifeCycleStatuses';
import Releases from './index';

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
