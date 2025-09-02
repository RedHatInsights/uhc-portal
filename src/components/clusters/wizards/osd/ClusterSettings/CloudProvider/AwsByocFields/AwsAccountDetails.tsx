import React from 'react';
import { useDispatch } from 'react-redux';

import { Alert, Flex, Grid, GridItem, Title } from '@patternfly/react-core';

import links from '~/common/installLinks.mjs';
import { awsNumericAccountID, required } from '~/common/validators';
import {
  billingModelConstants,
  constants,
} from '~/components/clusters/common/CreateOSDFormConstants';
import { CheckboxField, TextInputField } from '~/components/clusters/wizards/form';
import { FieldId } from '~/components/clusters/wizards/osd/constants';
import ExternalLink from '~/components/common/ExternalLink';
import InstructionCommand from '~/components/common/InstructionCommand';
import { clearMachineTypesByRegion } from '~/redux/actions/machineTypesActions';
import { useGlobalState } from '~/redux/hooks/useGlobalState';

export const AwsAccountDetails = () => {
  const { ccsCredentialsValidity } = useGlobalState((state) => state.ccsInquiries);
  const machineTypesByRegion = useGlobalState((state) => state.machineTypesByRegion);
  const { pending: isValidating } = ccsCredentialsValidity;
  const dispatch = useDispatch();

  // clear machineTypeByRegion cache when credentials change
  const clearMachineTypes = React.useCallback(() => {
    if (machineTypesByRegion.region) {
      dispatch(clearMachineTypesByRegion());
    }
  }, [dispatch, machineTypesByRegion.region]);

  return (
    <Grid hasGutter md={6}>
      <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsLg' }}>
        <GridItem>
          <TextInputField
            name={FieldId.AccountId}
            label="AWS account ID"
            validate={awsNumericAccountID}
            isDisabled={isValidating}
            onChange={clearMachineTypes}
            tooltipWidth="27rem"
            tooltip={
              <>
                <p>
                  Find your 12-digit AWS account ID in the AWS console or by running this command in
                  the AWS CLI:
                </p>
                <br />
                <InstructionCommand textAriaLabel="Copyable AWS account ID command">
                  aws sts get-caller-identity
                </InstructionCommand>
                <br />
                <ExternalLink href={links.FINDING_AWS_ACCOUNT_IDENTIFIERS}>
                  Finding your AWS account ID
                </ExternalLink>
              </>
            }
          />
        </GridItem>

        <GridItem>
          <Title headingLevel="h4">AWS IAM user credentials</Title>
        </GridItem>

        <GridItem>
          <Alert
            className="bottom-alert pf-v6-u-mt-0"
            variant="warning"
            title={billingModelConstants.awsCredentialsWarning}
            isInline
          />
        </GridItem>

        <GridItem>
          <TextInputField
            name={FieldId.AccessKeyId}
            label="AWS access key ID"
            validate={required}
            isDisabled={isValidating}
            helperText={isValidating ? 'Validating...' : ''}
            onChange={clearMachineTypes}
          />
        </GridItem>

        <GridItem>
          <TextInputField
            name={FieldId.SecretAccessKey}
            label="AWS secret access key"
            validate={required}
            isDisabled={isValidating}
            helperText={isValidating ? 'Validating...' : ''}
            type="password"
            onChange={clearMachineTypes}
          />
        </GridItem>

        <GridItem>
          <CheckboxField
            name={FieldId.DisableScpChecks}
            label="Bypass AWS service control policy (SCP) checks"
            tooltip={constants.bypassSCPChecksHint}
          />
        </GridItem>
      </Flex>
    </Grid>
  );
};
