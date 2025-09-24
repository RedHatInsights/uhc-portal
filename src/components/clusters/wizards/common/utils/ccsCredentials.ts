import { FormikValues } from 'formik';
import isEqual from 'lodash/isEqual';
import { Dispatch } from 'redux';

import { normalizedProducts } from '~/common/subscriptionTypes';
import {
  CloudProviderType,
  FieldId,
  GCP_DEFAULT_REGION,
} from '~/components/clusters/wizards/common/constants';
import { GCPAuthType } from '~/components/clusters/wizards/osd/ClusterSettings/CloudProvider/types';
import {
  getAWSCloudProviderRegions,
  getGCPCloudProviderVPCs,
  VALIDATE_CLOUD_PROVIDER_CREDENTIALS,
} from '~/redux/actions/ccsInquiriesActions';
import { GlobalState } from '~/redux/stateTypes';
import { AWSCredentials } from '~/types/types';

/**
 * Gets AWS CCS credentials from form state, in form suitable for actions.
 */
export const getAwsCcsCredentials = (values: FormikValues): AWSCredentials => {
  const {
    [FieldId.Product]: product,
    [FieldId.AccountId]: accountId,
    [FieldId.AccessKeyId]: accessKeyId,
    [FieldId.SecretAccessKey]: secretAccessKey,
    [FieldId.InstallerRoleArn]: installerRoleArn,
  } = values;

  const isSTS = product === normalizedProducts.ROSA;
  return isSTS
    ? {
        account_id: accountId,
        sts: {
          role_arn: installerRoleArn,
        },
      }
    : {
        account_id: accountId,
        access_key_id: accessKeyId,
        secret_access_key: secretAccessKey,
      };
};

/**
 * Gets GCP CCS credentials from form state, in form suitable for actions.
 * When auth type is service account, we return the whole JSON string; parsing it is deferred
 * to action time, when it's easier to present errors to user.
 */
export const getGcpCcsCredentials = (values: FormikValues): string => {
  const {
    [FieldId.GcpAuthType]: gcpAuthType,
    [FieldId.GcpServiceAccount]: gcpServiceAccount,
    [FieldId.GcpWifConfig]: gcpWifConfig,
  } = values;

  return gcpAuthType === GCPAuthType.ServiceAccounts ? gcpServiceAccount : gcpWifConfig.id;
};

export const getCloudProverInfo = (values: FormikValues, dispatch: Dispatch) => {
  if (values[FieldId.CloudProvider] === CloudProviderType.Gcp) {
    const gpcAuthType = values[FieldId.GcpAuthType];
    // hard code region since we're just validating credentials
    return dispatch(
      getGCPCloudProviderVPCs(
        VALIDATE_CLOUD_PROVIDER_CREDENTIALS,
        gpcAuthType,
        getGcpCcsCredentials(values),
        GCP_DEFAULT_REGION,
      ),
    );
  }
  return dispatch(
    getAWSCloudProviderRegions(VALIDATE_CLOUD_PROVIDER_CREDENTIALS, getAwsCcsCredentials(values)),
  );
};

export const shouldValidateCcsCredentials = (
  values: FormikValues,
  ccsCredentialsValidity: GlobalState['ccsInquiries']['ccsCredentialsValidity'],
) => {
  // GCP should be validated only if service accounts is the auth type
  const shouldValidateProvider =
    values[FieldId.CloudProvider] === CloudProviderType.Aws ||
    (values[FieldId.CloudProvider] === CloudProviderType.Gcp &&
      values[FieldId.GcpAuthType] === GCPAuthType.ServiceAccounts);

  const areCCSCredentialsValid =
    ccsCredentialsValidity.fulfilled &&
    ccsCredentialsValidity.cloudProvider === values[FieldId.CloudProvider] &&
    isEqual(
      ccsCredentialsValidity.credentials,
      values[FieldId.CloudProvider] === CloudProviderType.Aws
        ? getAwsCcsCredentials(values)
        : getGcpCcsCredentials(values),
    );

  return values[FieldId.Byoc] === 'true' && shouldValidateProvider && !areCCSCredentialsValid;
};
