import React from 'react';

import { checkAccessibility, render, screen } from '~/testUtils';

import {
  OVERVIEW_PRODUCT_BANNER_BASIC,
  OVERVIEW_PRODUCT_BANNER_MISSING_OPTIONAL_PROPS,
} from './fixtures';
import { OverviewProductBanner } from './OverviewProductBanner';

import '@testing-library/jest-dom';

describe('<OverviewProductBanner />', () => {
  it('renders elements when description is a plain string', async () => {
    // Arrange
    render(<OverviewProductBanner {...OVERVIEW_PRODUCT_BANNER_BASIC} />);

    const { title, icon, altText, learnMoreLink, description } = OVERVIEW_PRODUCT_BANNER_BASIC;

    // Assert
    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();

    const iconElement = screen.getByRole('img');
    expect(iconElement).toBeInTheDocument();
    expect(iconElement).toHaveAttribute('src', icon);
    expect(iconElement).toHaveAttribute('alt', altText);

    // eslint-disable-next-line testing-library/no-node-access
    const learnMoreLinkElement = screen.getByText('Learn more').closest('a');

    expect(learnMoreLinkElement).toBeInTheDocument();
    expect(learnMoreLinkElement).toHaveAttribute('href', learnMoreLink);
  });

  it('renders only provided elements when missing optional properties', async () => {
    // Arrange
    render(<OverviewProductBanner {...OVERVIEW_PRODUCT_BANNER_MISSING_OPTIONAL_PROPS} />);

    const { title, description } = OVERVIEW_PRODUCT_BANNER_MISSING_OPTIONAL_PROPS;

    // Assert
    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();

    const iconElement = screen.queryByRole('img');
    expect(iconElement).not.toBeInTheDocument();

    const learnMoreLinkElement = screen.queryByText('Learn more');
    expect(learnMoreLinkElement).not.toBeInTheDocument();
  });

  it('is accessible', async () => {
    const { container } = render(<OverviewProductBanner {...OVERVIEW_PRODUCT_BANNER_BASIC} />);

    await checkAccessibility(container);
  });
});
