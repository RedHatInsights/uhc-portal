import React from 'react';

import { Label, Popover } from '@patternfly/react-core';

import supportLinks from '~/common/supportLinks.mjs';

import ExternalLink from './ExternalLink';

import './SupportStatus.scss';

type Props = {
  status: string;
};

const SupportStatus = ({ status }: Props) => {
  let labelColor: React.ComponentProps<typeof Label>['color'] = 'blue';
  let labelText;
  let popoverBodyContent;
  let popoverID;

  switch (status.toLowerCase()) {
    case 'full support':
      labelText = 'Full support';
      popoverBodyContent =
        'This minor version of OpenShift is fully supported. In order to receive security and bug fixes, continue to install patch (z-stream) updates to your cluster or upgrade to the latest minor version when available.';
      popoverID = 'full-support';
      break;
    case 'maintenance support':
      labelText = 'Maintenance support';
      popoverBodyContent =
        'This minor version of OpenShift has reached the maintenance support phase. Critical and selected high priority fixes will continue to be delivered in patch (z-stream) releases.';
      popoverID = 'maintenance-support';
      break;
    case 'extended update support':
      labelText = 'Extended update support';
      popoverBodyContent =
        'This minor version of OpenShift has reached the extended update support phase. Critical and selected high priority fixes will continue to be delivered in patch (z-stream) releases.';
      popoverID = 'extended-update-support';
      break;
    case 'end of life':
      labelColor = 'red';
      labelText = 'End of life';
      popoverBodyContent =
        'This minor version of OpenShift has reached the end of life and is no longer supported. Upgrade to a newer version so that this cluster is supportable.';
      popoverID = 'end-of-life';
      break;
    default:
      return (
        <Label color={labelColor} variant="outline" className="support-status-label">
          {status}
        </Label>
      );
  }

  return (
    <Popover
      className="support-status-popover"
      aria-label={labelText}
      bodyContent={popoverBodyContent}
      footerContent={
        <>
          See{' '}
          <ExternalLink href={supportLinks.OPENSHIFT_SUPPORT_POLICY} noIcon>
            this resource
          </ExternalLink>{' '}
          to learn more about the support lifecycle.
        </>
      }
      id={popoverID}
    >
      <Label
        color={labelColor}
        variant="outline"
        className="support-status-label support-status-label--clickable"
        onClick={(event) => {
          event.preventDefault();
        }}
      >
        {labelText}
      </Label>
    </Popover>
  );
};

export default SupportStatus;
