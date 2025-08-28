import React from 'react';

import { Alert, Split, SplitItem } from '@patternfly/react-core';

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
              <ExternalLink href="https://cloud.google.com/resource-manager/docs/organization-policy/overview">
                GCP Organization Policy Service
              </ExternalLink>
            </>
          }
        >
          <>
            OCM is unable to determine whether the GCP organization contains any policies that would
            affect the installation without the GCP Org Policy API enabled. Enable the{' '}
            <ExternalLink href="https://cloud.google.com/resource-manager/docs/reference/orgpolicy/rest">
              Organization Policy API
            </ExternalLink>{' '}
            for the GCP project &apos;{projectName}&apos;
          </>
        </Alert>
      </SplitItem>
    </Split>
  );
};

export default GcpOrgPolicyAlert;
