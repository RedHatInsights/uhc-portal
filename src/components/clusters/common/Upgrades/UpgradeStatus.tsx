import React from 'react';
import { useDispatch } from 'react-redux';

import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Timestamp,
  TimestampFormat,
} from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';
import { InProgressIcon } from '@patternfly/react-icons/dist/esm/icons/in-progress-icon';
import { OutlinedArrowAltCircleUpIcon } from '@patternfly/react-icons/dist/esm/icons/outlined-arrow-alt-circle-up-icon';

import { VersionGate } from '~/types/clusters_mgmt.v1';
import type { AugmentedCluster, UpgradePolicyWithState } from '~/types/types';

import { modalActions } from '../../../common/Modal/ModalActions';

import UpdateGraph from './UpdateGraph/UpdateGraph';

import './UpgradeStatus.scss';

interface UpgradeStatusProps {
  clusterID: string;
  canEdit?: boolean;
  isHypershift?: boolean;
  isSTSEnabled?: boolean;
  clusterVersion?: string;
  scheduledUpgrade?: UpgradePolicyWithState;
  onCancelClick?: () => void;
  availableUpgrades?: string[];
  schedules?: UpgradePolicyWithState[];
  cluster: AugmentedCluster;
  unmetAcknowledgements?: VersionGate[];
}

const UpgradeStatus = ({
  clusterID,
  canEdit = false,
  clusterVersion,
  scheduledUpgrade,
  availableUpgrades = [],
  onCancelClick,
  schedules,
  cluster,
  isHypershift = false,
  isSTSEnabled = false,
  unmetAcknowledgements,
}: UpgradeStatusProps) => {
  const dispatch = useDispatch();
  const region = cluster?.subscription?.rh_region_id;
  const hasAvailableUpgrades = availableUpgrades.length > 0;

  const isManualUpgradeScheduled = scheduledUpgrade?.schedule_type === 'manual';

  const updateVersion = (): string | undefined => {
    if (scheduledUpgrade?.version) {
      return scheduledUpgrade.version;
    }

    if (!availableUpgrades || availableUpgrades.length === 0) {
      return undefined; // is up to date
    }

    return availableUpgrades[availableUpgrades.length - 1];
  };

  const upgradeState = scheduledUpgrade?.state?.value;
  const canCancel =
    isManualUpgradeScheduled && canEdit && upgradeState !== 'started' && upgradeState !== 'delayed';

  const upgradeStateIcon = (): React.ReactNode => {
    let icon: React.ReactNode;
    let text: string;

    if (upgradeState === 'started' || upgradeState === 'delayed') {
      icon = <InProgressIcon className="ocm-upgrade-in-progress-icon" />;
      if (upgradeState === 'delayed') {
        text = 'Update in progress (delayed)';
      } else {
        text = 'Update in progress';
      }
    } else if (hasAvailableUpgrades) {
      icon = <OutlinedArrowAltCircleUpIcon className="ocm-upgrade-available-icon" />;
      text = 'Update available';
    } else {
      icon = <CheckCircleIcon className="ocm-cluster-up-to-date-icon" />;
      text = 'Up to date';
    }

    return (
      <>
        {icon} {text}
      </>
    );
  };

  if (!clusterVersion) {
    return (
      <EmptyState
        headingLevel="h4"
        titleText="Update status is not available"
        variant={EmptyStateVariant.xs}
      >
        <EmptyStateBody>Update status is not available. Try again later.</EmptyStateBody>
      </EmptyState>
    );
  }

  return (
    <>
      <div>
        {upgradeStateIcon()}
        <UpdateGraph
          currentVersion={clusterVersion}
          updateVersion={updateVersion()}
          hasMore={!isManualUpgradeScheduled && availableUpgrades.length > 1}
          schedules={schedules || []}
          cluster={cluster}
          isHypershift={isHypershift}
          isSTSEnabled={isSTSEnabled}
          unmetAcknowledgements={unmetAcknowledgements}
        />

        {scheduledUpgrade && upgradeState !== 'started' && upgradeState !== 'pending' && (
          <>
            <div className="ocm-upgrade-status-scheduled-title">Upgrade scheduled</div>
            <Timestamp
              date={scheduledUpgrade.next_run ? new Date(scheduledUpgrade.next_run) : undefined}
              shouldDisplayUTC
              locale="eng-GB"
              dateFormat={TimestampFormat.medium}
              timeFormat={TimestampFormat.short}
            />
          </>
        )}
      </div>
      {canCancel && (
        <Button
          id="ocm-upgrade-status-cancel"
          variant="link"
          onClick={() => {
            if (onCancelClick) {
              onCancelClick();
            }
            dispatch(
              modalActions.openModal('cancel-upgrade', {
                clusterID,
                schedule: scheduledUpgrade,
                region,
              }),
            );
          }}
        >
          Cancel this update
        </Button>
      )}
    </>
  );
};

export default UpgradeStatus;
