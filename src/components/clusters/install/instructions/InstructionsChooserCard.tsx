import React from 'react';

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Flex,
  FlexItem,
  Icon,
  List,
  ListItem,
  Title,
} from '@patternfly/react-core';
import CheckIcon from '@patternfly/react-icons/dist/esm/icons/check-icon';

import { useNavigate } from '~/common/routing';
import ExternalLink from '~/components/common/ExternalLink';

interface InstructionsChooserCardProps {
  id: string;
  href: string;
  title: React.ReactNode;
  labels: React.ReactNode;
  body: React.ReactNode;
  featureListItems: React.ReactNode[];
  footerLinkHref?: string;
  footerLinkText?: React.ReactNode;
}

export const InstructionsChooserCard = ({
  id,
  href,
  title,
  labels,
  body,
  featureListItems,
  footerLinkHref,
  footerLinkText,
}: InstructionsChooserCardProps) => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(href);
  };

  return (
    <Card
      id={id}
      className="infra-card"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
    >
      <CardHeader>
        <CardTitle id={`${id}-title`}>
          <Flex direction={{ default: 'column' }}>
            <FlexItem>
              <Title headingLevel="h2">
                <Button variant="link" isInline onClick={handleClick}>
                  {title}
                </Button>
              </Title>
            </FlexItem>
            <FlexItem>
              <Flex spaceItems={{ default: 'spaceItemsSm' }}>{labels}</Flex>
            </FlexItem>
          </Flex>
        </CardTitle>
      </CardHeader>
      <CardBody id={`${id}-description`}>
        {body}
        <List isPlain className="pf-v6-u-mt-lg pf-v6-u-ml-0 pf-v6-u-pl-0">
          {featureListItems.map((item, index) => (
            <ListItem
              // These can be arbitrary JSX (no easy string key to use) and they will never change order once the page is rendered, so it is safe to use the array index as the key
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              icon={
                <Icon size="md">
                  <CheckIcon color="var(--pf-t--global--icon--color--status--success--default)" />
                </Icon>
              }
            >
              {item}
            </ListItem>
          ))}
        </List>
      </CardBody>
      {footerLinkHref && (
        <CardFooter>
          <ExternalLink href={footerLinkHref} stopClickPropagation>
            {footerLinkText}
          </ExternalLink>
        </CardFooter>
      )}
    </Card>
  );
};
