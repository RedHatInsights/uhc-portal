import React from 'react';

import SomeLogo from '~/styles/images/RedHatOpenShiftGitOpsLogo.svg';

import { DRAWER_PANEL_CONTENT, DrawerPanelContentNode } from './common/DrawerPanelContent';
import PRODUCT_CARD_LOGOS from './common/ProductCardLogos';
import { FEATURED_PRODUCTS_CARDS } from './FeaturedProductsCards/FeaturedProductsCards';

const OVERVIEW_PRODUCT_BANNER_BASIC = {
  title: 'some title',
  icon: 'some icon',
  altText: 'some alternative text',
  learnMoreLink: 'some link',
  description: 'I would like to play a game',
};

const OVERVIEW_PRODUCT_BANNER_DESCRIPTION_IS_A_REACT_NODE = {
  ...OVERVIEW_PRODUCT_BANNER_BASIC,
  description: (
    <div role="article">
      {OVERVIEW_PRODUCT_BANNER_BASIC.description}
      <br />
      {OVERVIEW_PRODUCT_BANNER_BASIC.altText}
    </div>
  ),
};

const OVERVIEW_PRODUCT_BANNER_MISSING_OPTIONAL_PROPS = {
  title: OVERVIEW_PRODUCT_BANNER_BASIC.title,
  description: OVERVIEW_PRODUCT_BANNER_BASIC.description,
};

const BASIC_PRODUCT_CARD_PROPS = {
  title: 'example title',
  description: 'example description',
  logo: 'product-overview-card__logo',
  labelText: 'example labelText',
  drawerPanelContent: {
    head: <div data-testid="test-head-div">example drawer panel content head</div>,
    body: <div data-testid="test-body-div">example drawer panel content body</div>,
  },
  openLearnMore: jest.fn(),
  isSelected: false,
  dataTestId: 'some-id',
};

const PRODUCT_CARD_TEST_CASES = {
  UNSELECTED: {
    ...BASIC_PRODUCT_CARD_PROPS,
  },

  SELECTED: {
    ...BASIC_PRODUCT_CARD_PROPS,
    isSelected: true,
  },

  WITHOUT_LABEL_TEXT: {
    ...BASIC_PRODUCT_CARD_PROPS,
    labelText: undefined,
  },
};

const BASIC_DRAWER_PANEL_PROPS = {
  children: <div data-testid="children-of-drawer-panel">some children</div>,
  content: {
    head: <div data-testid="test-head-div">example drawer panel content head</div>,
    body: <div data-testid="test-body-div">example drawer panel content body</div>,
  },
  isOpen: true,
  onClose: jest.fn(),
};

const DRAWER_PANEL_TEST_CASES = {
  OPENED: { ...BASIC_DRAWER_PANEL_PROPS },
};

const BASIC_RECCOMENDED_OPERATORS_CARDS_PROPS = {
  openLearnMore: jest.fn(),
  selectedCardTitle: '',
};

const RECOMMENDED_OPERATORS_CARDS_TEST_CASES = {
  NON_SELECTED: {
    ...BASIC_RECCOMENDED_OPERATORS_CARDS_PROPS,
  },
  GITOPS_SELECTED: {
    ...BASIC_RECCOMENDED_OPERATORS_CARDS_PROPS,
    selectedCardTitle: PRODUCT_CARD_LOGOS.gitops.title,
  },
};

type RecommendedOperatorsCardsNode = {
  title: string;
  description: string;
  logo: string | undefined;
  labelText?: string;
  drawerPanelContent?: DrawerPanelContentNode;
};

const RECOMMENDED_OPERATORS_CARDS_DATA: RecommendedOperatorsCardsNode[] = [
  {
    ...PRODUCT_CARD_LOGOS.gitops,
    description:
      'Integrate git repositories, continuous integration/continuous delivery (CI/CD) tools, and Kubernetes.',
    labelText: 'Free',
    drawerPanelContent: DRAWER_PANEL_CONTENT.gitops,
  },
  {
    ...PRODUCT_CARD_LOGOS.pipelines,
    description:
      'Automate your application delivery using a continuous integration and continuous deployment (CI/CD) framework.',
    labelText: 'Free',
    drawerPanelContent: DRAWER_PANEL_CONTENT.pipelines,
  },
  {
    ...PRODUCT_CARD_LOGOS.serviceMesh,
    description: 'Connect, manage, and observe microservices-based applications in a uniform way.',
    labelText: 'Free',
    drawerPanelContent: DRAWER_PANEL_CONTENT.serviceMesh,
  },
];

const BASIC_FEATURED_PRODUCTS_CARDS_PROPS = {
  openLearnMore: jest.fn(),
  selectedCardTitle: '',
};

const FEATURED_PRODUCTS_CARDS_TEST_CASES = {
  NON_SELECTED: {
    ...BASIC_FEATURED_PRODUCTS_CARDS_PROPS,
  },
  ADVANCED_CLUSTER_SECURITY_SELECTED: {
    ...BASIC_FEATURED_PRODUCTS_CARDS_PROPS,
    selectedCardTitle: PRODUCT_CARD_LOGOS.advancedClusterSecurity.title,
  },
};

const GENERAL_DRAWER_PANEL_HEAD_BASIC = {
  title: 'some title',
  logo: SomeLogo,
};

export {
  OVERVIEW_PRODUCT_BANNER_BASIC,
  OVERVIEW_PRODUCT_BANNER_DESCRIPTION_IS_A_REACT_NODE,
  OVERVIEW_PRODUCT_BANNER_MISSING_OPTIONAL_PROPS,
  PRODUCT_CARD_TEST_CASES,
  DRAWER_PANEL_TEST_CASES,
  RECOMMENDED_OPERATORS_CARDS_TEST_CASES,
  RECOMMENDED_OPERATORS_CARDS_DATA,
  FEATURED_PRODUCTS_CARDS_TEST_CASES,
  FEATURED_PRODUCTS_CARDS,
  GENERAL_DRAWER_PANEL_HEAD_BASIC,
};
