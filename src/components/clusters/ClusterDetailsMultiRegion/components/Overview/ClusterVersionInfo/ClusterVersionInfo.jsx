import React from 'react';
import get from 'lodash/get';
import PropTypes from 'prop-types';

import { Button, Flex, Popover } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons/dist/esm/icons/outlined-question-circle-icon';

import {
  isClusterUpgrading,
  isHypershiftCluster,
} from '~/components/clusters/common/clusterStates';
import getClusterVersion from '~/components/clusters/common/getClusterVersion';
import { useGetSchedules } from '~/queries/ClusterDetailsQueries/ClusterSettingsTab/useGetSchedules';
import { useFetchUpgradeGatesFromApi } from '~/queries/ClusterDetailsQueries/useFetchUpgadeGatesFromApi';

import ClusterUpdateLink from '../../../../common/ClusterUpdateLink';
import UpgradeStatus from '../../../../common/Upgrades/UpgradeStatus';
import SupportStatusLabel from '../SupportStatusLabel';

// TODO: Part of the upgrade tab
const ClusterVersionInfo = ({ cluster }) => {
  const isUpgrading = isClusterUpgrading(cluster);

  const clusterVersion = getClusterVersion(cluster);
  const channel = get(cluster, 'metrics.channel');
  const isHypershift = isHypershiftCluster(cluster);
  const clusterId = cluster?.id;
  const isClusterManaged = cluster?.managed;
  const region = cluster?.subscription?.rh_region_id;

  const { data: schedules } = useGetSchedules(clusterId, isHypershift, region);
  const { data: upgradeGates } = useFetchUpgradeGatesFromApi(isClusterManaged, region);

  const [popoverOpen, setPopoverOpen] = React.useState(false);

  const scheduledUpdate = schedules?.items.find(
    (schedule) => schedule.version !== cluster.version?.raw_id,
  );

  return (
    <div>
      <dl className="pf-v6-l-stack">
        <Flex>
          <dt>OpenShift: </dt>
          <dd>
            {clusterVersion}
            <ClusterUpdateLink cluster={cluster} hideOSDUpdates={!!scheduledUpdate} />
          </dd>
        </Flex>
        {scheduledUpdate && scheduledUpdate.schedule_type === 'manual' && (
          <div>
            <Flex>
              <dt>Update scheduled: </dt>
              <dd>
                <Popover
                  className="openshift"
                  headerContent="Update status"
                  isVisible={popoverOpen}
                  shouldOpen={() => setPopoverOpen(true)}
                  shouldClose={() => setPopoverOpen(false)}
                  bodyContent={
                    <UpgradeStatus
                      schedules={schedules?.items}
                      upgradeGates={upgradeGates}
                      cluster={cluster}
                      clusterID={cluster.id}
                      canEdit={cluster.canEdit}
                      clusterVersion={clusterVersion}
                      scheduledUpgrade={scheduledUpdate}
                      // eslint-disable-next-line camelcase
                      availableUpgrades={cluster.version?.available_upgrades}
                      onCancelClick={() => setPopoverOpen(false)}
                    />
                  }
                >
                  <Button
                    icon={<OutlinedQuestionCircleIcon />}
                    variant="link"
                    className="cluster-inline-link pf-v6-u-mt-0"
                  >
                    View details
                  </Button>
                </Popover>
              </dd>
            </Flex>
          </div>
        )}
        {!cluster.managed && !isUpgrading && (
          <div>
            <Flex>
              <dt>Life cycle state: </dt>
              <dd>
                <SupportStatusLabel clusterVersion={clusterVersion} />
              </dd>
            </Flex>
          </div>
        )}
        {channel && (
          <div>
            <Flex>
              <dt>Update channel: </dt>
              <dd>{channel}</dd>
            </Flex>
          </div>
        )}
      </dl>
    </div>
  );
};

ClusterVersionInfo.propTypes = {
  cluster: PropTypes.shape({
    subscription: PropTypes.object,
    id: PropTypes.string.isRequired,
    openshift_version: PropTypes.string,
    managed: PropTypes.bool,
    version: PropTypes.shape({
      channel_group: PropTypes.string,
      available_upgrades: PropTypes.arrayOf(PropTypes.string),
      raw_id: PropTypes.string,
    }),
    canEdit: PropTypes.bool,
    state: PropTypes.string,
  }),
};

export default ClusterVersionInfo;
