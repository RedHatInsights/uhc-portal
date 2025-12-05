# Contributing

## Table of contents

- [Setup](#setup)
- [Insights "Chrome" Architecture](#insights-chrome-architecture)
- [Code Style](#code-style)
  - [Linting](#linting)
  - [Formatting](#formatting)
- [Testing](#testing)
  - [Unit tests](#unit-tests)
  - [End-to-end tests](#end-to-end-tests)
- [Code assistants](#code-assistants)
- [OpenAPI types definitions](#openapi-types-definitions)
- [Storybook](#storybook)
- [Pull requests](#pull-requests)
- [Information security](#information-security)

## Setup

Following [RedHat's Information Security guidelines](https://source.redhat.com/departments/it/it_information_security/blog/prevent_costly_leaks_with_rh_pre_commit), contributors need to install the _rh-pre-commit_ git-hook, which scans for sensitive data.  
To install, follow the [_quickstart-install_ section of the rh-pre-commit repo docs](https://gitlab.cee.redhat.com/infosec-public/developer-workbench/tools/-/tree/main/rh-pre-commit#quickstart-install) (which is part of the general [LeakTK rh-pre-commit installation guide](https://source.redhat.com/departments/operations/it-information-security/leaktk/leaktk_guides/rh_pre_commit_installation)).

See the [Information security](#information-security) section below for details on what constitutes sensitive data.
                   
> [!NOTE]
> 
> When running the quickstart.sh installation script, make sure to use the `-r` flag with the local repo path as value; If omitted, the hook will be installed for all existing repos under the home dir.
> 
> Note that regardless of that flag, any future repo-clones on your system will have the hook installed automatically.

## Insights "Chrome" Architecture

As all apps under console.redhat.com, our app uses [insights-chrome](https://github.com/RedHatInsights/insights-chrome).
(The term "chrome" refers to it being a thin wrapper, no relation to Google Chrome.)

It is responsible for rendering the header & menu around the main content, and providing common services, like authentication or analytics.

It’s not a regular build dependency but is injected by CDN using [EdgeSide Includes](https://en.wikipedia.org/wiki/Edge_Side_Includes) tags.

In development, `yarn start` uses the Frontend Components Config (FEC) dev server, which automatically handles Chrome setup by running a containerized Chrome server (requires Podman). FEC manages the development environment including the Chrome container, webpack dev server, and proxying to backend services.

## Code guidelines

Code guidelines are listed [in a separate document](code-guide.md). Make sure to carefully read and understand them before contributing.

## Code Style

To promote consistency in the code base, OCM follows the JavaScript and React [style guides produced
by airbnb](https://github.com/airbnb/javascript).

To guide and aid developers in style consistency, OCM uses [eslint](https://eslint.org/) and
the [airbnb eslint
tools](https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb).

### Linting

To run the linter:

```
yarn lint
```

Note that this command will also run the formatter. See next chapter for more info.

### Formatting

To promote consistency in the code base, OCM uses the [Prettier](https://prettier.io/) code formatter for Javascript and TypeScript files.

To run prettier on all files in the `src` directory:

```
yarn prettier
```

To fix all formatting issues in all files in the `src` directory:

```
yarn prettier:fix
```

If you need to have prettier run on a set of files, NPX can be used.

```
npx prettier --check <path to file or directory>
```

For example `npx prettier --check 'src/common/\**/*.{js,ts,jsx,tsx}'`. Note that you can use the `--write` flag instead of "check" to fix formatting issues.

NOTE: Staged javascript files from the `src` directory will be checked and fixed by Prettier at commit time via [Husky](https://typicode.github.io/husky/#/) and [lint-staged](https://github.com/okonet/lint-staged). If there are any formatting errors that cannot be fixed, the commit will not happen. The scripts that are run at commit time can be run at any time against staged files by running `npx lint-staged`.

## Testing

### Unit tests

To run the tests:

```
yarn test
```

Unit tests are written using [Jest](https://jestjs.io/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro).

Jest will use all available cores to spawn workers while running tests. This can cause your local machine to become unresponsive.
You can run tests with a reduced amount of cpu usage by using:

```
yarn test-local
```

See the [unit test guidelines](./unit-testing.md) for in-depth guidance on writing tests.

### End-to-end tests

End-to-end tests are written using [Cypress](https://www.cypress.io/).

You can read more in the [dedicated `README`](../cypress/README.md) inside the `/cypress` folder.

## Code assistants

### Usage

When using AI tools to write, modify, or generate code or documentation make sure to always follow these guidelines:

* Treat AI-generated code as suggestions, not final code. Review all the generated code and modify as appropriate. Thoroughly review and test all code that you intend to integrate into your work.
* Do not blindly trust AI-generated or assisted code. Always apply your own judgment and expertise. AI coding assistants can introduce security vulnerabilities if not used carefully, and AI models can sometimes hallucinate and provide incorrect or non-functional code.
* Make sure you thoroughly understand any AI-generated code. If the generated code you intend to incorporate in your work is outside your expertise, consult with someone knowledgeable in the area prior to making it available to others.
* Never input confidential, personal or proprietary data, such as API keys, customer data, or protected content like passwords and credentials directly into code assistants.

### "Marking" generated code

Any nontrivial and substantial AI-generated or AI-assisted content needs to be “marked” in appropriate cases.

You have to mark at least two places: 
* the PR description field
* the commit message when squashing and merging the PR

You should use a message like “Assisted-by:” or “Generated-by:”. For example: "Assisted-by: Cursor/gemini-2.5-pro". You can eventually elaborate on how the code assistant was used if necessary.

When a significant portion of code inside a file is generated or assisted, you should add a source file comment to indicate it.


## OpenAPI types definitions

Types generated from OpenAPI spec files are located in the `src/types` folder.

You can read more about generating new types in the [dedicated README](../openapi/README.md).

## Storybook

A storybook is available to document UI elements, implement PoCs and run components in isolation.

To run storybook:

```
yarn storybook
```

Storybook will be available locally at `http://localhost:6006/`.


A component’s stories are defined in a story file that lives alongside the component file. The story file is for development-only, and it won't be included in the production bundle.
When adding a component to storybook, please create stories in separate files using the `.stories.tsx` suffix. For example, to add stories to a component named "MySelect.tsx", create a separate `MySelect.stories.tsx` file in the same folder.

You can have a look at storybook docs for more info about [how to write stories](https://storybook.js.org/docs/writing-stories).

## Pull requests

Please follow the guidelines described in the [Pull Request Process document](./pull-request-process.md) when opening new PRs.

For external contributors: If you need a pull request review, please message the OCM UI team at the `#ocm-osd-ui` Slack channel.
                                                              
## Information security

When proposing changes, take care to:

- Not include any sensitive client or QE data in the source-code (e.g. account IDs, emails, passwords)
- Not refer to any sensitive data in the docs (e.g. readme, wiki), including references to specific customers, or references to nonpublic Red Hat strategies/product plans
- Not include any source-code obtained from a vendor/partner/customer, or through an acquisition
- According to FedRAMP guidance, not include any instances of in-boundary names (e.g. domains, URLs)

If you have any doubts on whether data is sensitive or not, please reach out to OCM UI Core team or Infosec team first, before pushing any code.

