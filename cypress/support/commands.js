// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('getByTestId', (selector, ...args) => {
  return cy.get(`[data-testid=${selector}]`, ...args);
});

Cypress.Commands.add('executeRosaCmd', (cmd, ...args) => {
  cy.executeCustomCmd(cmd, ...args);
});

Cypress.Commands.add('rosaLoginViaOfflineToken', (token, env, ...args) => {
  let cmd = `rosa login --env ${env} --token ${token}`;
  cy.executeCustomCmd(cmd, ...args);
});

Cypress.Commands.add('rosaLoginViaServiceAccount', (clientId, clientSecret, env, ...args) => {
  let cmd = `rosa login --env ${env} --client-id ${clientId} --client-secret ${clientSecret}`;
  cy.executeCustomCmd(cmd, ...args);
});

Cypress.Commands.add('executeCustomCmd', (cmd, ...args) => {
  const fileName = Cypress.env('ROSACLI_LOGS');
  return cy.exec(cmd, ...args).then((result) => {
    cy.writeFile(fileName, '\n------------------', { flag: 'a+' });
    cy.writeFile(fileName, `\ncommand : ${cmd}`, { flag: 'a+' });
    cy.writeFile(fileName, `\nresult : ${result.stdout}`, { flag: 'a+' });
    cy.writeFile(fileName, `\nerror : ${result.stderr}`, { flag: 'a+' });
    cy.writeFile(fileName, '\n------------------', { flag: 'a+' });
  });
});

Cypress.Commands.add('waitForLoadingToFinish', (timeout = 20000) => {
  cy.get('[role="progressbar"]', { timeout }).should('not.exist');
});
