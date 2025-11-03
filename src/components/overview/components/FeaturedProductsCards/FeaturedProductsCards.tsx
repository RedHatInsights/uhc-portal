import React from 'react';

import { Gallery, GalleryItem, Title } from '@patternfly/react-core';

import { ProductCard } from '../../../common/ProductCard/ProductCard';
import { DRAWER_PANEL_CONTENT, DrawerPanelContentNode } from '../common/DrawerPanelContent';
import PRODUCT_CARD_LOGOS from '../common/ProductCardLogos';

const TITLE = 'Featured products';

type FeaturedProductsCardsNode = {
  title: string;
  description: string;
  logo: string;
  labelText?: string;
  drawerPanelContent: DrawerPanelContentNode;
};

const FEATURED_PRODUCTS_CARDS: FeaturedProductsCardsNode[] = [
  {
    ...PRODUCT_CARD_LOGOS.advancedClusterSecurity,
    description:
      'Protect your containerized Kubernetes workloads in all major clouds and hybrid platforms.',
    labelText: '60-day trial',
    drawerPanelContent: DRAWER_PANEL_CONTENT.advancedClusterSecurity,
  },
  {
    ...PRODUCT_CARD_LOGOS.openshiftAi,
    description:
      'Create and deliver generative and predictive AI models at scale across on-premise and public cloud environments.',
    labelText: '60-day trial',
    drawerPanelContent: DRAWER_PANEL_CONTENT.OpenshiftAi,
  },
  {
    ...PRODUCT_CARD_LOGOS.openshiftVirtualization,
    description:
      'Streamline your operations and reduce complexity when you run and manage your VMs, containers, and serverless workloads in a single platform.',
    labelText: 'Included',
    drawerPanelContent: DRAWER_PANEL_CONTENT.OpenshiftVirtualization,
  },
  {
    ...PRODUCT_CARD_LOGOS.advancedClusterManagement,
    description: 'Manage any Kubernetes cluster in your fleet.',
    labelText: '60-day trial',
    drawerPanelContent: DRAWER_PANEL_CONTENT.AdvancedClusterManagement,
  },
];

type FeaturedProductsCardsProps = {
  openLearnMore: (title: string, content?: DrawerPanelContentNode) => void;
  selectedCardTitle: string;
};

// TODO: This component can be refactored and simplified when using ProductCardView component (a generic ProductCard view in a Flex Layout) - LInk to ticket: https://issues.redhat.com/browse/OCMUI-2414

const FeaturedProductsCards = ({
  openLearnMore,
  selectedCardTitle,
}: FeaturedProductsCardsProps) => (
  <div className="featured-products-cards">
    <Title size="xl" headingLevel="h2" className="pf-v6-u-mt-lg" id="featured-products">
      {TITLE}
    </Title>
    <Gallery
      hasGutter
      minWidths={{
        default: '22em',
      }}
      maxWidths={{
        default: '22em',
      }}
    >
      {FEATURED_PRODUCTS_CARDS.map((card) => (
        <GalleryItem
          key={card.title}
          className="pf-v6-u-pt-md"
          data-testid="product-overview-card-flex-item"
        >
          <ProductCard
            {...card}
            openLearnMore={openLearnMore}
            isSelected={card.title === selectedCardTitle}
            dataTestId={TITLE}
          />
        </GalleryItem>
      ))}
    </Gallery>
  </div>
);

export { FeaturedProductsCards, FEATURED_PRODUCTS_CARDS };
