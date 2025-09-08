import React from 'react';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import { Alert, Button, Form } from '@patternfly/react-core';

import { Link } from '~/common/routing';
import Modal from '~/components/common/Modal/Modal';
import { useFetchMachineTypes } from '~/queries/ClusterDetailsQueries/MachinePoolTab/MachineTypes/useFetchMachineTypes';
import { HIDE_RH_MARKETPLACE } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { refreshClusterDetails } from '~/queries/refreshEntireCache';
import { useGlobalState } from '~/redux/hooks/useGlobalState';
import { SubscriptionCommonFieldsCluster_billing_model as SubscriptionCommonFieldsClusterBillingModel } from '~/types/accounts_mgmt.v1';

import getClusterName from '../../../../common/getClusterName';
import links from '../../../../common/installLinks.mjs';
import { normalizedProducts } from '../../../../common/subscriptionTypes';
import { useUpgradeClusterFromTrial } from '../../../../queries/ClusterActionsQueries/useUpgradeClusterFromTrial';
import { useFetchMachineOrNodePools } from '../../../../queries/ClusterDetailsQueries/MachinePoolTab/useFetchMachineOrNodePools';
import { getOrganizationAndQuota } from '../../../../redux/actions/userActions';
import MechTraining from '../../../../styles/images/RH_BRAND_7764_01_MECH_Training.svg';
import ErrorBox from '../../../common/ErrorBox';
import ExternalLink from '../../../common/ExternalLink';
import { closeModal } from '../../../common/Modal/ModalActions';
import modals from '../../../common/Modal/modals';
import { isHypershiftCluster } from '../clusterStates';
import { QuotaTypes } from '../quotaModel';
import { availableQuota } from '../quotaSelectors';

import './UpgradeTrialClusterDialog.scss';

