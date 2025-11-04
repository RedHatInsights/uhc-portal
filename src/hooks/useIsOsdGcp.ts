import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { OSD_FOR_GOOGLE_CLOUD } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';

export const useIsOsdGcp = (): boolean => {
  const location = useLocation();
  const isFeatureEnabled = useFeatureGate(OSD_FOR_GOOGLE_CLOUD);

  return useMemo(
    () => location.pathname === '/openshift/create/osdgcp' && isFeatureEnabled,
    [location.pathname, isFeatureEnabled],
  );
};
