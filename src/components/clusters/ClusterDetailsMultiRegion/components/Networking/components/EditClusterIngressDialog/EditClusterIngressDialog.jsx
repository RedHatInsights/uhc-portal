import React from 'react';
import { Field, Formik } from 'formik';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import {
  Alert,
  AlertVariant,
  ClipboardCopy,
  ExpandableSection,
  Form,
  FormGroup,
  TextInput,
} from '@patternfly/react-core';

import { isExactMajorMinor } from '~/common/versionHelpers';
import { CheckboxField } from '~/components/clusters/wizards/form/CheckboxField';
import Modal from '~/components/common/Modal/Modal';
import { useEditClusterIngressMutation } from '~/queries/ClusterDetailsQueries/NetworkingTab/useEditClusterIngress';
import { refetchGetClusterRouters } from '~/queries/ClusterDetailsQueries/NetworkingTab/useGetClusterRouters';
import { useGlobalState } from '~/redux/hooks';

import links from '../../../../../../../common/installLinks.mjs';
import { knownProducts } from '../../../../../../../common/subscriptionTypes';
import { checkLabelsAdditionalRouter } from '../../../../../../../common/validators';
import ErrorBox from '../../../../../../common/ErrorBox';
import ExternalLink from '../../../../../../common/ExternalLink';
import { modalActions } from '../../../../../../common/Modal/ModalActions';
import modals from '../../../../../../common/Modal/modals';
import shouldShowModal from '../../../../../../common/Modal/ModalSelectors';
import { ReduxVerticalFormGroup } from '../../../../../../common/ReduxFormComponents_deprecated';
import NetworkingSelector, { routeSelectorsAsString } from '../../NetworkingSelector';

const canConfigureAdditionalRouter = (clusterVersionRawId) =>
  isExactMajorMinor(clusterVersionRawId, 4, 11) || isExactMajorMinor(clusterVersionRawId, 4, 12);

