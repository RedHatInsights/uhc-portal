class ButtonHelper {
  #parentAlias;
  #href;
  #title;
  #classes;
  #elementAlias;
  #btnNumber;

  static #btnCounter = 0;

  constructor(alias, title, href, classes) {
    if (alias.isParent) {
      this.#parentAlias = alias.name;
    } else {
      this.#elementAlias = alias.name;
    }
    this.#href = href;
    this.#title = title;
    this.#classes = classes ? '.' + classes.join('.') : '';
    this.#btnNumber = ButtonHelper.#btnCounter++;
  }

  #element() {
    if (this.#parentAlias) {
      return cy.get(`@${this.#parentAlias}`).find('a' + this.#classes);
    } else {
      return cy.get(`@${this.#elementAlias}`);
    }
  }

  btnExists() {
    this.#element()
      .contains(this.#title)
      .as(`btn-${this.#btnNumber}`)
      .closest('a')
      .should('have.attr', 'href', this.#href)
      .should('not.have.class', 'pf-m-aria-disabled');
    const href = this.#href;
    const btnNumber = this.#btnNumber;
    return {
      opensExpectedPage: function (title) {
        //the reason because "force" is used: https://github.com/cypress-io/cypress/issues/7306
        cy.get(`@btn-${btnNumber}`).click({ force: true });
        cy.url().should('include', href);
        if (title) {
          cy.contains(title, { timeout: 60000 });
        }
        cy.go('back');
        cy.get('body').then(($body) => {
          let leaveBtnArray;
          if (
            (leaveBtnArray = $body.find('[data-testid="leave-cluster-prompt-button"]')).length > 0
          ) {
            leaveBtnArray[0].click();
          }
          return true;
        });
        return this;
      },

      get cyObj() {
        return cy.get(`@btn-${btnNumber}`);
      },
    };
  }
}

export default ButtonHelper;
