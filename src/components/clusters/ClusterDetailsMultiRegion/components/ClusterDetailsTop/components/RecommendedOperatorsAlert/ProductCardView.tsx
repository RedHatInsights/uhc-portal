import React from 'react';

import { Gallery, GalleryItem, Title } from '@patternfly/react-core';

import ExternalLink from '~/components/common/ExternalLink';

import { ProductCard, ProductCardNode } from '../../../../../../common/ProductCard/ProductCard';
import { DrawerPanelContentNode } from '../../../../../../overview/components/common/DrawerPanelContent';

type ProductCardViewProps = {
  cards: ProductCardNode[];
  openLearnMore: (title: string, content?: DrawerPanelContentNode) => void;
  title?: string;
  selectedCardTitle?: string;
  learnMoreLink?: {
    name: string;
    link: string;
  };
};

const ProductCardView = ({
  cards,
  openLearnMore,
  title,
  selectedCardTitle,
  learnMoreLink,
}: ProductCardViewProps) => (
  <div className={`${title ? `${title}-` : ''}product-card-view`}>
    {title ? (
      <Title size="xl" headingLevel="h2" className="pf-v6-u-mt-lg">
        {title}
      </Title>
    ) : null}
    <Gallery hasGutter className="pf-v6-u-mb-lg">
      {cards.map((card: ProductCardNode) => (
        <GalleryItem key={card.title} data-testid="product-overview-card-flex-item">
          <ProductCard
            {...card}
            openLearnMore={openLearnMore}
            isSelected={card.title === selectedCardTitle}
            dataTestId={title ?? 'product-card-view'}
          />
        </GalleryItem>
      ))}
    </Gallery>
    {learnMoreLink ? (
      <ExternalLink href={learnMoreLink.link}>{learnMoreLink.name}</ExternalLink>
    ) : null}
  </div>
);

export default ProductCardView;
