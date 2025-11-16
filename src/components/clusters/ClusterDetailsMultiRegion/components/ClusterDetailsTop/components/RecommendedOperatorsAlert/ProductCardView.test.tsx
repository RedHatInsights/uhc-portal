import React from 'react';

import { checkAccessibility, render, screen, userEvent, waitFor } from '~/testUtils';

import { CARDS, TEST_CASES } from './fixtures';
import ProductCardView from './ProductCardView';

import '@testing-library/jest-dom';

describe('<ProductCardView />', () => {
  const MANDATORY_PROPS = {
    cards: CARDS,
    openLearnMore: jest.fn(),
  };

  const PROPS = {
    ...MANDATORY_PROPS,
    title: 'some title',
    selectedCardTitle: '',
    learnMoreLink: {
      name: 'name of link',
      link: 'some url',
    },
  };

  it.each(TEST_CASES)(
    'should show "$title" ProductCard, check functionality and make sure it is not selected',
    async ({ title, logo, description, drawerPanelContent, index }) => {
      // Arrange
      render(<ProductCardView {...PROPS} />);

      // Assert
      // Card Info:
      const readMoreBtns = screen.getAllByText('Learn more');

      // since this is a logo, we have no visible text to use getByText here
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

      expect(PROPS.openLearnMore).toHaveBeenCalledWith(title, drawerPanelContent);
    },
  );

  it('should show "Advanced Cluster Security for Kubernetes" as selected when providing selectedCardTitle while other ProductCards should not be selected', async () => {
    // Arrange
    render(
      <ProductCardView {...PROPS} selectedCardTitle="Advanced Cluster Security for Kubernetes" />,
    );

    // Assert
    const productOverviewCards = screen.getAllByTestId('product-overview-card');
    const advancedClusterSecurityCard = productOverviewCards[0];
    await waitFor(() => expect(advancedClusterSecurityCard).toHaveClass('pf-m-selected-raised'));
    expect(advancedClusterSecurityCard).toHaveClass('pf-m-selected-raised');

    for (let i = 1; i < CARDS.length; i += 1)
      expect(productOverviewCards[i]).not.toHaveClass('pf-m-selected-raised');
  });

  it(`should show ${CARDS.length} cards and all other props`, () => {
    // Arrange
    render(<ProductCardView {...PROPS} />);

    const { title, learnMoreLink, cards } = PROPS;

    // Assert
    expect(screen.getByText(title)).toBeInTheDocument();

    const productOverviewCards = screen.getAllByTestId('product-overview-card');
    expect(productOverviewCards).toHaveLength(cards.length);

    const learnMore = screen.getByText(learnMoreLink.name);
    expect(learnMore).toBeInTheDocument();
    expect(learnMore).toHaveAttribute('href', learnMoreLink.link);
  });

  it('should show only mandatory props', () => {
    // Arrange
    render(<ProductCardView {...MANDATORY_PROPS} />);

    const { title, learnMoreLink, cards } = PROPS;

    // Assert
    expect(screen.queryByText(title)).not.toBeInTheDocument();

    const productOverviewCards = screen.getAllByTestId('product-overview-card');
    expect(productOverviewCards).toHaveLength(cards.length);

    const learnMore = screen.queryByText(learnMoreLink.name);
    expect(learnMore).not.toBeInTheDocument();
  });

  it('should be hidden when isHidden is true', () => {
    // Arrange
    render(<ProductCardView {...PROPS} isHidden />);

    const { title } = PROPS;

    // Assert
    expect(screen.queryByTestId(`${title}-product-card-view`)).not.toBeVisible();
    expect(screen.getByText(title)).not.toBeVisible();
  });

  it('should be visible when isHidden is false', () => {
    // Arrange
    // isHidden defaults to false
    render(<ProductCardView {...PROPS} />);

    const { title } = PROPS;

    // Assert
    expect(screen.getByText(title)).toBeVisible();
  });

  it(`should pass accessibility check`, async () => {
    // Arrange
    const { container } = render(<ProductCardView {...PROPS} />);

    // Assert
    await checkAccessibility(container);
  });
});
