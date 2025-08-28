import React from 'react';

import { checkAccessibility, render, screen, userEvent } from '~/testUtils';

import { FEATURED_PRODUCTS_CARDS, RECOMMENDED_OPERATORS_CARDS_DATA } from '../components/fixtures';
import Overview from '../Overview';

import '@testing-library/jest-dom';

describe('<Overview />', () => {
  const advancedClusterSecurityCardData = { ...FEATURED_PRODUCTS_CARDS[0] };
  const openshiftAiCardData = { ...FEATURED_PRODUCTS_CARDS[1] };
  const openshiftVirtualizationData = { ...FEATURED_PRODUCTS_CARDS[2] };
  const advancedClusterManagementData = { ...FEATURED_PRODUCTS_CARDS[3] };

  const gitopsCardData = { ...RECOMMENDED_OPERATORS_CARDS_DATA[0] };
  const pipelinesCardData = { ...RECOMMENDED_OPERATORS_CARDS_DATA[1] };
  const serviceMeshCardData = { ...RECOMMENDED_OPERATORS_CARDS_DATA[2] };

  it('contains a few elements of the page', async () => {
    // Arrange
    const { container } = render(<Overview />);

    // Assert
    // Featured OpenShift cluster types:

    expect(screen.getByText('Featured OpenShift cluster types')).toBeInTheDocument();

    expect(
      screen.getByText('View all OpenShift cluster types', {
        selector: 'a',
      }),
    ).toHaveAttribute('href', '/openshift/create');

    // Recommended Operator Cards:

    expect(screen.getByText('Recommended operators')).toBeInTheDocument();

    expect(
      screen.getByText('View all in Ecosystem Catalog', {
        selector: 'a',
      }),
    ).toHaveAttribute(
      'href',
      'https://catalog.redhat.com/search?searchType=software&deployed_as=Operator',
    );

    await checkAccessibility(container);
  });

  it.each([
    {
      ...gitopsCardData,
      index: 0,
      someDrawerContent:
        'Consistently configure and deploy Kubernetes-based infrastructure and applications across clusters and development lifecycles using Red Hat OpenShift GitOps.',
      learnMoreLinkDestination:
        'https://catalog.redhat.com/software/container-stacks/detail/5fb288c70a12d20cbecc6056',
    },
    {
      ...pipelinesCardData,
      index: 1,
      someDrawerContent:
        'Speed up the delivery of your applications with advanced continuous integration (CI) workflows and automation.',
      learnMoreLinkDestination:
        'https://catalog.redhat.com/software/container-stacks/detail/5ec54a4628834587a6b85ca5',
    },
    {
      ...serviceMeshCardData,
      index: 2,
      someDrawerContent:
        'Red Hat OpenShift Service Mesh adds tracing and visualization so you have a greater understanding of what is happening in and across applications as they are running, from start to finish.',
      learnMoreLinkDestination:
        'https://catalog.redhat.com/software/container-stacks/detail/5ec53e8c110f56bd24f2ddc4',
    },
  ])(
    'verifies Recommended Operators Card "$title" content (basic functionality verification of each Card separately)',
    async ({ title, description, index, someDrawerContent, learnMoreLinkDestination }) => {
      // Arrange
      render(<Overview />);

      // Assert
      // ensure Cards's description is shown:
      expect(screen.getByText(description)).toBeInTheDocument();

      // ensure the content of the Card's Drawers is not shown:
      expect(screen.queryByText(someDrawerContent)).not.toBeInTheDocument();

      // Basic functionality checks:

      const learnMoreBtns = screen.getAllByTestId(
        'product-overview-card__learn-more-button-Recommended operators',
      );
      expect(learnMoreBtns).toHaveLength(3);

      // click on Card's Learn more button
      await userEvent.click(learnMoreBtns[index]);

      // ensure the title and some content is shown
      expect(screen.getByTestId('drawer-panel-content__title')).toHaveTextContent(title);
      expect(screen.getByText('by Red Hat')).toBeInTheDocument();
      expect(screen.getByText(someDrawerContent)).toBeInTheDocument();

      // Learn more link
      const learnMoreLink = screen.getByText(`Learn more about ${title}`);
      expect(learnMoreLink).toBeInTheDocument();
      expect(learnMoreLink).toHaveAttribute('href', learnMoreLinkDestination);

      // click on close Drawer button:
      const closeDrawerBtn = screen.getByTestId('drawer-close-button');
      expect(closeDrawerBtn).toBeInTheDocument();
      await userEvent.click(closeDrawerBtn);

      // ensure some of the previously shown content of the Drawer is no longer shown:
      expect(screen.queryByText(someDrawerContent)).not.toBeInTheDocument();
      expect(screen.queryByText('by Red Hat')).not.toBeInTheDocument();
    },
  );

  it.each([
    {
      ...advancedClusterSecurityCardData,
      index: 0,
      someDrawerContent:
        'Conduct security sooner by automating DevSecOps and mitigating security issues early in the container lifecycle.',
      learnMoreLinkDestination:
        'https://catalog.redhat.com/software/container-stacks/detail/60eefc88ee05ae7c5b8f041c',
      learnMoreLinkTextContent: 'Learn more about Advanced Cluster Security',
    },
    {
      ...openshiftAiCardData,
      index: 1,
      someDrawerContent:
        'Build, train, tune, and deploy AI models at scale across hybrid cloud environments with Red Hat OpenShift AI, an AI platform.',
      learnMoreLinkDestination:
        'https://catalog.redhat.com/software/container-stacks/detail/63b85b573112fe5a95ee9a3a',
      learnMoreLinkTextContent: `Learn more about ${openshiftAiCardData.title}`,
    },
    {
      ...openshiftVirtualizationData,
      index: 2,
      someDrawerContent:
        'Transition your virtual machines to a modern hybrid cloud application platform. Run your VMs alongside containers using the same set of tools and processes.',
      learnMoreLinkDestination:
        'https://docs.redhat.com/en/documentation/migration_toolkit_for_virtualization/2.0/html/installing_and_using_the_migration_toolkit_for_virtualization/about-mtv_mtv#mtv-resources-and-services_mtv',
      learnMoreLinkTextContent: 'Learn more about Migration Toolkit for Virtualization',
    },
    {
      ...advancedClusterManagementData,
      index: 3,
      someDrawerContent: 'Reduce operational costs for multicloud environments:',
      learnMoreLinkDestination:
        'https://www.redhat.com/en/technologies/management/advanced-cluster-management',
      learnMoreLinkTextContent: 'Learn more about Advanced Cluster Management for Kubernetes',
    },
  ])(
    'verifies Featured Product Card "$title" content (basic functionality verification of each Card separately)',
    async ({
      title,
      description,
      index,
      someDrawerContent,
      learnMoreLinkDestination,
      learnMoreLinkTextContent,
    }) => {
      // Arrange
      render(<Overview />);

      // Assert
      // ensure Cards's description is shown:
      expect(screen.getByText(description)).toBeInTheDocument();

      // ensure the content of the Card's Drawers is not shown:
      expect(screen.queryByText(someDrawerContent)).not.toBeInTheDocument();

      // Basic functionality checks:

      const learnMoreBtns = screen.getAllByTestId(
        'product-overview-card__learn-more-button-Featured products',
      );
      expect(learnMoreBtns).toHaveLength(4);

      // click on Card's Learn more button
      await userEvent.click(learnMoreBtns[index]);

      // ensure the title and some content is shown
      expect(screen.getByTestId('drawer-panel-content__title')).toHaveTextContent(title);
      expect(screen.getByText('by Red Hat')).toBeInTheDocument();
      expect(screen.getByText(someDrawerContent)).toBeInTheDocument();

      // Learn more link
      const learnMoreLink = screen.getByText(learnMoreLinkTextContent);
      expect(learnMoreLink).toBeInTheDocument();
      expect(learnMoreLink).toHaveAttribute('href', learnMoreLinkDestination);

      // click on close Drawer button:
      const closeDrawerBtn = screen.getByTestId('drawer-close-button');
      expect(closeDrawerBtn).toBeInTheDocument();
      await userEvent.click(closeDrawerBtn);

      // ensure some of the previously shown content of the Drawer is no longer shown:
      expect(screen.queryByText(someDrawerContent)).not.toBeInTheDocument();
      expect(screen.queryByText('by Red Hat')).not.toBeInTheDocument();
    },
  );

  it('tests Featured Products Cards Functionality -> Click on the learnMore of each card and verify that the content of the Drawer switches to the appropriate card that was clicked', async () => {
    // Arrange
    render(<Overview />);

    // Assert
    const learnMoreBtns = screen.getAllByTestId(
      'product-overview-card__learn-more-button-Featured products',
    );
    expect(learnMoreBtns).toHaveLength(4);

    // click on Advanced Cluster Security card's Learn more button
    await userEvent.click(learnMoreBtns[0]);

    // ensure the title and some drawer content is shown
    expect(screen.getByTestId('drawer-panel-content__title')).toHaveTextContent(
      advancedClusterSecurityCardData.title,
    );
    expect(
      screen.getByText(
        'Conduct security sooner by automating DevSecOps and mitigating security issues early in the container lifecycle.',
      ),
    ).toBeInTheDocument();

    // click on close Drawer button:
    const closeDrawerBtn = screen.getByTestId('drawer-close-button');
    expect(closeDrawerBtn).toBeInTheDocument();
    await userEvent.click(closeDrawerBtn);

    // ensure some of the previously shown content of the Drawer is no longer shown:
    expect(
      screen.queryByText(
        'Conduct security sooner by automating DevSecOps and mitigating security issues early in the container lifecycle.',
      ),
    ).not.toBeInTheDocument();

    // click on Openshift AI card's Learn more button
    await userEvent.click(learnMoreBtns[1]);

    // ensure the title and some drawer content is shown
    expect(screen.getByTestId('drawer-panel-content__title')).toHaveTextContent(
      openshiftAiCardData.title,
    );
    expect(
      screen.getByText(
        'Build, train, tune, and deploy AI models at scale across hybrid cloud environments with Red Hat OpenShift AI, an AI platform.',
      ),
    ).toBeInTheDocument();

    // click on Openshift Virtualization card's Learn more button
    await userEvent.click(learnMoreBtns[2]);

    // ensure the title and some drawer content is shown
    expect(screen.getByTestId('drawer-panel-content__title')).toHaveTextContent(
      openshiftVirtualizationData.title,
    );

    expect(
      screen.getByText(
        'Transition your virtual machines to a modern hybrid cloud application platform. Run your VMs alongside containers using the same set of tools and processes.',
      ),
    ).toBeInTheDocument();

    // click on Advanced Cluster Management card's Learn more button
    await userEvent.click(learnMoreBtns[3]);

    // ensure the title and some drawer content is shown
    expect(screen.getByTestId('drawer-panel-content__title')).toHaveTextContent(
      advancedClusterManagementData.title,
    );

    expect(
      screen.getByText('Reduce operational costs for multicloud environments:'),
    ).toBeInTheDocument();

    // ensure some of the previously shown content of the Drawer is no longer shown:
    expect(
      screen.queryByText(
        'Transition your virtual machines to a modern hybrid cloud application platform. Run your VMs alongside containers using the same set of tools and processes.',
      ),
    ).not.toBeInTheDocument();
  });

  it('tests Recommended Operators Cards Functionality -> Click on the learnMore of each card and verify that the content of the Drawer switches to the appropriate card that was clicked', async () => {
    // Arrange
    render(<Overview />);

    // Assert
    const learnMoreBtns = screen.getAllByTestId(
      'product-overview-card__learn-more-button-Recommended operators',
    );
    expect(learnMoreBtns).toHaveLength(3);

    // click on Gitops card's Learn more button
    await userEvent.click(learnMoreBtns[0]);

    // ensure the title and some drawer content is shown
    expect(screen.getByTestId('drawer-panel-content__title')).toHaveTextContent(
      gitopsCardData.title,
    );
    expect(
      screen.getByText(
        'Consistently configure and deploy Kubernetes-based infrastructure and applications across clusters and development lifecycles using Red Hat OpenShift GitOps.',
      ),
    ).toBeInTheDocument();

    // click on close Drawer button:
    const closeDrawerBtn = screen.getByTestId('drawer-close-button');
    expect(closeDrawerBtn).toBeInTheDocument();
    await userEvent.click(closeDrawerBtn);

    // ensure some of the previously shown content of the Drawer is no longer shown:
    expect(
      screen.queryByText(
        'Consistently configure and deploy Kubernetes-based infrastructure and applications across clusters and development lifecycles using Red Hat OpenShift GitOps.',
      ),
    ).not.toBeInTheDocument();

    // click on Pipelines card's Learn more button
    await userEvent.click(learnMoreBtns[1]);

    // ensure the title and some drawer content is shown
    expect(screen.getByTestId('drawer-panel-content__title')).toHaveTextContent(
      pipelinesCardData.title,
    );
    expect(
      screen.getByText(
        'Speed up the delivery of your applications with advanced continuous integration (CI) workflows and automation.',
      ),
    ).toBeInTheDocument();

    // click on Service Mesh card's Learn more button
    await userEvent.click(learnMoreBtns[2]);

    // ensure the title and some drawer content is shown
    expect(screen.getByTestId('drawer-panel-content__title')).toHaveTextContent(
      serviceMeshCardData.title,
    );
    expect(
      screen.getByText(
        'Red Hat OpenShift Service Mesh adds tracing and visualization so you have a greater understanding of what is happening in and across applications as they are running, from start to finish.',
      ),
    ).toBeInTheDocument();
  });

  it('tests all Product Cards Learn more Functionality -> Click on the learnMore of each card and verify that the content of the Drawer switches to the appropriate card that was clicked', async () => {
    // Arrange
    render(<Overview />);

    // Assert
    const recommendedOperatorsLearnMoreBtns = screen.getAllByTestId(
      'product-overview-card__learn-more-button-Recommended operators',
    );
    const featuredProductsLearnMoreBtns = screen.getAllByTestId(
      'product-overview-card__learn-more-button-Featured products',
    );
    expect(recommendedOperatorsLearnMoreBtns).toHaveLength(3);
    expect(featuredProductsLearnMoreBtns).toHaveLength(4);

    const learnMoreBtns = [...featuredProductsLearnMoreBtns, ...recommendedOperatorsLearnMoreBtns];

    // click on Advanced Cluster Security card's Learn more button
    await userEvent.click(learnMoreBtns[0]);

    // ensure the title and some drawer content is shown
    expect(screen.getByTestId('drawer-panel-content__title')).toHaveTextContent(
      advancedClusterSecurityCardData.title,
    );
    expect(
      screen.getByText(
        'Conduct security sooner by automating DevSecOps and mitigating security issues early in the container lifecycle.',
      ),
    ).toBeInTheDocument();

    // click on Openshift AI card's Learn more button
    await userEvent.click(learnMoreBtns[1]);

    // ensure the title and some drawer content is shown
    expect(screen.getByTestId('drawer-panel-content__title')).toHaveTextContent(
      openshiftAiCardData.title,
    );
    expect(
      screen.getByText(
        'Build, train, tune, and deploy AI models at scale across hybrid cloud environments with Red Hat OpenShift AI, an AI platform.',
      ),
    ).toBeInTheDocument();

    // ensure some of the previously shown content of the Drawer is no longer shown:
    expect(
      screen.queryByText(
        'Conduct security sooner by automating DevSecOps and mitigating security issues early in the container lifecycle.',
      ),
    ).not.toBeInTheDocument();

    // click on Openshift Virtualization card's Learn more button
    await userEvent.click(learnMoreBtns[2]);

    // ensure the title and some drawer content is shown
    expect(screen.getByTestId('drawer-panel-content__title')).toHaveTextContent(
      openshiftVirtualizationData.title,
    );

    expect(
      screen.getByText(
        'Transition your virtual machines to a modern hybrid cloud application platform. Run your VMs alongside containers using the same set of tools and processes.',
      ),
    ).toBeInTheDocument();

    // ensure some of the previously shown content of the Drawer is no longer shown:
    expect(
      screen.queryByText(
        'Build, train, tune, and deploy AI models at scale across hybrid cloud environments with Red Hat OpenShift AI, an AI platform.',
      ),
    ).not.toBeInTheDocument();

    // click on Advanced Cluster Management card's Learn more button
    await userEvent.click(learnMoreBtns[3]);

    // ensure the title and some drawer content is shown
    expect(screen.getByTestId('drawer-panel-content__title')).toHaveTextContent(
      advancedClusterManagementData.title,
    );

    expect(
      screen.getByText('Reduce operational costs for multicloud environments:'),
    ).toBeInTheDocument();

    // ensure some of the previously shown content of the Drawer is no longer shown:
    expect(
      screen.queryByText(
        'Transition your virtual machines to a modern hybrid cloud application platform. Run your VMs alongside containers using the same set of tools and processes.',
      ),
    ).not.toBeInTheDocument();

    // click on Gitops card's Learn more button
    await userEvent.click(learnMoreBtns[4]);

    // ensure the title and some drawer content is shown
    expect(screen.getByTestId('drawer-panel-content__title')).toHaveTextContent(
      gitopsCardData.title,
    );
    expect(
      screen.getByText(
        'Consistently configure and deploy Kubernetes-based infrastructure and applications across clusters and development lifecycles using Red Hat OpenShift GitOps.',
      ),
    ).toBeInTheDocument();

    // ensure some of the previously shown content of the Drawer is no longer shown:
    expect(
      screen.queryByText('Reduce operational costs for multicloud environments:'),
    ).not.toBeInTheDocument();

    // click on Pipelines card's Learn more button
    await userEvent.click(learnMoreBtns[5]);

    // ensure the title and some drawer content is shown
    expect(screen.getByTestId('drawer-panel-content__title')).toHaveTextContent(
      pipelinesCardData.title,
    );
    expect(
      screen.getByText(
        'Speed up the delivery of your applications with advanced continuous integration (CI) workflows and automation.',
      ),
    ).toBeInTheDocument();

    // ensure some of the previously shown content of the Drawer is no longer shown:
    expect(
      screen.queryByText(
        'Consistently configure and deploy Kubernetes-based infrastructure and applications across clusters and development lifecycles using Red Hat OpenShift GitOps.',
      ),
    ).not.toBeInTheDocument();

    // click on Service Mesh card's Learn more button
    await userEvent.click(learnMoreBtns[6]);

    // ensure the title and some drawer content is shown
    expect(screen.getByTestId('drawer-panel-content__title')).toHaveTextContent(
      serviceMeshCardData.title,
    );
    expect(
      screen.getByText(
        'Red Hat OpenShift Service Mesh adds tracing and visualization so you have a greater understanding of what is happening in and across applications as they are running, from start to finish.',
      ),
    ).toBeInTheDocument();

    // ensure some of the previously shown content of the Drawer is no longer shown:
    expect(
      screen.queryByText(
        'Speed up the delivery of your applications with advanced continuous integration (CI) workflows and automation.',
      ),
    ).not.toBeInTheDocument();
  });
});
