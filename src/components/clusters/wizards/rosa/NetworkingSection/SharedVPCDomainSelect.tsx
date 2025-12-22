import React from 'react';
import { FieldInputProps, FieldMetaProps } from 'formik';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useDispatch } from 'react-redux';

import { Button, Flex, FlexItem, FormGroup, Tooltip } from '@patternfly/react-core';
import { CopyIcon } from '@patternfly/react-icons/dist/esm/icons/copy-icon';
import { TrashIcon } from '@patternfly/react-icons/dist/esm/icons/trash-icon';

import { ocmResourceType } from '~/common/analytics';
import ErrorBox from '~/components/common/ErrorBox';
import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';
import { FuzzySelect, FuzzySelectProps } from '~/components/common/FuzzySelect/FuzzySelect';
import { dnsDomainsActions } from '~/redux/actions/dnsDomainsActions';
import { useGlobalState } from '~/redux/hooks';

import './SharedVPCDomainSelect.scss';

const PLACEHOLDER_TEXT = 'Select base DNS domain';
const CREATE_LOADER_TEXT = 'Reserving new base DNS domain...';
const DELETE_LOADER_TEXT = 'Deleting a base DNS domain...';

interface SharedVPCDomainSelectProps {
  label: string;
  input: FieldInputProps<string>;
  meta: FieldMetaProps<string>;
}

const SharedVPCDomainSelect = ({ label, input, meta }: SharedVPCDomainSelectProps) => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [actionText, setActionText] = React.useState<string>('');

  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(dnsDomainsActions.getAvailableSharedVpcDnsDomains());
    dispatch(dnsDomainsActions.clearLastCreatedBaseDnsDomain());
  }, [dispatch]);

  const dnsDomainsResponse = useGlobalState((state) => state.dnsDomains);
  const {
    pending,
    isUpdatingDomains,
    createdDnsId,
    deletedDnsId,
    items: dnsDomains = [],
  } = dnsDomainsResponse;

  const isDisabled = pending || isUpdatingDomains;

  React.useEffect(() => {
    // Select the newly created domain
    if (!isUpdatingDomains && createdDnsId && input.value !== createdDnsId) {
      input.onChange(createdDnsId);
      dispatch(dnsDomainsActions.clearLastCreatedBaseDnsDomain());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUpdatingDomains, createdDnsId, input.value, dispatch]);

  React.useEffect(() => {
    if (input.value === deletedDnsId) {
      input.onChange('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deletedDnsId]);

  const onSelect: FuzzySelectProps['onSelect'] = (_, selection) => {
    if (!isDisabled) {
      setIsOpen(false);
      input.onChange(selection);
    }
  };

  const onToggle: FuzzySelectProps['onOpenChange'] = (isOpen) => {
    if (!isDisabled) {
      setIsOpen(isOpen);
    }
  };

  const createNewDnsDomain = () => {
    // Clear the selection in case an error happens, users notice it
    input.onChange('');
    setIsOpen(false);
    setActionText(CREATE_LOADER_TEXT);
    dispatch(dnsDomainsActions.createNewBaseDnsDomain());
  };

  const deleteBaseDnsDomain = () => {
    const id = input.value;
    setActionText(DELETE_LOADER_TEXT);
    dispatch(dnsDomainsActions.deleteBaseDnsDomain(id));
  };

  const placeholderLabel = isUpdatingDomains ? actionText : PLACEHOLDER_TEXT;

  return (
    <FormGroup label={label} isRequired className="shared-vpc-domain-select">
      <Flex>
        <FlexItem flex={{ default: 'flex_1' }} className="pf-v6-u-m-0">
          <FuzzySelect
            selectionData={
              dnsDomains.map((domain: { id: string }) => ({
                entryId: domain.id as string,
                label: domain.id as string,
              })) ?? []
            }
            fuzziness={0}
            onSelect={onSelect}
            selectedEntryId={input.value}
            placeholderText={placeholderLabel}
            onOpenChange={onToggle}
            isDisabled={isDisabled}
            isOpen={isOpen}
            validated={input.value ? 'success' : undefined}
            footer={
              <Button
                isInline
                variant="link"
                className="pf-v6-u-py-sm"
                onClick={createNewDnsDomain}
                isDisabled={isDisabled}
              >
                Reserve new base DNS domain
              </Button>
            }
            inlineFilterPlaceholderText="Filter by domain name"
            isScrollable
            popperProps={{
              appendTo: () => document.body,
            }}
          />
        </FlexItem>

        <FlexItem grow={{ default: undefined }} className="dns-domain-action-icon">
          <CopyToClipboard text={input.value || ''}>
            <Button
              variant="control"
              type="button"
              aria-label="Copy DNS domain to clipboard"
              tabIndex={0}
              isAriaDisabled={!input.value}
              icon={<CopyIcon />}
            />
          </CopyToClipboard>
          <Tooltip content="Clicking the icon will permanently delete the selected Base DNS domain">
            <Button
              variant="tertiary"
              type="button"
              tabIndex={0}
              isAriaDisabled={!input.value}
              onClick={deleteBaseDnsDomain}
              icon={<TrashIcon />}
            >
              Delete
            </Button>
          </Tooltip>
        </FlexItem>
      </Flex>

      {!isUpdatingDomains && !createdDnsId && dnsDomainsResponse.error && (
        <ErrorBox
          message={`Error ${
            actionText === CREATE_LOADER_TEXT ? 'creating' : 'deleting'
          } the DNS domain`}
          response={dnsDomainsResponse}
          showCloseBtn
          onCloseAlert={() => {
            dispatch(dnsDomainsActions.clearLastCreatedBaseDnsDomain());
          }}
          analyticsType={`error-dns-domain-${actionText === CREATE_LOADER_TEXT ? 'create' : 'delete'}`}
          analyticsResourceType={ocmResourceType.MOA}
        />
      )}

      <FormGroupHelperText touched={meta.touched} error={meta.error} />
    </FormGroup>
  );
};

export default SharedVPCDomainSelect;
