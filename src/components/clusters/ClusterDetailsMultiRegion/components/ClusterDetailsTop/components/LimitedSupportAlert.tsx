import React from 'react';

import {
  Alert,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';

import links from '~/common/installLinks.mjs';
import MarkdownParser from '~/common/MarkdownParser';
import ExternalLink from '~/components/common/ExternalLink';

type LimitedSupportAlertProps = {
  limitedSupportReasons?: {
    id?: string;
    summary?: string;
    details?: string;
    override?: { enabled: boolean };
  }[];
  isROSA?: boolean;
  isOSD?: boolean;
  setHasLimitedSupportAlert?: (isTrue: boolean) => void;
};

const LimitedSupportAlert = ({
  limitedSupportReasons,
  isROSA,
  isOSD,
  setHasLimitedSupportAlert,
}: LimitedSupportAlertProps) => {
  const legitReasons = React.useMemo(
    () => limitedSupportReasons?.filter((r) => !r.override?.enabled) || [],
    [limitedSupportReasons],
  );

  const hasLegitReasons = legitReasons.length > 0;

  if (hasLegitReasons && setHasLimitedSupportAlert) {
    setHasLimitedSupportAlert(true);
  }

  return !hasLegitReasons ? null : (
    <Alert
      id="limited-support-alert"
      variant="danger"
      className="pf-v6-u-mt-md"
      isInline
      role="alert"
      isExpandable={legitReasons.length > 1}
      title={`This cluster has limited support${
        legitReasons.length > 1 ? ' due to multiple reasons' : ''
      }.`}
      actionLinks={
        isROSA || isOSD ? (
          <ExternalLink
            href={
              isROSA ? links.ROSA_LIMITED_SUPPORT_DEFINITION : links.OSD_LIMITED_SUPPORT_DEFINITION
            }
          >
            Learn more
          </ExternalLink>
        ) : null
      }
    >
      <DescriptionList>
        {legitReasons.map((reason, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <DescriptionListGroup key={`reason-${index}`} data-testid="dl-group">
            {reason.summary ? <DescriptionListTerm>{reason.summary}</DescriptionListTerm> : null}
            {reason.details ? (
              <DescriptionListDescription>
                <MarkdownParser>{reason.details}</MarkdownParser>
              </DescriptionListDescription>
            ) : null}
          </DescriptionListGroup>
        ))}
      </DescriptionList>
    </Alert>
  );
};

export default LimitedSupportAlert;
