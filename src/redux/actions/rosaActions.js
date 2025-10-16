import { getAwsBillingAccountsFromQuota } from '~/components/clusters/common/quotaSelectors';

import { extractAWSID } from '../../common/rosa';
import {
  CLEAR_GET_AWS_ACCOUNT_IDS_RESPONSE,
  CLEAR_GET_AWS_ACCOUNT_ROLES_ARNS_RESPONSE,
  CLEAR_GET_OCM_ROLE_RESPONSE,
  CLEAR_GET_USER_ROLE_RESPONSE,
  GET_AWS_ACCOUNT_ROLES_ARNS,
  GET_AWS_BILLING_ACCOUNTS,
  GET_OCM_ROLE,
  GET_USER_ROLE,
  LIST_ASSOCIATED_AWS_IDS,
  LIST_USER_OIDC_CONFIGURATIONS,
  SET_OFFLINE_TOKEN,
} from '../../components/clusters/wizards/rosa/rosaConstants';
import { accountsService, clusterService } from '../../services';

export const getAWSIDsFromARNs = (arns) => {
  const ids = arns.map(extractAWSID);
  return [...new Set(ids)]; // convert to Set to remove duplicates, spread to convert back to array
};

/** Converts comma separated list of sts users into an array of users by aws account ids
 * @param stsUserRoles string.  Comma separated list of sts users
 * @returns
 * [
 *   { aws_id: <id>: sts_user: <user>},
 *   { aws_id: <id>: sts_user: <user>},
 * ]
 */
export const normalizeSTSUsersByAWSAccounts = (stsUserRoles) => {
  // Ex stsUserRoles = "arn:aws:iam::000000000006:role/ManagedOpenShift-User-dtaylor-ocm-Role, ..."
  //                '268733382466' above ^^ is an example AWS account ID
  if (stsUserRoles === undefined || stsUserRoles.length === 0) {
    return [];
  }
  const ids = stsUserRoles.split(',').map((stsUser) => {
    const awsAcctId = extractAWSID(stsUser);
    return { aws_id: awsAcctId, sts_user: stsUser.substr(stsUser.indexOf(':role/') + 6) };
  });
  return [...new Set(ids)]; // convert to Set to remove duplicates, spread to convert back to array
};

const normalizedAWSAccountRole = (arrayOfRoleItems, prefix) =>
  arrayOfRoleItems.reduce(
    (roleObj, { type, arn, roleVersion, ...otherRoleAttributes }) => ({
      ...roleObj,
      ...otherRoleAttributes,
      version: roleVersion,
      [type]: arn,
    }),
    {
      prefix,
    },
  );

/** Converts accountRoles object into an array of ARNs
 * @param accountRoles object: https://gitlab.cee.redhat.com/service/uhc-clusters-service/-/merge_requests/3486
 * @returns
 * [
 *   { Installer: 'arn:..ManagedOpenShift-Installer-Role', ControlPlane: 'arn:...' ...},
 *   { Installer: 'arn:..croche-test-Installer-Role', ControlPlane: 'arn:...' ...}
 * ]
 */
export const normalizeAWSAccountRoles = (accountRoles) => {
  const normalizedRoles = [];

  (accountRoles?.items || []).forEach((accountRole) => {
    // Only use accountRoles that have more than 1 arn attached
    // This is to prevent managed policy roles created with an unsupported CLI version
    if (accountRole.items && accountRole.items.length > 1) {
      const managedPolicyArns = [];
      const unManagedPolicyArns = [];

      // Split into managed and unmanaged policy
      accountRole.items.forEach((item) => {
        if (item.hcpManagedPolicies || item.managedPolicies) {
          managedPolicyArns.push(item);
        } else {
          unManagedPolicyArns.push(item);
        }
      });
      if (managedPolicyArns.length) {
        normalizedRoles.push(normalizedAWSAccountRole(managedPolicyArns, accountRole.prefix));
      }
      if (unManagedPolicyArns.length) {
        normalizedRoles.push(normalizedAWSAccountRole(unManagedPolicyArns, accountRole.prefix));
      }
    }
  });
  return normalizedRoles;
};

export const getAWSBillingAccountIDs = (organizationID) => (dispatch) =>
  dispatch({
    type: GET_AWS_BILLING_ACCOUNTS,
    payload: accountsService.getOrganizationQuota(organizationID).then((response) => {
      if (!response.data || !response.data.items) {
        return [];
      }
      return getAwsBillingAccountsFromQuota(response.data.items);
    }),
  });

export const getAWSAccountIDs = (organizationID) => (dispatch) =>
  dispatch({
    type: LIST_ASSOCIATED_AWS_IDS,
    payload: accountsService.getOrganizationLabels(organizationID).then((response) => {
      if (!response.data || !response.data.items) {
        return [];
      }
      // "key": "sts_ocm_role",
      // value is a comma separated list of ARNs:
      // Ex: "value": "arn:aws:iam::268733382466:role/ManagedOpenShift-OCM-Role-15212158, ...",
      const stsOCMRoleLabel = response.data.items.filter((label) => label.key === 'sts_ocm_role');
      const stsOCMRoleValue = stsOCMRoleLabel[0]?.value ?? '';
      const arns = stsOCMRoleValue === '' ? [] : stsOCMRoleValue.split(',');
      const awsAccountIDs = getAWSIDsFromARNs(arns);
      return awsAccountIDs;
    }),
  });

export const getAWSAccountRolesARNs = (awsAccountID) => (dispatch) => {
  const accountRoles = [];
  dispatch({
    type: GET_AWS_ACCOUNT_ROLES_ARNS,
    payload: accountsService.getAWSAccountARNs(awsAccountID).then((response) => {
      if (!response.data || !response.data.items) {
        return accountRoles;
      }
      return normalizeAWSAccountRoles(response.data);
    }),
  });
};

export const getOCMRole = (awsAccountID) => (dispatch) => {
  dispatch({
    type: GET_OCM_ROLE,
    payload: accountsService.getOCMRole(awsAccountID).then((response) => response?.data),
  });
};

const fetchUserRolesByOCMAccountID = async () => {
  const ocmAccount = await accountsService.getCurrentAccount();
  const userRole = await accountsService.getUserRole(ocmAccount?.data?.id);
  return normalizeSTSUsersByAWSAccounts(userRole?.data.value);
};

export const getUserRole = () => ({
  type: GET_USER_ROLE,
  payload: fetchUserRolesByOCMAccountID(),
});

export const getUserOidcConfigurations = (awsAccountID) => ({
  type: LIST_USER_OIDC_CONFIGURATIONS,
  payload: clusterService
    .getOidcConfigurations(awsAccountID)
    .then((response) => response?.data?.items ?? []),
});

export const clearGetAWSAccountIDsResponse = () => ({
  type: CLEAR_GET_AWS_ACCOUNT_IDS_RESPONSE,
});

export const clearGetAWSAccountRolesARNsResponse = () => ({
  type: CLEAR_GET_AWS_ACCOUNT_ROLES_ARNS_RESPONSE,
});

export const clearGetOcmRoleResponse = () => ({
  type: CLEAR_GET_OCM_ROLE_RESPONSE,
});

export const clearGetUserRoleResponse = () => ({
  type: CLEAR_GET_USER_ROLE_RESPONSE,
});

export const setOfflineToken = (token) => ({
  type: SET_OFFLINE_TOKEN,
  payload: token,
});
