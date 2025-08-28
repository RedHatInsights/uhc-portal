// ClusterStateIcon matches a cluster state from the API to the matching icon

import React from 'react';

import { Icon, IconComponentProps, Spinner, spinnerSize } from '@patternfly/react-core';
import { AsleepIcon } from '@patternfly/react-icons/dist/esm/icons/asleep-icon';
import { BanIcon } from '@patternfly/react-icons/dist/esm/icons/ban-icon';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';
import { DisconnectedIcon } from '@patternfly/react-icons/dist/esm/icons/disconnected-icon';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import { FolderOpenIcon } from '@patternfly/react-icons/dist/esm/icons/folder-open-icon';
import { InProgressIcon } from '@patternfly/react-icons/dist/esm/icons/in-progress-icon';
import { NotStartedIcon } from '@patternfly/react-icons/dist/esm/icons/not-started-icon';
import { UnknownIcon } from '@patternfly/react-icons/dist/esm/icons/unknown-icon';

import clusterStates from './clusterStates';

type ClusterStateIconProps = {
  clusterState?: clusterStates | string;
  animated?: boolean;
  limitedSupport?: boolean;
};

const ClusterStateIcon = ({
  clusterState,
  animated = false,
  limitedSupport,
}: ClusterStateIconProps) => {
  const iconProps: Pick<IconComponentProps, 'className' | 'size'> = {
    className: 'clusterstate',
    size: 'md',
  };

  if (limitedSupport && clusterState !== clusterStates.error) {
    return (
      <Icon {...iconProps} status="danger">
        <ExclamationCircleIcon data-icon-type="limited-support" />
      </Icon>
    );
  }

  switch (clusterState) {
    case clusterStates.waiting:
    case clusterStates.pending:
    case clusterStates.installing:
    case clusterStates.validating:
    case clusterStates.updating:
    case clusterStates.powering_down:
    case clusterStates.resuming:
      if (animated) {
        return <Spinner {...iconProps} size={spinnerSize.md} />;
      }
      return (
        <Icon {...iconProps}>
          <InProgressIcon data-icon-type="inprogress" />
        </Icon>
      );
    case clusterStates.disconnected:
      return (
        <Icon {...iconProps}>
          <DisconnectedIcon />
        </Icon>
      );
    case clusterStates.ready:
      return (
        <Icon {...iconProps} status="success">
          <CheckCircleIcon data-icon-type="check" />
        </Icon>
      );
    case clusterStates.uninstalling:
      if (animated) {
        return <Spinner {...iconProps} size={spinnerSize.md} />;
      }
      return (
        <Icon {...iconProps}>
          <InProgressIcon data-icon-type="inprogress" />
        </Icon>
      );
    case clusterStates.error:
      return (
        <Icon {...iconProps} status="danger">
          <ExclamationCircleIcon data-icon-type="exclamation" />
        </Icon>
      );
    case clusterStates.deprovisioned:
      return (
        <Icon {...iconProps}>
          <BanIcon data-icon-type="deprovisioned" />
        </Icon>
      );
    case clusterStates.archived:
      return (
        <Icon {...iconProps}>
          <FolderOpenIcon data-icon-type="archived" />
        </Icon>
      );
    case clusterStates.hibernating:
      return (
        <Icon {...iconProps}>
          <AsleepIcon />
        </Icon>
      );
    case clusterStates.stale:
      return (
        <Icon {...iconProps}>
          <NotStartedIcon />
        </Icon>
      );
    default:
      return (
        <Icon {...iconProps}>
          <UnknownIcon data-icon-type="unknown" />
        </Icon>
      );
  }
};

export default ClusterStateIcon;
