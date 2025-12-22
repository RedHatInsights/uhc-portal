import React, { useMemo, useState } from 'react';

import { Alert, AlertActionCloseButton, Content, ExpandableSection } from '@patternfly/react-core';

import { getOCMResourceType, trackEvents } from '~/common/analytics';
import { HAS_USER_DISMISSED_RECOMMENDED_OPERATORS_ALERT } from '~/common/localStorageConstants';
import ExternalLink from '~/components/common/ExternalLink';
import useAnalytics from '~/hooks/useAnalytics';
import { ClusterState } from '~/types/clusters_mgmt.v1/enums';

import { ProductCardNode } from '../../../../../../common/ProductCard/ProductCard';
import { DrawerPanelContentNode } from '../../../../../../overview/components/common/DrawerPanelContent';
import { FEATURED_PRODUCTS_CARDS } from '../../../../../../overview/components/FeaturedProductsCards/FeaturedProductsCards';
import { RECOMMENDED_OPERATORS_CARDS } from '../../../../../../overview/components/RecommendedOperatorsCards/RecommendedOperatorsCards';
import clusterStates from '../../../../../common/clusterStates';

import ProductCardView from './ProductCardView';

const OPERATORS_CARDS: ProductCardNode[] = [
  ...FEATURED_PRODUCTS_CARDS,
  ...RECOMMENDED_OPERATORS_CARDS,
];

type RecommendedOperatorsAlertProps = {
  openLearnMore: (title: string, content?: DrawerPanelContentNode) => void;
  selectedCardTitle?: string;
  clusterState: clusterStates;
  closeDrawer: () => void;
  onDismissAlertCallback: () => void;
  consoleURL?: string;
  planType: string;
};

const STATIC_ALERT_MESSAGES = {
  actionRequired: {
    title: 'Action is required in order to continue cluster creation.',
    description: 'Please address the issue before considering recommended operators.',
  },
  installing: {
    title: 'Your cluster is being created.',
    description:
      'While you wait, learn how to optimize your cluster with Operators. You can go to other pages, just come back here to check on your cluster.',
  },
  ready: {
    title: 'Optimize your cluster with operators.',
    description:
      'Check out our recommended operators for you, or view all operators in the console.',
  },
  hibernating: {
    title: 'Your cluster is currently hibernating.',
    description: 'Please wake the cluster before considering recommended operators.',
  },
  error: {
    title: 'Your cluster encountered an error.',
    description: 'Please address the issue before considering recommended operators.',
  },
};

const RecommendedOperatorsAlert = ({
  openLearnMore,
  selectedCardTitle = '',
  clusterState,
  closeDrawer,
  onDismissAlertCallback,
  consoleURL,
  planType,
}: RecommendedOperatorsAlertProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const track = useAnalytics();
  const onToggle = (_event: React.MouseEvent, isExpanded: boolean) => {
    // collapsing the Alert component also closes the Drawer
    if (!isExpanded) {
      closeDrawer();
    }
    setIsExpanded(isExpanded);
  };
  const onDismissAlert = () => {
    if (isExpanded) {
      closeDrawer();
    }
    setIsExpanded(false);

    const resourceType = getOCMResourceType(planType);

    // When the user dismisses the Alert, the value is saved in the user's LocalStorage
    localStorage.setItem(HAS_USER_DISMISSED_RECOMMENDED_OPERATORS_ALERT, 'true');

    onDismissAlertCallback();

    track(trackEvents.AlertInteraction, {
      resourceType,
      customProperties: {
        type: 'recommended-operators',
        action: 'dismiss',
        severity: 'info',
      },
    });
  };

  // if consoleURL is not provided, present a static "console" without a link
  const alertMessages = useMemo(
    () => ({
      ...STATIC_ALERT_MESSAGES,
      ...(consoleURL
        ? {
            ready: {
              title: 'Optimize your cluster with operators.',
              description: (
                <Content component="p" data-testid="alert-description-with-consoleURL-provided">
                  Check out our recommended operators for you, or view all operators in the{' '}
                  <ExternalLink noIcon href={consoleURL}>
                    console
                  </ExternalLink>
                  .
                </Content>
              ),
            },
          }
        : {}),
    }),
    [consoleURL],
  );

  const { title, description } = useMemo(() => {
    switch (true) {
      case clusterState === clusterStates.waiting:
        return alertMessages.actionRequired;
      case [clusterStates.installing, clusterStates.validating, clusterStates.pending].includes(
        clusterState as ClusterState,
      ):
        return alertMessages.installing;
      case clusterState === clusterStates.hibernating:
        return alertMessages.hibernating;
      case clusterState === clusterStates.error:
        return alertMessages.error;
      default:
        return alertMessages.ready;
    }
  }, [alertMessages, clusterState]);

  return (
    <Alert
      variant="info"
      title={title}
      isInline
      actionClose={<AlertActionCloseButton onClose={onDismissAlert} />}
      className="pf-v6-u-mt-md"
      component="h2"
    >
      <Content component="p">{description}</Content>
      <ExpandableSection
        toggleText={`${isExpanded ? 'Hide' : 'Show'} recommended operators`}
        onToggle={onToggle}
        isExpanded={isExpanded}
      >
        <ProductCardView
          cards={OPERATORS_CARDS}
          openLearnMore={openLearnMore}
          selectedCardTitle={selectedCardTitle}
          isHidden={!isExpanded}
        />
      </ExpandableSection>
    </Alert>
  );
};

export { RecommendedOperatorsAlert, STATIC_ALERT_MESSAGES };
