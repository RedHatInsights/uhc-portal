import Page from './page';
import LinkHelper from './LinkHelper';
import ButtonHelper from './ButtonHelper';

class Overview extends Page {
  static #path = '/openshift/overview';

  assertToBeOverviewUrl() {
    super.assertUrlIncludes(Overview.#path);
  }

  isOverviewUrl() {
    return cy.$$(location).attr('href').includes(Overview.#path);
  }

  isOverviewPage() {
    cy.contains('Get started with OpenShift', { timeout: 60000 }).should('be.visible');
  }

  viewAllOpenshiftClusterTypesLink = () =>
    cy.contains('a', 'View all OpenShift cluster types').scrollIntoView().should('be.visible');

  drawerContentTitle = () => cy.getByTestId('drawer-panel-content__title');

  drawerCloseButton = () => cy.getByTestId('drawer-close-button');

  header = () => {
    cy.get('[data-testid="OverviewHeader"]').as('header').should('be.visible');
    return {
      checkTitle: function (title) {
        cy.get('@header').find('h1').should('have.text', title);
        return this;
      },
      checkLink: function (title, link) {
        return new LinkHelper({ name: 'header', isParent: false }, title, link).linkExists();
      },
    };
  };

  centralSectionCard(id) {
    cy.get(`[data-testid="${id}"]`).as(id);
    return {
      btnShouldExist: function (btnText, link) {
        return new ButtonHelper({ name: id, isParent: true }, btnText, link).btnExists();
      },
      shouldHaveLabel: function (labelType) {
        cy.get(`@${id}`).find('[data-testtag="label"]').should('have.text', labelType);
        return this;
      },
      checkLink: function (title, link) {
        return new LinkHelper({ name: id, isParent: true }, title, link).linkExists();
      },
      cardDetails: function (cardDetails) {
        const cardDetailsLabelNames = Object.keys(cardDetails);
        cy.get(`@${id}`)
          .find('dl')
          .find('dt')
          .should('have.length', cardDetailsLabelNames.length)
          .each(($el, index) => {
            const labelName = cardDetailsLabelNames[index];
            cy.wrap($el).contains(labelName);
            cy.wrap($el).next('dd').contains(cardDetails[labelName]);
          });
        return this;
      },
      get cyObj() {
        return cy.get(`@${id}`);
      },
    };
  }

  centralSectionCardsExpected(numberOfCards) {
    cy.get('[data-testid^="offering-card"]').should('have.length', numberOfCards);
  }

  centralSectionFooterLinkExists(title, link) {
    cy.get('[data-testid^="offering-card"]')
      .parentsUntil('section')
      .next('a')
      .contains(title)
      .as('centralSectionFooterLink')
      .should('have.attr', 'href', link);
    cy.get('a').contains(title).as('centralSectionHeaderLink').should('have.attr', 'href', link);
    return new ButtonHelper(
      { name: 'centralSectionFooterLink', isParent: false },
      title,
      link,
    ).btnExists();
  }

  isRecommendedOperatorsHeaderVisible(link) {
    cy.get('h2').contains('Recommended operators').as('header');
    cy.get('@header')
      .parent()
      .within(() => {
        cy.get('a')
          .contains('View all in Ecosystem Catalog')
          .should('have.attr', 'href')
          .and('include', link);
      });
  }

  recommendedOperatorsExpected(numberOfContents) {
    cy.get('h2')
      .contains('Recommended operators')
      .parent()
      .within(() => {
        cy.getByTestId('product-overview-card').should('have.length', numberOfContents);
      });
  }

  featuredProductsExpected(numberOfContents) {
    cy.get('h2')
      .contains('Featured products')
      .parent()
      .within(() => {
        cy.getByTestId('product-overview-card').should('have.length', numberOfContents);
      });
  }

  productsOrOperatorCards(text, description) {
    cy.get('h3').contains(text).parents('div[data-testid="product-overview-card"]').as('headerObj');
    cy.get('@headerObj').find('div').contains(description).should('be.exist');
    cy.get('@headerObj').contains('Learn more').as('learnMore');
    return cy.get('@learnMore');
  }
}

export default new Overview();
