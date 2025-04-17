import React, { useCallback, useState } from 'react';

import { Flex, FlexItem, PageSection, Title } from '@patternfly/react-core';

import { Link } from '~/common/routing';
import InternalTrackingLink from '~/components/common/InternalTrackingLink';

import docLinks from '../../common/installLinks.mjs';
import OpenShiftProductIcon from '../../styles/images/OpenShiftProductIcon.svg';
import { AppPage } from '../App/AppPage';

import DrawerPanel from './components/common/DrawerPanel';
import { DrawerPanelContentNode } from './components/common/DrawerPanelContent';
import { FeaturedProductsCards } from './components/FeaturedProductsCards/FeaturedProductsCards';
import OfferingCard from './components/OfferingCard/OfferingCard';
import {
  OverviewProductBanner,
  OverviewProductBannerProps,
} from './components/OverviewProductBanner';
import { RecommendedOperatorsCards } from './components/RecommendedOperatorsCards/RecommendedOperatorsCards';

import './Overview.scss';

const openshiftHeaderContent: OverviewProductBannerProps = {
  title: 'Get started with OpenShift',
  icon: OpenShiftProductIcon,
  altText: 'OpenShift',
  learnMoreLink: docLinks.WHAT_IS_OPENSHIFT,
  description:
    "Focus on work that matters with the industry's leading hybrid cloud application platform powered by Kubernetes. \nDevelop, modernize, deploy, run, and manage your applications faster and easier.",
  dataTestId: 'OverviewHeader',
};

const PAGE_TITLE = 'Overview | Red Hat OpenShift Cluster Manager';

function OverviewEmptyState() {
  const createClusterURL = '/create';
  const CreateClusterLink = useCallback(
    (props: any) => <Link {...props} data-testid="create-cluster" to={createClusterURL} />,
    [],
  );

  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [drawerInfo, setDrawerInfo] = useState<{
    title: string;
    content?: DrawerPanelContentNode;
  }>();
  const [selectedCardTitle, setSelectedCardTitle] = useState<string>('');

  const openDrawer = (title: string, content?: DrawerPanelContentNode) => {
    setDrawerInfo({ title, content });
    setIsDrawerOpen(true);

    setSelectedCardTitle(title);
  };

  const closeDrawer = () => {
    setDrawerInfo(undefined);
    setIsDrawerOpen(false);

    setSelectedCardTitle('');
  };

  return (
    <DrawerPanel
      title={drawerInfo?.title}
      content={drawerInfo?.content}
      isOpen={isDrawerOpen}
      onClose={closeDrawer}
    >
      <AppPage title={PAGE_TITLE}>
        <OverviewProductBanner {...openshiftHeaderContent} />
        <PageSection>
          <Title size="xl" headingLevel="h2">
            Featured OpenShift cluster types
          </Title>
          <Flex className="pf-v5-u-mb-lg">
            <FlexItem className="pf-v5-u-pt-md" data-testid="offering-card_RHOSD">
              <OfferingCard offeringType="RHOSD" />
            </FlexItem>
            <FlexItem className="pf-v5-u-pt-md" data-testid="offering-card_AWS">
              <OfferingCard offeringType="AWS" />
            </FlexItem>
            <FlexItem className="pf-v5-u-pt-md" data-testid="offering-card_Azure">
              <OfferingCard offeringType="Azure" />
            </FlexItem>
            <FlexItem className="pf-v5-u-pt-md" data-testid="offering-card_RHOCP">
              <OfferingCard offeringType="RHOCP" />
            </FlexItem>
            <FlexItem className="pf-v5-u-pt-md" data-testid="offering-card_RHOIBM">
              <OfferingCard offeringType="RHOIBM" />
            </FlexItem>
            <FlexItem className="pf-v5-u-pt-md" data-testid="offering-card_DEVSNBX">
              <OfferingCard offeringType="DEVSNBX" />
            </FlexItem>
          </Flex>
          <InternalTrackingLink
            to={createClusterURL}
            variant="link"
            data-testid="create-cluster"
            component={CreateClusterLink}
          >
            View all OpenShift cluster types
          </InternalTrackingLink>
          <FeaturedProductsCards openLearnMore={openDrawer} selectedCardTitle={selectedCardTitle} />
          <RecommendedOperatorsCards
            openLearnMore={openDrawer}
            selectedCardTitle={selectedCardTitle}
          />
        </PageSection>
      </AppPage>
    </DrawerPanel>
  );
}

export default OverviewEmptyState;
