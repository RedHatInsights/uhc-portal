import React from 'react';

import { Button, Content, Stack, StackItem } from '@patternfly/react-core';
import ArrowRightIcon from '@patternfly/react-icons/dist/esm/icons/arrow-right-icon';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';

interface SimpleServiceWidgetProps {
  body: string;
  linkTitle: string;
  url: string;
  isExternal?: boolean;
}

export const SimpleServiceWidget: React.FunctionComponent<SimpleServiceWidgetProps> = ({
  body,
  linkTitle,
  url,
  isExternal,
}) => (
  <Stack hasGutter>
    <StackItem isFilled>
      <Content component="p">{body}</Content>
    </StackItem>
    <StackItem>
      <Button
        variant="link"
        isInline
        component="a"
        href={url}
        icon={isExternal ? <ExternalLinkAltIcon /> : <ArrowRightIcon />}
        iconPosition="end"
        {...(isExternal
          ? {
              target: '_blank',
              rel: 'noopener noreferrer',
            }
          : {})}
      >
        {linkTitle}
        {isExternal ? <span className="pf-v6-u-screen-reader"> (opens new tab)</span> : null}
      </Button>
    </StackItem>
  </Stack>
);
