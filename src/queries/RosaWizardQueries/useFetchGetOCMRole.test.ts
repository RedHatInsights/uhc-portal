import axios from 'axios';

import { waitFor } from '@testing-library/react';

import apiRequest from '~/services/apiRequest';
import { renderHook } from '~/testUtils';

import { mockedGetOCMRole } from '../__mocks__/queryMockedData';

import { useFetchGetOCMRole } from './useFetchGetOCMRole';

type MockedJest = jest.Mocked<typeof axios> & jest.Mock;
const apiRequestMock = apiRequest as unknown as MockedJest;

describe('useFetchGetOCMRole hook', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const awsAccountID = 'mockedAccountId';

  it('Get useFetchGetOCMRole valid response', async () => {
    // Mock the network request using axios
    apiRequestMock.post.mockResolvedValueOnce(mockedGetOCMRole);

    const { result } = renderHook(() => useFetchGetOCMRole(awsAccountID));

    expect(result.current.isPending).toBe(true);

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });
    expect(result.current.isError).toBe(false);
    expect(result.current.data).toEqual(mockedGetOCMRole);
  });

  it('Get useFetchGetOCMRole error response', async () => {
    const awsAccountID = 'mockedAccountId';

    // Mock the network request using axios
    apiRequestMock.post.mockRejectedValueOnce({
      name: 403,
      message: 'No data',
    });
    const { result } = renderHook(() => useFetchGetOCMRole(awsAccountID));

    expect(result.current.isPending).toBe(true);

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });
    expect(result.current.data).toBe(undefined);
    expect(result.current.isError).toBe(true);
  });
});
