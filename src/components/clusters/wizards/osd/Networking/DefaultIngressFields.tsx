import React from 'react';
import { Field } from 'formik';

import { FormGroup, GridItem } from '@patternfly/react-core';

import { checkRouteSelectors, validateNamespacesList } from '~/common/validators';
import {
  ExcludedNamespacesHelpText,
  ExcludedNamespacesPopover,
} from '~/components/clusters/ClusterDetailsMultiRegion/components/Networking/components/ApplicationIngressCard/ExcludedNamespacesPopover';
import { NamespaceOwnerPolicyPopover } from '~/components/clusters/ClusterDetailsMultiRegion/components/Networking/components/ApplicationIngressCard/NamespaceOwnerPolicyPopover';
import {
  RouteSelectorsHelpText,
  RouteSelectorsPopover,
} from '~/components/clusters/ClusterDetailsMultiRegion/components/Networking/components/ApplicationIngressCard/RouteSelectorsPopover';
import { WildcardPolicyPopover } from '~/components/clusters/ClusterDetailsMultiRegion/components/Networking/components/ApplicationIngressCard/WildcardsPolicyPopover';
import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';
import { ReduxCheckbox } from '~/components/common/ReduxFormComponents_deprecated';

import { useFormState } from '../../hooks';
import { FieldId } from '../constants';

type DefaultIngressFieldsProps = {};

/* So far used in Day 1 flow only (contrary to the version 1 CreateOSDWizard */
export const DefaultIngressFields: React.FC<DefaultIngressFieldsProps> = () => {
  const { setFieldValue, getFieldMeta, getFieldProps } = useFormState();

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
