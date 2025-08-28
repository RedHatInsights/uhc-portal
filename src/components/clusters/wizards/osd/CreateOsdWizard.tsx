import React from 'react';
import { Formik, FormikValues } from 'formik';
import omit from 'lodash/omit';
import { useDispatch } from 'react-redux';

import {
  Banner,
  PageSection,
  Spinner,
  Wizard,
  WizardStep,
  WizardStepChangeScope,
  WizardStepType,
} from '@patternfly/react-core';
import { WizardContextProps } from '@patternfly/react-core/dist/esm/components/Wizard/WizardContext';

import { ocmResourceTypeByProduct, TrackEvent, trackEvents } from '~/common/analytics';
import { shouldRefetchQuota } from '~/common/helpers';
import { Navigate, useNavigate } from '~/common/routing';
import { AppPage } from '~/components/App/AppPage';
import { availableQuota } from '~/components/clusters/common/quotaSelectors';
import {
  ClusterSettingsMachinePool,
  ClusterUpdates,
  NodeLabel,
} from '~/components/clusters/wizards/common';
import submitOSDRequest from '~/components/clusters/wizards/common/submitOSDRequest';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { osdWizardFormValidator } from '~/components/clusters/wizards/osd/formValidators';
import Breadcrumbs from '~/components/common/Breadcrumbs';
import PageTitle from '~/components/common/PageTitle';
import Unavailable from '~/components/common/Unavailable';
import config from '~/config';
import useAnalytics from '~/hooks/useAnalytics';
import usePreventBrowserNav from '~/hooks/usePreventBrowserNav';
import { GCP_WIF_DEFAULT, OSD_GCP_WIF } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { resetCreatedClusterResponse } from '~/redux/actions/clustersActions';
import getLoadBalancerValues from '~/redux/actions/loadBalancerActions';
import getPersistentStorageValues from '~/redux/actions/persistentStorageActions';
import { getOrganizationAndQuota } from '~/redux/actions/userActions';
import { useGlobalState } from '~/redux/hooks/useGlobalState';
import { QuotaCostList } from '~/types/accounts_mgmt.v1';
import { ErrorState } from '~/types/types';

import { QuotaTypes } from '../../common/quotaModel';
import { useClusterWizardResetStepsHook } from '../hooks/useClusterWizardResetStepsHook';

import { CloudProviderType, GCPAuthType } from './ClusterSettings/CloudProvider/types';
import { BillingModel } from './BillingModel';
import {
  CloudProviderStepFooter,
  ClusterSettingsCloudProvider,
  ClusterSettingsDetails,
} from './ClusterSettings';
import {
  ariaLabel,
  breadcrumbs,
  documentTitle,
  FieldId,
  initialTouched,
  initialValues,
  StepId,
  StepName,
  UrlPath,
} from './constants';
import { CreateOsdWizardFooter } from './CreateOsdWizardFooter';
import {
  NetworkingCidrRanges,
  NetworkingClusterProxy,
  NetworkingConfiguration,
  NetworkingVpcSettings,
} from './Networking';
import { ReviewAndCreate } from './ReviewAndCreate';

interface CreateOsdWizardProps {
  product?: string;
}

