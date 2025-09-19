import React from 'react';

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Label,
  Split,
  SplitItem,
  Title,
} from '@patternfly/react-core';
import { OpenDrawerRightIcon } from '@patternfly/react-icons/dist/esm/icons/open-drawer-right-icon';

import { DrawerPanelContentNode } from '../../overview/components/common/DrawerPanelContent';

import './ProductCard.scss';

export type ProductCardNode = {
  title: string;
  description: string;
  logo?: string;
  labelText?: string;
  drawerPanelContent?: DrawerPanelContentNode;
};

type ProductCardProps = ProductCardNode & {
  openLearnMore: (title: string, content?: DrawerPanelContentNode) => void;
  isSelected: boolean;
  dataTestId: string;
};

export const ProductCard = ({
  title,
  description,
  logo,
  labelText,
  drawerPanelContent,
  openLearnMore,
  isSelected,
  dataTestId,
}: ProductCardProps) => (
  <Card
    className={`product-overview-card ${isSelected ? 'pf-m-selectable-raised pf-m-selected-raised' : ''}`}
    data-testid="product-overview-card"
    isFullHeight
  >
    <CardHeader>
      <Split hasGutter style={{ width: '100%' }}>
        <SplitItem>
          <img
            src={logo}
            alt={`${title} logo`}
            className="product-overview-card__logo"
            data-testid="product-overview-card__logo"
          />
        </SplitItem>
        <SplitItem isFilled />
        <SplitItem>
          {labelText ? (
            <Label data-testtag="label" color="blue" data-testid="label-text">
              {labelText}
            </Label>
          ) : null}
        </SplitItem>
      </Split>
    </CardHeader>
    <CardTitle>
      <Title headingLevel="h3">{title}</Title>
    </CardTitle>
    <CardBody>{description}</CardBody>
    <CardFooter>
      <Button
        className="product-overview-card__learn-more-button"
        onClick={() => openLearnMore(title, drawerPanelContent)}
        variant="link"
        icon={<OpenDrawerRightIcon data-testid="open-right-drawer-icon" />}
        iconPosition="end"
        data-testid={`product-overview-card__learn-more-button-${dataTestId}`}
      >
        Learn more
      </Button>
    </CardFooter>
  </Card>
);
