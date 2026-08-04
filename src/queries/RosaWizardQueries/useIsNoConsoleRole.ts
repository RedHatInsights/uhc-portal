import { OCM_ROLE_NO_CONSOLE_PROFILE } from '~/components/clusters/wizards/rosa/rosaConstants';
import { OCM_ROLE_NO_CONSOLE } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';

import { useFetchGetOCMRole } from './useFetchGetOCMRole';

export const useIsNoConsoleRole = (awsAccountID: string) => {
  const hasNoConsoleFlag = useFeatureGate(OCM_ROLE_NO_CONSOLE);
  const ocmRole = useFetchGetOCMRole(awsAccountID);
  const isNoConsoleRole =
    hasNoConsoleFlag && ocmRole.isSuccess && ocmRole.data?.profile === OCM_ROLE_NO_CONSOLE_PROFILE;
  return { ...ocmRole, isNoConsoleRole };
};
