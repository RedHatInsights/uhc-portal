import React from 'react';
import FileSaver from 'file-saver';
import JSZip from 'jszip';
import PropTypes from 'prop-types';

import {
  Alert,
  Button,
  Content,
  ContentVariants,
  ExpandableSection,
  List,
  ListItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import { accountsService, clusterService } from '../../../../services';

import { getAWSAccountID, getOIDCEndpointNoScheme, getOIDCProviderARN } from './rosaUtils';

function AWSCLITab({ cluster }) {
  const [commands, setCommands] = React.useState();
  const [policies, setPolicies] = React.useState();
  const [credentialRequests, setCredentialRequests] = React.useState();
  const [error, setError] = React.useState('');
  const [errorReason, setErrorReason] = React.useState();

  // We're ready when everything we need loads.
  const ready = commands && policies && credentialRequests;

  React.useEffect(() => {
    const accountID = getAWSAccountID(cluster);
    clusterService
      .getOperatorRoleCommands(accountID, cluster.id, cluster.aws.sts.role_arn)
      .then((response) => {
        setCommands(response.data.commands);
      })
      .catch((e) => {
        setError(e.message || 'Could not fetch commands.');
        const errorReason = e.response.data.details?.[0].Error_Key ?? e.response.data.reason;
        if (errorReason) setErrorReason(errorReason);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    accountsService
      .getPolicies()
      .then((response) => {
        setPolicies(response.data.items);
      })
      .catch((e) => {
        setError(e.message || 'Could not fetch policies.');
      });
  }, []);

  React.useEffect(() => {
    accountsService
      .getCredentialRequests()
      .then((response) => {
        setCredentialRequests(response.data.items);
      })
      .catch((e) => {
        setError(e.message || 'Could not fetch credential requests.');
      });
  }, []);

  function generateRolePolicyFiles() {
    // Find the operator role policy in the resposne.
    const policyTemplate = policies.find(({ id }) => id === 'operator_iam_role_policy');
    const issuer = getOIDCEndpointNoScheme(cluster);
    const oidcProviderARN = getOIDCProviderARN(cluster);
    return cluster.aws.sts.operator_iam_roles.map((role) => {
      const request = credentialRequests.find(
        (r) => r.operator.name === role.name && r.operator.namespace === role.namespace,
      );
      const serviceAccounts = request.operator.service_accounts.map(
        (sa) => `system:serviceaccount:${role.namespace}:${sa}`,
      );
      return {
        // Filename must match the pattern used in the sts_commands response.
        filename: `operator_${request.name}_policy.json`,
        // Replace the variables in the policy template with the values for this
        // cluster. Example policy template:
        // {
        //   "Version": "2012-10-17",
        //   "Statement": [
        //     {
        //       "Action": [
        //         "sts:AssumeRoleWithWebIdentity"
        //       ],
        //       "Effect": "Allow",
        //       "Condition": {
        //         "StringEquals": {
        //           "%{issuer_url}:sub": [
        //             "%{service_accounts}"
        //           ]
        //         }
        //       },
        //       "Principal": {
        //         "Federated": "%{oidc_provider_arn}"
        //       }
        //     }
        //   ]
        // }
        content: policyTemplate.details
          .replace('%{issuer_url}', issuer)
          .replace('%{service_accounts}', serviceAccounts.join('", "'))
          .replace('%{oidc_provider_arn}', oidcProviderARN),
      };
    });
  }

  const downloadZip = async () => {
    try {
      const zip = new JSZip();
      zip.file(
        'README',
        `\
To create the operator roles and OIDC provider for your ROSA cluster, run the
AWS commands from commands.txt in the directory containing the policy files
extracted from the ZIP. Cluster installation will continue automatically when
the roles and OIDC provider are available.
`,
      );
      zip.file('commands.txt', commands.map(({ command }) => command).join('\n\n'));
      const policyFiles = generateRolePolicyFiles();
      policyFiles.forEach(({ filename, content }) => {
        zip.file(filename, content);
      });
      const content = await zip.generateAsync({ type: 'blob' });
      FileSaver.saveAs(content, `${cluster.name}-manual-commands.zip`);
    } catch (e) {
      setError(e.message || 'An error occurred creating the ZIP file.');
    }
  };

  return (
    <Stack hasGutter>
      {error && (
        <StackItem>
          <Alert isInline variant="danger" title="Something went wrong">
            <List isPlain>
              <ListItem>{error}</ListItem>
              <ListItem>
                You will need to use {/* either AWS CloudFormation or */} the ROSA CLI to create the
                operator roles and OIDC provider.
              </ListItem>
              {errorReason ? (
                <ListItem>
                  <ExpandableSection
                    toggleTextExpanded="Show less"
                    toggleTextCollapsed="Show more"
                    isIndented
                  >
                    {errorReason}
                  </ExpandableSection>
                </ListItem>
              ) : null}
            </List>
          </Alert>
        </StackItem>
      )}
      <StackItem>
        <Content>
          <Content component={ContentVariants.ol}>
            <Content component="li">Download and extract the following .zip file.</Content>
            <Content component="li">
              In the AWS CLI, run the commands with the included policy files to create the operator
              roles and OIDC provider.
            </Content>
          </Content>
          <Button variant="secondary" onClick={downloadZip} isDisabled={!ready}>
            {ready ? <>Download .zip</> : <>Preparing .zip</>}
          </Button>
        </Content>
      </StackItem>
    </Stack>
  );
}

AWSCLITab.propTypes = {
  cluster: PropTypes.object.isRequired,
};

export default AWSCLITab;
