import axios from 'axios';

import apiRequest from '~/services/apiRequest';

import { DemoExperienceStatusEnum } from './DemoExperienceModels';
import demoExperienceService, { deserializeDemoExperience } from './demoExperienceService';

type MockedJest = jest.Mocked<typeof axios> & jest.Mock;
const apiRequestMock = apiRequest as unknown as MockedJest;

describe('deserializeDemoExperience', () => {
  it('normalizes missing quota so consumers can read limit/current safely', () => {
    const result = deserializeDemoExperience({
      status: DemoExperienceStatusEnum.Available,
    } as Parameters<typeof deserializeDemoExperience>[0]);

    expect(result.quota).toEqual({ current: 0, limit: 0 });
    expect(result.status).toBe(DemoExperienceStatusEnum.Available);
  });

  it('rewrites unavailable to quota-exceeded when current >= limit', () => {
    const result = deserializeDemoExperience({
      status: DemoExperienceStatusEnum.Unavailable,
      quota: { current: 3, limit: 3 },
    });

    expect(result.status).toBe('quota-exceeded');
    expect(result.quota).toEqual({ current: 3, limit: 3 });
  });

  it('keeps unavailable when finite quota is not exhausted', () => {
    const result = deserializeDemoExperience({
      status: DemoExperienceStatusEnum.Unavailable,
      quota: { current: 1, limit: 3 },
    });

    expect(result.status).toBe(DemoExperienceStatusEnum.Unavailable);
    expect(result.quota).toEqual({ current: 1, limit: 3 });
  });

  it('does not treat missing quota as quota-exceeded for unavailable', () => {
    const result = deserializeDemoExperience({
      status: DemoExperienceStatusEnum.Unavailable,
    } as Parameters<typeof deserializeDemoExperience>[0]);

    expect(result.status).toBe(DemoExperienceStatusEnum.Unavailable);
    expect(result.quota).toEqual({ current: 0, limit: 0 });
  });

  it('does not treat null current/limit as quota-exceeded (null >= null is true in JS)', () => {
    const result = deserializeDemoExperience({
      status: DemoExperienceStatusEnum.Unavailable,
      quota: { current: null, limit: null },
    } as unknown as Parameters<typeof deserializeDemoExperience>[0]);

    expect(result.status).toBe(DemoExperienceStatusEnum.Unavailable);
    expect(result.quota).toEqual({ current: 0, limit: 0 });
  });

  it('does not rewrite when only one of current/limit is finite', () => {
    const result = deserializeDemoExperience({
      status: DemoExperienceStatusEnum.Unavailable,
      quota: { current: 3, limit: null },
    } as unknown as Parameters<typeof deserializeDemoExperience>[0]);

    expect(result.status).toBe(DemoExperienceStatusEnum.Unavailable);
    expect(result.quota).toEqual({ current: 3, limit: 0 });
  });
});

describe('demoExperienceService API wrappers', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('getDemoExperience deserializes quota and status', async () => {
    apiRequestMock.get.mockResolvedValue({
      data: {
        status: DemoExperienceStatusEnum.Unavailable,
        quota: { current: 3, limit: 3 },
      },
    });

    const response = await demoExperienceService.getDemoExperience();

    expect(apiRequestMock.get).toHaveBeenCalledWith(
      '/demoExperience/rosa-hands-on',
      expect.any(Object),
    );
    expect(response.data.status).toBe('quota-exceeded');
    expect(response.data.quota).toEqual({ current: 3, limit: 3 });
  });

  it('requestExperience deserializes the POST response', async () => {
    apiRequestMock.post.mockResolvedValue({
      data: {
        status: DemoExperienceStatusEnum.Deploying,
        quota: { current: 1, limit: 3 },
      },
    });

    const response = await demoExperienceService.requestExperience();

    expect(apiRequestMock.post).toHaveBeenCalledWith(
      '/demoExperience/rosa-hands-on',
      {},
      expect.any(Object),
    );
    expect(response.data.status).toBe(DemoExperienceStatusEnum.Deploying);
    expect(response.data.quota).toEqual({ current: 1, limit: 3 });
  });
});
