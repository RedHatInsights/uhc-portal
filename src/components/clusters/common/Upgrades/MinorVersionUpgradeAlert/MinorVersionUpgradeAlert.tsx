import React from 'react';
import { useDispatch } from 'react-redux';

import { Alert, AlertActionLink, Spinner } from '@patternfly/react-core';
import ArrowCircleUpIcon from '@patternfly/react-icons/dist/esm/icons/arrow-circle-up-icon';

import { isROSA } from '~/components/clusters/common/clusterStates';
import { useEditSchedule } from '~/queries/ClusterDetailsQueries/ClusterSettingsTab/useEditSchedule';
import { UpgradePolicy } from '~/types/clusters_mgmt.v1';
import { AugmentedCluster } from '~/types/types';

import links from '../../../../../common/installLinks.mjs';
import ExternalLink from '../../../../common/ExternalLink';
import { setAutomaticUpgradePolicy } from '../clusterUpgradeActions';

import {
  getEnableMinorVersionUpgrades,
  isNextMinorVersionAvailableHelper,
} from './MinorVersionUpgradeAlertHelpers';

interface MinorVersionUpgradeAlertProps {
  isHypershift?: boolean;
  clusterId: string;
  schedules: UpgradePolicy[];
  cluster: AugmentedCluster;
  hasUnmetAcknowledgements?: boolean;
}

const actionLink = (onChange: (isEnable: boolean) => void, isCurrentlyEnabled: boolean) => (
  <AlertActionLink onClick={() => onChange(!isCurrentlyEnabled)}>
    {isCurrentlyEnabled
      ? 'Disallow this minor version update'
      : 'Allow the next minor version update'}
  </AlertActionLink>
);

const MinorVersionUpgradeAlert = ({
  clusterId,
  isHypershift,
  schedules,
  cluster,
  hasUnmetAcknowledgements,
}: MinorVersionUpgradeAlertProps) => {
  const dispatch = useDispatch();
  const { mutateAsync: editScheduleMutate } = useEditSchedule(clusterId, isHypershift);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const isAutomatic = schedules?.some((policy) => policy.schedule_type === 'automatic');
  const isMinorVersionUpgradesEnabled = getEnableMinorVersionUpgrades(schedules);
  const automaticUpgradePolicyId = schedules?.find(
    (item) => item.schedule_type === 'automatic',
  )?.id;
  const isNextMinorVersionAvailable = isNextMinorVersionAvailableHelper(cluster);
  const isSTSEnabled = cluster?.aws?.sts?.enabled;

  if (
    !isAutomatic ||
    hasUnmetAcknowledgements ||
    !automaticUpgradePolicyId ||
    !clusterId ||
    !isNextMinorVersionAvailable ||
    isSTSEnabled
  ) {
    return null;
  }

  const onChangeAcknowledge = async (isEnable: boolean) => {
    setLoading(true);
    setError(null);

    try {
      const response = await editScheduleMutate(
        {
          policyID: automaticUpgradePolicyId,
          schedule: { enable_minor_version_upgrades: isEnable },
        },
        {
          onSuccess: () => {
            // Because this response can be quick, adding loading to prevent a double click
            setTimeout(() => {
              dispatch(setAutomaticUpgradePolicy(response.data));
              setLoading(false);
            }, 500);
          },
        },
      );
    } catch (err: any) {
      setError(err.response?.data?.reason || err.response?.data || 'An error occurred');
    }
  };

  return error ? (
    <Alert
      variant="danger"
      className="automatic-cluster-updates-alert"
      isInline
      title={error}
      role="alert"
      data-testid="alert-error"
    />
  ) : (
    <Alert
      isExpandable
      isInline
      className="automatic-cluster-updates-alert"
      customIcon={<ArrowCircleUpIcon />}
      title={
        isMinorVersionUpgradesEnabled
          ? 'Next minor version update allowed'
          : 'New minor version available'
      }
      actionLinks={
        loading ? (
          <Spinner size="sm" aria-label="Setting minor version update status" />
        ) : (
          actionLink(onChangeAcknowledge, isMinorVersionUpgradesEnabled)
        )
      }
      data-testid="alert-success"
    >
      {isMinorVersionUpgradesEnabled ? (
        <p data-testid="minorVersionUpgradeAlertDisableMessage">
          Your cluster will be updated to the newest minor version at the time you selected. Minor
          releases can include new Kubernetes versions or operating system capabilities, improved
          automation on IaaS providers, and other expanded features.
        </p>
      ) : (
        <p data-testid="minorVersionUpgradeAlertEnableMessage">
          Allow your cluster to be updated to the newest minor version at the time you selected.{' '}
          <ExternalLink href={isROSA(cluster) ? links.ROSA_UPGRADES : links.OSD_UPGRADES}>
            Learn more about updates
          </ExternalLink>
        </p>
      )}
    </Alert>
  );
};

export default MinorVersionUpgradeAlert;
