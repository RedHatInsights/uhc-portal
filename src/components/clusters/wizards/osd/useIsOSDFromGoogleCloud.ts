import { useContext } from 'react';

import { OsdWizardContext } from './OsdWizardContext';

export const useIsOSDFromGoogleCloud = (): boolean => {
  const { isOSDFromGoogleCloud } = useContext(OsdWizardContext);

  return isOSDFromGoogleCloud;
};
