// Duplication of `~/components/clusters/common/DefaultIngressFields` needed to convert it to formik
import React from 'react';
import classNames from 'classnames';
import { Field } from 'formik';

import { FormGroup } from '@patternfly/react-core';

import {
  checkRouteSelectors,
  validateNamespacesList,
  validateTlsHostname,
  validateTlsSecretName,
} from '~/common/validators';
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
import { LoadBalancerFlavorLabel } from '~/components/clusters/ClusterDetailsMultiRegion/components/Networking/components/constants';
import LoadBalancerPopover from '~/components/clusters/ClusterDetailsMultiRegion/components/Networking/components/LoadBalancerPopover';
import { useFormState } from '~/components/clusters/wizards/hooks';
import {
  ReduxCheckbox,
  ReduxVerticalFormGroup,
} from '~/components/common/ReduxFormComponents_deprecated';
import { LoadBalancerFlavor } from '~/types/clusters_mgmt.v1/enums';

type DefaultIngressFieldsFormikProps = {
  className?: string;
  areFieldsDisabled?: boolean;
  hasSufficientIngressEditVersion?: boolean;
  isDay2?: boolean;
  canEditLoadBalancer?: boolean;
  canShowLoadBalancer?: boolean;
  isHypershiftCluster?: boolean;
  values?: any;
};

export const DefaultIngressFieldsFormik: React.FC<DefaultIngressFieldsFormikProps> = ({
  className,
  areFieldsDisabled,
  isDay2,
  hasSufficientIngressEditVersion,
  canEditLoadBalancer,
  canShowLoadBalancer,
  isHypershiftCluster,
  values,
}) => {
  const {
    getFieldProps, // Access: name, value, onBlur, onChange for a <Field>, useful for mapping to a field
    getFieldMeta, // Access: error, touched for a <Field>, useful for mapping to a field
  } = useFormState();

  return (
    <>
      {isDay2 && (
        <FormGroup
          fieldId="default_router_address"
          label="Default application router"
          isStack
          isRequired
        >
          <Field
            component={ReduxVerticalFormGroup}
            name="default_router_address"
            type="text"
            disabled
            helpText="Address of application routes."
            input={getFieldProps('default_router_address')}
            meta={getFieldMeta('default_router_address')}
          />
          <Field
            component={ReduxCheckbox}
            name="private_default_router"
            label="Make router private"
            input={getFieldProps('private_default_router')}
            meta={getFieldMeta('private_default_router')}
          />
        </FormGroup>
      )}

      {hasSufficientIngressEditVersion && !isHypershiftCluster && (
        <FormGroup
          className={className}
          label="Route selector"
          labelHelp={<RouteSelectorsPopover />}
        >
          <Field
            component={ReduxVerticalFormGroup}
            name="defaultRouterSelectors"
            type="text"
            validate={checkRouteSelectors}
            disabled={areFieldsDisabled}
            helpText={RouteSelectorsHelpText}
            showHelpTextOnError={false}
            input={getFieldProps('defaultRouterSelectors')}
            meta={getFieldMeta('defaultRouterSelectors')}
          />
        </FormGroup>
      )}

      {hasSufficientIngressEditVersion && !isHypershiftCluster && (
        <FormGroup
          className={className}
          label="Excluded namespaces"
          labelHelp={<ExcludedNamespacesPopover />}
        >
          <Field
            component={ReduxVerticalFormGroup}
            name="defaultRouterExcludedNamespacesFlag"
            type="text"
            validate={validateNamespacesList}
            disabled={areFieldsDisabled}
            helpText={ExcludedNamespacesHelpText}
            showHelpTextOnError={false}
            input={getFieldProps('defaultRouterExcludedNamespacesFlag')}
            meta={getFieldMeta('defaultRouterExcludedNamespacesFlag')}
          />
        </FormGroup>
      )}

      {isDay2 && hasSufficientIngressEditVersion && !isHypershiftCluster && (
        <>
          <FormGroup className={className} label="TLS Secret name">
            <Field
              component={ReduxVerticalFormGroup}
              name="clusterRoutesTlsSecretRef"
              type="text"
              validate={(value: string) => validateTlsSecretName(value, values)}
              disabled={areFieldsDisabled}
              helpText="The name of a secret holding custom TLS certificate, in the openshift-config namespace. Optional."
              showHelpTextOnError={false}
              input={getFieldProps('clusterRoutesTlsSecretRef')}
              meta={getFieldMeta('clusterRoutesTlsSecretRef')}
            />
          </FormGroup>

          {/* TODO: provide link to documentation once it is written */}
          <FormGroup className={className} label="Hostname">
            <Field
              component={ReduxVerticalFormGroup}
              name="clusterRoutesHostname"
              type="text"
              validate={(value: string) => validateTlsHostname(value, values)}
              disabled={areFieldsDisabled}
              helpText="The cluster routes hostname the TLS certificate is issued for."
              showHelpTextOnError={false}
              input={getFieldProps('clusterRoutesHostname')}
              meta={getFieldMeta('clusterRoutesHostname')}
            />
          </FormGroup>
        </>
      )}

      {hasSufficientIngressEditVersion && !isHypershiftCluster && (
        <FormGroup
          className={className}
          fieldId="isDefaultRouterNamespaceOwnershipPolicyStrict"
          label="Namespace ownership policy"
          labelHelp={<NamespaceOwnerPolicyPopover />}
        >
          <Field
            id="isDefaultRouterNamespaceOwnershipPolicyStrict"
            component={ReduxCheckbox}
            name="isDefaultRouterNamespaceOwnershipPolicyStrict"
            disabled={areFieldsDisabled}
            label="Strict"
            labelOff="Inter-namespace ownership allowed"
            isSwitch
            input={getFieldProps('isDefaultRouterNamespaceOwnershipPolicyStrict')}
            meta={getFieldMeta('isDefaultRouterNamespaceOwnershipPolicyStrict')}
          />
        </FormGroup>
      )}

      {hasSufficientIngressEditVersion && !isHypershiftCluster && (
        <FormGroup
          className={className}
          fieldId="isDefaultRouterWildcardPolicyAllowed"
          label="Wildcard policy"
          labelHelp={<WildcardPolicyPopover />}
        >
          <Field
            id="isDefaultRouterWildcardPolicyAllowed"
            component={ReduxCheckbox}
            name="isDefaultRouterWildcardPolicyAllowed"
            disabled={areFieldsDisabled}
            label="Allowed"
            labelOff="Disallowed"
            isSwitch
            input={getFieldProps('isDefaultRouterWildcardPolicyAllowed')}
            meta={getFieldMeta('isDefaultRouterWildcardPolicyAllowed')}
          />
        </FormGroup>
      )}

      {canShowLoadBalancer && !isHypershiftCluster && (
        <FormGroup
          fieldId="load_balancer_group"
          label="Load balancer type"
          className={classNames('pf-v6-u-pb-md', className)}
          labelHelp={<LoadBalancerPopover />}
        >
          <Field
            id="load_balancer_group"
            component={ReduxCheckbox}
            name="is_nlb_load_balancer"
            disabled={!canEditLoadBalancer}
            label={LoadBalancerFlavorLabel[LoadBalancerFlavor.nlb]}
            labelOff={LoadBalancerFlavorLabel[LoadBalancerFlavor.classic]}
            isSwitch
            input={getFieldProps('is_nlb_load_balancer')}
            meta={getFieldMeta('is_nlb_load_balancer')}
          />
        </FormGroup>
      )}
    </>
  );
};