const EditClusterIngressDialog = ({ provider, cluster, refreshCluster, clusterRoutersData }) => {
  const clusterID = cluster?.id;
  const region = cluster?.subscription?.rh_region_id;
  const {
    isPending,
    isError,
    error,
    mutate: editClusterIngress,
  } = useEditClusterIngressMutation(clusterID, region);

  const dispatch = useDispatch();
  const isOpen = useGlobalState((state) => shouldShowModal(state, modals.EDIT_CLUSTER_INGRESS));
  const clusterRouters = NetworkingSelector(clusterRoutersData);
  const hasAdditionalRouter = Object.keys(clusterRouters).length === 2;
  const subscriptionPlan = cluster.subscription?.plan?.type;
  const APIPrivate = cluster.api?.listening === 'internal';
  const controlPlaneAPIEndpoint = cluster.api?.url;
  const hideAdvancedOptions =
    !hasAdditionalRouter /* Do not allow Add of an additional router */ ||
    subscriptionPlan === knownProducts.ROSA;
  const additionalRouterAddress = hasAdditionalRouter
    ? clusterRouters.additional.address
    : `apps2${clusterRouters.default?.address.substr(4)}`;
  const clusterVersion = cluster?.openshift_version || cluster?.version?.raw_id || '';

  const onClose = () => {
    refetchGetClusterRouters();
    dispatch(modalActions.closeModal());
  };

  const isAWS = provider === 'aws';

  const editRoutersError = isError ? (
    <ErrorBox message="Error editing cluster ingress" response={error} />
  ) : null;

  const privacySettingsWarningBox = (
    <Alert
      id="privacySettingsWarningBox"
      title="Editing the privacy settings may require additional actions in your cloud provider account to maintain access."
      variant={AlertVariant.warning}
      isPlain
      isInline
    >
      {isAWS && (
        <ExternalLink href={links.OSD_PRIVATE_CLUSTER}>
          Learn more about cluster privacy
        </ExternalLink>
      )}
    </Alert>
  );

  return isOpen ? (
    <Formik
      initialValues={{
        control_plane_api_endpoint: cluster.api?.url || undefined,
        private_api: APIPrivate,
        enable_additional_router: hasAdditionalRouter,
        private_additional_router: !!clusterRouters?.additional?.isPrivate,
        labels_additional_router: routeSelectorsAsString(
          clusterRouters?.additional?.routeSelectors,
        ),
      }}
      onSubmit={(values) => {
        const currentData = { ...clusterRouters, APIPrivate };
        const formData = { ...values };
        editClusterIngress(
          { formData, currentData },
          {
            onSuccess: () => {
              refreshCluster();
              onClose();
            },
          },
        );
      }}
    >
      {({ handleSubmit, isValid, dirty, getFieldProps, getFieldMeta, initialValues }) => {
        const additionalRouterEnabled = !!initialValues.enable_additional_router;
        const canEditAdditionalRouter =
          additionalRouterEnabled && canConfigureAdditionalRouter(clusterVersion);
        const showRouterVisibilityWarning =
          additionalRouterEnabled &&
          !initialValues.labels_additional_router &&
          initialValues.private_additional_router;

        return (
          <Modal
            primaryText="Save"
            secondaryText="Cancel"
            title="Edit cluster ingress"
            onClose={onClose}
            onPrimaryClick={handleSubmit}
            onSecondaryClick={onClose}
            isPending={isPending}
            isPrimaryDisabled={!isValid || !dirty}
          >
            {editRoutersError}
            <Form id="cluster-ingress-form" onSubmit={handleSubmit}>
              {privacySettingsWarningBox}
              {showRouterVisibilityWarning ? (
                <Alert
                  id="routerVisibilityWarningBox"
                  title="All routers will be exposed publicly because there is no label match on the additional application router. This is a potential security risk."
                  variant={AlertVariant.warning}
                  isPlain
                  isInline
                />
              ) : null}
              <FormGroup
                fieldId="control_plane_api_endpoint"
                label="Control Plane API endpoint"
                isStack
              >
                <ClipboardCopy name="control_plane_api_endpoint" isReadOnly>
                  {controlPlaneAPIEndpoint}
                </ClipboardCopy>
                <Field component={CheckboxField} name="private_api" label="Make API private" />
              </FormGroup>
              {hideAdvancedOptions ? null : (
                <ExpandableSection toggleText="Advanced options">
                  <Form>
                    <FormGroup fieldId="enable_additional_router" isStack>
                      <Field
                        component={CheckboxField}
                        name="enable_additional_router"
                        label="Enable additional router"
                        extendedHelpText="The use of an additional router is deprecated in favor of the single application ingress. Since it has already been enabled, the additional router can be still edited for 4.11 and 4.12 versions but once disabled, it can not be re-enabled again. In the 4.13+ versions, the additional router can not be edited but disabled only."
                      />
                    </FormGroup>
                    <FormGroup fieldId="additional_router_address" isStack>
                      <TextInput
                        id="additional_router_address"
                        value={`*.${additionalRouterAddress}`}
                        readOnlyVariant="default"
                      />
                      <Field
                        component={CheckboxField}
                        name="private_additional_router"
                        label="Make router private"
                        isDisabled={!canEditAdditionalRouter}
                      />
                    </FormGroup>
                    <Field
                      component={ReduxVerticalFormGroup}
                      aria-label="Additional Router Labels"
                      name="labels_additional_router"
                      label="Label match for additional router (optional)"
                      type="text"
                      helpText="Comma separated pairs in key=value format. If no label is specified, all routes will be exposed on both routers."
                      validate={checkLabelsAdditionalRouter}
                      key="route_selectors"
                      readOnlyVariant={canEditAdditionalRouter ? undefined : 'default'}
                      meta={getFieldMeta('labels_additional_router')}
                      input={getFieldProps('labels_additional_router')}
                    />
                  </Form>
                </ExpandableSection>
              )}
            </Form>
          </Modal>
        );
      }}
    </Formik>
  ) : null;
};

EditClusterIngressDialog.propTypes = {
  provider: PropTypes.string,
  clusterRoutersData: PropTypes.array,
  cluster: PropTypes.object,
  refreshCluster: PropTypes.func.isRequired,
};

export default EditClusterIngressDialog;
