import React from 'react';

import { Card, CardBody, CardFooter } from '@patternfly/react-core/dist/dynamic/components/Card';
import { Content } from '@patternfly/react-core/dist/dynamic/components/Content';
import { Icon } from '@patternfly/react-core/dist/dynamic/components/Icon';
import ArrowRightIcon from '@patternfly/react-icons/dist/esm/icons/arrow-right-icon';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';

import { Link } from '~/common/routing/Link';

interface SimpleServiceWidgetProps {
  id: number;
  body: string;
  linkTitle: string;
  url: string;
  isExternal?: boolean;
}

export const SimpleServiceWidget: React.FunctionComponent<SimpleServiceWidgetProps> = ({
  id,
  body,
  linkTitle,
  url,
  isExternal,
}) => (
  <Card isPlain>
    <CardBody className="pf-v6-u-p-md pf-v6-u-pb-0">
      <Content key={id} className="pf-v6-u-display-flex pf-v6-u-flex-direction-column">
        <Content component="p" className="pf-v6-u-flex-grow-1">
          {body}{' '}
        </Content>
      </Content>
    </CardBody>
    <CardFooter className="pf-v6-u-p-md">
      {isExternal ? (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {linkTitle}
          <Icon className="pf-v6-u-ml-sm" isInline>
            <ExternalLinkAltIcon />
          </Icon>
        </a>
      ) : (
        <Link to={url}>
          {linkTitle}
          <Icon className="pf-v6-u-ml-sm" isInline>
            <ArrowRightIcon />
          </Icon>
        </Link>
      )}
    </CardFooter>
  </Card>
);
