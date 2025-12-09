import React, { useEffect, useMemo, useState } from 'react';
import { Field } from 'formik';
import PropTypes from 'prop-types';

import {
  Button,
  ClipboardCopy,
  ClipboardCopyVariant,
  Content,
  ContentVariants,
  Flex,
  FlexItem,
  FormGroup,
  Popover,
  Skeleton,
} from '@patternfly/react-core';

import { useFormState } from '~/components/clusters/wizards/hooks';
import { FieldId } from '~/components/clusters/wizards/rosa/constants';
import ExternalLink from '~/components/common/ExternalLink';
import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';
import { FuzzySelect } from '~/components/common/FuzzySelect/FuzzySelect';
import Instruction from '~/components/common/Instruction';
import Instructions from '~/components/common/Instructions';
import PopoverHint from '~/components/common/PopoverHint';
import {
  refetchGetUserOidcConfigurations,
  useFetchGetUserOidcConfigurations,
} from '~/queries/RosaWizardQueries/useFetchGetUserOidcConfigurations';

import links from '../../../../../common/installLinks.mjs';
import validators, {
  MAX_CUSTOM_OPERATOR_ROLES_PREFIX_LENGTH,
} from '../../../../../common/validators';
import ReduxVerticalFormGroup from '../../../../common/ReduxFormComponents_deprecated/ReduxVerticalFormGroup';

import './CustomerOIDCConfiguration.scss';

function CreateOIDCProviderInstructions({ isMultiRegionEnabled, regionLoginCommand }) {
  return (
    <Popover
      aria-label="oidc-creation-instructions"
      position="top"
      maxWidth="25rem"
      style={{ '--pf-v6-c-popover--c-button--sibling--PaddingRight': '2rem' }}
      bodyContent={
        <Content>
          <p>
            Create a new OIDC config ID by running the following command
            {isMultiRegionEnabled ? 's' : ''} in your CLI. Then, refresh and select the new config
            ID from the dropdown.
          </p>
          {isMultiRegionEnabled ? (
            <ClipboardCopy
              className="pf-v6-u-pb-md"
              variant={ClipboardCopyVariant.expansion}
              isReadOnly
            >
              {regionLoginCommand}
            </ClipboardCopy>
          ) : null}
          <ClipboardCopy isReadOnly>rosa create oidc-config</ClipboardCopy>
        </Content>
      }
    >
      <Button variant="link" isInline>
        create a new OIDC config id
      </Button>
    </Popover>
  );
}

