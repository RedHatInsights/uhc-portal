/* eslint-disable react/no-unstable-nested-components */
import React, { useState } from 'react';

import { Button, ButtonVariant, Stack, StackItem } from '@patternfly/react-core';
import { ExpandableRowContent, Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { Link } from '~/common/routing';
import CreateClusterDropDown from '~/components/clusters/CreateClusterPage/CloudTab/components/CreateClusterDropDown';
import links from '~/components/clusters/CreateClusterPage/CreateClusterConsts';
import { CreateManagedClusterButtonWithTooltip } from '~/components/common/CreateManagedClusterTooltip';
import ExternalLink from '~/components/common/ExternalLink';
import { useCanCreateManagedCluster } from '~/queries/ClusterDetailsQueries/useFetchActionsPermissions';
import { isRestrictedEnv } from '~/restrictedEnv';
import AWSLogo from '~/styles/images/AWS.png';
import IBMCloudLogo from '~/styles/images/ibm_cloud-icon.png';
import RedHatLogo from '~/styles/images/Logo-RedHat-Hat-Color-RGB.png';
import MicrosoftLogo from '~/styles/images/Microsoft_logo.svg';

interface ManagedServicesTableProps {
  hasOSDQuota?: boolean;
  isTrialEnabled?: boolean;
}

const ManagedServicesTable = (props: ManagedServicesTableProps) => {
  const { canCreateManagedCluster } = useCanCreateManagedCluster();

  const { hasOSDQuota = false, isTrialEnabled = false } = props;
  const [openRows, setOpenRows] = useState<Array<string>>([]);
  const setRowExpanded = (rowKey: string, isExpanding = true) =>
    setOpenRows((prevExpanded) => {
      const otherExpandedRepoNames = prevExpanded.filter((r) => r !== rowKey);
      return isExpanding ? [...otherExpandedRepoNames, rowKey] : otherExpandedRepoNames;
    });
  const isRowExpanded = (rowKey: string) => openRows.includes(rowKey);

  const columnNames = {
    logo: 'Logo',
    offerings: 'Offerings',
    purchasedThrough: 'Purchased through',
    details: 'Details',
    getStarted: 'Get started',
  };

  const rowKeys = {
    osdTrial: 'osdTrial',
    osd: 'osd',
    azure: 'azure',
    ibm: 'ibm',
    rosa: 'rosa',
  };

  const osdTrialRow = {
    key: rowKeys.osdTrial,
    logo: <img className="partner-logo" src={RedHatLogo} alt="OSD" />,
    offerings: (
      <ExternalLink href={links.OSD_LEARN_MORE} noIcon>
        Red Hat OpenShift Dedicated Trial
      </ExternalLink>
    ),
    purchasedThrough: 'Red Hat',
    details: 'Available on GCP',
    action: (
      <CreateManagedClusterButtonWithTooltip
        childComponent={Button}
        className="create-button"
        isAriaDisabled={!canCreateManagedCluster}
        variant={ButtonVariant.primary}
        component={(props: any) => (
          <Link
            {...props}
            id="create-trial-cluster"
            to="/create/osdtrial?trial=osd"
            data-testid="osd-create-trial-cluster"
            role="button"
          />
        )}
      >
        Create trial cluster
      </CreateManagedClusterButtonWithTooltip>
    ),
    expandedSection: null,
  };

  let osdRowaction;

  if (hasOSDQuota) {
    osdRowaction = (
      <CreateManagedClusterButtonWithTooltip
        childComponent={Button}
        className="create-button"
        isAriaDisabled={!canCreateManagedCluster}
        variant={ButtonVariant.primary}
        component={(props: any) => (
          <Link
            {...props}
            id="create-cluster"
            to="/create/osd"
            data-testid="osd-create-cluster-button"
          />
        )}
      >
        Create cluster
      </CreateManagedClusterButtonWithTooltip>
    );
  } else {
    osdRowaction = (
      <ExternalLink
        href={links.OSD_LEARN_MORE}
        isButton
        variant={ButtonVariant.secondary}
        className="create-button"
        noIcon
      >
        <span>Learn more</span>
      </ExternalLink>
    );
  }

  const osdRow = {
    key: rowKeys.osd,
    logo: <img className="partner-logo" src={RedHatLogo} alt="OSD" />,
    offerings: (
      <ExternalLink href={links.OSD_LEARN_MORE} noIcon>
        Red Hat OpenShift Dedicated
      </ExternalLink>
    ),
    purchasedThrough: 'Red Hat',
    details: 'Available on GCP',
    action: osdRowaction,
    expandedSection: {
      content: (
        <Stack hasGutter>
          <StackItem>
            A complete OpenShift cluster provided as a fully-managed cloud service dedicated to a
            single customer.
            <br />
            Reduce operational complexity and focus on building and scaling applications that add
            more value to your business.
            <br />
            Hosted on Google Cloud.
          </StackItem>
          <StackItem>
            <ExternalLink href={links.OSD_LEARN_MORE}>
              Learn more about Red Hat OpenShift Dedicated
            </ExternalLink>
          </StackItem>
        </Stack>
      ),
    },
  };

  const azureRow = {
    key: rowKeys.azure,
    logo: <img className="partner-logo" src={MicrosoftLogo} alt="Microsoft" />,
    offerings: (
      <ExternalLink href={links.AZURE} noIcon>
        Azure Red Hat OpenShift
      </ExternalLink>
    ),
    purchasedThrough: 'Microsoft Azure',
    details: 'Flexible hourly billing',
    action: (
      <ExternalLink
        isButton
        noIcon
        variant={ButtonVariant.secondary}
        href={links.AZURE}
        className="create-button"
      >
        Try it on Azure
      </ExternalLink>
    ),
    expandedSection: {
      content: (
        <Stack hasGutter>
          <StackItem>
            A flexible, self-service deployment of OpenShift clusters provided as a fully-managed
            cloud service by Microsoft and Red Hat.
            <br />
            Hosted on Microsoft Azure.
          </StackItem>
          <StackItem>
            <ExternalLink href={links.AZURE}>Learn more about Azure Red Hat OpenShift</ExternalLink>
          </StackItem>
        </Stack>
      ),
    },
  };

  const ibmCloudRow = {
    key: rowKeys.ibm,
    logo: <img className="partner-logo" src={IBMCloudLogo} alt="IBM Cloud" />,
    offerings: (
      <ExternalLink href={links.IBM_CLOUD_LEARN_MORE} noIcon>
        Red Hat OpenShift on IBM Cloud
      </ExternalLink>
    ),
    purchasedThrough: 'IBM',
    details: 'Flexible hourly billing',
    action: (
      <ExternalLink
        isButton
        noIcon
        href={links.IBM_CLOUD}
        variant={ButtonVariant.secondary}
        className="create-button"
      >
        Try it on IBM
      </ExternalLink>
    ),
    expandedSection: {
      content: (
        <Stack hasGutter>
          <StackItem>
            A preconfigured OpenShift environment provided as a fully-managed cloud service at
            enterprise scale.
            <br />
            Hosted on IBM Cloud.
          </StackItem>
          <StackItem>
            <ExternalLink href={links.IBM_CLOUD_LEARN_MORE}>
              Learn more about Red Hat OpenShift on IBM Cloud
            </ExternalLink>
          </StackItem>
        </Stack>
      ),
    },
  };

  const rosaRow = {
    key: rowKeys.rosa,
    logo: <img className="partner-logo" src={AWSLogo} alt="AWS" />,
    offerings: (
      <ExternalLink noIcon href={links.AWS}>
        Red Hat OpenShift Service on AWS (ROSA)
      </ExternalLink>
    ),
    purchasedThrough: 'Amazon Web Services',
    details: 'Flexible hourly billing',

    action: (
      <CreateManagedClusterButtonWithTooltip
        childComponent={CreateClusterDropDown}
        isDisabled={!canCreateManagedCluster}
        wrap
      />
    ),
    expandedSection: {
      content: (
        <Stack hasGutter>
          <StackItem>
            Build, deploy, and manage Kubernetes applications with Red Hat OpenShift running
            natively on AWS.
            <br />
            Hosted on AWS.
          </StackItem>
          <StackItem>
            <ExternalLink href={links.AWS}>
              Learn more about Red Hat OpenShift Service on AWS
            </ExternalLink>
          </StackItem>
        </Stack>
      ),
    },
  };

  const rows = [];
  if (!isRestrictedEnv()) {
    if (isTrialEnabled) {
      rows.push(osdTrialRow);
    }
    rows.push(osdRow, azureRow, ibmCloudRow);
  }
  rows.push(rosaRow);

  return (
    <Table aria-label="Managed services" data-testid="managed-service-table">
      <Thead>
        <Tr>
          <Th screenReaderText="Row expansion" />
          <Th width={10} screenReaderText="Logo" />
          <Th width={25}>{columnNames.offerings}</Th>
          <Th width={20}>{columnNames.purchasedThrough}</Th>
          <Th width={20} screenReaderText={columnNames.details} />
          <Th>{columnNames.getStarted}</Th>
        </Tr>
      </Thead>
      {rows.map((row, rowIndex) => (
        <Tbody key={row.key} isExpanded={isRowExpanded(row.key)}>
          <Tr key="content-row">
            <Td
              expand={
                row.expandedSection
                  ? {
                      rowIndex,
                      isExpanded: isRowExpanded(row.key),
                      onToggle: () => setRowExpanded(row.key, !isRowExpanded(row.key)),
                      expandId: row.key,
                    }
                  : undefined
              }
            />
            <Td dataLabel={columnNames.logo}>{row.logo}</Td>
            <Td dataLabel={columnNames.offerings}>{row.offerings}</Td>
            <Td dataLabel={columnNames.purchasedThrough}>{row.purchasedThrough}</Td>
            <Td dataLabel={columnNames.details}>{row.details}</Td>
            <Td dataLabel={columnNames.getStarted}>{row.action}</Td>
          </Tr>
          {row.expandedSection && (
            <Tr key="expandable-row" isExpanded={isRowExpanded(row.key)}>
              <Td dataLabel="Description" colSpan={6}>
                <ExpandableRowContent>{row.expandedSection.content}</ExpandableRowContent>
              </Td>
            </Tr>
          )}
        </Tbody>
      ))}
    </Table>
  );
};

export { ManagedServicesTable };
