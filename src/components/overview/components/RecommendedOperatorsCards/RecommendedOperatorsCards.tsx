import React from 'react';

import { Gallery, GalleryItem, Title } from '@patternfly/react-core';

import ExternalLink from '~/components/common/ExternalLink';

import { ProductCard } from '../../../common/ProductCard/ProductCard';
import { DRAWER_PANEL_CONTENT, DrawerPanelContentNode } from '../common/DrawerPanelContent';
import PRODUCT_CARD_LOGOS from '../common/ProductCardLogos';

import './RecommendedOperatorsCards.scss';

type RecommendedOperatorsCardsNode = {
  title: string;
  description: string;
  logo?: string;
  labelText?: string;
  drawerPanelContent?: DrawerPanelContentNode;
};

const RECOMMENDED_OPERATORS_CARDS: RecommendedOperatorsCardsNode[] = [
  {
    ...PRODUCT_CARD_LOGOS.gitops,
    description:
      'Integrate git repositories, continuous integration/continuous delivery (CI/CD) tools, and Kubernetes.',
    labelText: 'Included',
    drawerPanelContent: DRAWER_PANEL_CONTENT.gitops,
  },
  {
    ...PRODUCT_CARD_LOGOS.pipelines,
    description:
      'Automate your application delivery using a continuous integration and continuous deployment (CI/CD) framework.',
    labelText: 'Included',
    drawerPanelContent: DRAWER_PANEL_CONTENT.pipelines,
  },
  {
    ...PRODUCT_CARD_LOGOS.serviceMesh,
    description: 'Connect, manage, and observe microservices-based applications in a uniform way.',
    labelText: 'Included',
    drawerPanelContent: DRAWER_PANEL_CONTENT.serviceMesh,
  },
];

type RecommendedOperatorsCardsProps = {
  openLearnMore: (title: string, content?: DrawerPanelContentNode) => void;
  selectedCardTitle: string;
};

const TITLE = 'Recommended operators';

// TODO: This component can be refactored and simplified when using ProductCardView component (a generic ProductCard view in a Flex Layout) - LInk to ticket: https://issues.redhat.com/browse/OCMUI-2413

const RecommendedOperatorsCards = ({
  openLearnMore,
  selectedCardTitle,
}: RecommendedOperatorsCardsProps) => (
  <div className="recommended-operators-cards">
    <Title size="xl" headingLevel="h2" className="pf-v6-u-mt-lg" id="recommended-operators">
      {TITLE}
    </Title>
    <Gallery
      className="pf-v6-u-mb-lg"
      hasGutter
      minWidths={{
        default: '22em',
      }}
      maxWidths={{
        default: '22em',
      }}
    >
      {RECOMMENDED_OPERATORS_CARDS.map((card) => (
        <GalleryItem
          key={card.title}
          className="pf-v6-u-pt-md "
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
    <ExternalLink href="https://catalog.redhat.com/search?searchType=software&deployed_as=Operator">
      View all in Ecosystem Catalog
    </ExternalLink>
  </div>
);

export { RecommendedOperatorsCards, RECOMMENDED_OPERATORS_CARDS };
