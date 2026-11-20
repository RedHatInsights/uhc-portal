import { DemoExperienceStatusEnum } from './DemoExperienceModels';
import { deserializeDemoExperience } from './demoExperienceService';

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

  it('does not treat missing quota as quota-exceeded for unavailable', () => {
    const result = deserializeDemoExperience({
      status: DemoExperienceStatusEnum.Unavailable,
    } as Parameters<typeof deserializeDemoExperience>[0]);

    expect(result.status).toBe(DemoExperienceStatusEnum.Unavailable);
    expect(result.quota).toEqual({ current: 0, limit: 0 });
  });
});
