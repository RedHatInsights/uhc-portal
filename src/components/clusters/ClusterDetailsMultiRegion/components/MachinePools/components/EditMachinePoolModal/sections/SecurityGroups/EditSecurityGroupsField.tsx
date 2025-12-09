import React from 'react';
import { Field } from 'formik';

import { Alert, AlertActionLink, AlertVariant, Flex, FlexItem } from '@patternfly/react-core';

import { SupportedFeature } from '~/common/featureCompatibility';
import { validateSecurityGroups } from '~/common/validators';
import { getIncompatibleVersionReason } from '~/common/versionCompatibility';
import { RefreshClusterVPCAlert } from '~/components/clusters/ClusterDetailsMultiRegion/components/MachinePools/common/RefreshClusterVPCAlert';
import EditSecurityGroups from '~/components/clusters/ClusterDetailsMultiRegion/components/SecurityGroups/EditSecurityGroups';
import SecurityGroupsEmptyAlert from '~/components/clusters/ClusterDetailsMultiRegion/components/SecurityGroups/SecurityGroupsEmptyAlert';
import SecurityGroupsNoChangeAlert from '~/components/clusters/ClusterDetailsMultiRegion/components/SecurityGroups/SecurityGroupsNoChangeAlert';
import { isHypershiftCluster, isROSA } from '~/components/clusters/common/clusterStates';
import { useAWSVPCFromCluster } from '~/components/clusters/common/useAWSVPCFromCluster';
import { FieldId } from '~/components/clusters/wizards/common';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { ClusterFromSubscription } from '~/types/types';

import { EditSecurityGroupsFieldLoading } from './EditSecurityGroupsFieldLoading';

interface EditSecurityGroupsFieldProps {
  cluster: ClusterFromSubscription;
  isReadOnly: boolean;
}

const EditSecurityGroupsField = ({ cluster, isReadOnly }: EditSecurityGroupsFieldProps) => {
  const {
    values: { [FieldId.SecurityGroupIds]: selectedGroupIds },
    setFieldValue,
    setFieldTouched,
  } = useFormState();

  const { clusterVpc, isLoading, errorReason, refreshVPC } = useAWSVPCFromCluster(cluster);
  const isHypershift = isHypershiftCluster(cluster);
  const incompatibleReason = getIncompatibleVersionReason(
    SupportedFeature.SECURITY_GROUPS,
    cluster.openshift_version,
    { day2: true, isHypershift },
  );
  if (isLoading) {
    return <EditSecurityGroupsFieldLoading />;
  }

  if (!clusterVpc) {
    return (
      <RefreshClusterVPCAlert
        isLoading={isLoading}
        refreshVPC={refreshVPC}
        errorReason={errorReason}
      />
    );
  }
  if ((clusterVpc.aws_security_groups || []).length === 0) {
    return <SecurityGroupsEmptyAlert refreshVPCCallback={refreshVPC} />;
  }
  return incompatibleReason?.trim().length > 0 ? (
    <Alert variant={AlertVariant.warning} title={incompatibleReason} isInline>
      <AlertActionLink onClick={refreshVPC}>Refresh Security Groups</AlertActionLink>
    </Alert>
  ) : (
    <Flex direction={{ default: 'column' }}>
      <FlexItem>
        <SecurityGroupsNoChangeAlert isRosa={isROSA(cluster)} isHypershift={isHypershift} />
      </FlexItem>
      <FlexItem>
        <Field
          component={EditSecurityGroups}
          name={FieldId.SecurityGroupIds}
          onChange={(values: string[]) => {
            setFieldValue(FieldId.SecurityGroupIds, values, true);
            setFieldTouched(FieldId.SecurityGroupIds, true, false);
          }}
          validate={(securityGroupIds: string[]) =>
            validateSecurityGroups(securityGroupIds, isHypershift)
          }
          selectedVPC={clusterVpc}
          isReadOnly={isReadOnly}
          selectedGroupIds={selectedGroupIds}
          isHypershift={isHypershift}
          refreshVPCCallback={refreshVPC}
          isVPCLoading={isLoading}
        />
      </FlexItem>
    </Flex>
  );
};

export default EditSecurityGroupsField;
