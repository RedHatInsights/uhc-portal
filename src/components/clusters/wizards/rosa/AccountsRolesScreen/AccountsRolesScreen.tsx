/* eslint-disable camelcase */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Field } from 'formik';
import get from 'lodash/get';
import { useDispatch, useSelector } from 'react-redux';

import { Button, Content, ContentVariants, Form, Grid, GridItem } from '@patternfly/react-core';

import { trackEvents } from '~/common/analytics';
import { AWS_ACCOUNT_ROSA_LOCALSTORAGE_KEY } from '~/common/localStorageConstants';
import { required } from '~/common/validators';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { PrerequisitesInfoBox } from '~/components/clusters/wizards/rosa/common/PrerequisitesInfoBox';
import { WelcomeMessage } from '~/components/clusters/wizards/rosa/common/WelcomeMessage';
import ErrorBox from '~/components/common/ErrorBox';
import useAnalytics from '~/hooks/useAnalytics';
import { clearMachineTypesByRegion } from '~/redux/actions/machineTypesActions';
import { GlobalState } from '~/redux/stateTypes';

import { FieldId } from '../constants';

import AccountRolesARNsSection from './AccountRolesARNsSection/AccountRolesARNsSection';
import { useAssociateAWSAccountDrawer } from './AssociateAWSAccountDrawer/AssociateAWSAccountDrawer';
import AWSBillingAccount from './AWSBillingAccount/AWSBillingAccount';
import AWSAccountSelection from './AWSAccountSelection';
import { AwsRoleErrorAlert } from './AwsRoleErrorAlert';

export const isUserRoleForSelectedAWSAccount = (users: any[] | undefined, awsAcctId: any) =>
  users?.some((user: { aws_id: any }) => user.aws_id === awsAcctId);

export const getUserRoleForSelectedAWSAccount = (users: any[], awsAcctId: any) =>
  users.find((user: { aws_id: any }) => user.aws_id === awsAcctId);

export interface AccountsRolesScreenProps {
  getAWSAccountIDs: any;
  getAWSAccountIDsResponse: any;
  getAWSAccountRolesARNs: any;
  getAWSAccountRolesARNsResponse: any;
  getUserRoleResponse: any;
  clearGetAWSAccountIDsResponse: any;
  clearGetAWSAccountRolesARNsResponse: any;
  clearGetUserRoleResponse: any;
  organizationID: string;
  isHypershiftEnabled: boolean;
  isHypershiftSelected: boolean;
}

