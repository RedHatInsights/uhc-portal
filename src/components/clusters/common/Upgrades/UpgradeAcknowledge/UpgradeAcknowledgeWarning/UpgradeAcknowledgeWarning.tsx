import React from 'react';

import { Icon } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';
import { InfoCircleIcon } from '@patternfly/react-icons/dist/esm/icons/info-circle-icon';

import { useFetchUpgradeGateAgreements } from '~/queries/ClusterDetailsQueries/useFetchUpgradeGateAgreements';
import { queryConstants } from '~/queries/queriesConstants';
import { SubscriptionResponseType } from '~/queries/types';
import { UpgradePolicy, UpgradePolicyState, VersionGate } from '~/types/clusters_mgmt.v1';
import { AugmentedCluster } from '~/types/types';

import {
  getHasScheduledManual,
  getToVersionFromHelper,
  isManualUpdateSchedulingRequired,
} from '../UpgradeAcknowledgeHelpers';

import './UpgradeAcknowledgeWarning.scss';

type UpgradePolicyWithState = UpgradePolicy & { state?: UpgradePolicyState };

interface UpgradeAcknowledgeWarningProps {
  showConfirm?: boolean; // If saved acks AND no needed acks, then show info confirm message
  isInfo?: boolean; // If manual  AND  needed acks, show the alert as information text
  isHypershift?: boolean;
  schedules: UpgradePolicyWithState[];
  cluster: AugmentedCluster;
  showUpgradeWarning?: boolean;
  unmetAcknowledgements?: VersionGate[];
}

const UpgradeAcknowledgeWarning = ({
  isInfo = false,
  showConfirm = false,
  isHypershift,
  schedules,
  cluster,
  showUpgradeWarning,
  unmetAcknowledgements,
}: UpgradeAcknowledgeWarningProps) => {
  const clusterId = cluster?.id;
  const openshiftVersion = isHypershift ? cluster?.openshift_version : cluster?.version?.raw_id;
  const fromVersion = cluster?.version?.raw_id || null;
  const maxVersion = getToVersionFromHelper([], cluster);
  const hasScheduledManual = getHasScheduledManual(schedules, cluster);
  const showManualUpgradeWarning = isManualUpdateSchedulingRequired(schedules, cluster);
  const hasUnmetAcknowledgements = (unmetAcknowledgements?.length || 0) > 0;
  const { data: metAcknowledgements } = useFetchUpgradeGateAgreements(
    clusterId || '',
    { subscription: cluster?.subscription } as SubscriptionResponseType,
    queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY,
  );

  const infoTitle = `Administrator acknowledgement is required before updating from ${fromVersion} to ${maxVersion}`;

  if (!clusterId || !openshiftVersion) {
    return null;
  }

  const showConfirmMessage =
    showConfirm && !hasUnmetAcknowledgements && (metAcknowledgements?.data?.items?.length ?? 0) > 0;

  return (
    <>
      {hasUnmetAcknowledgements && schedules.length === 0 && isInfo && !hasScheduledManual ? (
        <div
          className="ocm-upgrade-additional-versions-available"
          data-testid="infoMessageUnmetAcks"
        >
          <InfoCircleIcon /> {infoTitle}
        </div>
      ) : null}

      {showUpgradeWarning && showManualUpgradeWarning ? (
        <div className="ocm-upgrade-additional-versions-available" data-testid="confirmAckReceived">
          <Icon status="warning">
            <ExclamationTriangleIcon />
          </Icon>{' '}
          Your update strategy is currently set to recurring updates. Update {maxVersion} is a Y
          stream update and must be individually updated.
        </div>
      ) : null}
      {showConfirmMessage ? (
        <div className="ocm-upgrade-additional-versions-available" data-testid="confirmAckReceived">
          <InfoCircleIcon />
          Administrator acknowledgement was received.
        </div>
      ) : null}
    </>
  );
};

export default UpgradeAcknowledgeWarning;
