import { useContext, useMemo } from 'react';

import { OsdWizardContext } from './OsdWizardContext';

export const useIsOSDFromGoogleCloud = (): boolean => {
  const { isOSDFromGoogleCloud } = useContext(OsdWizardContext);

  return useMemo(() => isOSDFromGoogleCloud, [isOSDFromGoogleCloud]);
};
