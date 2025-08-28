// a Field-compatible component for selecting an associated AWS account id

import React, { createRef, ReactElement, useCallback, useEffect, useMemo, useState } from 'react';

import {
  Button,
  ButtonProps,
  EmptyState,
  EmptyStateBody,
  Flex,
  FlexItem,
  FormGroup,
  Tooltip,
} from '@patternfly/react-core';

import links from '~/common/installLinks.mjs';
import { AWS_ACCOUNT_ROSA_LOCALSTORAGE_KEY } from '~/common/localStorageConstants';
import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';
import { FuzzyDataType, FuzzyEntryType } from '~/components/common/FuzzySelect/types';
import { CloudAccount } from '~/types/accounts_mgmt.v1';

import { FuzzySelect } from '../../../../common/FuzzySelect/FuzzySelect';
import PopoverHint from '../../../../common/PopoverHint';

import { useAssociateAWSAccountDrawer } from './AssociateAWSAccountDrawer/AssociateAWSAccountDrawer';
import { getContract } from './AWSBillingAccount/awsBillingAccountHelper';

import './AccountsRolesScreen.scss';

const AWS_ACCT_ID_PLACEHOLDER = 'Select an account';

function NoAssociatedAWSAccounts() {
  return (
    <EmptyState
      headingLevel="h6"
      titleText="No associated accounts were found."
      data-testid="no_associated_accounts"
      className="no-associated-aws-accounts_empty-state"
    >
      <EmptyStateBody>Associate an AWS account to your Red Hat account.</EmptyStateBody>
    </EmptyState>
  );
}

function sortFn(a: FuzzyEntryType, b: FuzzyEntryType) {
  const ret = b.label.length - a.label.length;
  return ret || b.label.localeCompare(a.label);
}
export interface AWSAccountSelectionProps {
  input: {
    name: string;
    value?: string;
    onChange?: any;
    onBlur: any;
  };
  meta: {
    touched?: boolean;
    error?: string;
  };
  isDisabled?: boolean;
  isLoading?: boolean;
  label?: string;
  extendedHelpText: string | ReactElement;
  accounts: CloudAccount[];
  selectedAWSAccountID?: string;
  initialValue?: string;
  refresh: {
    onRefresh: any;
    text: string;
  };
  isBillingAccount?: boolean;
  clearGetAWSAccountIDsResponse: () => void;
  required?: boolean;
}

function AWSAccountSelection({
  input: {
    name,
    // onBlur interferes with Patternfly's Select footer onClick handlers.
    onBlur: _onBlur,
    ...inputProps
  },
  meta: { error, touched },
  isDisabled,
  isLoading,
  label,
  extendedHelpText,
  selectedAWSAccountID,
  accounts,
  isBillingAccount = false,
  refresh,
  clearGetAWSAccountIDsResponse,
  required = true,
}: AWSAccountSelectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const associateAWSAccountBtnRef = createRef<HTMLInputElement>();
  const hasAWSAccounts = accounts?.length > 0;
  const { onRefresh, text } = refresh;
  const { onChange } = inputProps;
  const { openDrawer } = useAssociateAWSAccountDrawer();

  useEffect(() => {
    // only scroll to associateAWSAccountBtn when no AWS accounts
    if (isOpen === true && !hasAWSAccounts) {
      associateAWSAccountBtnRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, hasAWSAccounts]);

  const onToggle = useCallback(
    (toggleOpenValue: boolean) => {
      setIsOpen(toggleOpenValue);
    },
    [setIsOpen],
  );

  const onSelect = useCallback(
    (_: any, selection: any) => {
      setIsOpen(false);
      onChange(selection);
      localStorage.setItem(AWS_ACCOUNT_ROSA_LOCALSTORAGE_KEY, selection);
    },
    [setIsOpen, onChange],
  );

  const selectionData = useMemo<FuzzyDataType>(
    () =>
      accounts.map((cloudAccount) => {
        const accountId = cloudAccount.cloud_account_id as string;
        return {
          entryId: accountId,
          label: accountId,
          description: isBillingAccount && !!getContract(cloudAccount) ? 'Contract enabled' : '',
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accounts],
  );

  const onClick = useCallback(() => {
    // close dropdown
    setIsOpen(false);
    // will cause window reload on first time, then open assoc aws modal with new token
    openDrawer({ onClose: clearGetAWSAccountIDsResponse });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openDrawer, setIsOpen]);

  const footer = useMemo<ReactElement>(() => {
    const btnProps: ButtonProps = isBillingAccount
      ? {
          component: 'a',
          href: links.AWS_CONSOLE_ROSA_HOME,
          target: '_blank',
        }
      : {
          onClick,
        };

    return (
      <>
        {!hasAWSAccounts && <NoAssociatedAWSAccounts />}
        <Button ref={associateAWSAccountBtnRef} variant="secondary" {...btnProps}>
          {isBillingAccount
            ? 'Connect ROSA to a new AWS billing account'
            : 'How to associate a new AWS account'}
        </Button>
      </>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAWSAccounts, isBillingAccount, associateAWSAccountBtnRef]);

  return (
    <FormGroup
      label={label}
      labelHelp={extendedHelpText ? <PopoverHint hint={extendedHelpText} /> : undefined}
      className="aws-account-selection"
      isRequired
    >
      <Flex>
        <FlexItem grow={{ default: 'grow' }}>
          <FuzzySelect
            isOpen={isOpen}
            selectedEntryId={hasAWSAccounts ? selectedAWSAccountID : ''}
            selectionData={selectionData}
            onOpenChange={onToggle}
            onSelect={onSelect}
            sortFn={sortFn}
            isDisabled={isDisabled}
            placeholderText={AWS_ACCT_ID_PLACEHOLDER}
            inlineFilterPlaceholderText="Filter by account ID"
            filterValidate={{ pattern: /^\d*$/, message: 'Please enter numeric digits only.' }}
            validated={touched && error ? 'danger' : undefined}
            footer={footer}
            aria-describedby="aws-infra-accounts"
            toggleId={name}
            popperProps={{
              appendTo: document.body,
            }}
          />
        </FlexItem>
        {onRefresh && (
          <FlexItem>
            <Tooltip content={<p>{text}</p>}>
              <Button
                data-testid="refresh-aws-accounts"
                isLoading={isLoading}
                isDisabled={isDisabled}
                isInline
                size="sm"
                variant="secondary"
                onClick={() => {
                  onRefresh();
                }}
              >
                Refresh
              </Button>
            </Tooltip>
          </FlexItem>
        )}
      </Flex>

      <FormGroupHelperText touched={touched} error={error} />
    </FormGroup>
  );
}

export { AWS_ACCT_ID_PLACEHOLDER };

export default AWSAccountSelection;
