import React from 'react';

import * as Sentry from '@sentry/browser';

import { AugmentedDemoExperience } from './augmentedModelTypes';
import { DemoExperienceStatusEnum } from './DemoExperienceModels';
import demoExperienceService from './demoExperienceService';

const LONG_POLLING_INTERVAL = 30000;
const SHORT_POLLING_INTERVAL = 5000;
const MAX_SHORT_POLLING_COUNTER = 5;

const useDemoExperiencePolling = (): {
  demoExperience: AugmentedDemoExperience;
  initializing: boolean;
  initializeError: unknown;
  restartPolling: (demoExperience: AugmentedDemoExperience) => void;
} => {
  const [demoExperience, setDemoExperience] = React.useState<AugmentedDemoExperience>({
    quota: { current: 0, limit: 0 },
  } as AugmentedDemoExperience);
  const [initializing, setInitializing] = React.useState<boolean>(false);
  const [initializeError, setInitializeError] = React.useState<unknown>();
  const intervalIdRef = React.useRef<number | null>();
  const pollingErrorCounter = React.useRef<number>(0);
  const pollingCounter = React.useRef<number>(-1);

  const shouldStopPolling = (demoExperience?: AugmentedDemoExperience) =>
    demoExperience?.status === DemoExperienceStatusEnum.Available ||
    demoExperience?.status === DemoExperienceStatusEnum.Failed ||
    demoExperience?.status === DemoExperienceStatusEnum.Unavailable ||
    demoExperience?.status === 'quota-exceeded';

  const stopPolling = () => {
    if (intervalIdRef.current) {
      window.clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    pollingCounter.current = -1;
  };

  // avoid race conditions, for example the request returned after next interval tick occured
  const wasCounterUpdatedDuringRequest = (counter: number) => counter !== pollingCounter.current;

  const startPolling = async (interval: number) => {
    pollingCounter.current = 0;
    const id = window.setInterval(async () => {
      pollingCounter.current += 1;
      const counter = pollingCounter.current;
      try {
        const { data: demoExperience } = await demoExperienceService.getDemoExperience();
        if (wasCounterUpdatedDuringRequest(counter)) {
          return;
        }
        setDemoExperience(demoExperience);
        if (shouldStopPolling(demoExperience)) {
          stopPolling();
        } else if (
          interval === SHORT_POLLING_INTERVAL &&
          pollingCounter.current === MAX_SHORT_POLLING_COUNTER
        ) {
          // poll every five seconds first five times to support case where there's an available experience from the pool within seconds
          stopPolling();
          startPolling(LONG_POLLING_INTERVAL);
        }
      } catch (err) {
        if (counter !== pollingCounter.current) {
          // avoid race conditions
          return;
        }
        // handle polling error by reportring the first one to Sentry. currently not displayed to user
        if (pollingErrorCounter.current === 0) {
          Sentry.captureException(err);
        }
        pollingErrorCounter.current += 1;
      }
    }, interval);
    intervalIdRef.current = id;
  };

  const initialize = async () => {
    setInitializing(true);
    try {
      const { data: demoExperience } = await demoExperienceService.getDemoExperience();
      setDemoExperience(demoExperience);
      if (!shouldStopPolling(demoExperience)) {
        startPolling(SHORT_POLLING_INTERVAL);
      }
    } catch (err) {
      Sentry.captureException(err);
      setInitializeError(err);
    } finally {
      setInitializing(false);
    }
  };

  const restartPolling = (demoExperience: AugmentedDemoExperience) => {
    stopPolling();
    setDemoExperience(demoExperience);
    startPolling(SHORT_POLLING_INTERVAL);
  };

  React.useEffect(() => {
    initialize();
    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { demoExperience, initializing, initializeError, restartPolling };
};

export default useDemoExperiencePolling;
