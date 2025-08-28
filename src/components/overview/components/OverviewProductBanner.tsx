import React from 'react';

import PageHeader from '@patternfly/react-component-groups/dist/dynamic/PageHeader';
import { Grid } from '@patternfly/react-core';

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
}: OverviewProductBannerProps) => (
  <Grid className="overview-product-banner-grid" data-testid={dataTestId}>
    <PageHeader
      title={title}
      subtitle={description}
      icon={icon ? <img src={icon} alt={altText} className="overview-product-banner-icon" /> : null}
      linkProps={
        learnMoreLink
          ? {
              label: 'Learn more',
              isExternal: true,
              href: learnMoreLink,
              target: '_blank',
            }
          : undefined
      }
      data-testid={dataTestId}
    />
  </Grid>
);
