import React from 'react';

import { Alert, Content, ContentVariants } from '@patternfly/react-core';

import docLinks from '~/common/docLinks.mjs';
import supportLinks from '~/common/supportLinks.mjs';
import ExternalLink from '~/components/common/ExternalLink';

interface RosaGovCloudFipsWarningProps {
  'data-testid'?: string;
  className?: string;
}

export const RosaGovCloudFipsWarning = ({
  'data-testid': dataTestId = 'rosa-govcloud-fips-warning',
  className,
}: RosaGovCloudFipsWarningProps) => (
  <Alert
    variant="warning"
    isInline
    isLiveRegion
    className={className}
    data-testid={dataTestId}
    title="Currently, only OpenShift Container Platform version 4.18.x utilizes cryptographic modules with full CMVP approval."
  >
    <Content>
      <Content component={ContentVariants.p}>
        ROSA in AWS GovCloud additionally supports OpenShift Container Platform versions 4.19, 4.20,
        4.21, 4.22. These OCP versions leverage cryptographic modules that are currently in the
        process of obtaining FIPS 140-3 validation from CMVP.
      </Content>
      <Content component={ContentVariants.p} className="pf-v6-u-mt-sm">
        All ROSA GovCloud clusters are deployed in{' '}
        <ExternalLink href={docLinks.OCP_INSTALLING_FIPS}>FIPS mode</ExternalLink>. Refer here for
        more information:{' '}
        <ExternalLink href={supportLinks.ROSA_GOVCLOUD_FIPS_KB}>
          ROSA GovCloud and FIPS-validated Cryptography
        </ExternalLink>
      </Content>
    </Content>
  </Alert>
);
