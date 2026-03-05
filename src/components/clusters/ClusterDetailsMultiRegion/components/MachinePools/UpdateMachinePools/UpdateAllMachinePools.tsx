import React from 'react';
import semver from 'semver';

import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';

import links from '~/common/installLinks.mjs';
import { Link } from '~/common/routing';
import ExternalLink from '~/components/common/ExternalLink';
import { refetchMachineOrNodePoolsQuery } from '~/queries/ClusterDetailsQueries/MachinePoolTab/useFetchMachineOrNodePools';
import { NodePool } from '~/types/clusters_mgmt.v1';

import {
  compareIsMachinePoolBehindControlPlane,
  isControlPlaneValidForMachinePool,
  isMachinePoolScheduleError,
  isMachinePoolUpgrading,
  updateAllMachinePools as updateAllPools,
  useHCPControlPlaneUpdating,
} from './updateMachinePoolsHelpers';

const UpdateAllMachinePools = ({
  isMachinePoolError,
  clusterId,
  isHypershift,
  controlPlaneVersion,
  controlPlaneRawVersion,
  initialErrorMessage, // introduced for testing purposes
  goToMachinePoolTab,
  machinePoolData,
  region,
  refreshMachinePools,
}: {
  isMachinePoolError: boolean;
  clusterId: string;
  isHypershift: boolean;
  controlPlaneVersion: string;
  controlPlaneRawVersion: string;
  initialErrorMessage?: string;
  goToMachinePoolTab?: boolean;
  machinePoolData?: NodePool[];
  region?: string;
  refreshMachinePools?: () => void;
}) => {
  const [pending, setPending] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>(
    initialErrorMessage ? [initialErrorMessage] : [],
  );

  const controlPlaneUpdating = useHCPControlPlaneUpdating(
    controlPlaneVersion,
    isMachinePoolError,
    isHypershift,
  );

  const existingMachinePools = machinePoolData;

  if (controlPlaneUpdating) {
    return null;
  }

  const machinePoolsToUpdate =
    existingMachinePools?.filter(
      (pool: NodePool) =>
        compareIsMachinePoolBehindControlPlane(controlPlaneRawVersion, pool.version?.raw_id) &&
        isControlPlaneValidForMachinePool(pool, controlPlaneRawVersion) &&
        !isMachinePoolScheduleError(pool) &&
        !isMachinePoolUpgrading(pool),
    ) || [];

  if (machinePoolsToUpdate.length === 0) {
    return null;
  }

  const updateNodePools = async () => {
    setPending(true);
    const errors = await updateAllPools(
      machinePoolsToUpdate,
      clusterId,
      controlPlaneRawVersion,
      region,
    );
    setPending(false);
    setErrors(errors);

    if (isHypershift && refreshMachinePools) {
      refreshMachinePools();
    } else {
      refetchMachineOrNodePoolsQuery(clusterId, isHypershift, controlPlaneVersion, region);
    }
  };

  return (
    <>
      {!pending && errors.length > 0 ? (
        <Alert
          title="Some machine pools could not be updated"
          variant={AlertVariant.danger}
          isExpandable
          isInline
          role="alert"
          className="pf-v6-u-mt-md"
          data-testid="alert-danger"
        >
          {errors.map((error, index) => (
            // There isn't another accessible unique key
            // eslint-disable-next-line react/no-array-index-key
            <p key={index}>{error}</p>
          ))}
        </Alert>
      ) : null}
      <Alert
        className={goToMachinePoolTab ? 'pf-v6-u-mb-lg' : 'pf-v6-u-mt-lg'}
        isExpandable
        isInline
        role="alert"
        variant={AlertVariant.warning}
        title="Update available for Machine pools"
        data-testid="alert-warning"
        actionLinks={
          <>
            {pending && !goToMachinePoolTab ? (
              <Spinner size="sm" aria-label="Updating machine pools" />
            ) : null}
            {!pending && !goToMachinePoolTab ? (
              <AlertActionLink onClick={() => updateNodePools()} data-testid="btn-update-all">
                Update all Machine pools now
              </AlertActionLink>
            ) : null}
            {goToMachinePoolTab ? (
              <Link to={`/details/${clusterId}#machinePools`}>Go to Machine pools list</Link>
            ) : null}
          </>
        }
      >
        <p>
          You can update all worker nodes to the current control plane version (
          {semver.coerce(controlPlaneVersion)?.version}
          ), or use the CLI to update a specific version.{' '}
          <ExternalLink href={isHypershift ? links.ROSA_UPGRADES : links.ROSA_CLASSIC_UPGRADES}>
            Learn more about updates
          </ExternalLink>
        </p>
      </Alert>
    </>
  );
};
export default UpdateAllMachinePools;