const UpgradeTrialClusterDialog = ({ onClose }) => {
  const dispatch = useDispatch();
  const hideRHMarketplace = useFeatureGate(HIDE_RH_MARKETPLACE);
  const modalData = useGlobalState((state) => state.modal.data);
  const organization = useGlobalState((state) => state.userProfile.organization);
  const clusterID = modalData.clusterID ? modalData.clusterID : '';
  const cluster = modalData.cluster ? modalData.cluster : '';
  const clusterDisplayName = getClusterName(modalData.cluster);
  const { shouldDisplayClusterName } = modalData;

  const isHypershift = isHypershiftCluster(cluster);
  const clusterVersionID = cluster?.version?.id;
  const clusterRawVersionID = cluster?.version?.raw_id;
  const region = cluster?.subscription?.rh_region_id;

  const { data: machinePools } = useFetchMachineOrNodePools(
    clusterID,
    isHypershift,
    clusterVersionID,
    region,
    clusterRawVersionID,
  );

  const { data } = useFetchMachineTypes(region);
  const machineTypesByID = data.typesByID;

  const {
    isPending: isUpgradeFromTrialPending,
    isError: isUpgradeFromTrialError,
    error: upgradeFromTrialError,
    mutate: upgradeClusterFromTrial,
  } = useUpgradeClusterFromTrial();

  React.useEffect(() => {
    if (!organization.pending) {
      dispatch(getOrganizationAndQuota());
    }
    // ComponentDidMount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitUpgrade = (clusterID, billingModel) => {
    const params = {
      billing_model: billingModel,
      product: {
        id: 'osd',
      },
    };
    upgradeClusterFromTrial(
      { clusterID, params, region },
      {
        onSuccess: () => {
          dispatch(closeModal());
          onClose();
          refreshClusterDetails();
        },
      },
    );
  };

  const buttonLinkClick = (link) => {
    window.open(link, '_blank');
  };

  const upgradeModalQuota = () => {
    const { OSD } = normalizedProducts;
    const { quotaList } = organization;
    // OSD Trial is always CCS
    const isBYOC = true;
    const isMultiAz = get(cluster, 'multi_az');

    const cloudProviderID = get(cluster, 'cloud_provider.id');
    const machinePoolTypes = machinePools?.reduce((acc, mp) => {
      const instanceTypeID = mp.instance_type;
      const resourceName = machineTypesByID[instanceTypeID]?.generic_name;
      const numOfMachines = mp.autoscaling ? mp.autoscaling.max_replicas : mp.replicas;

      if (acc[resourceName]) {
        acc[resourceName] += numOfMachines;
      } else {
        acc[resourceName] = numOfMachines;
      }
      return acc;
    }, {});

    const quota = { MARKETPLACE: !hideRHMarketplace, STANDARD: true };
    Object.keys(machinePoolTypes || {}).forEach((key) => {
      const quotaParams = {
        product: OSD,
        cloudProviderID,
        resourceName: key,
        isBYOC,
        isMultiAz,
      };

      const standardClusters = availableQuota(quotaList, {
        ...quotaParams,
        billingModel: SubscriptionCommonFieldsClusterBillingModel.standard,
        resourceType: QuotaTypes.CLUSTER,
      });
      const standardNodes = availableQuota(quotaList, {
        ...quotaParams,
        billingModel: SubscriptionCommonFieldsClusterBillingModel.standard,
        resourceType: QuotaTypes.NODE,
      });

      quota.STANDARD =
        quota.STANDARD && standardNodes >= machinePoolTypes[key] && standardClusters > 0;

      const marketClusters = availableQuota(quotaList, {
        ...quotaParams,
        billingModel: SubscriptionCommonFieldsClusterBillingModel.marketplace,
        resourceType: QuotaTypes.CLUSTER,
      });
      const marketNodes = availableQuota(quotaList, {
        ...quotaParams,
        billingModel: SubscriptionCommonFieldsClusterBillingModel.marketplace,
        resourceType: QuotaTypes.NODE,
      });

      quota.MARKETPLACE =
        !hideRHMarketplace &&
        quota.MARKETPLACE &&
        marketNodes >= machinePoolTypes[key] &&
        marketClusters > 0;
    });
    return quota;
  };

  const getPrimaryButtonProps = (availableQuotaValue) => {
    const marketplaceQuotaEnabled = availableQuotaValue.MARKETPLACE && !hideRHMarketplace;
    const button = {
      primaryText: 'Contact sales',
      onPrimaryClick: () => buttonLinkClick('https://cloud.redhat.com/products/dedicated/contact/'),
    };

    if (availableQuotaValue.STANDARD && !marketplaceQuotaEnabled) {
      button.primaryText = 'Upgrade using quota';
      button.primaryLink = null;
      button.onPrimaryClick = () =>
        submitUpgrade(clusterID, SubscriptionCommonFieldsClusterBillingModel.standard);
      return button;
    }

    if (marketplaceQuotaEnabled) {
      button.primaryText = 'Upgrade using Marketplace billing';
      button.primaryLink = null;
      button.onPrimaryClick = () =>
        submitUpgrade(clusterID, SubscriptionCommonFieldsClusterBillingModel.marketplace);
      return button;
    }

    return button;
  };

  const getSecondaryButtonProps = (availableQuotaValue) => {
    const marketplaceQuotaEnabled = availableQuotaValue.MARKETPLACE && !hideRHMarketplace;
    const button = {
      showSecondary: false,
    };

    button.secondaryText = 'Enable Marketplace billing';
    button.showSecondary = !hideRHMarketplace;
    button.onSecondaryClick = () =>
      buttonLinkClick('https://marketplace.redhat.com/en-us/products/red-hat-openshift-dedicated');

    if (marketplaceQuotaEnabled && availableQuotaValue.STANDARD) {
      button.secondaryText = 'Upgrade using quota';
      button.onSecondaryClick = () =>
        submitUpgrade(clusterID, SubscriptionCommonFieldsClusterBillingModel.standard);
    }

    if (marketplaceQuotaEnabled && !availableQuotaValue.STANDARD) {
      button.showSecondary = false;
      button.secondaryLink = null;
    }

    return button;
  };

  const getTertiaryButtonProps = () => {
    const cancelEdit = () => {
      dispatch(closeModal());
      refreshClusterDetails();
    };
    return {
      tertiaryText: 'Cancel',
      onTertiaryClick: cancelEdit,
      showTertiary: true,
      onClose: cancelEdit,
    };
  };

  const error = isUpgradeFromTrialError ? (
    <ErrorBox message="Error upgrading cluster" response={upgradeFromTrialError} />
  ) : null;

  const availableQuotaValue = upgradeModalQuota();
  const primaryButton = getPrimaryButtonProps(availableQuotaValue);
  const secondaryButton = getSecondaryButtonProps(availableQuotaValue);
  const tertiaryButton = getTertiaryButtonProps();
  const noQuota =
    !availableQuotaValue.STANDARD && (!availableQuotaValue.MARKETPLACE || hideRHMarketplace);
  const modalSize = noQuota ? 'small' : 'medium';

  return (
    <Modal
      title="Upgrade cluster from Trial"
      secondaryTitle={shouldDisplayClusterName ? clusterDisplayName : undefined}
      data-testid="upgrade-trial-cluster-dialog"
      modalSize={modalSize}
      isSmall={false}
      {...primaryButton}
      className="upgrade-trial-cluster-dialog"
      {...secondaryButton}
      {...tertiaryButton}
      isPending={isUpgradeFromTrialPending}
    >
      {error}
      <Form onSubmit={() => submitUpgrade(clusterID)}>
        <div>
          {!noQuota && <img className="upgrade-trial-logo" src={MechTraining} alt="Red Hat" />}
          Convert this trial cluster to a fully supported OpenShift Dedicated cluster.
          <br />
          <br />
          <ExternalLink href={links.OCM_DOCS_UPGRADING_OSD_TRIAL}>Learn more</ExternalLink>
          {noQuota && (
            <Alert
              variant="warning"
              isInline
              title="Your organization doesn't have enough quota to upgrade this cluster."
              className="upgrade-trial-no-quota"
              data-testid="no-quota-alert"
            >
              <Link to="/quota">
                <Button id="subscriptions" variant="link">
                  View your available quota
                </Button>
              </Link>
            </Alert>
          )}
        </div>
      </Form>
    </Modal>
  );
};

UpgradeTrialClusterDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
};

UpgradeTrialClusterDialog.modalName = modals.UPGRADE_TRIAL_CLUSTER;

export default UpgradeTrialClusterDialog;
