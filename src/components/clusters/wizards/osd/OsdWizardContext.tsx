import { createContext } from 'react';

export const OsdWizardContext = createContext<{
  isOSDFromGoogleCloud: boolean;
}>({ isOSDFromGoogleCloud: false });
