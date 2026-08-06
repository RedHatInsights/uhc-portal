import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { useWizardContext } from '@patternfly/react-core';
import { WizardContextProps } from '@patternfly/react-core/dist/esm/components/Wizard/WizardContext';

import { isGcpMarketplaceBilling } from '~/components/clusters/common/billingModelMapper';
import { availableQuota } from '~/components/clusters/common/quotaSelectors';
import { CloudProviderType } from '~/components/clusters/wizards/common/constants';
import {
  getCloudProverInfo,
  shouldValidateCcsCredentials,
} from '~/components/clusters/wizards/common/utils/ccsCredentials';
import { quotaParams, QuotaType } from '~/components/clusters/wizards/common/utils/quotas';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { CreateOsdWizardFooter } from '~/components/clusters/wizards/osd/CreateOsdWizardFooter';
import { useGlobalState } from '~/redux/hooks';
import { QuotaCostList } from '~/types/accounts_mgmt.v1';

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
  const quotaList = useGlobalState(
    (state) => state.userProfile.organization.quotaList,
  ) as QuotaCostList;
  const [pendingValidation, setPendingValidation] = useState(false);

  const billingModel = values[FieldId.BillingModel];
  const hasGcpResources =
    isGcpMarketplaceBilling(billingModel) ||
    availableQuota(quotaList, {
      ...quotaParams[QuotaType.GcpResources],
      product: values[FieldId.Product],
      billingModel,
      isBYOC: values[FieldId.Byoc] === 'true',
    }) > 0;

  const disableNextButton =
    !hasGcpResources && values[FieldId.CloudProvider] === CloudProviderType.Gcp;

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
