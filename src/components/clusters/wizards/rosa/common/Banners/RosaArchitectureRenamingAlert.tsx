import React from 'react';

import { Alert, List, ListItem } from '@patternfly/react-core';

import links from '~/common/installLinks.mjs';
import ExternalLink from '~/components/common/ExternalLink';
import { ROSA_ARCHITECTURE_RENAMING_ALERT } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';

const RosaArchitectureRenamingAlert = ({ className }: { className?: string }) => {
  const allowAlert = useFeatureGate(ROSA_ARCHITECTURE_RENAMING_ALERT);

  const learnMoreLink = links.ROSA_ARCHITECTURE_RENAMING_KNOWLEDGE_BASE_ARTICLE;

  return allowAlert ? (
    <Alert
      variant="info"
      isInline
      title="Red Hat OpenShift Service on AWS (ROSA) architectures are being renamed"
      actionLinks={<ExternalLink href={learnMoreLink}>Learn more</ExternalLink>}
      className={className}
    >
      <List>
        <ListItem>
          ROSA Classic architecture will be renamed to &quot;Red Hat OpenShift Service on AWS
          (classic architecture)&quot;.
        </ListItem>
        <ListItem>
          ROSA architecture with hosted control planes will be renamed to &quot;Red Hat OpenShift
          Service on AWS&quot;.
        </ListItem>
      </List>
    </Alert>
  ) : null;
};

export { RosaArchitectureRenamingAlert };
