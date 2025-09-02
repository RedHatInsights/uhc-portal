import React from 'react';
import { Field, Form, useField, useFormikContext } from 'formik';

import { Button, Popover, Stack, StackItem } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons/dist/esm/icons/outlined-question-circle-icon';

import links from '~/common/installLinks.mjs';
import { getAwsBillingAccountsFromQuota } from '~/components/clusters/common/quotaSelectors';
import { useFetchOrganizationQuota } from '~/queries/ClusterDetailsQueries/useFetchOrganizationQuota';
import { useGlobalState } from '~/redux/hooks/useGlobalState';

import { required } from '../../../../../../common/validators';
import ExternalLink from '../../../../../common/ExternalLink';
import AWSAccountSelection from '../../../../wizards/rosa/AccountsRolesScreen/AWSAccountSelection';
import { getContract } from '../../../../wizards/rosa/AccountsRolesScreen/AWSBillingAccount/awsBillingAccountHelper';
import ContractInfo from '../../../../wizards/rosa/AccountsRolesScreen/AWSBillingAccount/ContractInfo';

type AWSBillingAccountProps = {
  name: string;
  selectedAWSBillingAccountID: string;
};

export const AWSBillingAccountForm = ({
  name,
  selectedAWSBillingAccountID,
}: AWSBillingAccountProps) => {
  const organization = useGlobalState((state) => state.userProfile.organization);
  const { isLoading, data, isFetching, refetch } = useFetchOrganizationQuota(
    organization.details?.id || '',
  );
  const cloudAccounts = getAwsBillingAccountsFromQuota(data?.organizationQuota?.items);
  const [field, { error, touched }] = useField(name);
  const { setFieldValue } = useFormikContext();

  const connectNewAcctBtn = (
    <ExternalLink
      isButton={false}
      variant="link"
      className="pf-v6-u-mt-md"
      href={links.AWS_CONSOLE_ROSA_HOME}
      noIcon
    >
      Connect a new AWS billing account
    </ExternalLink>
  );

  const selectedAccount = cloudAccounts.find(
    (account) => account.cloud_account_id === selectedAWSBillingAccountID,
  );
  const selectedContract = selectedAccount ? getContract(selectedAccount) : null;

  return (
    <>
      <Form>
        <Field
          component={AWSAccountSelection}
          id={name}
          {...field}
          input={{
            name: { name },
            value: field.value,
            onBlur: () => {},
            onChange: (e: React.ChangeEvent<any>) => {
              setFieldValue(name, e);
            },
          }}
          meta={{
            touched,
            error,
          }}
          label="AWS billing account"
          validate={required}
          required
          refresh={{
            onRefresh: refetch,
            text: 'Refresh to view any new AWS billing accounts. It can take up to 5 minutes to sync new accounts.',
          }}
          extendedHelpText={
            <>
              Connect a new AWS billing account. To add a different AWS account, log in to the
              account, and click get started.
            </>
          }
          accounts={cloudAccounts}
          selectedAWSAccountID={field.value}
          // initialValue={selectedAWSBillingAccountID}
          isLoading={isLoading || isFetching}
          isDisabled={isLoading || isFetching}
          isBillingAccount
        />
      </Form>
      {selectedContract ? (
        <Stack>
          <StackItem>
            <Popover bodyContent={<ContractInfo contract={selectedContract} />}>
              <Button variant="link" icon={<OutlinedQuestionCircleIcon />}>
                Contract enabled for this billing account
              </Button>
            </Popover>
          </StackItem>
          <StackItem>{connectNewAcctBtn}</StackItem>
        </Stack>
      ) : (
        connectNewAcctBtn
      )}
    </>
  );
};
