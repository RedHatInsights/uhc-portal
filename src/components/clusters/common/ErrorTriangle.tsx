import React from 'react';
import { ReactElementLike, ReactNodeLike } from 'prop-types';

import { Icon, Tooltip } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';

type ErrorTriangleProps = {
  item?: string;
  errorMessage: string | ReactNodeLike | ReactElementLike;
};

const ErrorTriangle = ({ item = 'clusters', errorMessage }: ErrorTriangleProps) => (
  <Tooltip
    content={`An error occurred when fetching ${item}${errorMessage ? `: ${errorMessage}` : '.'}`}
    data-testid="error-triangle"
  >
    <Icon
      size="lg"
      status="warning"
      className="cluster-error-triangle"
      aria-label="Warning"
      data-testid="error-triangle-icon"
    >
      <ExclamationTriangleIcon />
    </Icon>
  </Tooltip>
);

export default ErrorTriangle;
