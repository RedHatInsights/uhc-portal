import React from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  List,
  ListItem,
  Popover,
  ProgressStep,
  ProgressStepper,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';

import AddOnsConstants from '../../ClusterDetailsMultiRegion/components/AddOns/AddOnsConstants';
import { isHypershiftCluster } from '../clusterStates';

import './UninstallProgress.scss';

const UninstallProgress = ({ cluster, clusterAddOns, getClusterAddOns, addOns }) => {
  const [showPopover, setShowPopover] = React.useState(false);

  React.useEffect(() => {
    if (clusterAddOns.clusterID !== cluster.id || !clusterAddOns.pending) {
      getClusterAddOns(cluster.id);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navToAddOns = () => {
    setShowPopover(false);
    window.location.hash = '#addOns';
  };

  // check if a cluster has addons with external resources
  const getBlockingAddons = () => {
    const addOnsWithExternalResources = [];
    clusterAddOns.items.forEach((clusterAddOn) => {
      addOns.items.forEach((addOn) => {
        if (addOn.id === clusterAddOn.id && addOn.has_external_resources) {
          addOnsWithExternalResources.push(clusterAddOn);
        }
      });
    });
    return addOnsWithExternalResources;
  };

  // get a list of addons that will block an uninstall
  const blockingAddons = getBlockingAddons();

  // check if addon are currently deleting
  const anyAddonsDeleting = blockingAddons.some(
    (addOn) => addOn.state === AddOnsConstants.INSTALLATION_STATE.DELETING,
  );

  // check if any addons are not deleted
  const anyAddonsNotDeleted = blockingAddons.some(
    (addOn) => addOn.state !== AddOnsConstants.INSTALLATION_STATE.DELETED,
  );

  // check if any blocking addons are in error state
  const anyAddonsError = blockingAddons.some(
    (addOn) => addOn.state === AddOnsConstants.INSTALLATION_STATE.FAILED,
  );

  const getFailedAddons = () => {
    const failedAddons = [];
    if (anyAddonsError) {
      clusterAddOns.items.forEach((clusterAddOn) => {
        if (clusterAddOn.state === AddOnsConstants.INSTALLATION_STATE.FAILED) {
          failedAddons.push(clusterAddOn);
        }
      });
    }
    return failedAddons;
  };

  const failedAddons = getFailedAddons();

  const singlePopOver = () => (
    <Popover
      isVisible={showPopover}
      shouldClose={() => setShowPopover(false)}
      shouldOpen={() => setShowPopover(true)}
      headerContent={<div>Add-on uninstallation status</div>}
      bodyContent={
        <div>
          <Button isInline variant="link" onClick={() => navToAddOns()}>
            {failedAddons[0].id}
          </Button>{' '}
          add-on failed to uninstall
        </div>
      }
    >
      <Button isInline variant="link">
        Failed
      </Button>
    </Popover>
  );

  const multiplePopOver = () => (
    <Popover
      isVisible={showPopover}
      shouldClose={() => setShowPopover(false)}
      shouldOpen={() => setShowPopover(true)}
      headerContent={<div>Add-on uninstallation status</div>}
      bodyContent={
        <div>
          The following add-ons failed to uninstall:
          <List className="uninstall-progress-list--error-list">
            {failedAddons.map((addOn) => (
              <ListItem>
                <Button isInline variant="link" onClick={() => navToAddOns()}>
                  {addOn.id}
                </Button>
              </ListItem>
            ))}
          </List>
        </div>
      }
    >
      <Button isInline variant="link">
        Failed
      </Button>
    </Popover>
  );

  const error = () => {
    if (failedAddons.length === 0) {
      return {
        icon: <ExclamationCircleIcon className="uninstall-progress-list--icon-error" />,
        text: 'Failed',
      };
    }
    if (failedAddons.length === 1) {
      return {
        icon: <ExclamationCircleIcon className="uninstall-progress-list--icon-error" />,
        text: singlePopOver(),
      };
    }

    return {
      icon: <ExclamationCircleIcon className="uninstall-progress-list--icon-error" />,
      text: multiplePopOver(),
    };
  };

  // get current progress data
  const getProgressData = () => {
    const pending = { variant: 'pending', text: 'Pending' };
    const completed = { variant: 'success', text: 'Completed' };
    const inProgress = { variant: 'info', text: 'Uninstalling', isCurrent: true };
    const notSupported = { variant: 'pending', text: 'Not Supported' };

    const hasAddOns = blockingAddons.length !== 0 && clusterAddOns.items.length !== 0;

    if (isHypershiftCluster(cluster)) {
      return {
        addOnCleanUp: notSupported,
        clusterUninstall: inProgress,
      };
    }
    if (!hasAddOns || !anyAddonsNotDeleted) {
      return {
        addOnCleanUp: completed,
        clusterUninstall: inProgress,
      };
    }

    if (anyAddonsDeleting) {
      return {
        addOnCleanUp: inProgress,
        clusterUninstall: pending,
      };
    }

    if (anyAddonsError) {
      return {
        addOnCleanUp: error(),
        clusterUninstall: pending,
      };
    }

    return {
      addOnCleanUp: pending,
      clusterUninstall: pending,
    };
  };

  // get progress data
  const progressData = getProgressData();

  return (
    <ProgressStepper>
      <ProgressStep
        variant={progressData.addOnCleanUp.variant}
        icon={progressData.addOnCleanUp.icon}
        isCurrent={progressData.addOnCleanUp.isCurrent}
        description={progressData.addOnCleanUp.text}
        id="addOnCleanUp"
        titleId="addOnCleanUp-title"
      >
        Add-on uninstallation
      </ProgressStep>
      <ProgressStep
        variant={progressData.clusterUninstall.variant}
        icon={progressData.clusterUninstall.icon}
        isCurrent={progressData.clusterUninstall.isCurrent}
        description={progressData.clusterUninstall.text}
        id="clusterUninstall"
        titleId="clusterUninstall-title"
      >
        Cluster uninstallation
      </ProgressStep>
    </ProgressStepper>
  );
};

UninstallProgress.propTypes = {
  cluster: PropTypes.object.isRequired,
  getClusterAddOns: PropTypes.func.isRequired,
  clusterAddOns: PropTypes.object,
  addOns: PropTypes.object,
};

export default UninstallProgress;
