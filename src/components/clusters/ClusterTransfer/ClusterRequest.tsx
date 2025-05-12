import React from 'react';

import {
  Flex,
  FlexItem,
  PageSection,
  PageSectionVariants,
  Split,
  SplitItem,
  Title,
} from '@patternfly/react-core';

import { AppPage } from '~/components/App/AppPage';
import Breadcrumbs from '~/components/common/Breadcrumbs';

import ClusterTransferList from './ClusterTransferList';

const ClusterRequestList = () => {
  const PAGE_TITLE = 'Cluster Request | Red Hat OpenShift Cluster Manager';
  const breadCrumbs = (
    <Breadcrumbs path={[{ label: 'Cluster List' }, { label: 'Cluster Requests' }]} />
  );

  return (
    <AppPage title={PAGE_TITLE}>
      <PageSection variant={PageSectionVariants.light}>
        <Split>
          <SplitItem className="pf-v5-u-pb-md">{breadCrumbs}</SplitItem>
        </Split>
        <Flex>
          <FlexItem grow={{ default: 'grow' }}>
            <Title headingLevel="h1">Cluster Requests</Title>
          </FlexItem>
        </Flex>
      </PageSection>
      <ClusterTransferList />
      {/* TODO: Add Access request list here */}
    </AppPage>
  );
};
export default ClusterRequestList;
