import React from 'react';

import PageHeader from '@patternfly/react-component-groups/dist/dynamic/PageHeader';
import { Flex, FlexItem, Grid, Stack, StackItem } from '@patternfly/react-core';

import { Link } from '~/common/routing';
import ExternalLink from '~/components/common/ExternalLink';
import InternalTrackingLink from '~/components/common/InternalTrackingLink';

import './OverviewProductBanner.scss';

export type OverviewProductBannerProps = {
  title: string;
  icon?: string;
  altText?: string;
  learnMoreLink?: string;
  description: string;
  dataTestId?: string;
};

export const OverviewProductBanner = ({
  icon,
  altText,
  learnMoreLink,
  title,
  description,
  dataTestId,
}: OverviewProductBannerProps) => {
  const createClusterURL = '/create';
  const createClusterAIURL = '/assisted-installer/clusters/~new';

  const headerActions = (
    <Flex>
      <FlexItem>
        <InternalTrackingLink
          isButton
          variant="primary"
          to={createClusterURL}
          data-testid="create-cluster"
          component={Link}
        >
          Create cluster
        </InternalTrackingLink>
      </FlexItem>
      <FlexItem>
        <InternalTrackingLink
          isButton
          variant="secondary"
          to={createClusterAIURL}
          data-testid="create-cluster-assisted-installer"
          component={Link}
        >
          Create cluster with Assisted Installer
        </InternalTrackingLink>
      </FlexItem>
      {learnMoreLink ? (
        <FlexItem>
          <ExternalLink href={learnMoreLink}>Learn more</ExternalLink>
        </FlexItem>
      ) : null}
    </Flex>
  );

  const subtitle = (
    <Stack hasGutter>
      <StackItem>{description}</StackItem>
      <StackItem>{headerActions}</StackItem>
    </Stack>
  );

  return (
    <Grid className="overview-product-banner-grid" data-testid={dataTestId}>
      <PageHeader
        title={title}
        subtitle={subtitle}
        icon={
          icon ? <img src={icon} alt={altText} className="overview-product-banner-icon" /> : null
        }
        data-testid={dataTestId}
      />
    </Grid>
  );
};