const CreateOsdWizardInternal = () => {
  const track = useAnalytics();
  const navigate = useNavigate();
  const {
    values: {
      [FieldId.Product]: product,
      [FieldId.CloudProvider]: cloudProvider,
      [FieldId.Byoc]: byoc,
      [FieldId.InstallToVpc]: installToVpc,
      [FieldId.ConfigureProxy]: configureProxy,
    },
  } = useFormState();
  const { values } = useFormState();

  const organization = useGlobalState((state) => state.userProfile.organization);
  const loadBalancerValues = useGlobalState((state) => state.loadBalancerValues);
  const persistentStorageValues = useGlobalState((state) => state.persistentStorageValues);
  const createClusterResponse = useGlobalState((state) => state.clusters.createdCluster);

  const [currentStep, setCurrentStep] = React.useState<WizardStepType>();

  const wizardContextRef = React.useRef<Partial<WizardContextProps>>();
  const onWizardContextChange = ({ steps, setStep, goToStepById }: Partial<WizardContextProps>) => {
    wizardContextRef.current = {
      steps,
      setStep,
      goToStepById,
    };
  };
  useClusterWizardResetStepsHook({ currentStep, wizardContextRef, values });

  const hasProductQuota =
    availableQuota(organization.quotaList as QuotaCostList, {
      product,
      resourceType: QuotaTypes.CLUSTER,
    }) >= 1;

  const requestErrors = [
    {
      data: organization,
      name: 'Organization & Quota',
    },
    {
      data: loadBalancerValues,
      name: 'Load balancers',
    },
    {
      data: persistentStorageValues,
      name: 'Storage options',
    },
  ].reduce((acc: { key: string; message: string; response: ErrorState }[], request) => {
    if (request.data.error) {
      acc.push({
        key: request.name,
        message: `Error while loading required form data (${request.name})`,
        response: request.data,
      });
    }
    return acc;
  }, []);

  const trackStepChange = (event: TrackEvent, stepName?: string) =>
    track(event, {
      resourceType: (ocmResourceTypeByProduct as Record<string, string>)[product],
      ...(stepName && {
        customProperties: {
          step_name: stepName,
        },
      }),
    });

  const onClose = () => navigate(UrlPath.CreateCloud);

  const onStepChange = (
    event: React.MouseEvent<HTMLButtonElement>,
    currentStep: WizardStepType,
    prevStep: WizardStepType,
    scope: WizardStepChangeScope,
  ) => {
    let trackEvent: TrackEvent;
    setCurrentStep(currentStep);

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

    trackStepChange(trackEvent, currentStep?.name?.toString());
  };

  if (
    organization.pending ||
    loadBalancerValues.pending ||
    persistentStorageValues.pending ||
    (!organization.fulfilled && !organization.error)
  ) {
    return (
      <PageSection hasBodyWrapper={false}>
        <div className="pf-v6-u-text-align-center">
          <Spinner size="lg" arial-label="Loading..." />
        </div>
      </PageSection>
    );
  }

  if (createClusterResponse.fulfilled) {
    return <Navigate replace to={`/details/s/${createClusterResponse.cluster.subscription?.id}`} />;
  }

  if (organization.fulfilled && !hasProductQuota) {
    return <Navigate replace to="/create" />;
  }

  if (requestErrors.length > 0) {
    return (
      <PageSection hasBodyWrapper={false}>
        <Unavailable errors={requestErrors} />
      </PageSection>
    );
  }

  return (
    <Wizard
      id="osd-wizard"
      onClose={onClose}
      onStepChange={onStepChange}
      footer={
        <CreateOsdWizardFooter
          track={() => trackStepChange(trackEvents.WizardSubmit)}
          onWizardContextChange={onWizardContextChange}
        />
      }
      nav={{ 'aria-label': `${ariaLabel} steps` }}
      isVisitRequired
    >
      <WizardStep name={StepName.BillingModel} id={StepId.BillingModel}>
        <BillingModel />
      </WizardStep>
      <WizardStep
        name={StepName.ClusterSettings}
        id={StepId.ClusterSettings}
        isExpandable
        steps={[
          <WizardStep
            name={StepName.CloudProvider}
            id={StepId.ClusterSettingsCloudProvider}
            footer={<CloudProviderStepFooter onWizardContextChange={onWizardContextChange} />}
          >
            <ClusterSettingsCloudProvider />
          </WizardStep>,
          <WizardStep name={StepName.Details} id={StepId.ClusterSettingsDetails}>
            <ClusterSettingsDetails />
          </WizardStep>,
          <WizardStep name={StepName.MachinePool} id={StepId.ClusterSettingsMachinePool}>
            <ClusterSettingsMachinePool />
          </WizardStep>,
        ]}
      />
      <WizardStep
        name={StepName.Networking}
        id={StepId.Networking}
        isExpandable
        steps={[
          <WizardStep
            name={StepName.Configuration}
            id={StepId.NetworkingConfiguration}
            isHidden={cloudProvider === CloudProviderType.Gcp && byoc !== 'true'}
          >
            <NetworkingConfiguration />
          </WizardStep>,
          <WizardStep
            name={StepName.VpcSettings}
            id={StepId.NetworkingVpcSettings}
            isHidden={!installToVpc}
          >
            <NetworkingVpcSettings />
          </WizardStep>,
          <WizardStep
            name={StepName.ClusterProxy}
            id={StepId.NetworkingClusterProxy}
            isHidden={!configureProxy}
          >
            <NetworkingClusterProxy />
          </WizardStep>,
          <WizardStep name={StepName.CidrRanges} id={StepId.NetworkingCidrRanges}>
            <NetworkingCidrRanges />
          </WizardStep>,
        ]}
      />
      <WizardStep name={StepName.ClusterUpdates} id={StepId.ClusterUpdates}>
        <ClusterUpdates />
      </WizardStep>
      <WizardStep name={StepName.Review} id={StepId.Review}>
        <ReviewAndCreate />
      </WizardStep>
    </Wizard>
  );
};

