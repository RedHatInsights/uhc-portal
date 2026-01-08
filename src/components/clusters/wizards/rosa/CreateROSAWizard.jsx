import React from 'react';
import { Formik } from 'formik';
import PropTypes from 'prop-types';

import {
  Banner,
  PageSection,
  Spinner,
  Wizard,
  WizardStep,
  WizardStepChangeScope,
} from '@patternfly/react-core';

import { ocmResourceType, trackEvents } from '~/common/analytics';
import { shouldRefetchQuota } from '~/common/helpers';
import { Navigate, useNavigate } from '~/common/routing';
import { AppDrawerContext } from '~/components/App/AppDrawer';
import { AppPage } from '~/components/App/AppPage';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { rosaWizardFormValidator } from '~/components/clusters/wizards/rosa/formValidators';
import {
  getAccountAndRolesStepId,
  stepId,
  stepNameById,
} from '~/components/clusters/wizards/rosa/rosaWizardConstants';
import config from '~/config';
import withAnalytics from '~/hoc/withAnalytics';
import useAnalytics from '~/hooks/useAnalytics';
import usePreventBrowserNav from '~/hooks/usePreventBrowserNav';
import { HYPERSHIFT_WIZARD_FEATURE } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { isRestrictedEnv } from '~/restrictedEnv';

import ErrorBoundary from '../../../App/ErrorBoundary';
import Breadcrumbs from '../../../common/Breadcrumbs';
import PageTitle from '../../../common/PageTitle';
import Unavailable from '../../../common/Unavailable';
import { useClusterWizardResetStepsHook } from '../hooks/useClusterWizardResetStepsHook';

import CIDRScreen from './CIDRScreen/CIDRScreen';
import ClusterRolesScreen from './ClusterRolesScreen/ClusterRolesScreen';
import Details from './ClusterSettings/Details/Details';
import ControlPlaneScreen from './ControlPlaneScreen/ControlPlaneScreen';
import NetworkScreen from './NetworkScreen/NetworkScreen';
import UpdatesScreen from './UpdatesScreen/UpdatesScreen';
import { VPCScreen } from './VPCScreen/VPCScreen';
import AccountsRolesScreen from './AccountsRolesScreen';
import ClusterProxyScreen from './ClusterProxyScreen';
import { FieldId, initialTouched, initialValues, initialValuesRestrictedEnv } from './constants';
import CreateClusterErrorModal from './CreateClusterErrorModal';
import CreateRosaWizardFooter from './CreateRosaWizardFooter';
import MachinePoolScreen from './MachinePoolScreen';
import ReviewClusterScreen from './ReviewClusterScreen';
import { ValuesPanel } from './ValuesPanel';

import './createROSAWizard.scss';

const breadcrumbs = [
  { label: 'Cluster List' },
  { label: 'Cluster Type', path: '/create' },
  { label: 'Set up ROSA', path: '/create/rosa/getstarted' },
  { label: 'Create a ROSA Cluster' },
];

const title = (
  <PageTitle title="Create a ROSA Cluster" breadcrumbs={<Breadcrumbs path={breadcrumbs} />} />
);

const trackWizardNavigation = (track, event, currentStepId = '') => {
  track(event, {
    resourceType: ocmResourceType.MOA,
    customProperties: {
      step_name: stepNameById[currentStepId],
    },
  });
};

