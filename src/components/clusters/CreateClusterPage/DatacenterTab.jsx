/* eslint-disable react/jsx-no-useless-fragment */
import React from 'react';

import {
  Button,
  PageSection,
  Popover,
  Split,
  SplitItem,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import OutlinedQuestionCircleIcon from '@patternfly/react-icons/dist/esm/icons/outlined-question-circle-icon';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { Link } from '~/common/routing';

const ocpTableColumns = ['Infrastructure provider', 'Installation options'];
const ocpTableRows = [
  {
    link: <Link to="/install/metal">Bare Metal (x86_64)</Link>,
    description: 'Full stack automation and pre-existing infrastructure',
    id: 'bareMetalx86',
  },
  {
    link: (
      <>
        <Link to="/install/arm">Bare Metal (ARM)</Link>
      </>
    ),
    description: 'Full stack automation and pre-existing infrastructure',
    id: 'bareMetalArm',
  },
  {
    link: (
      <>
        <Link to="/install/azure-stack-hub">Azure Stack Hub</Link>
      </>
    ),
    description: 'Full stack automation and pre-existing infrastructure',
    id: 'azureStackHub',
  },
  {
    link: (
      <>
        <Link to="/install/ibmz">IBM Z (s390x)</Link>
      </>
    ),
    description: 'Full stack automation and pre-existing infrastructure',
    id: 'ibmZ',
  },
  {
    link: (
      <>
        <Link to="/install/power">IBM Power (ppc64le)</Link>
      </>
    ),
    description: 'Full stack automation and pre-existing infrastructure',
    id: 'ibmPower',
  },
  {
    link: (
      <>
        <Link to="/install/nutanix">Nutanix AOS</Link>
      </>
    ),
    description: 'Full stack automation and pre-existing infrastructure',
    id: 'nutanixAOS',
  },
  {
    link: (
      <>
        <Link to="/install/openstack">Red Hat OpenStack</Link>
      </>
    ),
    description: 'Full stack automation and pre-existing infrastructure',
    id: 'rhOpenStack',
  },
  {
    link: (
      <>
        <Link to="/install/vsphere">vSphere</Link>
      </>
    ),
    description: 'Full stack automation and pre-existing infrastructure',
    id: 'vSphere',
  },
  {
    link: (
      <>
        <Link to="/install/platform-agnostic">Platform agnostic (x86_64)</Link>
      </>
    ),
    description: 'Pre-existing infrastructure',
    id: 'platformAgnostic',
  },
];

const DatacenterTab = () => (
  <>
    <PageSection hasBodyWrapper={false} className="pf-v6-u-p-lg">
      <Stack hasGutter>
        <StackItem>
          <Title headingLevel="h2" className="ocm-ocp-datacenter-title">
            Assisted Installer
          </Title>
        </StackItem>
        <StackItem>
          The easiest way to install OpenShift on your own infrastructure with step-by-step
          guidance, preflight validations, and smart defaults. This method supports multiple
          architectures.
        </StackItem>
        <StackItem>
          <Split hasGutter>
            <SplitItem>
              <Button component={Link} to="/assisted-installer/clusters/~new">
                Create cluster
              </Button>
            </SplitItem>
            <SplitItem className="pf-v6-u-align-self-center">
              <Link to="/install/metal/agent-based">Run Agent-based Installer locally</Link>
              <Popover bodyContent="Runs Assisted Installer securely and locally to create clusters in disconnected or air-gapped environments.">
                <Button
                  icon={<OutlinedQuestionCircleIcon />}
                  variant="plain"
                  onClick={(e) => e.preventDefault()}
                />
              </Popover>
            </SplitItem>
          </Split>
        </StackItem>
      </Stack>
    </PageSection>
    <PageSection hasBodyWrapper={false}>
      <Stack hasGutter>
        <StackItem>
          <Title headingLevel="h2">Other datacenter options</Title>
        </StackItem>
        <StackItem>
          Create clusters on supported infrastructure using our extensive documentation and
          installer program.
        </StackItem>
        <StackItem>
          <Table className="install-options-table" aria-label="Installation options table">
            <Thead>
              <Tr>
                {ocpTableColumns.map((column) => (
                  <Th key={column}>{column}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {ocpTableRows.map((row) => (
                <Tr key={row.id}>
                  <Td>{row.link}</Td>
                  <Td>{row.description}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </StackItem>
      </Stack>
    </PageSection>
  </>
);

export default DatacenterTab;
