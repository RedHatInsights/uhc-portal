import { CurrentsConfig } from '@currents/playwright';

const config: CurrentsConfig = {
  projectId: 'AFvdNQ',
  recordKey: process.env.CURRENTS_RECORD_KEY!,
};

export default config;
