import React from 'react';
import { Field } from 'formik';

import { Alert, Content, Title } from '@patternfly/react-core';

import { SupportedFeature } from '~/common/featureCompatibility';
import links from '~/common/installLinks.mjs';
import { getIncompatibleVersionReason } from '~/common/versionCompatibility';
import { useFormState } from '~/components/clusters/wizards/hooks';
import ExternalLink from '~/components/common/ExternalLink';
import { ReduxCheckbox } from '~/components/common/ReduxFormComponents_deprecated';

import SharedVPCField from './SharedVPCField';

import './SharedVPCSection.scss';

type SharedVPCSectionProps = {
  hostedZoneDomainName?: string;
  isSelected: boolean;
  openshiftVersion: string;
  isHypershiftSelected: boolean;
};

const SharedVPCSection = ({
  hostedZoneDomainName,
  isSelected,
  openshiftVersion,
  isHypershiftSelected,
}: SharedVPCSectionProps) => {
  const { getFieldProps, getFieldMeta } = useFormState();
  const incompatibleReason = getIncompatibleVersionReason(
    SupportedFeature.AWS_SHARED_VPC,
    openshiftVersion,
    { day1: true, isHypershift: isHypershiftSelected },
  );
  if (incompatibleReason) {
    return (
      <>
        <Title headingLevel="h3" className="pf-v6-u-mt-lg">
          AWS shared VPC
        </Title>
        <Content component="p">{incompatibleReason}</Content>
      </>
    );
  }

  return (
    <>
      <Title headingLevel="h3">AWS shared VPC</Title>
      <Field
        component={ReduxCheckbox}
        name="shared_vpc.is_selected"
        label="Install into AWS shared VPC"
        extendedHelpText={
          <>
            Install into a non-default subnet shared by another account in your AWS organization.
            <br />
            <ExternalLink href={links.AWS_SHARED_VPC}>Learn more about AWS shared VPC</ExternalLink>
          </>
        }
        input={getFieldProps('shared_vpc.is_selected')}
        meta={getFieldMeta('shared_vpc.is_selected')}
      />
      {isSelected && (
        <section className="shared-vpc-instructions">
          <Alert
            className="pf-v6-u-mb-md"
            variant="info"
            isInline
            title={
              <>
                NOTE: To continue, you&apos;ll need to fill out all of the information. Some of the
                information, such as Private Hosted Zone ID and Shared VPC Role ARN, must be
                provided by the VPC owner of the AWS account you want to use. If you aren&apos;t the
                VPC owner, reach out to them now.
              </>
            }
          >
            <ExternalLink href={links.ROSA_SHARED_VPC}>
              View instructions on configuring shared VPC for ROSA clusters
            </ExternalLink>
          </Alert>
          <SharedVPCField hostedZoneDomainName={hostedZoneDomainName} />
        </section>
      )}
    </>
  );
};

export default SharedVPCSection;
