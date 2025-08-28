import React, { useCallback, useEffect, useState } from 'react';
import { Field } from 'formik';
import { useDispatch } from 'react-redux';

import {
  Alert,
  AlertVariant,
  Button,
  Content,
  ContentVariants,
  GridItem,
  Popover,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons/dist/esm/icons/outlined-question-circle-icon';

import { shouldRefetchQuota } from '~/common/helpers';
import links from '~/common/installLinks.mjs';
import { getAwsBillingAccountsFromQuota } from '~/components/clusters/common/quotaSelectors';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { useGlobalState } from '~/redux/hooks/useGlobalState';
import { CloudAccount } from '~/types/accounts_mgmt.v1';

import { required } from '../../../../../../common/validators';
import { getAWSBillingAccountIDs } from '../../../../../../redux/actions/rosaActions';
import ErrorBox from '../../../../../common/ErrorBox';
import ExternalLink from '../../../../../common/ExternalLink';
import { FieldId } from '../../constants';
import AWSAccountSelection from '../AWSAccountSelection';

import { getContract } from './awsBillingAccountHelper';
import ContractInfo from './ContractInfo';

interface AWSBillingAccountProps {
  selectedAWSBillingAccountID: string;
  selectedAWSAccountID: string;
}

const AWSBillingAccount = ({
  selectedAWSBillingAccountID,
  selectedAWSAccountID,
}: AWSBillingAccountProps) => {
  const { setFieldValue, getFieldProps, getFieldMeta, setFieldTouched } = useFormState();
  const dispatch = useDispatch();
  const organization = useGlobalState((state) => state.userProfile.organization);
  const getAWSBillingAccountsResponse = useGlobalState(
    (state) => state.rosaReducer.getAWSBillingAccountsResponse,
  );

  const [cloudAccounts, setCloudAccounts] = useState<CloudAccount[]>([]);

  const refresh = useCallback(() => {
    dispatch(getAWSBillingAccountIDs(organization.details?.id) as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    // if there is (recent) quota data in global state
    if (!shouldRefetchQuota(organization)) {
      // extract billing accounts out of it
      setCloudAccounts(getAwsBillingAccountsFromQuota(organization.quotaList?.items));
    } else {
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (getAWSBillingAccountsResponse.fulfilled) {
      setCloudAccounts(getAWSBillingAccountsResponse.data);
      // if selected account is not on the list after refresh
      if (
        selectedAWSBillingAccountID &&
        !getAWSBillingAccountsResponse.data.some(
          (account: CloudAccount) => account.cloud_account_id === selectedAWSBillingAccountID,
        )
      ) {
        // reset the field
        setFieldValue(FieldId.BillingAccountId, '');
        setFieldTouched(FieldId.BillingAccountId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAWSBillingAccountsResponse]);

  // if there's only one account, select it by default
  useEffect(() => {
    if (cloudAccounts?.length === 1 && !selectedAWSBillingAccountID) {
      setFieldValue(FieldId.BillingAccountId, cloudAccounts[0].cloud_account_id || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloudAccounts, selectedAWSBillingAccountID]);

  const connectNewAcctBtn = (
    <ExternalLink
      isButton
      variant="secondary"
      className="pf-v6-u-mt-md"
      href={links.AWS_CONSOLE_ROSA_HOME}
      noIcon
    >
      Connect ROSA to a new AWS billing account
    </ExternalLink>
  );

  const selectedAccount = cloudAccounts.find(
    (account) => account.cloud_account_id === selectedAWSBillingAccountID,
  );
  const selectedContract = selectedAccount ? getContract(selectedAccount) : null;

  return (
    <>
      <GridItem span={8}>
        <Title headingLevel="h3">AWS billing account</Title>
        <Content component={ContentVariants.p}>
          This account will be charged for your subscription usage. You can select an already
          connected AWS account or sign in to a different AWS account that you want to connect to
          ROSA.
        </Content>
      </GridItem>
      <GridItem span={4} />
      <GridItem sm={12} md={7}>
        {(organization.error || getAWSBillingAccountsResponse.error) && (
          <ErrorBox
            message="Error getting associated AWS billing account id(s)"
            response={organization.error ? organization : getAWSBillingAccountsResponse}
          />
        )}
        <Field
          component={AWSAccountSelection}
          name={FieldId.BillingAccountId}
          input={{
            // name, value, onBlur, onChange
            ...getFieldProps(FieldId.BillingAccountId),
            onChange: (value: string) => setFieldValue(FieldId.BillingAccountId, value),
          }}
          meta={getFieldMeta(FieldId.BillingAccountId)}
          label="AWS billing account"
          validate={required}
          required
          refresh={{
            onRefresh: refresh,
            text: 'Refresh to view any new AWS billing accounts. It can take up to 5 minutes to sync new accounts.',
          }}
          extendedHelpText={
            <>
              Connect ROSA to a new billing account. To add a different AWS account, log in to the
              account, and click get started.
            </>
          }
          accounts={cloudAccounts}
          selectedAWSAccountID={selectedAWSBillingAccountID}
          isLoading={organization.pending || getAWSBillingAccountsResponse.pending}
          isDisabled={organization.pending || getAWSBillingAccountsResponse.pending}
          isBillingAccount
        />
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
      </GridItem>
      <GridItem span={7} />
      <GridItem sm={12} md={12}>
        {selectedAWSBillingAccountID !== selectedAWSAccountID &&
        selectedAWSBillingAccountID &&
        selectedAWSAccountID ? (
          <Alert
            isInline
            variant={AlertVariant.info}
            component="p"
            role="alert"
            title="The selected AWS billing account is a different account than your AWS infrastructure account.
            The AWS billing account will be charged for subscription usage.  The AWS infrastructure account will be used for managing the cluster."
          />
        ) : null}
      </GridItem>
    </>
  );
};

export default AWSBillingAccount;