const CreateROSAWizardInternal = ({
  isHypershiftEnabled,
  isHypershiftSelected,
  getOrganizationAndQuota,
  organization,
  machineTypes,
  cloudProviders,
  getMachineTypes,
  getCloudProviders,
  getInstallableVersionsResponse,
  clearInstallableVersions,
  getUserRoleResponse,
  createClusterResponse,
  getUserRole,
  privateLinkSelected,
  installToVPCSelected,
  configureProxySelected,
  resetResponse,
  closeDrawer,
  isErrorModalOpen,
  openModal,
  selectedAWSAccountID,
  createCluster,
}) => {
  const navigate = useNavigate();
  const track = useAnalytics();
  const { resetForm, values } = useFormState();

  const accountAndRolesStepId = getAccountAndRolesStepId(isHypershiftEnabled);
  const firstStepId = isHypershiftEnabled ? stepId.CONTROL_PLANE : accountAndRolesStepId;

  const [currentStepId, setCurrentStepId] = React.useState(firstStepId);
  const [currentStep, setCurrentStep] = React.useState();

  const wizardContextRef = React.useRef();

  const onWizardContextChange = ({ steps, setStep, goToStepById }) => {
    wizardContextRef.current = {
      steps,
      setStep,
      goToStepById,
    };
  };
  useClusterWizardResetStepsHook({
    currentStep,
    wizardContextRef,
    values,
    additionalStepIndex: accountAndRolesStepId,
    additionalCondition: !selectedAWSAccountID,
  });

  React.useEffect(() => {
    // On component mount
    if (shouldRefetchQuota(organization, false)) {
      getOrganizationAndQuota();
    }
    if (!cloudProviders.fulfilled && !cloudProviders.pending) {
      getCloudProviders();
    }
    if (!machineTypes.fulfilled && !machineTypes.pending) {
      getMachineTypes();
    }
    if (getInstallableVersionsResponse.fulfilled) {
      clearInstallableVersions();
    }
    return () => {
      // onUnmount
      resetResponse();
      resetForm();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (createClusterResponse.error && !isErrorModalOpen) {
      openModal('osd-create-error');
    }
  }, [createClusterResponse, isErrorModalOpen, openModal]);

  const ariaTitle = 'Create ROSA cluster wizard';
  const onClose = () => navigate('/create/cloud');

  const trackStepChange = (event, currentStepId = '') =>
    track(event, {
      resourceType: ocmResourceType.MOA,
      customProperties: {
        step_name: stepNameById[currentStepId],
      },
    });

  const onStepChange = (_event, currentStep, _prevStep, scope) => {
    setCurrentStep(currentStep);
    setCurrentStepId(currentStep.id);

    let trackEvent;

    switch (scope) {
      case WizardStepChangeScope.Next:
        trackEvent = trackEvents.WizardNext;
        break;
      case WizardStepChangeScope.Back:
        trackEvent = trackEvents.WizardBack;
        break;
      default:
        trackEvent = trackEvents.WizardLinkNav;
    }

    trackStepChange(trackEvent, currentStep.id);

    closeDrawer({ skipOnClose: true });
  };

  // Needed data requests are pending
  const requests = [
    {
      data: machineTypes,
      name: 'Machine types',
    },
    {
      data: organization,
      name: 'Organization & Quota',
    },
  ];
  const anyRequestPending = requests.some((request) => request.data.pending);
  if (anyRequestPending || (!organization.fulfilled && !organization.error)) {
    return (
      <>
        {title}
        <PageSection hasBodyWrapper={false}>
          <div className="pf-v6-u-text-align-center">
            <Spinner size="lg" arial-label="Loading..." />
          </div>
        </PageSection>
      </>
    );
  }

  // Any errors
  const anyErrors = requests.some((request) => request.data.error);

  if (anyErrors) {
    return (
      <PageSection hasBodyWrapper={false}>
        <Unavailable
          errors={requests
            .filter((request) => request.data.error)
            .map((request) => ({
              key: request.name,
              message: `Error while loading required form data (${request.name})`,
              response: request.data,
            }))}
        />
      </PageSection>
    );
  }

  // Create cluster request has completed
  if (createClusterResponse.fulfilled) {
    return <Navigate replace to={`/details/s/${createClusterResponse.cluster.subscription?.id}`} />;
  }

  // Show wizard
  return (
    <>
      {title}
      <PageSection hasBodyWrapper={false}>
        {config.fakeOSD && ( // TODO Is ?fake=true supported for ROSA clusters?
          <Banner color="yellow">On submit, a fake ROSA cluster will be created.</Banner>
        )}
        <div className="ocm-page pf-v6-u-display-flex">
          <Wizard
            id="rosa-wizard"
            className="rosa-wizard pf-v6-u-flex-1"
            onClose={onClose}
            onStepChange={onStepChange}
            footer={
              <>
                {isErrorModalOpen && <CreateClusterErrorModal />}
                <CreateRosaWizardFooter
                  isHypershiftSelected={isHypershiftSelected}
                  currentStepId={currentStepId}
                  accountAndRolesStepId={accountAndRolesStepId}
                  getUserRoleResponse={getUserRoleResponse}
                  getUserRoleInfo={() => getUserRole()}
                  isSubmitting={createClusterResponse.pending}
                  onWizardContextChange={onWizardContextChange}
                />
              </>
            }
            nav={{ 'aria-label': `${ariaTitle} steps` }}
            isVisitRequired
          >
            {isHypershiftEnabled ? (
              <WizardStep id={stepId.CONTROL_PLANE} name={stepNameById[stepId.CONTROL_PLANE]}>
                <ErrorBoundary>
                  <ControlPlaneScreen />
                </ErrorBoundary>
              </WizardStep>
            ) : null}

            <WizardStep id={accountAndRolesStepId} name={stepNameById[accountAndRolesStepId]}>
              <ErrorBoundary>
                <AccountsRolesScreen
                  organizationID={organization?.details?.id}
                  isHypershiftEnabled={isHypershiftEnabled}
                  isHypershiftSelected={isHypershiftSelected}
                />
              </ErrorBoundary>
            </WizardStep>

            <WizardStep
              id={stepId.CLUSTER_SETTINGS}
              name={stepNameById[stepId.CLUSTER_SETTINGS]}
              isExpandable
              steps={[
                <WizardStep
                  id={stepId.CLUSTER_SETTINGS__DETAILS}
                  name={stepNameById[stepId.CLUSTER_SETTINGS__DETAILS]}
                >
                  <ErrorBoundary>
                    <Details />
                  </ErrorBoundary>
                </WizardStep>,

                <WizardStep
                  id={stepId.CLUSTER_SETTINGS__MACHINE_POOL}
                  name={stepNameById[stepId.CLUSTER_SETTINGS__MACHINE_POOL]}
                >
                  <ErrorBoundary>
                    <MachinePoolScreen />
                  </ErrorBoundary>
                </WizardStep>,
              ]}
            />

            <WizardStep
              id={stepId.NETWORKING}
              name={stepNameById[stepId.NETWORKING]}
              isExpandable
              steps={[
                <WizardStep
                  id={stepId.NETWORKING__CONFIGURATION}
                  name={stepNameById[stepId.NETWORKING__CONFIGURATION]}
                >
                  <ErrorBoundary>
                    <NetworkScreen
                      showClusterPrivacy
                      showVPCCheckbox
                      showClusterWideProxyCheckbox
                      privateLinkSelected={privateLinkSelected}
                      forcePrivateLink
                    />
                  </ErrorBoundary>
                </WizardStep>,

                <WizardStep
                  id={stepId.NETWORKING__VPC_SETTINGS}
                  name={stepNameById[stepId.NETWORKING__VPC_SETTINGS]}
                  isHidden={!installToVPCSelected || isHypershiftSelected}
                >
                  <ErrorBoundary>
                    <VPCScreen privateLinkSelected={privateLinkSelected} />
                  </ErrorBoundary>
                </WizardStep>,

                <WizardStep
                  id={stepId.NETWORKING__CLUSTER_WIDE_PROXY}
                  name={stepNameById[stepId.NETWORKING__CLUSTER_WIDE_PROXY]}
                  isHidden={!configureProxySelected}
                >
                  <ErrorBoundary>
                    <ClusterProxyScreen isHypershiftSelected={isHypershiftSelected} />
                  </ErrorBoundary>
                </WizardStep>,

                <WizardStep
                  id={stepId.NETWORKING__CIDR_RANGES}
                  name={stepNameById[stepId.NETWORKING__CIDR_RANGES]}
                >
                  <ErrorBoundary>
                    <CIDRScreen />
                  </ErrorBoundary>
                </WizardStep>,
              ]}
            />

            <WizardStep
              id={stepId.CLUSTER_ROLES_AND_POLICIES}
              name={stepNameById[stepId.CLUSTER_ROLES_AND_POLICIES]}
            >
              <ErrorBoundary>
                <ClusterRolesScreen />
              </ErrorBoundary>
            </WizardStep>

            <WizardStep id={stepId.CLUSTER_UPDATES} name={stepNameById[stepId.CLUSTER_UPDATES]}>
              <ErrorBoundary>
                <UpdatesScreen />
              </ErrorBoundary>
            </WizardStep>

            <WizardStep id={stepId.REVIEW_AND_CREATE} name={stepNameById[stepId.REVIEW_AND_CREATE]}>
              <ReviewClusterScreen
                createCluster={createCluster}
                isSubmitPending={createClusterResponse?.pending}
              />
            </WizardStep>
          </Wizard>
          {config.fakeOSD && <ValuesPanel />}
        </div>
      </PageSection>
    </>
  );
};

function CreateROSAWizard(props) {
  usePreventBrowserNav();
  const {
    values: {
      [FieldId.InstallToVpc]: installToVPCSelected,
      [FieldId.UsePrivateLink]: privateLinkSelected,
      [FieldId.ConfigureProxy]: configureProxySelected,
      [FieldId.AssociatedAwsId]: selectedAWSAccountID,
      [FieldId.Hypershift]: hypershiftValue,
    },
    values,
    isValidating,
    isValid,
    resetForm,
  } = useFormState();
  const isHypershiftSelected = hypershiftValue === 'true';
  const combinedProps = {
    ...props,
    installToVPCSelected,
    privateLinkSelected,
    configureProxySelected,
    selectedAWSAccountID,
    isHypershiftSelected,
  };
  const isHypershiftEnabled = useFeatureGate(HYPERSHIFT_WIZARD_FEATURE);

  return (
    <AppPage title="Create OpenShift ROSA Cluster">
      <AppDrawerContext.Consumer>
        {({ closeDrawer }) => (
          <CreateROSAWizardInternal
            {...combinedProps}
            closeDrawer={closeDrawer}
            isHypershiftEnabled={isHypershiftEnabled}
            formValues={values}
            isValidating={isValidating}
            isValid={isValid}
            resetForm={resetForm}
          />
        )}
      </AppDrawerContext.Consumer>
    </AppPage>
  );
}

const requestStatePropTypes = PropTypes.shape({
  fulfilled: PropTypes.bool,
  error: PropTypes.bool,
  pending: PropTypes.bool,
});

CreateROSAWizardInternal.propTypes = {
  installToVPCSelected: PropTypes.bool,
  privateLinkSelected: PropTypes.bool,
  configureProxySelected: PropTypes.bool,
  isErrorModalOpen: PropTypes.bool,

  createClusterResponse: PropTypes.shape({
    fulfilled: PropTypes.bool,
    error: PropTypes.bool,
    pending: PropTypes.bool,
    cluster: PropTypes.shape({
      subscription: PropTypes.shape({
        id: PropTypes.string,
      }),
    }),
  }),
  machineTypes: requestStatePropTypes,
  organization: PropTypes.shape({
    fulfilled: PropTypes.bool,
    error: PropTypes.bool,
    pending: PropTypes.bool,
    details: { id: PropTypes.string },
  }),
  cloudProviders: requestStatePropTypes,

  getMachineTypes: PropTypes.func,
  getOrganizationAndQuota: PropTypes.func,
  createCluster: PropTypes.func,
  getUserRole: PropTypes.func,
  getCloudProviders: PropTypes.func,

  resetResponse: PropTypes.func,
  openModal: PropTypes.func,
  getUserRoleResponse: PropTypes.object,

  // for cancel button
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    block: PropTypes.func,
  }).isRequired,

  closeDrawer: PropTypes.func,
};

const CreateROSAWizardFormik = (props) => {
  const { onSubmit, track } = props;
  return (
    <Formik
      initialValues={isRestrictedEnv() ? initialValuesRestrictedEnv : initialValues()}
      initialTouched={initialTouched}
      validate={rosaWizardFormValidator}
      validateOnChange
      onSubmit={(formikValues) => {
        trackWizardNavigation(track, trackEvents.WizardSubmit);
        onSubmit(formikValues);
      }}
    >
      <CreateROSAWizard {...props} />
    </Formik>
  );
};

CreateROSAWizardFormik.propTypes = { ...CreateROSAWizardInternal.propTypes };

export default withAnalytics(CreateROSAWizardFormik);
