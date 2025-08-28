import React from 'react';

import PageHeader from '@patternfly/react-component-groups/dist/dynamic/PageHeader';

export type ProductBannerProps = {
  icon?: React.ReactNode;
  title: string;
  text: string;
  linkLabel: string;
  linkHref: string;
  breadcrumbs?: React.ReactNode;
  dataTestId?: string;
};

export const ProductBanner = ({
  icon,
  title,
  text,
  linkLabel,
  linkHref,
  breadcrumbs,
  dataTestId,
}: ProductBannerProps) => (
  <PageHeader
    title={title}
    subtitle={text}
    breadcrumbs={breadcrumbs}
    icon={icon}
    data-testid={dataTestId}
    linkProps={{
      label: linkLabel,
      isExternal: true,
      href: linkHref,
      target: '_blank',
    }}
  />
);
