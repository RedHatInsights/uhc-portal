import React from 'react';
import PropTypes from 'prop-types';

// import semver from 'semver';
import { ClipboardCopy, Content } from '@patternfly/react-core';

import { getAWSAccountID, getOIDCEndpointNoScheme, getOIDCProviderARN } from './rosaUtils';

// Map of operator role namesapces to role name and policy ARN CloudFormation
// parameter keys.
const parameterKeys = {
  'openshift-cloud-credential-operator': {
    nameKey: 'CloudCredentialOperatorRoleName',
    policyARNKey: 'CloudCredentialOperatorPolicyARN',
  },
  'openshift-cluster-csi-drivers': {
    nameKey: 'ClusterCSIDriverEBSRoleName',
    policyARNKey: 'ClusterCSIDriverEBSPolicyARN',
  },
  'openshift-cloud-network-config-controller': {
    nameKey: 'NetworkConfigControllerRoleName',
    policyARNKey: 'NetworkConfigControllerPolicyARN',
  },
  'openshift-image-registry': {
    nameKey: 'ImageRegistryOperatorRoleName',
    policyARNKey: 'ImageRegistryOperatorPolicyARN',
  },
  'openshift-ingress-operator': {
    nameKey: 'IngressOperatorRoleName',
    policyARNKey: 'IngressOperatorPolicyARN',
  },
  'openshift-machine-api': {
    nameKey: 'MachineAPIOperatorRoleName',
    policyARNKey: 'MachineAPIOperatorPolicyARN',
  },
};

function getCloudFormationTemplateURL(cluster, template) {
  // const { major, minor } = semver.coerce(cluster.version.raw_id);
  // return `https://example.com/${major}.${minor}/${template}`;
  // TODO: Replace template file with template URL when available.
  return `file://templates/cloudformation/${template}`;
}

// Return the fully-qualified name from the operator role ARN.
// In: 'arn:aws:iam::123456789012:role/cluster-test-openshift-machine-api-aws-cloud-credentials'
// Out: 'cluster-test-openshift-machine-api-aws-cloud-credentials'
function getFullRoleName(role) {
  return role.role_arn.split('/')[1];
}

// Get the account role prefix from the installer role ARN.
// In: 'arn:aws:iam::123456789012:role/ManagedOpenShift-Installer-Role',
// Out: 'ManagedOpenShift'
function getAccountRolePrefix(cluster) {
  return cluster.aws.sts.role_arn.split('/')[1].replace(/-Installer-Role$/, '');
}

// Build the policy ARN for this operator role.
function getRolePolicyARN(cluster, role) {
  const accountID = getAWSAccountID(cluster);
  const prefix = getAccountRolePrefix(cluster);
  const policy = `${prefix}-${role.namespace}-${role.name}`.substring(0, 64);
  return `arn:aws:iam::${accountID}:policy/${policy}`;
}

function getOperatorRoleParameters(cluster) {
  const parameters = cluster.aws.sts.operator_iam_roles.reduce((acc, role) => {
    const { nameKey, policyARNKey } = parameterKeys[role.namespace] || {};
    return [
      ...acc,
      `\
ParameterKey=${nameKey},ParameterValue=${getFullRoleName(role)} \
ParameterKey=${policyARNKey},ParameterValue=${getRolePolicyARN(cluster, role)}`,
    ];
  }, []);
  return parameters.join(' ');
}

function CloudFormationTab({ cluster }) {
  return (
    <Content>
      <p>Copy and run the following commands:</p>
      <div>
        <ClipboardCopy isReadOnly>
          {`\
aws cloudformation create-stack \
--stack-name operator-roles-${cluster.id} \
--template-body ${getCloudFormationTemplateURL(cluster, 'openshift_operator_roles.json')} \
--parameters \
ParameterKey=OIDCProviderARN,ParameterValue=${getOIDCProviderARN(cluster)} \
ParameterKey=IssuerURL,ParameterValue=${getOIDCEndpointNoScheme(cluster)} \
${getOperatorRoleParameters(cluster)} \
--region ${cluster.region.id} \
--capabilities CAPABILITY_NAMED_IAM`}
        </ClipboardCopy>
      </div>
      <div>
        <ClipboardCopy isReadOnly>
          {`\
aws cloudformation create-stack \
--stack-name oidc-provider-${cluster.id} \
--template-body ${getCloudFormationTemplateURL(cluster, 'openshift_oidc_provider.json')} \
--parameters \
ParameterKey=IssuerURL,ParameterValue=${cluster.aws.sts.oidc_endpoint_url} \
--region ${cluster.region.id}`}
        </ClipboardCopy>
      </div>
    </Content>
  );
}

CloudFormationTab.propTypes = {
  cluster: PropTypes.object.isRequired,
};

export { getAWSAccountID, getOIDCEndpointNoScheme, getOIDCProviderARN, getAccountRolePrefix };
export default CloudFormationTab;
