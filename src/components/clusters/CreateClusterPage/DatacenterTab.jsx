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
  [
    <>
      <Link to="/install/metal">Bare Metal (x86_64)</Link>
    </>,
    'Full stack automation and pre-existing infrastructure',
  ],
  [
    <>
      <Link to="/install/arm">Bare Metal (ARM)</Link>
    </>,
    'Full stack automation and pre-existing infrastructure',
  ],
  [
    <>
      <Link to="/install/azure-stack-hub">Azure Stack Hub</Link>
    </>,
    'Full stack automation and pre-existing infrastructure',
  ],
  [
    <>
      <Link to="/install/ibmz">IBM Z (s390x)</Link>
    </>,
    'Full stack automation and pre-existing infrastructure',
  ],
  [
    <>
      <Link to="/install/power">IBM Power (ppc64le)</Link>
    </>,
    'Full stack automation and pre-existing infrastructure',
  ],
  [
    <>
      <Link to="/install/nutanix">Nutanix AOS</Link>
    </>,
    'Full stack automation and pre-existing infrastructure',
  ],
  [
    <>
      <Link to="/install/openstack">Red Hat OpenStack</Link>
    </>,
    'Full stack automation and pre-existing infrastructure',
  ],
  [
    <>
      <Link to="/install/vsphere">vSphere</Link>
    </>,
    'Full stack automation and pre-existing infrastructure',
  ],
  [
    <>
      <Link to="/install/platform-agnostic">Platform agnostic (x86_64)</Link>
    </>,
    'Pre-existing infrastructure',
  ],
];

const DatacenterTab = () => (
  <>
    <PageSection variant="light" className="pf-v5-u-p-lg">
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
            <SplitItem className="pf-v5-u-align-self-center">
              <Link to="/install/metal/agent-based">Run Agent-based Installer locally</Link>
              <Popover bodyContent="Runs Assisted Installer securely and locally to create clusters in disconnected or air-gapped environments.">
                <Button variant="plain" onClick={(e) => e.preventDefault()}>
                  <OutlinedQuestionCircleIcon />
                </Button>
              </Popover>
            </SplitItem>
          </Split>
        </StackItem>
      </Stack>
    </PageSection>
    <PageSection>
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
              {ocpTableColumns.map((column) => (
                <Th>{column}</Th>
              ))}
            </Thead>
            <Tbody>
              {ocpTableRows.map((row) => (
                <Tr>
                  <Td>{row[0]}</Td>
                  <Td>{row[1]}</Td>
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
