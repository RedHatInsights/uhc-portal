import React from 'react';

import { checkAccessibility, render, screen, userEvent, waitFor } from '~/testUtils';

import {
  RECOMMENDED_OPERATORS_CARDS_DATA,
  RECOMMENDED_OPERATORS_CARDS_TEST_CASES,
} from '../components/fixtures';
import { RecommendedOperatorsCards } from '../components/RecommendedOperatorsCards/RecommendedOperatorsCards';

import '@testing-library/jest-dom';

describe('RecommendedOperatorsCards', () => {
  const { openLearnMore } = RECOMMENDED_OPERATORS_CARDS_TEST_CASES.NON_SELECTED;
  let index = 0;

  it.each(RECOMMENDED_OPERATORS_CARDS_DATA)(
    'renders "$title" card, verifies some card details and ensures it is not selected',
    async ({ title, logo, description, drawerPanelContent }) => {
      render(
        <RecommendedOperatorsCards {...RECOMMENDED_OPERATORS_CARDS_TEST_CASES.NON_SELECTED} />,
      );

      // Cards Info:
      const readMoreBtns = screen.getAllByTestId(
        'product-overview-card__learn-more-button-Recommended operators',
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
    const { container } = render(
      <RecommendedOperatorsCards {...RECOMMENDED_OPERATORS_CARDS_TEST_CASES.NON_SELECTED} />,
    );

    // title:
    expect(screen.getByText('Recommended operators')).toBeInTheDocument();

    // link:
    const viewAllInEcosystemCatalogLink = screen.getByText('View all in Ecosystem Catalog');
    expect(viewAllInEcosystemCatalogLink).toBeInTheDocument();
    expect(viewAllInEcosystemCatalogLink).toHaveAttribute(
      'href',
      'https://catalog.redhat.com/search?searchType=software&deployed_as=Operator',
    );

    // Cards Info:
    const readMoreBtns = screen.getAllByTestId(
      'product-overview-card__learn-more-button-Recommended operators',
    );

    const productCardLogos = screen.getAllByTestId('product-overview-card__logo');
    expect(productCardLogos).toHaveLength(3);

    const productOverviewCards = screen.getAllByTestId('product-overview-card');

    // click on learn more button of Service Mesh
    const readMoreBtn = readMoreBtns[2];
    await userEvent.click(readMoreBtn);

    await waitFor(() => expect(productOverviewCards[0]).not.toHaveClass('pf-m-selected-raised'));
    // ensure gitops and pipelines cards are NOT selected
    for (let i = 0; i < 2; i += 1)
      expect(productOverviewCards[i]).not.toHaveClass('pf-m-selected-raised');

    const labelTexts = screen.getAllByText(/Included/i);
    expect(labelTexts).toHaveLength(3);

    const openRightDrawerIcons = screen.getAllByTestId('open-right-drawer-icon');
    expect(openRightDrawerIcons).toHaveLength(3);

    await checkAccessibility(container);
  });

  it('renders gitops as selected card, and the other two cards are not selected', async () => {
    render(
      <RecommendedOperatorsCards {...RECOMMENDED_OPERATORS_CARDS_TEST_CASES.GITOPS_SELECTED} />,
    );

    const productOverviewCards = screen.getAllByTestId('product-overview-card');
    const gitopsCard = productOverviewCards[0];
    await waitFor(() => expect(gitopsCard).toHaveClass('pf-m-selected-raised'));
    expect(gitopsCard).toHaveClass('pf-m-selected-raised');

    for (let i = 1; i < 3; i += 1)
      expect(productOverviewCards[i]).not.toHaveClass('pf-m-selected-raised');
  });
});
