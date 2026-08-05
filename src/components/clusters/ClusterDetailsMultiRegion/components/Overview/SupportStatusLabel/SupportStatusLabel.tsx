import React, { useMemo } from 'react';

import { Alert, Skeleton } from '@patternfly/react-core';

import { useOCPLifeCycleStatus } from '~/queries/useOCPLifeCycleStatus';

import SupportStatus from '../../../../../common/SupportStatus';

import './SupportStatusLabel.scss';

type SupportStatusLabelProps = {
  clusterVersion: string;
};

const SupportStatusLabel = ({ clusterVersion }: SupportStatusLabelProps) => {
  const { versions, isLoading, isError } = useOCPLifeCycleStatus();

  const supportedVersionRegex = useMemo(() => /^[4-6]\.\d{1,3}(\.\d{1,3})?$/, []);

  const supportStatusMap = useMemo(
    () =>
      versions?.reduce<Record<string, string>>((acc, { name, type }) => {
        acc[name] = type;
        return acc;
      }, {}),
    [versions],
  );

  const majorMinorVersion = clusterVersion.split('.', 2).join('.');
  const status = supportStatusMap?.[majorMinorVersion];

  const shouldHideComponent =
    !clusterVersion ||
    clusterVersion === 'N/A' ||
    !status ||
    !supportedVersionRegex.test(clusterVersion);

  if (isLoading) {
    return <Skeleton fontSize="sm" className="inline-skeleton" screenreaderText="Loading..." />;
  }

  if (isError) {
    return (
      <Alert
        variant="warning"
        isInline
        isPlain
        title="Unable to load support status"
        aria-label="Unable to load support status"
      />
    );
  }

  return shouldHideComponent ? <>N/A</> : <SupportStatus status={status} />;
};

export { SupportStatusLabel };
export default SupportStatusLabel;
