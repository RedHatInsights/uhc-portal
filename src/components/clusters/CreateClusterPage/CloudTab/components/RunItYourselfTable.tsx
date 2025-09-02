import React from 'react';

import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { Link } from '~/common/routing';
import TechnologyPreview from '~/components/common/TechnologyPreview';

const RunItYourselfTable = () => {
  const columnNames = { cloudProvider: 'Cloud provider', options: 'Installation options' };
  const rows = [
    {
      key: 'alibaba',
      provider: (
        <>
          <Link to="/install/alibaba" className="pf-v6-u-mr-xs">
            Alibaba Cloud
          </Link>
          <TechnologyPreview className="pf-v6-u-ml-md pf-v6-u-display-inline" />
        </>
      ),
      options: 'Pre-existing infrastructure',
    },
    {
      key: 'aws_x86_64',
      provider: <Link to="/install/aws">AWS (x86_64)</Link>,
      options: 'Full stack automation and pre-existing infrastructure',
    },
    {
      key: 'aws_arm',
      provider: <Link to="/install/aws/arm">AWS (ARM)</Link>,
      options: 'Full stack automation and pre-existing infrastructure',
    },
    {
      key: 'aws_multi',
      provider: <Link to="/install/aws/multi/installer-provisioned">AWS (multi-architecture)</Link>,
      options: 'Full stack automation',
    },
    {
      key: 'azure_x86_64',
      provider: <Link to="/install/azure">Azure (x86_64)</Link>,
      options: 'Full stack automation and pre-existing infrastructure',
    },
    {
      key: 'azure_arm',
      provider: <Link to="/install/azure/arm/installer-provisioned">Azure (ARM)</Link>,
      options: 'Full stack automation',
    },
    {
      key: 'azure_multi',
      provider: (
        <Link to="/install/azure/multi/installer-provisioned" className="pf-v6-u-mr-xs">
          Azure (multi-architecture)
        </Link>
      ),
      options: 'Full stack automation',
    },
    {
      key: 'google',
      provider: <Link to="/install/gcp">Google Cloud</Link>,
      options: 'Full stack automation and pre-existing infrastructure',
    },
    {
      key: 'ibm',
      provider: <Link to="/install/ibm-cloud">IBM Cloud</Link>,
      options: 'Full stack automation',
    },
    {
      key: 'baremetal',
      provider: <Link to="/install/metal/multi"> Baremetal (multi-architecture)</Link>,
      options: 'Pre-existing infrastructure',
    },
    {
      key: 'ibm_powervs',
      provider: <Link to="/install/powervs/installer-provisioned">IBM PowerVS (ppc64le)</Link>,
      options: 'Full stack automation',
    },
    {
      key: 'agnostic',
      provider: <Link to="/install/platform-agnostic">Platform agnostic (x86_64)</Link>,
      options: 'Pre-existing infrastructure',
    },
    {
      key: 'oracle',
      provider: <Link to="/install/oracle-cloud">Oracle Cloud Infrastructure</Link>,
      options: 'Pre-existing infrastructure',
    },
  ];

  return (
    <Table aria-label="Run it yourself" data-testid="run-it-yourself">
      <Thead>
        <Tr>
          <Th>{columnNames.cloudProvider}</Th>
          <Th>{columnNames.options}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {rows.map((row) => (
          <Tr key={row.key}>
            <Td dataLabel={columnNames.cloudProvider}>{row.provider}</Td>
            <Td dataLabel={columnNames.options}>{row.options}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export { RunItYourselfTable };
