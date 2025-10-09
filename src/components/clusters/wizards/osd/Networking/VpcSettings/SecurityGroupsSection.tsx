import React, { useState } from 'react';
import { Field } from 'formik';

import { ExpandableSection } from '@patternfly/react-core';

import { SupportedFeature } from '~/common/featureCompatibility';
import { validateSecurityGroups } from '~/common/validators';
import { getIncompatibleVersionReason } from '~/common/versionCompatibility';
import SecurityGroupsEmptyAlert from '~/components/clusters/ClusterDetailsMultiRegion/components/SecurityGroups/SecurityGroupsEmptyAlert';
import SecurityGroupsNoEditAlert from '~/components/clusters/ClusterDetailsMultiRegion/components/SecurityGroups/SecurityGroupsNoEditAlert';
import { useAWSVPCInquiry } from '~/components/clusters/common/useVPCInquiry';
import { CheckboxField } from '~/components/clusters/wizards/form';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { FieldId } from '~/components/clusters/wizards/osd/constants';

import { SecurityGroupField } from '../../../rosa/VPCScreen/SecurityGroupsSection';

const fieldId = 'securityGroups';

const SecurityGroupsSection = () => {
  const {
    values: {
      [FieldId.SelectedVpc]: selectedVPC,
      [FieldId.ClusterVersion]: version,
      [FieldId.SecurityGroups]: securityGroups,
    },
    getFieldProps,
    setFieldValue,
  } = useFormState();

  const { applyControlPlaneToAll } = securityGroups;
  const selectedGroups = applyControlPlaneToAll
    ? securityGroups.controlPlane
    : securityGroups.controlPlane.concat(securityGroups.infra).concat(securityGroups.worker);
  const [isExpanded, setIsExpanded] = useState<boolean>(selectedGroups.length > 0);

  const { refreshVPCs } = useAWSVPCInquiry(true) as { refreshVPCs: () => void };
  if (!selectedVPC.id) {
    return null;
  }

  const setValue = (fieldName: string) => (value: string) => setFieldValue(fieldName, value);
  const onExpandToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const incompatibleReason = getIncompatibleVersionReason(
    SupportedFeature.SECURITY_GROUPS,
    version?.raw_id,
    { day1: true },
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
          <SecurityGroupsNoEditAlert isHypershift={false} />
          <br />
          <Field
            component={CheckboxField}
            name={`${fieldId}.applyControlPlaneToAll`}
            label="Apply the same security groups to all node types (control plane, infrastructure, worker)"
            input={{
              ...getFieldProps(`${fieldId}.applyControlPlaneToAll`),
              onChange: (_event: React.FormEvent<HTMLInputElement>, checked: boolean) =>
                setFieldValue(`${fieldId}.applyControlPlaneToAll`, checked),
            }}
          />
          <Field
            component={SecurityGroupField}
            name={`${fieldId}.controlPlane`}
            label={applyControlPlaneToAll ? '' : 'Control plane nodes'}
            selectedVPC={selectedVPC}
            validate={(securityGroupIds: string[]) =>
              validateSecurityGroups(securityGroupIds, false)
            }
            input={{
              ...getFieldProps(`${fieldId}.controlPlane`),
              onChange: setValue(`${fieldId}.controlPlane`),
            }}
            refreshVPCCallback={refreshVPCs}
          />
          {!applyControlPlaneToAll && (
            <>
              <Field
                component={SecurityGroupField}
                name={`${fieldId}.infra`}
                label="Infrastructure nodes"
                selectedVPC={selectedVPC}
                validate={(securityGroupIds: string[]) =>
                  validateSecurityGroups(securityGroupIds, false)
                }
                input={{
                  ...getFieldProps(`${fieldId}.infra`),
                  onChange: setValue(`${fieldId}.infra`),
                }}
                refreshVPCCallback={refreshVPCs}
              />
              <Field
                component={SecurityGroupField}
                name={`${fieldId}.worker`}
                label="Worker nodes"
                selectedVPC={selectedVPC}
                validate={(securityGroupIds: string[]) =>
                  validateSecurityGroups(securityGroupIds, false)
                }
                input={{
                  ...getFieldProps(`${fieldId}.worker`),
                  onChange: setValue(`${fieldId}.worker`),
                }}
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
