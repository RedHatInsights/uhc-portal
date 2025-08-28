import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import { Button, Popover } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons/dist/esm/icons/info-circle-icon';
import { OutlinedArrowAltCircleUpIcon } from '@patternfly/react-icons/dist/esm/icons/outlined-arrow-alt-circle-up-icon';

import getClusterVersion from '~/components/clusters/common/getClusterVersion';
import { SubscriptionCommonFieldsStatus } from '~/types/accounts_mgmt.v1';

import getClusterName from '../../../common/getClusterName';
import links from '../../../common/installLinks.mjs';
import { openModal } from '../../common/Modal/ModalActions';
import modals from '../../common/Modal/modals';

import { isHibernating } from './clusterStates';

const ClusterUpdateLink = ({ cluster, hideOSDUpdates }) => {
  const dispatch = useDispatch();
  const clusterVersion = getClusterVersion(cluster);
  const { upgrade } = cluster.metrics;
  // eslint-disable-next-line camelcase
  const osdUpgradeAvailable =
    cluster.managed &&
    cluster.version?.available_upgrades?.length > 0 &&
    clusterVersion &&
    !hideOSDUpdates;
  const isStale = cluster?.subscription?.status === SubscriptionCommonFieldsStatus.Stale;

  // Show which version the cluster is currently updating to
  if (
    upgrade?.state === 'running' &&
    upgrade?.version &&
    cluster.version?.raw_id !== upgrade.version
  ) {
    return (
      <span>
        {' '}
        &rarr;
        {` ${upgrade.version}`}
      </span>
    );
  }

  // Only show Update tooltip/link for OSD clusters when the feature toggle is enabled
  // or OCP clusters that have available updates
  const cannotUpgrade =
    !cluster.canEdit || !osdUpgradeAvailable || isHibernating(cluster) || isStale;
  if ((cluster.managed && cannotUpgrade) || (!cluster.managed && (!upgrade.available || isStale))) {
    return null;
  }

  if (cluster.managed) {
    return (
      <Button
        className="cluster-inline-link pf-v6-u-mt-0"
        variant="link"
        onClick={() =>
          dispatch(
            openModal(modals.UPGRADE_WIZARD, {
              clusterName: getClusterName(cluster),
              subscriptionID: cluster.subscription.id,
            }),
          )
        }
        icon={<OutlinedArrowAltCircleUpIcon />}
      >
        Update
      </Button>
    );
  }

  // Display a link to the cluster settings page in the console
  if (cluster.console && cluster.console.url) {
    return (
      <a href={`${cluster.console.url}/settings/cluster`} target="_blank" rel="noopener noreferrer">
        <Button
          className="cluster-inline-link pf-v6-u-mt-0"
          variant="link"
          icon={<OutlinedArrowAltCircleUpIcon />}
        >
          Update
        </Button>
      </a>
    );
  }

  // If console link is not available, display a popover with data about the update
  return (
    <Popover
      position="top"
      aria-label="Update"
      bodyContent={
        <div>
          An update is available for this cluster. Navigate to the Cluster settings page in the
          cluster&apos;s web console to update.{' '}
          <a href={links.UPDATING_CLUSTER} target="_blank" rel="noreferrer noopener">
            Learn more
          </a>
        </div>
      }
    >
      <Button className="cluster-inline-link pf-v6-u-mt-0" variant="link" icon={<InfoCircleIcon />}>
        Update
      </Button>
    </Popover>
  );
};

ClusterUpdateLink.propTypes = {
  cluster: PropTypes.object.isRequired,
  hideOSDUpdates: PropTypes.bool,
};

export default ClusterUpdateLink;
