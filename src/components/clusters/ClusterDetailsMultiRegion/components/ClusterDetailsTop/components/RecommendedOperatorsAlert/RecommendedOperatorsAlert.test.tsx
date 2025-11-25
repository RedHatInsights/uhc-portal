import React from 'react';

import { checkAccessibility, mockUseChrome, render, screen, userEvent, waitFor } from '~/testUtils';

import clusterStates from '../../../../../common/clusterStates';

import { ALERT_MESSAGES, CARDS, TEST_CASES } from './fixtures';
import { RecommendedOperatorsAlert, STATIC_ALERT_MESSAGES } from './RecommendedOperatorsAlert';

import '@testing-library/jest-dom';

mockUseChrome({ analytics: { track: () => {} } });

describe('<RecommendedOperatorsAlert />', () => {
  const openLearnMore = jest.fn();
  const closeDrawer = jest.fn();
  const onDismissAlertCallback = jest.fn();

  test.each`
    clusterState                 | title                                         | description
    ${clusterStates.waiting}     | ${STATIC_ALERT_MESSAGES.actionRequired.title} | ${STATIC_ALERT_MESSAGES.actionRequired.description}
    ${clusterStates.pending}     | ${STATIC_ALERT_MESSAGES.installing.title}     | ${STATIC_ALERT_MESSAGES.installing.description}
    ${clusterStates.validating}  | ${STATIC_ALERT_MESSAGES.installing.title}     | ${STATIC_ALERT_MESSAGES.installing.description}
    ${clusterStates.installing}  | ${STATIC_ALERT_MESSAGES.installing.title}     | ${STATIC_ALERT_MESSAGES.installing.description}
    ${clusterStates.hibernating} | ${STATIC_ALERT_MESSAGES.hibernating.title}    | ${STATIC_ALERT_MESSAGES.hibernating.description}
    ${clusterStates.error}       | ${STATIC_ALERT_MESSAGES.error.title}          | ${STATIC_ALERT_MESSAGES.error.description}
  `(
    'should show appropriate message for "$clusterState" cluster',
    ({ clusterState, title, description }) => {
      // Arrange
      render(
        <RecommendedOperatorsAlert
          clusterState={clusterState}
          openLearnMore={openLearnMore}
          closeDrawer={closeDrawer}
          onDismissAlertCallback={onDismissAlertCallback}
          planType="123"
        />,
      );

      // Assert
      expect(screen.getByText(title)).toBeInTheDocument();
      expect(screen.getByText(description)).toBeInTheDocument();
    },
  );

  it(`should show appropriate message & should also find console link for ${clusterStates.ready} cluster, when consoleURL link is provided`, () => {
    // Arrange
    const { title, description } = ALERT_MESSAGES.ready;

    render(
      <RecommendedOperatorsAlert
        clusterState={clusterStates.ready}
        openLearnMore={openLearnMore}
        closeDrawer={closeDrawer}
        onDismissAlertCallback={onDismissAlertCallback}
        consoleURL="someLink"
        planType="123"
      />,
    );

    expect(screen.getByText(title)).toBeInTheDocument();

    // The External link adds this expression when using 'toHaveTextContent' selector
    const descriptionWithOpenNewWindowOrTab = `${description.slice(0, description.length - 1)} (new window or tab).`;
    expect(screen.getByTestId('alert-description-with-consoleURL-provided')).toHaveTextContent(
      descriptionWithOpenNewWindowOrTab,
    );

    // ensure console has the correct link
    const consoleLink = screen.getByText('console');
    expect(consoleLink).toBeInTheDocument();
    expect(consoleLink).toHaveAttribute('href', 'someLink');
  });

  it(`should show appropriate message for ${clusterStates.ready} cluster, when consoleURL link is NOT provided`, () => {
    // Arrange
    const { title, description } = ALERT_MESSAGES.ready;

    render(
      <RecommendedOperatorsAlert
        clusterState={clusterStates.ready}
        openLearnMore={openLearnMore}
        closeDrawer={closeDrawer}
        onDismissAlertCallback={onDismissAlertCallback}
        planType="123"
      />,
    );

    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();
  });

  it.each(TEST_CASES)(
    'should show "$title" ProductCard and make sure it is not selected',
    async ({ title, description, drawerPanelContent, index }) => {
      // Arrange
      render(
        <RecommendedOperatorsAlert
          clusterState={clusterStates.installing}
          openLearnMore={openLearnMore}
          closeDrawer={closeDrawer}
          onDismissAlertCallback={onDismissAlertCallback}
          consoleURL="someLink"
          planType="123"
        />,
      );

      // Assert
      // Card Info:
      const learnMoreBtns = screen.getAllByText('Learn more');

      const productOverviewCards = screen.getAllByTestId('product-overview-card');

      expect(screen.getByText(`${title}`)).toBeInTheDocument();
      expect(screen.getByText(`${description}`)).toBeInTheDocument();

      await waitFor(() =>
        expect(productOverviewCards[index]).not.toHaveClass('pf-m-selected-raised'),
      );
      expect(productOverviewCards[index]).not.toHaveClass('pf-m-selected-raised');

      const learnMoreBtn = learnMoreBtns[index];
      await userEvent.click(learnMoreBtn);

      expect(openLearnMore).toHaveBeenCalledWith(title, drawerPanelContent);
    },
  );

  it('should show all ProductCards while "Advanced Cluster Security for Kubernetes" as selected when providing selectedCardTitle while other ProductCards should not be selected', async () => {
    // Arrange
    render(
      <RecommendedOperatorsAlert
        selectedCardTitle="Advanced Cluster Security for Kubernetes"
        clusterState={clusterStates.installing}
        openLearnMore={openLearnMore}
        closeDrawer={closeDrawer}
        onDismissAlertCallback={onDismissAlertCallback}
        consoleURL="someLink"
        planType="123"
      />,
    );

    // Assert
    const productOverviewCards = screen.getAllByTestId('product-overview-card');
    expect(productOverviewCards).toHaveLength(CARDS.length);

    const advancedClusterSecurityCard = productOverviewCards[0];
    await waitFor(() => expect(advancedClusterSecurityCard).toHaveClass('pf-m-selected-raised'));
    expect(advancedClusterSecurityCard).toHaveClass('pf-m-selected-raised');

    for (let i = 1; i < CARDS.length; i += 1)
      expect(productOverviewCards[i]).not.toHaveClass('pf-m-selected-raised');
  });

  it('Should call `onDismissAlertCallback` when the alert is dismissed', async () => {
    // Arrange
    render(
      <RecommendedOperatorsAlert
        clusterState={clusterStates.installing}
        openLearnMore={openLearnMore}
        closeDrawer={closeDrawer}
        onDismissAlertCallback={onDismissAlertCallback}
        planType="123"
      />,
    );

    // Assert
    const allBtns = screen.getAllByRole('button');
    // find dismiss button (the 'X')
    const dismissBtn = allBtns[0];
    await userEvent.click(dismissBtn);

    expect(onDismissAlertCallback).toHaveBeenCalled();
  });

  it('Should show correct message for expanding and collapsing the alert and should also call `closeDrawer` when the alert has collasped', async () => {
    // Arrange
    render(
      <RecommendedOperatorsAlert
        clusterState={clusterStates.installing}
        openLearnMore={openLearnMore}
        closeDrawer={closeDrawer}
        onDismissAlertCallback={onDismissAlertCallback}
        planType="123"
      />,
    );

    const getExpectedMsg = (prefix: string) => `${prefix} recommended operators`;
    const expandMsg = getExpectedMsg('Show');
    const collapseMsg = getExpectedMsg('Hide');

    // Assert

    // expand alert
    const expandBtn = screen.getByText(expandMsg);
    await userEvent.click(expandBtn);

    // Alert has been opened -> should present collapsing message

    // collapse alert
    const collapseBtn = screen.getByText(collapseMsg);
    await userEvent.click(collapseBtn);

    expect(closeDrawer).toHaveBeenCalled();
  });

  it(`should pass accessibility check`, async () => {
    // Arrange
    const { container } = render(
      <RecommendedOperatorsAlert
        clusterState={clusterStates.installing}
        openLearnMore={openLearnMore}
        closeDrawer={closeDrawer}
        onDismissAlertCallback={onDismissAlertCallback}
        consoleURL="someLink"
        planType="123"
      />,
    );

    // Assert
    await checkAccessibility(container);
  });
});
