import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { useWizardContext } from '@patternfly/react-core';
import { WizardContextProps } from '@patternfly/react-core/dist/esm/components/Wizard/WizardContext';

import {
  getCloudProverInfo,
  shouldValidateCcsCredentials,
} from '~/components/clusters/wizards/common/utils/ccsCredentials';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { CreateOsdWizardFooter } from '~/components/clusters/wizards/osd/CreateOsdWizardFooter';
import { useGlobalState } from '~/redux/hooks';
import { SubscriptionCommonFieldsCluster_billing_model as SubscriptionCommonFieldsClusterBillingModel } from '~/types/accounts_mgmt.v1';

import { useGetBillingQuotas } from '../../BillingModel/useGetBillingQuotas';
import { FieldId } from '../../constants';

export const CloudProviderStepFooter = ({
  onWizardContextChange,
}: {
  onWizardContextChange(context: Partial<WizardContextProps>): void;
}) => {
  const dispatch = useDispatch();
  const { values } = useFormState();
  const { goToNextStep } = useWizardContext();
  const { ccsCredentialsValidity } = useGlobalState((state) => state.ccsInquiries);
  const [pendingValidation, setPendingValidation] = useState(false);

  const quotas = useGetBillingQuotas({
    product: values[FieldId.Product],
    billingModel: values[FieldId.BillingModel],
    isBYOC: values[FieldId.Byoc] === 'true',
  });
  const hasGcpResources =
    values[FieldId.BillingModel] === SubscriptionCommonFieldsClusterBillingModel.marketplace_gcp ||
    quotas.gcpResources;

  const disableNextButton = !hasGcpResources && values[FieldId.CloudProvider] === 'gcp';

  const onNext = () => {
    const validateCcsCredentials = shouldValidateCcsCredentials(values, ccsCredentialsValidity);

    if (validateCcsCredentials) {
      getCloudProverInfo(values, dispatch);
      setPendingValidation(true);
    } else {
      goToNextStep();
    }
  };

  useEffect(() => {
    if (pendingValidation) {
      if (ccsCredentialsValidity.fulfilled || ccsCredentialsValidity.error) {
        setPendingValidation(false);
        if (ccsCredentialsValidity.fulfilled) {
          goToNextStep();
        }
      }
    }
  }, [
    pendingValidation,
    ccsCredentialsValidity.fulfilled,
    ccsCredentialsValidity.error,
    goToNextStep,
  ]);

  return (
    <CreateOsdWizardFooter
      isNextDisabled={disableNextButton}
      onNext={onNext}
      isLoading={pendingValidation}
      onWizardContextChange={onWizardContextChange}
    />
  );
};
