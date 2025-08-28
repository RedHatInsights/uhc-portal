import React from 'react';

import { Content } from '@patternfly/react-core';

import PageTitle from '../../../common/PageTitle';

interface InstructionsChooserPageTitleProps {
  cloudName: string;
  breadcrumbs: React.ReactNode;
}

export const InstructionsChooserPageTitle = ({
  cloudName,
  breadcrumbs,
}: InstructionsChooserPageTitleProps) => (
  <PageTitle title={`Create an OpenShift Cluster: ${cloudName}`} breadcrumbs={breadcrumbs}>
    <Content className="pf-v6-u-mt-sm">
      <Content component="p">Select the installation type that best fits your needs.</Content>
    </Content>
  </PageTitle>
);
