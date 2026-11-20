import { AxiosResponse } from 'axios';

import config from '~/config';
import apiRequest from '~/services/apiRequest';

import { AugmentedDemoExperience, AugmentedDemoExperienceStatus } from './augmentedModelTypes';
import {
  DemoExperience,
  DemoExperienceQuota,
  DemoExperienceStatusEnum,
} from './DemoExperienceModels';

/** Safe defaults when API/override payloads omit quota (avoids render crashes). */
const normalizeQuota = (quota?: Partial<DemoExperienceQuota>): DemoExperienceQuota => ({
  current: quota?.current ?? 0,
  limit: quota?.limit ?? 0,
});

const getAugmentedDemoExperienceStatus = (
  demoExperience: DemoExperience,
): AugmentedDemoExperienceStatus => {
  const quota = demoExperience.quota;
  // Require a real quota object before rewriting — missing quota must not become
  // quota-exceeded via 0 >= 0 after normalization.
  if (
    demoExperience.status === DemoExperienceStatusEnum.Unavailable &&
    quota != null &&
    quota.current >= quota.limit
  ) {
    return 'quota-exceeded';
  }
  return demoExperience.status;
};

const URL = '/demoExperience/rosa-hands-on';

/** Normalize quota and apply UI status rewrite (e.g. unavailable → quota-exceeded). */
export const deserializeDemoExperience = (
  demoExperience: DemoExperience,
): AugmentedDemoExperience => ({
  ...demoExperience,
  quota: normalizeQuota(demoExperience.quota),
  status: getAugmentedDemoExperienceStatus(demoExperience),
});

const getDemoExperience = async (): Promise<AxiosResponse<AugmentedDemoExperience>> => {
  const response = await apiRequest.get<DemoExperience>(URL, {
    baseURL: config.configData.demoExperience,
  });
  return { ...response, data: deserializeDemoExperience(response.data) };
};

const requestExperience = async (): Promise<AxiosResponse<AugmentedDemoExperience>> => {
  const response = await apiRequest.post<DemoExperience>(
    URL,
    {},
    { baseURL: config.configData.demoExperience },
  );
  return { ...response, data: deserializeDemoExperience(response.data) };
};

const demoExperienceService = {
  getDemoExperience,
  requestExperience,
};

export default demoExperienceService;
