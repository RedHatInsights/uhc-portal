import * as React from 'react';

import { Button, EmptyState, EmptyStateBody, Icon } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';

const EmptyIcon = (props: any) => (
  <Icon status="danger">
    <ExclamationCircleIcon {...props} />
  </Icon>
);

const GovCloudTCPage = ({ redirectURL }: { redirectURL: string }) => (
  <EmptyState headingLevel="h4" icon={EmptyIcon} titleText="Signed agreement not detected">
    <EmptyStateBody>
      You need to sign the Enterprise agreement and Appendix4 to proceed
      <br />
      <Button
        variant="link"
        icon={
          <Icon>
            <ExternalLinkAltIcon />
          </Icon>
        }
        iconPosition="right"
        isInline
        onClick={() => window.location.assign(`${redirectURL}&redirect=${window.location.href}`)}
      >
        Sign them here.
      </Button>
    </EmptyStateBody>
  </EmptyState>
);

export default GovCloudTCPage;