function AccountsRolesScreen({
  organizationID,
  getAWSAccountIDs,
  getAWSAccountIDsResponse,
  getAWSAccountRolesARNs,
  getAWSAccountRolesARNsResponse,
  getUserRoleResponse,
  clearGetAWSAccountRolesARNsResponse,
  clearGetAWSAccountIDsResponse,
  clearGetUserRoleResponse,
  isHypershiftEnabled,
  isHypershiftSelected,
}: AccountsRolesScreenProps) {
  const {
    setFieldValue,
    getFieldProps,
    getFieldMeta,
    values: {
      [FieldId.AssociatedAwsId]: selectedAWSAccountID,
      [FieldId.BillingAccountId]: selectedAWSBillingAccountID,
      [FieldId.InstallerRoleArn]: selectedInstallerRoleARN,
      [FieldId.RosaMaxOsVersion]: rosaMaxOSVersion,
    },
  } = useFormState();
  const [AWSAccountIDs, setAWSAccountIDs] = useState<string[]>([]);
  const [hasFinishedLoading, setHasFinishedLoading] = useState<boolean>(false);
  const [noUserForSelectedAWSAcct, setNoUserForSelectedAWSAcct] = useState(false);
  const [refreshButtonClicked, setRefreshButtonClicked] = useState(false);
  const isAWSDataPending = useMemo(
    () => getAWSAccountIDsResponse.pending || getAWSAccountRolesARNsResponse.pending,
    [getAWSAccountIDsResponse.pending, getAWSAccountRolesARNsResponse.pending],
  );

  const openDrawerButtonRef = useRef(null);
  const hasAWSAccounts = AWSAccountIDs.length > 0;
  const track = useAnalytics();
  const { openDrawer } = useAssociateAWSAccountDrawer(isHypershiftSelected);

  const machineTypesByRegion = useSelector((state: GlobalState) => state.machineTypesByRegion);
  const dispatch = useDispatch();

  // clear machineTypeByRegion cache when credentials change
  React.useEffect(() => {
    if (machineTypesByRegion.region) {
      dispatch(clearMachineTypesByRegion());
    }
  });

  const resetAWSAccountFields = () => {
    // clear certain responses; causes refetch of AWS acct info.
    clearGetAWSAccountIDsResponse();
    clearGetAWSAccountRolesARNsResponse();
    clearGetUserRoleResponse();
  };

  const resetUserRoleFields = () => {
    setNoUserForSelectedAWSAcct(false);
    clearGetUserRoleResponse();
  };

  // default product and cloud_provider form values
  useEffect(() => {
    resetAWSAccountFields();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (getUserRoleResponse.fulfilled && selectedAWSAccountID) {
      const found = isUserRoleForSelectedAWSAccount(getUserRoleResponse.data, selectedAWSAccountID);
      setNoUserForSelectedAWSAcct(!found);
      clearGetUserRoleResponse();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getUserRoleResponse.fulfilled, selectedAWSAccountID]);

  // if aws acct ids default to first available aws account
  useEffect(() => {
    if (hasAWSAccounts && !selectedAWSAccountID) {
      let selectedAWSAccountID = localStorage.getItem(AWS_ACCOUNT_ROSA_LOCALSTORAGE_KEY);
      if (!selectedAWSAccountID || !AWSAccountIDs.includes(selectedAWSAccountID)) {
        [selectedAWSAccountID] = AWSAccountIDs;
      }
      setFieldValue(FieldId.AssociatedAwsId, selectedAWSAccountID);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAWSAccounts, selectedAWSAccountID]);

  useEffect(() => {
    if (getAWSAccountIDsResponse.pending) {
      setHasFinishedLoading(false);
    } else if (getAWSAccountIDsResponse.fulfilled) {
      const awsIDs = get(getAWSAccountIDsResponse, 'data', []);
      setAWSAccountIDs(awsIDs);
      // Reset a previous, invalid selection
      if (selectedAWSAccountID && !awsIDs.includes(selectedAWSAccountID)) {
        setFieldValue(FieldId.AssociatedAwsId, '');
      }
      setHasFinishedLoading(true);
    } else if (getAWSAccountIDsResponse.error) {
      setHasFinishedLoading(true);
    } else {
      getAWSAccountIDs(organizationID);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAWSAccountIDsResponse]);

  useEffect(() => {
    if (getUserRoleResponse?.error || noUserForSelectedAWSAcct) {
      track(trackEvents.MissingUserRole);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getUserRoleResponse?.error, noUserForSelectedAWSAcct]);

  const onClick = useCallback(
    (event: any) => {
      openDrawer({ focusOnClose: event.target, onClose: clearGetAWSAccountIDsResponse });
    },
    [clearGetAWSAccountIDsResponse, openDrawer],
  );

  return (
    <Form onSubmit={() => false}>
      <Grid hasGutter className="pf-v6-u-mt-md">
        {!isHypershiftEnabled && (
          <>
            <GridItem span={12}>
              <WelcomeMessage />
            </GridItem>
            <GridItem span={12}>
              <PrerequisitesInfoBox showRosaCliRequirement={false} />
            </GridItem>
          </>
        )}
        <GridItem span={8}>
          <Content>
            <Content component={ContentVariants.h3}>AWS infrastructure account</Content>
            <Content component={ContentVariants.p}>
              Select an AWS account that is associated with your Red Hat account or associate a new
              account. This account will contain the ROSA infrastructure.
            </Content>
          </Content>
        </GridItem>
        <GridItem span={4} />
        <GridItem sm={12} md={7}>
          {getAWSAccountIDsResponse.error ? (
            <ErrorBox
              message="Error getting associated AWS account id(s)"
              response={getAWSAccountIDsResponse}
            />
          ) : null}
          <Field
            component={AWSAccountSelection}
            name={FieldId.AssociatedAwsId}
            input={{
              // name, value, onBlur, onChange
              ...getFieldProps(FieldId.AssociatedAwsId),
              onChange: (value: string) => setFieldValue(FieldId.AssociatedAwsId, value),
            }}
            meta={getFieldMeta(FieldId.AssociatedAwsId)}
            label="Associated AWS infrastructure account"
            refresh={{
              onRefresh: () => {
                setRefreshButtonClicked(true);
                resetAWSAccountFields();
              },
              text: 'Refresh to view newly associated AWS accounts and account-roles.',
            }}
            validate={hasFinishedLoading ? required : undefined}
            extendedHelpText={
              <>
                A list of associated AWS infrastructure accounts. You must associate at least one
                account to proceed.
              </>
            }
            accounts={AWSAccountIDs.map((account) => ({ cloud_account_id: account }))}
            selectedAWSAccountID={selectedAWSAccountID}
            isLoading={refreshButtonClicked && isAWSDataPending}
            isDisabled={isAWSDataPending}
            clearGetAWSAccountIDsResponse={clearGetAWSAccountIDsResponse}
          />
          <Button
            variant="secondary"
            className="pf-v6-u-mt-md"
            data-testid="launch-associate-account-btn"
            ref={openDrawerButtonRef}
            onClick={onClick}
          >
            How to associate a new AWS account
          </Button>
        </GridItem>
        <GridItem span={7} />
        {isHypershiftSelected && (
          <AWSBillingAccount
            selectedAWSBillingAccountID={selectedAWSBillingAccountID || ''}
            selectedAWSAccountID={selectedAWSAccountID || ''}
          />
        )}
        {selectedAWSAccountID && hasAWSAccounts && (
          <AccountRolesARNsSection
            selectedAWSAccountID={selectedAWSAccountID}
            selectedInstallerRoleARN={selectedInstallerRoleARN}
            rosaMaxOSVersion={rosaMaxOSVersion}
            getAWSAccountRolesARNs={getAWSAccountRolesARNs}
            getAWSAccountRolesARNsResponse={getAWSAccountRolesARNsResponse}
            clearGetAWSAccountRolesARNsResponse={clearGetAWSAccountRolesARNsResponse}
            isHypershiftSelected={isHypershiftSelected}
            onAccountChanged={resetUserRoleFields}
          />
        )}

        {(getUserRoleResponse?.error || noUserForSelectedAWSAcct) && (
          <GridItem span={8} className="pf-v6-u-mt-sm">
            <AwsRoleErrorAlert title="A user-role could not be detected" targetRole="user" />
          </GridItem>
        )}
      </Grid>
    </Form>
  );
}

export default AccountsRolesScreen;
