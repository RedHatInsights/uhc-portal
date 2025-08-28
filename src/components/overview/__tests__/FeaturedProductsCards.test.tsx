import React from 'react';

import { checkAccessibility, render, screen, userEvent, waitFor } from '~/testUtils';

import { FeaturedProductsCards } from '../components/FeaturedProductsCards/FeaturedProductsCards';
import {
  FEATURED_PRODUCTS_CARDS,
  FEATURED_PRODUCTS_CARDS_TEST_CASES,
} from '../components/fixtures';

import '@testing-library/jest-dom';

const TITLE = 'Featured products';

describe('<FeaturedProductsCards />', () => {
  // Arrange
  const { openLearnMore } = FEATURED_PRODUCTS_CARDS_TEST_CASES.NON_SELECTED;
  let index = 0;

  it.each(FEATURED_PRODUCTS_CARDS)(
    'renders "$title" card, verifies some card details and ensures it is not selected',
    async ({ title, logo, description, drawerPanelContent }) => {
      // Arrange
      render(<FeaturedProductsCards {...FEATURED_PRODUCTS_CARDS_TEST_CASES.NON_SELECTED} />);

      // Assert
      // Cards Info:
      const readMoreBtns = screen.getAllByTestId(
        `product-overview-card__learn-more-button-${TITLE}`,
      );

      const productCardLogos = screen.getAllByTestId('product-overview-card__logo');

      const productOverviewCards = screen.getAllByTestId('product-overview-card');

      expect(screen.getByText(`${title}`)).toBeInTheDocument();
      expect(screen.getByText(`${description}`)).toBeInTheDocument();

      expect(productCardLogos[index]).toHaveAttribute('src', `${logo}`);

      await waitFor(() =>
        expect(productOverviewCards[index]).not.toHaveClass('pf-m-selected-raised'),
      );
      expect(productOverviewCards[index]).not.toHaveClass('pf-m-selected-raised');

      const readMoreBtn = readMoreBtns[index];
      await userEvent.click(readMoreBtn);

      expect(openLearnMore).toHaveBeenCalledWith(title, drawerPanelContent);

      index += 1;
    },
  );

  it('renders title, link and all cards & checks functionality', async () => {
    // Arrange
    const { container } = render(
      <FeaturedProductsCards {...FEATURED_PRODUCTS_CARDS_TEST_CASES.NON_SELECTED} />,
    );

    // Assert
    // title:
    expect(screen.getByText(TITLE)).toBeInTheDocument();

    // Cards Info:
    const readMoreBtns = screen.getAllByTestId(`product-overview-card__learn-more-button-${TITLE}`);

    const productCardLogos = screen.getAllByTestId('product-overview-card__logo');
    expect(productCardLogos).toHaveLength(4);

    const productOverviewCards = screen.getAllByTestId('product-overview-card');

    // click on learn more button of Openshift AI
    const readMoreBtn = readMoreBtns[1];
    await userEvent.click(readMoreBtn);

    await waitFor(() => expect(productOverviewCards[0]).not.toHaveClass('pf-m-selected-raised'));
    // ensure Advanced Cluster Security card is NOT selected
    expect(productOverviewCards[0]).not.toHaveClass('pf-m-selected-raised');

    const labelTexts = screen.getAllByText(/60-day trial/i);
    expect(labelTexts).toHaveLength(3);

    const includedLabelText = screen.getAllByText(/Included/i);
    expect(includedLabelText).toHaveLength(1);

    const openRightDrawerIcons = screen.getAllByTestId('open-right-drawer-icon');
    expect(openRightDrawerIcons).toHaveLength(4);

    await checkAccessibility(container);
  });

  it('renders advanced cluster security as selected card, and the other card is not selected', async () => {
    // Arrange
    render(
      <FeaturedProductsCards
        {...FEATURED_PRODUCTS_CARDS_TEST_CASES.ADVANCED_CLUSTER_SECURITY_SELECTED}
      />,
    );

    // Assert
    const productOverviewCards = screen.getAllByTestId('product-overview-card');
    const advancedClusterSecurityCard = productOverviewCards[0];
    await waitFor(() => expect(advancedClusterSecurityCard).toHaveClass('pf-m-selected-raised'));
    expect(advancedClusterSecurityCard).toHaveClass('pf-m-selected-raised');

    expect(productOverviewCards[1]).not.toHaveClass('pf-m-selected-raised');
  });
});
