import Page from './page';
import LinkHelper from './LinkHelper';
import ButtonHelper from './ButtonHelper';

class OsdProductPage extends Page {
  isOSDProductPage = () => {
    cy.url().should('include', 'openshift/overview/osd');
    cy.title().should('eq', 'Overview | OpenShift');
  };

  isTitlePage = () => {
    cy.contains('h1', 'Red Hat OpenShift Dedicated');
  };

  isBenefitsTitle = () => {
    cy.contains('h2', 'Benefits');
  };

  isFeaturesTitle = () => {
    cy.contains('h2', 'Features');
  };

  isPricingTitle = () => {
    cy.contains('h2', 'Pricing');
  };

  isRecommendationsTitle = () => {
    cy.contains('h2', 'Recommendations');
  };

  isRecommendedContentTitle = () => {
    cy.contains('h2', 'Recommended content');
  };

  validateUrlLink(expectedText, expectedUrl) {
    const link = cy.contains('a', expectedText);

    link
      .should('be.visible')
      .should('have.attr', 'href', expectedUrl)
      .and('have.attr', 'target', '_blank');

    return this;
  }

  createClusterCard = () => {
    cy.getByTestId('create-cluster-card').scrollIntoView().as('create-cluster-card');
    return {
      btnShouldExist: function (btnText, link) {
        return new ButtonHelper(
          { name: 'create-cluster-card', isParent: true },
          btnText,
          link,
        ).btnExists();
      },

      checkLink: function (title, link) {
        return new LinkHelper(
          { name: 'create-cluster-card', isParent: false },
          title,
          link,
        ).linkExists();
      },

      isCardTitle() {
        cy.contains('h3', 'Create an OpenShift Dedicated cluster');
      },
    };
  };

  learnMoreCard = () => {
    cy.getByTestId('learn-more-osdcard').as('learn-more-osdcard');
    return {
      btnShouldExist: function (btnText, link) {
        return new ButtonHelper(
          { name: 'learn-more-osdcard', isParent: true },
          btnText,
          link,
        ).btnExists();
      },

      checkLink: function (title, link) {
        return new LinkHelper(
          { name: 'learn-more-osdcard', isParent: false },
          title,
          link,
        ).linkExists();
      },

      isCardTitle() {
        cy.contains('h3', 'Want to learn more?');
      },
    };
  };

  isCreateOSDPage = () => cy.url().should('include', '/openshift/create/osd');
  clickCreateOSDButton() {
    cy.getByTestId('register-cluster')
      .should('be.visible')
      .and('not.be.disabled')
      .and('contain.text', 'Create cluster')
      .scrollIntoView();

    cy.get('[data-testid]').should('exist');

    cy.getByTestId('register-cluster').click();

    return this;
  }

  clickBackButton = () => cy.go('back');

  expandFeature(sectionTitle) {
    cy.contains('button', sectionTitle).scrollIntoView().should('be.visible').click();
    return this;
  }

  collapseFeature(sectionTitle) {
    cy.contains('button', sectionTitle).click();
    return this;
  }

  verifyFeatureContent(expectedText) {
    cy.contains('.rosa-expandable-list-item', `${expectedText}`);
    return this;
  }

  validatePricingCard({ title, yearlyText }) {
    cy.contains('h3', title)
      .scrollIntoView()
      .closest('[data-testid="pricing-card"]')
      .should('be.visible')
      .within(() => {
        cy.contains(yearlyText).should('exist');
      });

    return this;
  }

  validateRecommendationsCard({ title, cardText }) {
    cy.contains('h3', title)
      .scrollIntoView()
      .closest('[data-testid="recommendations-card"]')
      .should('be.visible')
      .within(() => {
        cy.contains(cardText).should('exist');
      });

    return this;
  }

  validateRecommendedContentList(testId, rows) {
    cy.getByTestId(testId)
      .scrollIntoView()
      .should('be.visible')
      .find('ul > li')
      .should('have.length', rows.length)
      .each(($li, index) => {
        cy.wrap($li).within(() => {
          const expected = rows[index];
          cy.get('[data-testtag="label"]').should('contain.text', expected.badge);
          cy.contains(expected.label).should('be.visible');
          cy.get('a')
            .should('have.attr', 'href', expected.linkUrl)
            .and('have.attr', 'target', '_blank');
        });
      });
    return this;
  }
}

export default new OsdProductPage();
