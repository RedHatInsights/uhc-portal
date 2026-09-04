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

    expect(await screen.findByTestId('version-5.0')).toBeInTheDocument();
    expect(screen.getByTestId('version-5.1')).toBeInTheDocument();
    expect(screen.getByText('OpenShift 5.0')).toBeInTheDocument();
    // 5.0 has concrete EUS dates in the mock; 5.1 does not
    expect(screen.getByText('eus-5.0')).toBeInTheDocument();
    expect(screen.getByText('No 5.1 EUS channel')).toBeInTheDocument();
    // 4.x versions still render alongside 5.x when flag is on
    expect(screen.getByTestId('version-4.12')).toBeInTheDocument();
    expect(screen.getByText('eus-4.12')).toBeInTheDocument();
    expect(screen.getByText('No 4.11 EUS channel')).toBeInTheDocument();
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
