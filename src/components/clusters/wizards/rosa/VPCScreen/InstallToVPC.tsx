import React from 'react';

import { Alert, GridItem, Title } from '@patternfly/react-core';

import links from '~/common/installLinks.mjs';
import SecurityGroupsSection from '~/components/clusters/wizards/rosa/VPCScreen/SecurityGroupsSection';
import ExternalLink from '~/components/common/ExternalLink';
import PopoverHint from '~/components/common/PopoverHint';
import { isRestrictedEnv } from '~/restrictedEnv';
import { CloudVpc } from '~/types/clusters_mgmt.v1';

import SharedVPCSection from '../NetworkingSection/SharedVPCSection';

import AWSSubnetFields from './AWSSubnetFields';

type InstallIntoVPCProps = {
  hostedZoneDomainName: string;
  selectedRegion?: string;
  selectedVPC: CloudVpc;
  selectedAZs: string[];
  openshiftVersion: string;
  isMultiAz?: boolean;
  privateLinkSelected?: boolean;
  isSharedVpcSelected: boolean;
  cloudProviderID?: string;
  isHypershiftSelected: boolean;
};
const InstallToVPC = ({
  selectedRegion,
  selectedVPC,
  selectedAZs,
  openshiftVersion,
  isMultiAz,
  privateLinkSelected,
  cloudProviderID,
  isSharedVpcSelected,
  hostedZoneDomainName,
  isHypershiftSelected,
}: InstallIntoVPCProps) =>
  cloudProviderID === 'aws' && (
    <>
      <GridItem>
        <Title headingLevel="h4" size="md">
          Install into an existing VPC
          <PopoverHint
            iconClassName="pf-v6-u-ml-sm"
            hint={
              <>
                Your VPC must have public and private subnets. Public subnets are associated with
                appropriate Ingress rules. Private subnets need appropriate routes and tables.{' '}
                <ExternalLink href={links.INSTALL_AWS_VPC}>
                  Learn more about installing into an existing VPC
                </ExternalLink>
              </>
            }
          />
        </Title>
        {`To install into an existing VPC, you need to ensure that your VPC is configured with ${
          !privateLinkSelected ? 'a public and' : ''
        }
            a private subnet for each availability zone that you want the cluster
            installed into`}
        .
        <ExternalLink href={links.INSTALL_AWS_CUSTOM_VPC_REQUIREMENTS}>
          Learn more about VPC
        </ExternalLink>
      </GridItem>
      <Alert
        variant="info"
        isInline
        title="You'll need to match these VPC subnets when you define the CIDR ranges."
      />
      <AWSSubnetFields
        isMultiAz={isMultiAz}
        selectedVPC={selectedVPC}
        selectedRegion={selectedRegion}
        selectedAZs={selectedAZs}
        privateLinkSelected={privateLinkSelected}
      />
      <SecurityGroupsSection
        selectedVPC={selectedVPC}
        openshiftVersion={openshiftVersion}
        isHypershiftSelected={isHypershiftSelected}
      />
      {!isRestrictedEnv() && (
        <SharedVPCSection
          hostedZoneDomainName={hostedZoneDomainName}
          isSelected={isSharedVpcSelected}
          openshiftVersion={openshiftVersion}
          isHypershiftSelected={isHypershiftSelected}
        />
      )}
    </>
  );

export { InstallToVPC };
