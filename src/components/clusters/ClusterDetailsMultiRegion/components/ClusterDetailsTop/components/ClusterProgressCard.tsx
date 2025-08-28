import React from 'react';

import {
  Card,
  CardBody,
  CardTitle,
  Content,
  ContentVariants,
  Icon,
  Spinner,
  Title,
} from '@patternfly/react-core';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';

import clusterStates, {
  hasInflightEgressErrors,
  isHypershiftCluster,
  isWaitingHypershiftCluster,
  isWaitingROSAManualMode,
} from '~/components/clusters/common/clusterStates';
import DownloadOcCliButton from '~/components/clusters/common/InstallProgress/DownloadOcCliButton';
import InstallProgress from '~/components/clusters/common/InstallProgress/InstallProgress';
import UninstallProgress from '~/components/clusters/common/UninstallProgress';
import { AvailableRegionalInstance } from '~/queries/types';
import { ClusterFromSubscription } from '~/types/types';

import InstallationLogView from '../../Overview/InstallationLogView';

interface ClusterProgressCardProps {
  cluster: ClusterFromSubscription;
  regionalInstance?: AvailableRegionalInstance;
}

const ClusterProgressCard = ({ cluster, regionalInstance }: ClusterProgressCardProps) => {
  const isError = cluster.state === clusterStates.error;
  const isPending = cluster.state === clusterStates.pending;
  const isValidating = cluster.state === clusterStates.validating;
  const isInstalling = cluster.state === clusterStates.installing;
  const isUninstalling = cluster.state === clusterStates.uninstalling;
  const isWaitingROSAManual = isWaitingROSAManualMode(cluster);
  const isWaitingHypershift = isWaitingHypershiftCluster(cluster);
  const installationInProgress =
    (isPending || isInstalling || isWaitingHypershift || isValidating || !isWaitingROSAManual) &&
    !isError;
  const inProgress = (installationInProgress || isUninstalling) && !isError;
  const estCompletionTime = isHypershiftCluster(cluster) ? '10' : '30 to 60';
  const hasInflightErrors = hasInflightEgressErrors(cluster);

  let titleText;
  if (isError) {
    titleText = 'Installation error';
  } else if (isUninstalling) {
    titleText = 'Uninstalling cluster';
  } else if (isWaitingROSAManual) {
    titleText = 'Action required to continue installation';
  } else if (installationInProgress) {
    titleText = 'Installing cluster';
  }

  return (
    <Card>
      {!hasInflightErrors && (
        <CardTitle>
          <Title
            headingLevel="h2"
            size="lg"
            className="card-title pf-v6-u-display-inline-block pf-v6-u-mr-md"
            data-testid="installation-header"
          >
            {inProgress && (
              <Spinner
                size="sm"
                aria-label="Loading..."
                className="progressing-icon pf-v6-u-mr-md"
              />
            )}
            {isError && (
              <span className="pf-v6-u-mr-xs">
                <Icon status="danger">
                  <ExclamationCircleIcon />{' '}
                </Icon>
              </span>
            )}
            {titleText}
          </Title>
          {(installationInProgress || isWaitingROSAManual) && !isUninstalling && (
            <DownloadOcCliButton />
          )}
          {installationInProgress && !isUninstalling && (
            <Content
              component={ContentVariants.p}
              data-testid="expected-cluster-installation-msg"
              className="expected-cluster-installation-text"
            >
              Cluster creation usually takes {estCompletionTime} minutes to complete.
            </Content>
          )}
        </CardTitle>
      )}
      <CardBody>
        {isUninstalling ? (
          <UninstallProgress cluster={cluster} />
        ) : (
          <InstallProgress
            cluster={cluster}
            hasInflightErrors={hasInflightErrors}
            regionalInstance={regionalInstance}
          />
        )}
        <InstallationLogView isExpandable={!isUninstalling} cluster={cluster} />
      </CardBody>
    </Card>
  );
};

export default ClusterProgressCard;
