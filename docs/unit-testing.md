# React component unit testing best practices

## Table of contents

- [Use React testing library](#use-react-testing-library-rtl)
- [Testing files in same directory as component file](#testing-files-in-same-directory-as-component-file)
- [Test grouping](#test-grouping)
- [Use `it()`](#use-it)
- [Test spacing](#test-spacing)
- [Test description (end result when)](#test-description-end-result-when)
- [Test structure (using modified AAA format)](#test-structure-using-modified-aaa-format)
- [Test boundaries](#test-boundaries)
- [Keep tests DRY while avoiding over abstraction](#keep-tests-dry-while-avoiding-over-abstraction)
- [Keep tests small and focused (test a single item/state at a time)](#keep-tests-small-and-focused-test-a-single-itemstate-at-a-time)
- [Avoid snapshot or “it renders” tests](#avoid-snapshot-or-it-renders-tests)
- [Accessibility testing](#accessibility-testing)
- [Write "todo" tests before coding](#write-todo-tests-before-coding)
- [Skip tests that are producing unexpected results](#skip-tests-that-are-producing-unexpected-results)
- [Query types](#query-types)
- [Selector preference order](#selector-preference-order)
- [Tools](#tools)
- [Render in each test](#render-in-each-test)
- [Test independence](#test-independence)
- [Use `user` helper object](#use-user-helper-object)
- [Use `within` instead of `querySelector` (when possible)](#use-within-instead-of-queryselector-when-possible)
- [Use `findBy` instead of `waitFor` (when possible)](#use-findby-instead-of-waitfor-when-possible)
- [Use `toBeInTheDocument` to test if an item exists](#use-tobeinthedocument-to-test-if-an-item-exists)
- [Helpful tips](#helpful-tips)

## Use React testing library (RTL)

All unit tests shall be written using [React Testing Library (RTL)](https://testing-library.com/docs/react-testing-library/intro/).

### The RTL approach

When using RTL, the main approach is to test as how users would test. For example, when finding a button, a user would look for a button object with a given text. Users do not identify a button but the CSS class, id, or test id. When writing selectors, we want to select on what the user is seeing (role, text, etc.) instead of items hidden in the HTML.

In addition, since a user sees the entire rendered component, the same should be true when performing unit tests. By default, RTL does this, and mocking whole components should be avoided.

## Testing files in same directory as component file

For every file that exports at least one React component, there is a corresponding test file in the same directory as the component file. The file should have the same name, but ending with `.test.jsx` or `.test.tsx`. Do not use `.spec.` for file names.

Example:

```
MyComponentDirectory
    MyComponent.test.tsx
    MyComponent.tsx
```

If updating an existing component file, the corresponding test file should be moved to the same directory and re-named if necessary.

## Test grouping

All the tests for a component shall be in a `describe` block where the description is component name.

If there are numerous tests, like tests shall be grouped in a child `describe` block.

```javascript
describe('<MySampleComponent />', () => {
  describe('Test validation', () => {
    // a bunch of tests
  });
  describe('Test submission errors', () => {
    // a bunch of tests
  });
});
```

## Use `it()`

Jest allows the use of both the `test` and `it` methods to define a test. All tests should use the `it` method.

Example:

```javascript
it('displays “hello” when “hello” is sent as a prop', () => {
  /* ... */
});
```

## Test spacing

There should be a single empty line between tests

```javascript
it('displays “hello” when “hello” is sent as a prop', () => {
  /* ... */
});

it('is accessible on initial render', () => {
  /* ... */
});
```

## Test description (end result when)

The test description should clearly describe what the end result will be along with the exact conditions needed to get the expected result. This allows future developers to quickly understand what each test does without analyzing the test code. Non-descriptive descriptions like “it works”, “it renders”, etc. shall not be used.

Format shall be:

_Expected result when conditions_

So the following are examples

```javascript
it('displays “hello” when “hello” is sent as a prop', () => {
  /* ... */
});

it('displays only the Overview, Access control, and Networking tabs when using default prop values', () => {
  /* ... */
});

it('shows an alert when the api call to get the cluster details fails', () => {
  /* ... */
});

it('shows the node count has increased by 1 when the user clicks on the “+” button', () => {
  /* ... */
});
```

Concise descriptions are valued, but longer descriptions are completely appropriate in order to effectively describe the test.

## Test structure (using modified AAA format)

In order to make the test itself more readable, each test should be broken down into three areas:

- Arrange => get the component ready to be tested. If there is an act part of the test, assert that the component is in an expected state before changes
- Act => perform any user action and/or data changes
- Assert => test the component is in the expected state.

Example:

```javascript
it('displays welcome banner when "welcome" button is pressed', () => {
  // Arrange
  const alertMessage = 'Welcome to our site Kim!';
  render(<MySampleComponent name="Kim" />);
  expect(screen.queryByRole('alert', { name: alertMessage })).not.toBeInTheDocument();

  // Act
  userEvent.click(screen.getByRole('button', { name: 'Welcome' }));

  // Assert
  expect(screen.getByRole('alert', { name: alertMessage })).toBeInTheDocument();
});
```

NOTE: Not all tests will have an act step - especially if the test is to assert that the component is in a certain state immediately after render.

Although helpful, adding the comments isn’t necessary but it should be obvious to future readers that these steps are followed in this order.

## Test boundaries

When creating a test, it is important to test all paths through the code of the component you are writing the test for. For example if you have an if statement in your code, this generally means that you will need two tests - one to cover the path in the if statement and one to over the else path.

With this said, only test logic that is introduced into the component. There isn’t a need to test imported components or libraries.

## Keep tests DRY while avoiding over abstraction

The end goal is to ensure that each test is readable in isolation. With that said, we don’t want a situation where a single change (like a new required prop) would require modifying many individual tests.

Things like text used for matching, initial props and set-up steps can be abstracted into helper functions that are contained outside all describe blocks and are defined at the top of the test file they are used.

While abstracting duplicate code into a helper, make sure that your tests are simple and easily readable - this may mean that you may error on duplicating code over creating an overly complex helper.

## Keep tests small and focused (test a single item/state at a time)

Unlike functional or end-to-end tests which can become rather lengthy, for unit tests it is ideal to keep them short and only testing a single state.

This will mean that there will be many smaller unit tests.

## Avoid snapshot or “it renders” tests

While, on the surface snapshot tests seem like an easy way to create a test, in practice snapshot tests do not catch bugs and give a false sense of confidence in test coverage. They discourage a test driven development (TDD) approach. In addition, it is unclear exactly what is supposed to be tested.

Checking to see if the component renders anything doesn't provide a lot of value, React itself has been well tested and we don’t need to verify it will render information it is given.

Avoid:

```javascript
it('renders', () => {
  // Arrange
  const { container } = render(<MySampleComponent name="Kim" />);

  // Assert
  expect(container).toMatchSnapshot();
});
```

Better:

```javascript
it('displays “Hello Kim” when “Kim” is sent as a prop on initial render', () => {
  // Arrange
  render(<MySampleComponent name="Kim" />);

  // Assert
  expect(screen.getByText('Hello Kim')).toBeInTheDocument();
});
```

## Accessibility testing

While automated accessibility tests only catch around 20% of the accessibility issues, adding automated accessibility tests is easy and should be added for each component using the axe-core library.

Each state of the component should be tested for accessibility. Ideally accessibility checks would be separate tests, but accessibility checks can be added to other tests if the tests include a state change.

```javascript
import { render, screen, checkAccessibility } from '@testUtils';

it('is accessible on initial render', async () => {
  // Arrange
  const { container } = render(<MySampleComponent name="Kim" />);

  // Assert
  await checkAccessibility(container);
});

it('displays welcome banner when "welcome" button is pressed AND is accessible', async () => {
  // Arrange
  const alertMessage = 'Welcome to our site Kim!';
  const { container } = render(<MySampleComponent name="Kim" />);
  expect(screen.queryByRole('alert', { name: alertMessage })).not.toBeInTheDocument();

  // Act
  userEvent.click(screen.getByRole('button', { name: 'Welcome' }));

  // Assert
  expect(screen.getByRole('alert', { name: alertMessage })).toBeInTheDocument();

  await checkAccessibility(container);
});
```

If there is an accessibility issue that can’t be resolved because it is from an external library (like PatternFly) do the following:

- Make the accessibility test a “skip” test (see section below)
- Add an explanation to the test describing why the test is being skipped
- Check for an existing bug on the external library’s site. If one doesn't exist, then create a new one.
- Add the URL to the bug as a comment in the test.

## Write "todo" tests before coding

Ideally, tests will be written and coded before making changes to the actual application. The feature is complete once all the tests pass. This isn’t always possible. Before starting new work, at the very least “todo” tests should be created describing how the application should behave.

```javascript
it.todo('displays “Hello Kim” when “Kim” is sent as a prop on initial render');
```

These todo tests should be checked into git if there is a need to merge the code to 'main' before the tests are done.

## Skip tests that are producing unexpected results

If a test is producing unexpected results, it should be skipped along with an explanation of why the test is being skipped. By skipping the test it is a signal to future developers that this is something that should be tested but here is an issue that should be addressed in the future.

```javascript
it.skip('is accessible on initial render', async () => {
  // NOTE: This test is skipped because of an accessibility error
  // from an external library. This has been recorded in
  // https://www.github.com/externalUIlibrary/issues/123

  // Arrange
  const { container } = render(<MySampleComponent name="Kim" />);

  // Assert
  await checkAccessibility(container);
});
```

These skip tests should be checked into git. Do not comment out or remove valid failing tests.

## Query types

There are three types of queries available in RTL (`getBy…`, `queryBy…`, `findBy…`,) It is important to use them in the correct way.

| Query expect single results | Query expect multiple results | When to use                                                    |
| --------------------------- | ----------------------------- | -------------------------------------------------------------- |
| `getBy…`                    | `getAllBy…`                   | When you are expect that the item(s) exist                     |
| `queryBy…`                  | `queryAllBy…`                 | When you expect that the item(s) do not exist                  |
| `findBy…`                   | `findAllBy…`                  | When you what the code to wait until the item(s) are available |

See: https://testing-library.com/docs/queries/about#types-of-queries for more description.

## Selector preference order

When trying to find an object(s) in a component with RTL, the following selectors should be used in this preference order:
The RTL queries (in [priority order](https://testing-library.com/docs/queries/about/#priority))

- `getByRole` (accessibility tree role - often combined with text) - [getByRole information and examples](https://testing-library.com/docs/queries/byrole/)
- `getByLabelText` (used with form elements)
- `getByPlaceholderText` (used with form elements)
- `getByText`
- `getByDisplayValue` (used with form elements)
- `getByAltText` (used with images)
- `getByTitle` (only if title attribute is appropriate)
- `getByTestId`\*

The reasoning is that we want to use items in the same way users find items. This often means by searching by text strings. The instability of using text matching can be reduced by using partial text matching, regular expressions, and variabilization.

When the above priority is followed, the code will generally be more accessible because writing code that is testable with the above priority in mind tends to be more accessible code.

NOTE: Do not force an inappropriate role, alt text, or title just for testing purposes. Role, alt, and title attribute must be appropriate for the situation.

\*If `getByTestId` is used, an explanation of why no other method would work in this situation.

Example of to use `getByTestId`:

```javascript
it('smiley face is shown when “isSmiley” is passed as a prop', () => {
  // Arrange
  render(<MySampleComponent isSmiley />);

  // Assert
  // NOTE: byByTestId is used because the SmileyFace component
  // doesn’t render a role or accessible text.

  expect(screen.getByTestId('mySmileyFaceTestId')).toBeInTheDocument();
});
```

## Tools

[Testing Playground](https://chrome.google.com/webstore/detail/testing-playground/hejbmebodbijjdhflfknehhcgaklhano/) is a Chrome extension that will suggest selectors based on this preference order.

## Render in each test

In order to ensure it is clear what is rendered for each test, rendering shall happen within the test itself. This means that rendering should not happen inside a `beforeAll`, `beforeEach`, or other similar helper.

In order to reduce duplicate code, props that are applied in each test can be saved as a variable.

```javascript
const props = { isSmiley: true, name: 'Kim' };

describe('<MySampleComponent />', () => {
  it('is accessible on initial render', async () => {
    const { container } = render(<MySampleComponent {...props} />);
    await checkAccessibility(container);
  });

  it('shows "Kim" when passed as a prop', () => {
    render(<MySampleComponent {...props} />);
    expect(screen.getByText('Hello Kim')).toBeInTheDocument();
  });

  it('shows SmileyFace when passed as a prop', () => {
    render(<MySampleComponent {...props} />);
    expect(screen.getByAltText('smiley face')).toBeInTheDocument();
  });

  it('does not show SmileyFace when false is passed as a prop', () => {
    const newProps = { ...props, isSmiley: false };
    render(<MySampleComponent {...newProps} />);
    expect(screen.queryByAltText('smiley face')).not.toBeInTheDocument();
  });
});
```

## Test independence

Each test, describe block, and file should be able to be run singularly and as part of the entire test suite with the same results.

In order to achieve this, it is important to ensure that actions taken in one test do not impact another test or persist after the test. Take extra care when:

- Using `beforeEach`, `beforeAll`, `afterEach`, `afterAll` methods
- Nesting describe blocks
- Changing the value of a variable - especially during a `beforeEach`, `beforeAll`, `afterEach`, `afterAll` blocks

See [Avoid Nesting when you’re Testing](https://kentcdodds.com/blog/avoid-nesting-when-youre-testing)

In addition, jest will automatically clear mocks after each test to ensure that mocks aren't bleed between tests.  See [jest documentation](https://jestjs.io/docs/configuration#clearmocks-boolean) for more information.  While manually calling `jest.clearAllMocks()` in a beforeEach or afterEach block is not necessary, it causes no harm and can be added to remind future coders of a given unit test file that clearing mocks is important between tests.

## Use `user` helper object

When testing user interactions like typing or clicking, use the user helper method that is returned on render. This object has a configuration that works best with the code base. Do not directly use `userEvent` or `fireEvent`.

```javascript
it('displays “hello” when button is clicked', async () => {
  // Arrange
  const { user } = render(<MySampleComponent />);
  expect(screen.queryByText('hello')).not.toBeInTheDocument();

  // Act
  await user.click(screen.getByRole('button'));

  // Assert
  expect(screen.getByText('hello')).toBeInTheDocument();
});
```

### Simulating typing

When RTL simulates a user typing into a textbox, it does not empty the textbox first. Clear the textbox before simulating typing.

```javascript
it('displays “world” when user types “hello”', async () => {
  // Arrange
  const { user } = render(<MySampleComponent />);
  expect(screen.queryByText('world')).not.toBeInTheDocument();

  // Act
  await user.clear(screen.getByRole('textbox'));
  await user.type(screen.getByRole('textbox'), 'hello');

  // Assert
  expect(screen.getByText('world')).toBeInTheDocument();
});
```

## Use `within` instead of `querySelector` (when possible)

Often there are times when you want to find an element inside another element. For example, you want the first list item inside the first tab. While RTL does allow for the use of `querySelectors`, the `within` helper is preferred.

```javascript
it('has the text “hello world” in the first list item', () => {
  // Arrange
  render(<MySampleComponent />);

  // Assert
  const FirstLI = within(screen.getAllByRole('tabpanel')[0]).getAllByRole('listitem')[0];
  expect(FirstLI).toHaveTextContent(`hello world`);
});
```

## Use `findBy` instead of `waitFor` (when possible)

If there is a state change in a component (either onmount or due to a user action) there may be a short time delay before the component is rerendered. This can cause tests to fail. RTL has two ways to wait for an expect statement to pass - `waitFor` and `findBy` (or `findAllBy`). The `findBy` or `findAllBy` selectors are preferred to ensure consistency across tests.

```javascript
it('Displays error when api call fails on initial render', async () => {
  // Arrange
  render(<MySampleComponent />);

  // Assert
  expect(await screen.findByRole('alert')).toBeVisible();
});
```

NOTE: There is an existing [RTL bug](https://github.com/testing-library/react-testing-library/issues/865) where if you set an element when using `findby` in a later exert, this may cause intermittent unit test failures on CI.

Avoid:

```javascript
it('Displays error when api call fails on initial render', async () => {
  // Arrange
  render(<MySampleComponent />);

  // Assert
  const myAlert = await screen.findByRole('alert');
  expect(myAlert).toBeVisible();
});
```

## Use `toBeInTheDocument` to test if an item exists

There are many approaches available if you want to check if an element exists. Best practice is to use the `toBeInTheDocument()` assertion. This makes it very clear what you are testing (that it exists)

Avoid:

```javascript
it('Displays “Kim” when passed as a prop', () => {
  // Arrange
  render(<MySampleComponent name="Kim" />);

  // Assert
  expect(screen.getByText('Kim')).toBeTruthy();
  expect(screen.getAllByText('Kim')).toHaveLength(1);
  expect(screen.getByText('Kim')).toBeVisible();

  expect(screen.queryByText('Fish')).toBeFalsy();
  expect(screen.queryAllByText('Fish')).toHaveLength(0);
});
```

Best:

```javascript
it('Displays “Kim” when passed as a prop', () => {
  // Arrange
  render(<MySampleComponent name="Kim" />);

  // Assert
  expect(screen.getByText('Kim')).toBeInTheDocument();
  expect(screen.queryByText('Fish')).not.toBeInTheDocument();
});
```

NOTE:  
If an element’s visibility changes via CSS and you want to test if an element is currently visible, then use `.toBeVisible()`. See [`toBeVisible()` documentation](https://github.com/testing-library/jest-dom#tobevisible)

## Helpful tips

### Logging HTML

You can log the HTML of the component at any time using [`screen.debug()`](https://testing-library.com/docs/queries/about#screendebug) There is a limit on how many lines of code are printed to the console. If you want all rendered component html in the console, use the following: `screen.debug(undefined, Infinity)`

### Logging Roles (used in `getByRole`)

You can log out the aria roles of an object (including the entire component) and its children using [`logRoles()`](https://testing-library.com/docs/dom-testing-library/api-debugging/#logroles). This is incredibly helpful when using the `getByRole` selector.

```javascript
const { container } = render(<MySampleComponent />);

// entire component:
logRoles(container);

// single element
logRoles(screen.getByText('my favorite item'));
```

### Waiting for element to be removed

While the findBy selectors will wait for the appearance of an object, you can use the [`waitForElementToBeRemoved()`](https://testing-library.com/docs/guide-disappearance/#waiting-for-disappearance) helper to wait until an object has been removed from the DOM.

NOTE: There is an existing [RTL bug](https://github.com/testing-library/react-testing-library/issues/865) where if you save an element to a variable and then pass this variable to `waitForElementToBeRemoved()` causing intermittent unit test failures on CI.

Avoid:

```javascript
it('Displays error when api call fails on initial render', async () => {
  // Arrange
  render(<MySampleComponent />);

  // Assert
  const myAlert = screen.getByRole('alert');
  await waitForElementToBeRemoved(() => myAlert);
});
```

### Custom matchers

The React Testing Library has added [custom matchers](https://github.com/testing-library/jest-dom#custom-matchers) that you can use with your expect statements. For example, you can verify that a checkbox has been checked.

```javascript
it('The first checkbox is checked on initial render', () => {
  // Arrange
  render(<MySampleComponent />);

  // Assert
  expect(screen.getAllByRole('radio')[0]).toBeChecked();
});
```

### Fixing “not wrapped in act” errors/warning

There are times when the tests may finish, but throws the following warning/error in the console:

> “An update to … inside a test was not wrapped in act(...) ”.

There are numerous reasons why this may happen, but the most common is that the test finished before the rendering was fully completed. This can happen if there are a lot of child components, updates on mount, or complex rendering.

The fix is to have the test check for something that would happen after a full render using the `findBy` selectors (ideal) or using `waitFor`.

```javascript
it('Dispalys hello on initial render', async () => {
  // Arrange
  render(<MySampleComponent />);

  // Assert
  expect(await screen.getByText('hello')).toBeInTheDocument();

  await waitFor(() => {
    expect(myMockedFunction).toHaveBeenCalled();
  });
});
```
