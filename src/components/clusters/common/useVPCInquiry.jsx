import { useEffect } from 'react';
import isEqual from 'lodash/isEqual';
import { useDispatch, useSelector } from 'react-redux';

import { useFormState } from '~/components/clusters/wizards/hooks';
import { FieldId as OsdFieldId } from '~/components/clusters/wizards/osd/constants';
import { FieldId as RosaFieldId } from '~/components/clusters/wizards/rosa/constants';
import { clearListVpcs, getAWSCloudProviderVPCs } from '~/redux/actions/ccsInquiriesActions';

export const lastVpcRequestIsInEffect = (vpcs, newRequest) => {
  if (!vpcs.fulfilled) {
    return false;
  }

  return (
    vpcs.cloudProvider === newRequest.cloudProviderID &&
    vpcs.region === newRequest.region &&
    isEqual(vpcs.credentials, newRequest.credentials) // make the more expensive comparison last
  );
};

/**
 * Generates the request parameters to obtain the customer's VPC.
 * Valid only for Formik Wizard.

 *
 * @returns {object} request params for the VPCs
 */
const useOsdVPCRequest = () => {
  const { values } = useFormState();
  return {
    region: values[OsdFieldId.Region],
    cloudProviderID: values[OsdFieldId.CloudProvider],
    credentials: {
      account_id: values[OsdFieldId.AccountId],
      access_key_id: values[OsdFieldId.AccessKeyId],
      secret_access_key: values[OsdFieldId.SecretAccessKey],
    },
  };
};

const useRosaVPCRequest = () => {
  const { values } = useFormState();
  return {
    region: values[RosaFieldId.Region],
    cloudProviderID: values[RosaFieldId.CloudProvider],
    credentials: {
      account_id: values[RosaFieldId.AssociatedAwsId],
      sts: {
        role_arn: values[RosaFieldId.InstallerRoleArn],
      },
    },
  };
};

const vpcsSelector = (state) => state.ccsInquiries.vpcs;

/**
 * React hook fetching VPCs on mount and when dependencies change.
 * - Does nothing if GCP selected.
 * @param isOSD Determines the form type
 * @returns current vpcs state.
 */
export const useAWSVPCInquiry = (isOSD) => {
  const dispatch = useDispatch();
  const vpcs = useSelector(vpcsSelector);

  // We must fetch the data from the form state.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const requestParams = isOSD ? useOsdVPCRequest() : useRosaVPCRequest();
  const hasLatestVpcs = lastVpcRequestIsInEffect(vpcs, requestParams);

  const { region, cloudProviderID, credentials } = requestParams;
  useEffect(() => {
    // The action works similarly for AWS and GCP,
    // but current GCP components don't need it, they fetch the data themselves.
    if (cloudProviderID === 'aws' && !hasLatestVpcs) {
      // Clear stale error state before re-fetching VPCs
      if (vpcs.error) {
        dispatch(clearListVpcs());
      }

      dispatch(
        getAWSCloudProviderVPCs({
          region,
          awsCredentials: credentials,
          options: { includeSecurityGroups: true },
        }),
      );
    }
    // Adding "credentials" will trigger more than 1 request when the component first receives its data
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloudProviderID, region, hasLatestVpcs]);
  const refreshVPCs = () => {
    if (requestParams.cloudProviderID === 'aws') {
      dispatch(
        getAWSCloudProviderVPCs({
          region,
          awsCredentials: credentials,
          options: { includeSecurityGroups: true },
        }),
      );
    }
  };
  return { vpcs, requestParams, refreshVPCs };
};
