import React from 'react';

import { Alert, Split, SplitItem } from '@patternfly/react-core';

import installLinks from '~/common/installLinks.mjs';
import ExternalLink from '~/components/common/ExternalLink';

type GcpOrgPolicyAlertProps = {
  summary: string | undefined;
};

const GcpOrgPolicyAlert = ({ summary }: GcpOrgPolicyAlertProps) => {
  const projectName = summary?.match(/'([^']+)'/)?.[1];

  return (
    <Split>
      <SplitItem isFilled>
        <Alert
          id="gcp-org-policy-alert"
          variant="warning"
          className="pf-v6-u-mt-md"
          isInline
          title={
            <>
              Your installation might be affected by the{' '}
              <ExternalLink href={installLinks.GCP_ORG_POLICY}>
                Google Cloud Organization Policy Service
              </ExternalLink>
            </>
          }
        >
          <>
            OCM is unable to determine whether the Google Cloud organization contains any policies
            that would affect the installation without the Google Cloud Org Policy API enabled.
            Enable the{' '}
            <ExternalLink href={installLinks.GCP_ORG_POLICY_API}>
              Organization Policy API
            </ExternalLink>{' '}
            for the Google Cloud project &apos;{projectName}&apos;
          </>
        </Alert>
      </SplitItem>
    </Split>
  );
};

export default GcpOrgPolicyAlert;
