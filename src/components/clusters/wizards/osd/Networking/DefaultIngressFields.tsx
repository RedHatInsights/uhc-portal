import React, { useEffect } from 'react';
import { Field, FieldArray } from 'formik';

import {
  FormGroup,
  FormHelperText,
  GridItem,
  HelperText,
  HelperTextItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import {
  checkRouteSelectors,
  validateExcludeNamespaceSelectorKey,
  validateExcludeNamespaceSelectorValue,
  validateNamespacesList,
} from '~/common/validators';
import {
  ExcludedNamespacesHelpText,
  ExcludedNamespacesPopover,
} from '~/components/clusters/ClusterDetailsMultiRegion/components/Networking/components/ApplicationIngressCard/ExcludedNamespacesPopover';
import {
  ExcludeNamespaceSelectorsHelpText,
  ExcludeNamespaceSelectorsPopover,
} from '~/components/clusters/ClusterDetailsMultiRegion/components/Networking/components/ApplicationIngressCard/ExcludeNamespaceSelectorsPopover';
import { NamespaceOwnerPolicyPopover } from '~/components/clusters/ClusterDetailsMultiRegion/components/Networking/components/ApplicationIngressCard/NamespaceOwnerPolicyPopover';
import {
  RouteSelectorsHelpText,
  RouteSelectorsPopover,
} from '~/components/clusters/ClusterDetailsMultiRegion/components/Networking/components/ApplicationIngressCard/RouteSelectorsPopover';
import { WildcardPolicyPopover } from '~/components/clusters/ClusterDetailsMultiRegion/components/Networking/components/ApplicationIngressCard/WildcardsPolicyPopover';
import { CloudProviderType } from '~/components/clusters/wizards/common/constants';
import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';
import FormKeyValueList from '~/components/common/FormikFormComponents/FormKeyValueList';
import { ReduxCheckbox } from '~/components/common/ReduxFormComponents_deprecated';
import { GCP_EXCLUDE_NAMESPACE_SELECTORS } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';

import { useFormState } from '../../hooks';
import { FieldId } from '../constants';

type DefaultIngressFieldsProps = {};

/* So far used in Day 1 flow only (contrary to the version 1 CreateOSDWizard */
export const DefaultIngressFields: React.FC<DefaultIngressFieldsProps> = () => {
  const { setFieldValue, getFieldMeta, getFieldProps, values } = useFormState();
  const isExcludeNamespaceSelectorsEnabled = useFeatureGate(GCP_EXCLUDE_NAMESPACE_SELECTORS);
  const isGcp = values[FieldId.CloudProvider] === CloudProviderType.Gcp;
  const showExcludeNamespaceSelectors = isExcludeNamespaceSelectorsEnabled && isGcp;

  useEffect(() => {
    if (!showExcludeNamespaceSelectors) {
      setFieldValue(FieldId.DefaultRouterExcludeNamespaceSelectors, [], false);
    }
  }, [showExcludeNamespaceSelectors, setFieldValue]);

  const routeSelectorFieldMeta = getFieldMeta(FieldId.DefaultRouterSelectors);
  const excludedNamespacesFieldMeta = getFieldMeta(FieldId.DefaultRouterExcludedNamespacesFlag);
  return (
    <>
      <GridItem span={9}>
        <FormGroup label="Route selector" labelHelp={<RouteSelectorsPopover />}>
          <Field
            name={FieldId.DefaultRouterSelectors}
            type="text"
            validate={checkRouteSelectors}
            className="pf-v6-u-w-100"
            input={{
              ...getFieldProps(FieldId.DefaultRouterSelectors),
              onChange: (value: string) =>
                setFieldValue(FieldId.DefaultRouterSelectors, value, false),
            }}
          />

          <FormGroupHelperText touched error={routeSelectorFieldMeta.error}>
            {RouteSelectorsHelpText}
          </FormGroupHelperText>
        </FormGroup>
      </GridItem>

      <GridItem span={9}>
        <FormGroup label="Excluded namespaces" labelHelp={<ExcludedNamespacesPopover />}>
          <Field
            name={FieldId.DefaultRouterExcludedNamespacesFlag}
            type="text"
            validate={validateNamespacesList}
            className="pf-v6-u-w-100"
            input={{
              ...getFieldProps(FieldId.DefaultRouterExcludedNamespacesFlag),
              onChange: (value: string) =>
                setFieldValue(FieldId.DefaultRouterExcludedNamespacesFlag, value, false),
            }}
          />

          <FormGroupHelperText touched error={excludedNamespacesFieldMeta.error}>
            {ExcludedNamespacesHelpText}
          </FormGroupHelperText>
        </FormGroup>
      </GridItem>

      {showExcludeNamespaceSelectors ? (
        <GridItem span={9}>
          <FormGroup
            data-testid="default-ingress-exclude-namespace-selectors"
            label="Exclude namespace selectors"
            labelHelp={<ExcludeNamespaceSelectorsPopover />}
          >
            <Stack hasGutter>
              <StackItem>
                <FormHelperText>
                  <HelperText>
                    <HelperTextItem>{ExcludeNamespaceSelectorsHelpText}</HelperTextItem>
                  </HelperText>
                </FormHelperText>
              </StackItem>
              <StackItem>
                <FieldArray
                  name={FieldId.DefaultRouterExcludeNamespaceSelectors}
                  validateOnChange={false}
                >
                  {(arrayHelpers) => (
                    <FormKeyValueList
                      push={arrayHelpers.push}
                      remove={arrayHelpers.remove}
                      arrayFieldName={FieldId.DefaultRouterExcludeNamespaceSelectors}
                      valueColumnLabel="Values (comma-separated)"
                      addButtonLabel="Add selector"
                      keyInputAriaLabel="Exclude namespace selector key"
                      valueInputAriaLabel="Exclude namespace selector values"
                      validateKey={validateExcludeNamespaceSelectorKey}
                      validateValue={validateExcludeNamespaceSelectorValue}
                      allowKeyWithoutValue={false}
                    />
                  )}
                </FieldArray>
              </StackItem>
            </Stack>
          </FormGroup>
        </GridItem>
      ) : null}

      <FormGroup
        className="pf-v6-u-mb-0"
        label="Namespace ownership policy"
        labelHelp={<NamespaceOwnerPolicyPopover />}
      >
        <Field
          id={FieldId.IsDefaultRouterNamespaceOwnershipPolicyStrict}
          component={ReduxCheckbox}
          name={FieldId.IsDefaultRouterNamespaceOwnershipPolicyStrict}
          label="Strict"
          labelOff="Inter-namespace ownership allowed"
          isSwitch
          input={getFieldProps(FieldId.IsDefaultRouterNamespaceOwnershipPolicyStrict)}
          meta={getFieldMeta(FieldId.IsDefaultRouterNamespaceOwnershipPolicyStrict)}
        />
      </FormGroup>

      <FormGroup
        className="pf-v6-u-mb-0"
        label="Wildcard policy"
        labelHelp={<WildcardPolicyPopover />}
      >
        <Field
          id={FieldId.IsDefaultRouterWildcardPolicyAllowed}
          component={ReduxCheckbox}
          name={FieldId.IsDefaultRouterWildcardPolicyAllowed}
          label="Allowed"
          labelOff="Disallowed"
          isSwitch
          input={getFieldProps(FieldId.IsDefaultRouterWildcardPolicyAllowed)}
          meta={getFieldMeta(FieldId.IsDefaultRouterWildcardPolicyAllowed)}
        />
      </FormGroup>
    </>
  );
};
