import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Field, Formik } from 'formik';
import { get } from 'lodash';
import { useDispatch } from 'react-redux';

import PageHeader from '@patternfly/react-component-groups/dist/dynamic/PageHeader';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Content,
  ContentVariants,
  Form,
  Grid,
  GridItem,
  PageSection,
  Spinner,
  Title,
  Tooltip,
  TooltipPosition,
} from '@patternfly/react-core';

import { Link, Navigate } from '~/common/routing';
import { AppPage } from '~/components/App/AppPage';
import { openModal } from '~/components/common/Modal/ModalActions';
import modals from '~/components/common/Modal/modals';
import shouldShowModal from '~/components/common/Modal/ModalSelectors';
import {
  registerDisconnectedCluster,
  resetCreatedClusterResponse,
} from '~/redux/actions/clustersActions';
import { getOrganizationAndQuota } from '~/redux/actions/userActions';
import { useGlobalState } from '~/redux/hooks';
import {
  SubscriptionCreateRequest,
  SubscriptionCreateRequestPlan_id as SubscriptionCreateRequestPlanId,
  SubscriptionCreateRequestStatus,
} from '~/types/accounts_mgmt.v1';
import { ErrorState } from '~/types/types';

import {
  checkClusterDisplayName,
  checkClusterUUID,
  checkDisconnectedConsoleURL,
} from '../../../common/validators';
import Breadcrumbs from '../../common/Breadcrumbs';
import ErrorModal from '../../common/ErrorModal';
import ReduxVerticalFormGroup from '../../common/ReduxFormComponents_deprecated/ReduxVerticalFormGroup';
import Unavailable from '../../common/Unavailable';

import EditSubscriptionSettings from './EditSubscriptionSettings';
import { hasOrgLevelsubscribeOCPCapability } from './registerClusterSelectors';
import validateSubscriptionSettings from './validateSubscriptionSettings';

