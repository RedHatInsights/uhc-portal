import React from 'react';

import { EmptyState } from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';
import { InfoCircleIcon } from '@patternfly/react-icons/dist/esm/icons/info-circle-icon';
import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { OndemandMetricsAlerts } from '~/types/accounts_mgmt.v1';
import { ClusterConsole } from '~/types/clusters_mgmt.v1';

import { alertsSeverity, monitoringItemLinkProps, monitoringItemTypes } from '../monitoringHelper';

type AlertsTableProps = {
  alerts?: Array<OndemandMetricsAlerts>;
  clusterConsole?: ClusterConsole;
};

function AlertsTable({ alerts = [], clusterConsole }: AlertsTableProps) {
  const errorIcon = (
    <>
      <ExclamationCircleIcon className="status-icon danger" />
      <span>Critical</span>
    </>
  );
  const warningIcon = (
    <>
      <ExclamationTriangleIcon className="status-icon warning" />
      <span>Warning</span>
    </>
  );

  const infoIcon = (
    <>
      <InfoCircleIcon className="status-icon info" />
      <span>Info</span>
    </>
  );

  const isNotRealAlert = (name?: string) => name === 'Watchdog' || name === 'DeadMansSwitch';

  if (alerts.every((alert) => isNotRealAlert(alert.name))) {
    return <EmptyState headingLevel="h5" icon={CheckCircleIcon} titleText="No alerts firing" />;
  }

  const rows = alerts
    .map((alert) => {
      if (isNotRealAlert(alert.name)) {
        return null;
      }
      let severityIcon = null;
      if (alert.severity === alertsSeverity.WARNING) {
        severityIcon = warningIcon;
      }
      if (alert.severity === alertsSeverity.CRITICAL) {
        severityIcon = errorIcon;
      }
      if (alert.severity === alertsSeverity.INFO) {
        severityIcon = infoIcon;
      }

      const alertLinkProps = monitoringItemLinkProps(
        clusterConsole,
        monitoringItemTypes.ALERT,
        alert.name,
      );
      const alertName =
        alertLinkProps !== null ? <a {...alertLinkProps}>{alert.name}</a> : alert.name;

      const alertKey = alert.name;

      return {
        alertName,
        severityIcon,
        alertKey,
      };
    })
    .filter(Boolean);

  return (
    <Table aria-label="alerts" variant={TableVariant.compact} borders={false}>
      <Thead>
        <Tr>
          <Th>Name</Th>
          <Th>Severity</Th>
        </Tr>
      </Thead>
      <Tbody>
        {rows.map((row) => (
          <Tr key={row?.alertKey}>
            <Td>{row?.alertName}</Td>
            <Td>{row?.severityIcon}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}

export default AlertsTable;
