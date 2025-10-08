import React, { useState } from 'react';
import { Field } from 'formik';

import { ExpandableSection } from '@patternfly/react-core';

import { SupportedFeature } from '~/common/featureCompatibility';
import { validateSecurityGroups } from '~/common/validators';
import { getIncompatibleVersionReason } from '~/common/versionCompatibility';
import SecurityGroupsEmptyAlert from '~/components/clusters/ClusterDetailsMultiRegion/components/SecurityGroups/SecurityGroupsEmptyAlert';
import SecurityGroupsNoEditAlert from '~/components/clusters/ClusterDetailsMultiRegion/components/SecurityGroups/SecurityGroupsNoEditAlert';
import { useAWSVPCInquiry } from '~/components/clusters/common/useVPCInquiry';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { CloudVpc } from '~/types/clusters_mgmt.v1';

import { FieldId } from '../../constants';
import { SecurityGroupField } from '../../VPCScreen/SecurityGroupsSection';

export const SecurityGroupsSectionHCP = ({
  openshiftVersion,
  selectedVPC,
  isHypershiftSelected,
}: {
  openshiftVersion: string;
  selectedVPC: CloudVpc;
  isHypershiftSelected: boolean;
}) => {
  const { setFieldValue, getFieldProps, getFieldMeta } = useFormState();
  const fieldNameSecurityGroups = `${FieldId.SecurityGroups}.worker`;

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const { refreshVPCs } = useAWSVPCInquiry(false) as { refreshVPCs: () => void };
  const onExpandToggle = () => {
    setIsExpanded(!isExpanded);
  };

  if (!selectedVPC?.id || !isHypershiftSelected) {
    return null;
  }

  const incompatibleReason = getIncompatibleVersionReason(
    SupportedFeature.SECURITY_GROUPS,
    openshiftVersion,
    { day1: true, isHypershift: isHypershiftSelected },
  );

  const showEmptyAlert =
    !incompatibleReason && (selectedVPC?.aws_security_groups || []).length === 0;

  return (
    <ExpandableSection
      toggleText="Additional security groups"
      isExpanded={isExpanded}
      isIndented
      onToggle={onExpandToggle}
    >
      {incompatibleReason && <div>{incompatibleReason}</div>}
      {showEmptyAlert && <SecurityGroupsEmptyAlert refreshVPCCallback={refreshVPCs} />}
      {!incompatibleReason && !showEmptyAlert && (
        <>
          <SecurityGroupsNoEditAlert isHypershift={isHypershiftSelected} />
          <br />

          <Field
            component={SecurityGroupField}
            name={fieldNameSecurityGroups}
            label="Security groups"
            selectedVPC={selectedVPC}
            validate={(securityGroupIds: string[]) =>
              validateSecurityGroups(securityGroupIds, isHypershiftSelected)
            }
            input={{
              ...getFieldProps(fieldNameSecurityGroups),
              onChange: (value: string[]) => setFieldValue(fieldNameSecurityGroups, value),
            }}
            meta={getFieldMeta(fieldNameSecurityGroups)}
            isHypershift={isHypershiftSelected}
            refreshVPCCallback={refreshVPCs}
          />
        </>
      )}
    </ExpandableSection>
  );
};
