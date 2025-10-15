import React, { useState } from 'react';
import { Field } from 'formik';

import { ExpandableSection } from '@patternfly/react-core';

import { SupportedFeature } from '~/common/featureCompatibility';
import { validateSecurityGroups } from '~/common/validators';
import { getIncompatibleVersionReason } from '~/common/versionCompatibility';
import EditSecurityGroups from '~/components/clusters/ClusterDetailsMultiRegion/components/SecurityGroups/EditSecurityGroups';
import SecurityGroupsEmptyAlert from '~/components/clusters/ClusterDetailsMultiRegion/components/SecurityGroups/SecurityGroupsEmptyAlert';
import SecurityGroupsNoEditAlert from '~/components/clusters/ClusterDetailsMultiRegion/components/SecurityGroups/SecurityGroupsNoEditAlert';
import { useAWSVPCInquiry } from '~/components/clusters/common/useVPCInquiry';
import { useFormState } from '~/components/clusters/wizards/hooks';
import ReduxCheckbox from '~/components/common/ReduxFormComponents_deprecated/ReduxCheckbox';
import { CloudVpc } from '~/types/clusters_mgmt.v1';

import { FieldId } from '../constants';

type SecurityGroupFieldProps = {
  selectedVPC: CloudVpc;
  label?: string;
  input: { onChange: (selectedGroupIds: string[]) => void; value: string[] };
  isHypershift: boolean;
  refreshVPCCallback?: () => void;
};

export const SecurityGroupField = ({
  input: { onChange, value: selectedGroupIds },
  label,
  selectedVPC,
  isHypershift,
  refreshVPCCallback,
}: SecurityGroupFieldProps) => (
  <EditSecurityGroups
    label={label}
    selectedVPC={selectedVPC}
    selectedGroupIds={selectedGroupIds}
    isReadOnly={false}
    onChange={onChange}
    isHypershift={isHypershift}
    refreshVPCCallback={refreshVPCCallback}
  />
);

const SecurityGroupsSection = ({
  openshiftVersion,
  selectedVPC,
  isHypershiftSelected,
}: {
  openshiftVersion: string;
  selectedVPC: CloudVpc;
  isHypershiftSelected: boolean;
}) => {
  const {
    setFieldValue,
    getFieldProps,
    getFieldMeta,
    values: { [FieldId.SecurityGroups]: securityGroups },
  } = useFormState();
  const applyAllFieldName = `${FieldId.SecurityGroups}.applyControlPlaneToAll`;
  const controlPlaneFieldName = `${FieldId.SecurityGroups}.controlPlane`;
  const infraFieldName = `${FieldId.SecurityGroups}.infra`;
  const workerFieldName = `${FieldId.SecurityGroups}.worker`;
  const { refreshVPCs } = useAWSVPCInquiry(false) as { refreshVPCs: () => void };

  const selectedGroups = securityGroups.applyControlPlaneToAll
    ? securityGroups.controlPlane
    : securityGroups.controlPlane.concat(securityGroups.infra).concat(securityGroups.worker);
  const [isExpanded, setIsExpanded] = useState<boolean>(selectedGroups.length > 0);

  const onExpandToggle = () => {
    setIsExpanded(!isExpanded);
  };

  if (!selectedVPC.id) {
    return null;
  }

  const incompatibleReason = getIncompatibleVersionReason(
    SupportedFeature.SECURITY_GROUPS,
    openshiftVersion,
    { day1: true, isHypershift: isHypershiftSelected },
  );

  const showEmptyAlert =
    !incompatibleReason && (selectedVPC.aws_security_groups || []).length === 0;

  return (
    <ExpandableSection
      toggleText="Additional security groups"
      isExpanded={isExpanded}
      onToggle={onExpandToggle}
    >
      {incompatibleReason && <div>{incompatibleReason}</div>}
      {showEmptyAlert && <SecurityGroupsEmptyAlert refreshVPCCallback={refreshVPCs} />}
      {!incompatibleReason && !showEmptyAlert && (
        <>
          <SecurityGroupsNoEditAlert isHypershift={isHypershiftSelected} />
          <br />
          <Field
            component={ReduxCheckbox}
            name={applyAllFieldName}
            label="Apply the same security groups to all node types (control plane, infrastructure, worker)"
            input={{
              ...getFieldProps(applyAllFieldName),
              onChange: (_: React.FormEvent<HTMLInputElement>, value: boolean) =>
                setFieldValue(applyAllFieldName, value),
            }}
            meta={getFieldMeta(applyAllFieldName)}
          />

          <Field
            component={SecurityGroupField}
            name={controlPlaneFieldName}
            label={securityGroups.applyControlPlaneToAll ? '' : 'Control plane nodes'}
            selectedVPC={selectedVPC}
            validate={(securityGroupIds: string[]) =>
              validateSecurityGroups(securityGroupIds, isHypershiftSelected)
            }
            input={{
              ...getFieldProps(controlPlaneFieldName),
              onChange: (value: string[]) => setFieldValue(controlPlaneFieldName, value),
            }}
            meta={getFieldMeta(controlPlaneFieldName)}
            isHypershift={isHypershiftSelected}
            refreshVPCCallback={refreshVPCs}
          />
          {!securityGroups.applyControlPlaneToAll && (
            <>
              <Field
                component={SecurityGroupField}
                name={infraFieldName}
                label="Infrastructure nodes"
                selectedVPC={selectedVPC}
                validate={(securityGroupIds: string[]) =>
                  validateSecurityGroups(securityGroupIds, isHypershiftSelected)
                }
                input={{
                  ...getFieldProps(infraFieldName),
                  onChange: (value: string[]) => setFieldValue(infraFieldName, value),
                }}
                meta={getFieldMeta(infraFieldName)}
                isHypershift={isHypershiftSelected}
                refreshVPCCallback={refreshVPCs}
              />
              <Field
                component={SecurityGroupField}
                name={workerFieldName}
                label="Worker nodes"
                selectedVPC={selectedVPC}
                validate={(securityGroupIds: string[]) =>
                  validateSecurityGroups(securityGroupIds, isHypershiftSelected)
                }
                input={{
                  ...getFieldProps(workerFieldName),
                  onChange: (value: string[]) => setFieldValue(workerFieldName, value),
                }}
                meta={getFieldMeta(workerFieldName)}
                isHypershift={isHypershiftSelected}
                refreshVPCCallback={refreshVPCs}
              />
            </>
          )}
        </>
      )}
    </ExpandableSection>
  );
};

export default SecurityGroupsSection;
