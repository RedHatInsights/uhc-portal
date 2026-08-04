import React from 'react';

import { Alert, AlertActionCloseButton, AlertVariant } from '@patternfly/react-core';

import installLinks from '~/common/installLinks.mjs';
import { HAS_USER_DISMISSED_ROSA_OPP_MARKETPLACE_ALERT } from '~/common/localStorageConstants';
import ExternalLink from '~/components/common/ExternalLink';

type Props = {
  onDismiss: () => void;
};

const PlatformPlusMarketplaceAlert = ({ onDismiss }: Props) => {
  const handleClose = () => {
    localStorage.setItem(HAS_USER_DISMISSED_ROSA_OPP_MARKETPLACE_ALERT, 'true');
    onDismiss();
  };

  return (
    <Alert
      variant={AlertVariant.info}
      isInline
      component="h2"
      className="pf-v6-u-mt-md"
      title="Red Hat OpenShift Platform Plus for Red Hat OpenShift Service on AWS (ROSA) is now available on the AWS Marketplace"
      actionClose={<AlertActionCloseButton onClose={handleClose} />}
      data-testid="platform-plus-marketplace-alert"
    >
      Learn how Red Hat OpenShift Platform Plus provides cluster management, multi-cluster security,
      global registry, and storage capabilities that integrate into your workloads.{' '}
      <ExternalLink
        data-testid="rosa-opp-aws-marketplace-emea"
        href={installLinks.ROSA_OPP_AWS_MARKETPLACE_EMEA}
      >
        AWS Marketplace listing for EMEA
      </ExternalLink>{' '}
      /{' '}
      <ExternalLink
        data-testid="rosa-opp-aws-marketplace-non-emea"
        href={installLinks.ROSA_OPP_AWS_MARKETPLACE_NON_EMEA}
      >
        AWS Marketplace listing for NA, LATAM, and APAC
      </ExternalLink>
      .
    </Alert>
  );
};

export default PlatformPlusMarketplaceAlert;
