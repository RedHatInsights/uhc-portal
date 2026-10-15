import React from 'react';

import { Alert, AlertActionCloseButton, AlertVariant } from '@patternfly/react-core';

import installLinks from '~/common/installLinks.mjs';
import { HAS_USER_DISMISSED_ARO_OPP_MARKETPLACE_ALERT } from '~/common/localStorageConstants';
import ExternalLink from '~/components/common/ExternalLink';

type Props = {
  onDismiss: () => void;
};

const AroPlatformPlusMarketplaceAlert = ({ onDismiss }: Props) => {
  const handleClose = () => {
    localStorage.setItem(HAS_USER_DISMISSED_ARO_OPP_MARKETPLACE_ALERT, 'true');
    onDismiss();
  };

  return (
    <Alert
      variant={AlertVariant.info}
      isInline
      component="h2"
      className="pf-v6-u-mt-md"
      title="Red Hat OpenShift Platform Plus is now available for Azure Red Hat OpenShift"
      actionClose={<AlertActionCloseButton onClose={handleClose} />}
      data-testid="aro-platform-plus-marketplace-alert"
    >
      Learn how OpenShift Platform Plus provides cluster management, multi-cluster security, global
      registry, and storage capabilities that integrate into your workloads.{' '}
      <ExternalLink
        data-testid="aro-opp-azure-marketplace-emea"
        href={installLinks.ARO_OPP_AZURE_MARKETPLACE_EMEA}
      >
        Azure Marketplace listing for EMEA
      </ExternalLink>{' '}
      /{' '}
      <ExternalLink
        data-testid="aro-opp-azure-marketplace-non-emea"
        href={installLinks.ARO_OPP_AZURE_MARKETPLACE_NON_EMEA}
      >
        Azure Marketplace listing for NA, LATAM, and APAC
      </ExternalLink>
      .
    </Alert>
  );
};

export default AroPlatformPlusMarketplaceAlert;
