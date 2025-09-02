import React from 'react';

import PageHeader from '@patternfly/react-component-groups/dist/dynamic/PageHeader';

type Props = {
  title: string;
  breadcrumbs?: React.ReactNode;
  children?: React.ReactNode;
};

const PageTitle = ({ title, breadcrumbs, children }: Props) => (
  <PageHeader title={title} breadcrumbs={breadcrumbs} subtitle="">
    {children}
  </PageHeader>
);

export default PageTitle;
