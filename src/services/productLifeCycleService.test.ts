import axios from 'axios';

import getOCPLifeCycleStatus, {
  V1_API_URL,
  V1_PRODUCT_NAME,
  V2_API_URL,
  V2_PRODUCT_NAME,
} from './productLifeCycleService';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('productLifeCycleService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.get.mockResolvedValue({ data: { data: [] } });
  });

  it('calls the v1 endpoint when OCP5 support is disabled', async () => {
    await getOCPLifeCycleStatus(false);

    expect(mockedAxios.get).toHaveBeenCalledWith(V1_API_URL, {
      params: { name: V1_PRODUCT_NAME },
    });
  });

  it('calls the v2 endpoint when OCP5 support is enabled', async () => {
    await getOCPLifeCycleStatus(true);

    expect(mockedAxios.get).toHaveBeenCalledWith(V2_API_URL, {
      params: { name: V2_PRODUCT_NAME },
    });
  });
});