export const CreateOsdWizard = ({ product }: CreateOsdWizardProps) => {
  const dispatch = useDispatch();
  const persistentStorageValues = useGlobalState((state) => state.persistentStorageValues);
  const loadBalancerValues = useGlobalState((state) => state.loadBalancerValues);
  const organization = useGlobalState((state) => state.userProfile.organization);

  usePreventBrowserNav();

  React.useEffect(() => {
    if (shouldRefetchQuota(organization, false)) {
      dispatch(getOrganizationAndQuota() as any);
    }
    // just on getting into the component
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!persistentStorageValues.fulfilled && !persistentStorageValues.pending) {
      dispatch(getPersistentStorageValues());
    }
    if (!loadBalancerValues.fulfilled && !loadBalancerValues.pending) {
      dispatch(getLoadBalancerValues());
    }
    return () => {
      dispatch(resetCreatedClusterResponse());
    };
  }, [
    dispatch,
    loadBalancerValues.fulfilled,
    loadBalancerValues.pending,
    persistentStorageValues.fulfilled,
    persistentStorageValues.pending,
  ]);

  const onSubmit = async (values: FormikValues) => {
    const hasNodeLabels = values[FieldId.NodeLabels].some(
      (nodeLabel: NodeLabel) => !!nodeLabel.key,
    );
    const submitValues = omit(values, [
      FieldId.CidrDefaultValuesEnabled,
      FieldId.AcknowledgePrereq,
      ...(!hasNodeLabels ? [FieldId.NodeLabels] : []),
    ]);
    dispatch((() => submitOSDRequest(dispatch, { isWizard: true })(submitValues)) as any);
  };

  const isWifEnabled = useFeatureGate(OSD_GCP_WIF);
  const isWifDefaultEnabled = useFeatureGate(GCP_WIF_DEFAULT);

  const defaultAuthType =
    isWifEnabled && isWifDefaultEnabled
      ? GCPAuthType.WorkloadIdentityFederation
      : GCPAuthType.ServiceAccounts;

  const defaultInitialValues = {
    ...initialValues,
    ...(product && { product }),
    [FieldId.GcpAuthType]: defaultAuthType,
  };

  return (
    <AppPage title={documentTitle}>
      <Formik
        initialValues={defaultInitialValues}
        initialTouched={initialTouched}
        validate={osdWizardFormValidator}
        validateOnChange={false}
        onSubmit={onSubmit}
      >
        <>
          <PageTitle
            title="Create an OpenShift Dedicated Cluster"
            breadcrumbs={<Breadcrumbs path={breadcrumbs} />}
          />
          <PageSection hasBodyWrapper={false}>
            {config.fakeOSD && (
              <Banner color="yellow">On submit, a fake OSD cluster will be created.</Banner>
            )}
            <CreateOsdWizardInternal />
          </PageSection>
        </>
      </Formik>
    </AppPage>
  );
};