const RegisterCluster = () => {
  const dispatch = useDispatch();
  const [settings, setSettings] = useState({});

  const { quotaResponse, registerClusterResponse, isOpen, canSubscribeOCP } = useGlobalState(
    (state) => ({
      quotaResponse: get(state, 'userProfile.organization', null),
      registerClusterResponse: state.clusters.createdCluster,
      isOpen: shouldShowModal(state, modals.REGISTER_CLUSTER_ERROR),
      canSubscribeOCP: hasOrgLevelsubscribeOCPCapability(state),
    }),
  );

  const resetResponseAndForm = useCallback(() => {
    dispatch(resetCreatedClusterResponse());
  }, [dispatch]);

  useEffect(() => {
    resetResponseAndForm();
    dispatch(getOrganizationAndQuota() as any);

    return () => resetResponseAndForm();
  }, [dispatch, resetResponseAndForm]);

  useEffect(() => {
    if (registerClusterResponse.error && !isOpen) {
      dispatch(openModal(modals.REGISTER_CLUSTER_ERROR));
    }
  }, [registerClusterResponse.error, isOpen, dispatch]);

  const validation = useMemo(() => validateSubscriptionSettings(settings), [settings]);

  const onSubmit = (values: {
    cluster_id: string;
    display_name: string;
    web_console_url: string;
  }) => {
    const { request, isValid } = validateSubscriptionSettings(settings);
    if (isValid) {
      const registrationRequest: SubscriptionCreateRequest = {
        cluster_uuid: values.cluster_id,
        plan_id: SubscriptionCreateRequestPlanId.OCP,
        status: SubscriptionCreateRequestStatus.Disconnected,
        display_name: values.display_name,
        console_url: values.web_console_url,
      };
      dispatch(registerDisconnectedCluster(registrationRequest, request) as any);
    }
  };

  if (registerClusterResponse.fulfilled) {
    return (
      // TODO 'cluster' here is actually subscription, should be renamed
      <Navigate replace to={`/details/s/${registerClusterResponse.cluster.id}`} />
    );
  }

  const errorModal = isOpen && (
    <ErrorModal
      title="Error Registering Cluster"
      errorResponse={registerClusterResponse as ErrorState}
      resetResponse={() => dispatch(resetCreatedClusterResponse())}
    />
  );

  if (quotaResponse?.error) {
    return (
      <PageSection hasBodyWrapper={false}>
        <Unavailable message="Error retrieving quota" response={quotaResponse} />
      </PageSection>
    );
  }

  return (
    <AppPage>
      <PageHeader
        title="Register disconnected cluster"
        subtitle=""
        breadcrumbs={
          <Breadcrumbs
            path={[{ label: 'Cluster List' }, { label: 'Register disconnected cluster' }]}
          />
        }
      />
      <PageSection hasBodyWrapper={false}>
        {errorModal}
        <Formik
          initialValues={{
            cluster_id: '',
            display_name: '',
            web_console_url: '',
          }}
          onSubmit={(values) => onSubmit(values)}
        >
          {({ getFieldMeta, getFieldProps, submitForm, isValid }) => (
            <Card id="register-cluster">
              <CardBody>
                <Grid>
                  <GridItem md={8}>
                    <Content id="register-cluster-top-text">
                      <Content component={ContentVariants.p}>
                        Register clusters that are not connected to OpenShift Cluster Manager.
                        Existing cluster owners, cluster editors, or admins can edit existing
                        cluster subscriptions from the cluster details page.
                      </Content>
                    </Content>
                    {quotaResponse?.fulfilled ? (
                      <Form onSubmit={submitForm} className="subscription-settings form">
                        {/* @ts-ignore */}
                        <Field
                          component={ReduxVerticalFormGroup}
                          name="cluster_id"
                          label="Cluster ID"
                          type="text"
                          extendedHelpText="The cluster ID may be found on the About page of the cluster web console"
                          disabled={registerClusterResponse.pending}
                          input={{
                            // name, value, onBlur, onChange
                            ...getFieldProps('cluster_id'),
                          }}
                          meta={getFieldMeta('cluster_id')}
                          validate={checkClusterUUID}
                          isRequired
                        />
                        {/* @ts-ignore */}
                        <Field
                          component={ReduxVerticalFormGroup}
                          name="display_name"
                          label="Display name"
                          type="text"
                          disabled={registerClusterResponse.pending}
                          input={{
                            // name, value, onBlur, onChange
                            ...getFieldProps('display_name'),
                          }}
                          meta={getFieldMeta('display_name')}
                          validate={checkClusterDisplayName}
                        />
                        {/* @ts-ignore */}
                        <Field
                          component={ReduxVerticalFormGroup}
                          name="web_console_url"
                          label="Web console URL"
                          validate={checkDisconnectedConsoleURL}
                          disabled={registerClusterResponse.pending}
                          input={{
                            // name, value, onBlur, onChange
                            ...getFieldProps('web_console_url'),
                          }}
                          meta={getFieldMeta('web_console_url')}
                          type="text"
                        />
                        <Title headingLevel="h4" size="xl">
                          Subscription settings
                        </Title>
                        <Content>
                          <Content component={ContentVariants.p}>
                            Editing the subscription settings will help ensure that you receive the
                            level of support that you expect, and that your cluster is consuming the
                            correct type of subscription.
                          </Content>
                        </Content>
                        {canSubscribeOCP ? (
                          <EditSubscriptionSettings
                            setSettings={setSettings}
                            canSubscribeOCP={canSubscribeOCP}
                          />
                        ) : (
                          <Tooltip
                            content="You cannot edit subscription settings because your organization does not have any OpenShift subscriptions. Contact sales to purchase OpenShift."
                            position={TooltipPosition.auto}
                          >
                            <div>
                              <EditSubscriptionSettings
                                setSettings={setSettings}
                                canSubscribeOCP={canSubscribeOCP}
                              />
                            </div>
                          </Tooltip>
                        )}
                      </Form>
                    ) : (
                      <Spinner size="lg" aria-label="Loading..." />
                    )}
                  </GridItem>
                </Grid>
              </CardBody>
              <CardFooter>
                <Button
                  variant="primary"
                  type="submit"
                  onClick={submitForm}
                  isDisabled={registerClusterResponse.pending || !isValid || !validation.isValid}
                >
                  Register cluster
                </Button>
                <Link to="/cluster-list">
                  <Button variant="secondary" isDisabled={registerClusterResponse.pending}>
                    Cancel
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          )}
        </Formik>
      </PageSection>
    </AppPage>
  );
};

export default RegisterCluster;
