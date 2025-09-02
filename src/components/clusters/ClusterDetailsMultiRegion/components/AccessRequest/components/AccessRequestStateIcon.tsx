import React from 'react';

import { Label } from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';
import { OutlinedClockIcon } from '@patternfly/react-icons/dist/esm/icons/outlined-clock-icon';
import { TimesCircleIcon } from '@patternfly/react-icons/dist/esm/icons/times-circle-icon';

import { AccessRequest, AccessRequestStatusState } from '~/types/access_transparency.v1';

type AccessRequestStateIconProps = {
  accessRequest?: AccessRequest;
};

const stateStyles: {
  [state in AccessRequestStatusState]: {
    color?:
      | 'blue'
      | 'teal'
      | 'green'
      | 'orange'
      | 'purple'
      | 'red'
      | 'orangered'
      | 'grey'
      | 'yellow';
    icon?: React.ReactNode;
  };
} = {
  [AccessRequestStatusState.Pending]: {
    color: 'orange',
    icon: <ExclamationTriangleIcon />,
  },
  [AccessRequestStatusState.Approved]: {
    color: 'green',
    icon: <CheckCircleIcon />,
  },
  [AccessRequestStatusState.Denied]: {
    color: 'red',
    icon: <TimesCircleIcon />,
  },
  [AccessRequestStatusState.Expired]: {
    icon: <OutlinedClockIcon />,
  },
};

const AccessRequestStateIcon = ({ accessRequest }: AccessRequestStateIconProps) =>
  accessRequest?.status?.state ? (
    <Label
      color={stateStyles[accessRequest.status.state].color}
      icon={stateStyles[accessRequest.status.state].icon}
    >
      {accessRequest.status.state}
    </Label>
  ) : null;

export default AccessRequestStateIcon;