function CustomerOIDCConfiguration({
  awsAccountID,
  byoOidcConfigID,
  operatorRolesCliCommand,
  regionSearch,
  isMultiRegionEnabled,
  input: { onChange },
  meta: { error, touched },
}) {
  const {
    getFieldProps,
    getFieldMeta,
    values: { [FieldId.RegionalInstance]: regionalInstance, [FieldId.Hypershift]: hypershiftValue },
  } = useFormState();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRefreshLoading, setIsRefreshLoading] = useState(false);
  const [oidcConfigs, setOidcConfigs] = useState([]);

  const isHypershift = hypershiftValue === 'true';

  const {
    data: oidcData,
    isSuccess: isOidcDataSuccess,
    isFetching: isOidcDataFetching,
  } = useFetchGetUserOidcConfigurations(awsAccountID, regionSearch, isMultiRegionEnabled);

  useEffect(() => {
    if (oidcData && isOidcDataSuccess) {
      const currentConfigs = oidcData?.data?.items || [];
      setOidcConfigs(currentConfigs);
    }
  }, [oidcData, isOidcDataSuccess]);

  const refreshOidcConfigs = () => {
    setIsRefreshLoading(true);

    refetchGetUserOidcConfigurations();
    if (isOidcDataSuccess && !isOidcDataFetching) {
      const currentConfigs = oidcData?.data?.items || [];
      setOidcConfigs(currentConfigs);

      const isSelectedConfigDeleted =
        byoOidcConfigID &&
        currentConfigs.find((config) => config.id === byoOidcConfigID) === undefined;

      if (isSelectedConfigDeleted) {
        onChange(null);
      }
    }
    // Because the response can be so quick, this ensures the user will see that something has happened
    setTimeout(() => {
      setIsRefreshLoading(false);
    }, 500);
  };

  const onSelect = (_, configId) => {
    const selected = oidcConfigs.find((config) => config.id === configId);
    setIsDropdownOpen(false);
    onChange(selected);
  };

  useEffect(() => {
    const isValidSelection = oidcConfigs?.some((item) => item?.id === byoOidcConfigID);
    if (oidcConfigs.length > 0 && byoOidcConfigID && !isValidSelection) {
      onChange(null);
    }
  }, [byoOidcConfigID, oidcConfigs, onChange]);

  const selectionData = useMemo(
    () =>
      oidcConfigs.map((oidcConfig) => ({
        entryId: oidcConfig.id,
        label: oidcConfig.id,
        description: oidcConfig.issuer_url ? `Issuer URL: ${oidcConfig.issuer_url}` : undefined,
      })),

    [oidcConfigs],
  );

  const rosaRegionLoginCommand = `rosa login --use-auth-code --url ${regionalInstance?.url}`;

  return (
    <Instructions wide>
      <Instruction simple>
        <Content className="pf-v6-u-pb-md">
          <div>
            Select your existing OIDC config id or{' '}
            <CreateOIDCProviderInstructions
              isMultiRegionEnabled={isMultiRegionEnabled}
              regionLoginCommand={rosaRegionLoginCommand}
            />
            .
          </div>
        </Content>

        <FormGroup
          label="Config ID"
          labelHelp={
            <PopoverHint
              hint={
                <span>
                  The OIDC configuration ID created by running the command{' '}
                  <pre>rosa create oidc-config</pre>
                </span>
              }
            />
          }
          isRequired
        >
          <Flex>
            <FlexItem grow={{ default: 'grow' }}>
              <FuzzySelect
                className="oidc-config-select"
                aria-label="Config ID"
                isOpen={isDropdownOpen}
                onOpenChange={(isOpen) => setIsDropdownOpen(isOpen)}
                onSelect={onSelect}
                selectedEntryId={byoOidcConfigID}
                selectionData={selectionData}
                isDisabled={oidcConfigs.length === 0 || isOidcDataFetching || isRefreshLoading}
                placeholderText={
                  oidcConfigs.length > 0 ? 'Select a config id' : 'No OIDC configurations found'
                }
                inlineFilterPlaceholderText="Filter by config ID"
                isScrollable
                popperProps={{
                  maxWidth: 'trigger',
                }}
              />
            </FlexItem>
            <FlexItem>
              <Button
                variant="secondary"
                className="pf-v6-u-mt-md"
                onClick={refreshOidcConfigs}
                isLoading={isOidcDataFetching || isRefreshLoading}
                isDisabled={isOidcDataFetching || isRefreshLoading}
              >
                Refresh
              </Button>
            </FlexItem>
          </Flex>

          <FormGroupHelperText touched={touched} error={error} />
        </FormGroup>
      </Instruction>

      <Instruction simple>
        <Content className="pf-v6-u-pb-md">
          <Content component={ContentVariants.p}>Enter an Operator role prefix.</Content>
        </Content>

        <Field
          component={ReduxVerticalFormGroup}
          name={FieldId.CustomOperatorRolesPrefix}
          label="Operator roles prefix"
          type="text"
          isRequired
          // eslint-disable-next-line import/no-named-as-default-member
          validate={validators.checkCustomOperatorRolesPrefix}
          helpText={`Maximum ${MAX_CUSTOM_OPERATOR_ROLES_PREFIX_LENGTH} characters.  Changing the cluster name will regenerate this value.`}
          extendedHelpText={
            <Content>
              <Content component={ContentVariants.p}>
                You can specify a custom prefix for the cluster-specific Operator IAM roles to use.{' '}
                <br />
                See examples in{' '}
                <ExternalLink
                  href={
                    isHypershift
                      ? links.ROSA_AWS_IAM_OPERATOR_ROLES
                      : links.ROSA_AWS_CLASSIC_IAM_OPERATOR_ROLES
                  }
                >
                  Defining a custom Operator IAM role prefix
                </ExternalLink>
              </Content>
            </Content>
          }
          showHelpTextOnError={false}
          disabled={!byoOidcConfigID}
          input={getFieldProps(FieldId.CustomOperatorRolesPrefix)}
          meta={getFieldMeta(FieldId.CustomOperatorRolesPrefix)}
        />
      </Instruction>

      <Instruction simple>
        <Content className="pf-v6-u-pb-md">
          <Content component={ContentVariants.p}>
            {isMultiRegionEnabled
              ? 'Run the commands in order to create new Operator Roles.'
              : 'Run the command to create new Operator Roles.'}
          </Content>
        </Content>
        {operatorRolesCliCommand ? (
          <>
            {isMultiRegionEnabled && (
              <ClipboardCopy
                className="pf-v6-u-pb-md"
                textAriaLabel="Copyable ROSA region login"
                isReadOnly
              >
                {rosaRegionLoginCommand}
              </ClipboardCopy>
            )}
            <ClipboardCopy
              textAriaLabel="Copyable ROSA create operator-roles"
              // variant={ClipboardCopyVariant.expansion} // temporarily disabled due to  https://github.com/patternfly/patternfly-react/issues/9962
              isReadOnly
            >
              {operatorRolesCliCommand}
            </ClipboardCopy>
            <div className="pf-v6-c-clipboard-copy">
              <div className="pf-v6-c-clipboard-copy__expandable-content">
                {operatorRolesCliCommand}
              </div>
            </div>
          </>
        ) : (
          <Skeleton fontSize="md" />
        )}
      </Instruction>
    </Instructions>
  );
}

CreateOIDCProviderInstructions.propTypes = {
  isMultiRegionEnabled: PropTypes.bool.isRequired,
  regionLoginCommand: PropTypes.string.isRequired,
};

CustomerOIDCConfiguration.propTypes = {
  awsAccountID: PropTypes.string,
  byoOidcConfigID: PropTypes.string,
  operatorRolesCliCommand: PropTypes.string,
  regionSearch: PropTypes.string,
  isMultiRegionEnabled: PropTypes.bool,
  input: PropTypes.object.isRequired,
  meta: PropTypes.object.isRequired,
};

export default CustomerOIDCConfiguration;
