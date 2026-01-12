# Coding Guidelines

This document defines the coding standards for the OCM UI project. All code contributions must follow these guidelines to ensure consistency, maintainability, and code quality.

These guidelines serve to:
- Establish shared conventions for code structure and patterns
- Improve code reviews by setting clear expectations
- Maintain a consistent, maintainable codebase

Use these guidelines during development and code reviews. When in doubt or if a scenario isn't covered, ask the team for help.

## Component Structure

Components should be organized by features. Each feature is represented by a container component in charge of handling logic and rendering other presentational components. The main responsibilities of presentational components are to display data received via props and handle user interactions.

Components should be properly broken down into UI elements responsible for a single goal. 

Example folder structure for a hypothetical `UsersList` component:

```
UsersList/
├── UsersList.tsx           # Container component
├── UsersList.test.tsx      
├── UsersList.stories.tsx      
├── useUsersList.ts         # Feature-specific hooks
├── components/             # Presentational components (only imported by container)
├── └── UsersTable.tsx      # Only create a folder if you have many
├── └── UsersToolbar.tsx
├── types.ts                # Only if needed      
└── utils/                  # Feature-specific utilities
```

## Coding Patterns

Use the following patterns when designing components:
- UI components should be a thin wrapper around data, they should handle local state (like `useState`) only when necessary. Even then, you should evaluate if you can flatten the UI state into a basic calculation, deriving data from props.
- Create a new component abstraction when you're nesting conditional logic or top-level if/else statements. Ternaries are reserved for small, easily readable logic.
- When complex data manipulation and logic is necessary, make use of custom hooks.
- Avoid passing whole objects to components when they only need a few properties. It will help clarify which information they rely on.
- Presentational components should not contain any domain/business logic. Consider the following example:
  ```tsx
  // ❌ BAD: Logic is coded inside an input field
  const SizeInput = (props: { isHypershift: boolean }) => {
    const { isHypershift } = props;
    const maxSize = isHypershift ? 200 : 150;
  
    return <NumberInput max={maxSize} />;
  };
  
  // ✅ GOOD: Configuration is passed down by parent feature
  const SizeInput = (props: { maxSize: number }) => {
    const { maxSize } = props;

    return <NumberInput max={maxSize} />;
  };  
  ```
- Avoid putting state-dependent logic inside `useEffect`; it causes misdirection of what the logic is doing. Choose to explicitly define logic rather than depend on implicit reactive behavior
- Prefer state machines over multiple related `useState` calls. Multiple interdependent state variables make code harder to reason about.
- Avoid `setTimeouts`. They are flaky and usually a _hack_, always provide a comment on _why_ you are using them. This doesn't affect if the "code runs" or not most of the time, but they can introduce subtle bugs that can grow into big issues that aren't obvious until someone goes in and has to spend a lot of time refactoring everything.

## React Hooks Patterns

- Avoid using `useMemo` for processes that are not [computationally expensive](https://react.dev/learn/you-might-not-need-an-effect#how-to-tell-if-a-calculation-is-expensive)
- Functions are memoized with `useCallback` only when necessary:
  * Functions used as dependencies in `useEffect`, `useMemo`, or other hooks
  * Functions passed to context providers or returned from custom hooks
  * Functions passed as props to memoized child components (to prevent unnecessary re-renders)
- Functions are NOT unnecessarily memoized:
  * Simple event handlers that aren't passed as props
  * Functions without dependencies or only used within the same component
- All hook dependencies (`useEffect`, `useMemo`, `useCallback`) use referentially stable variables
- No `useEffect`s that take incoming props and compute them for a local `useState`, this is `useMemo` with extra steps
- Make sure the [exhaustive-deps rule](https://react.dev/reference/eslint-plugin-react-hooks/lints/exhaustive-deps) is applied. If you encounter a file where the ESLint rule is ignored (`// eslint-disable-next-line react-hooks/exhaustive-deps`), re-enable it and fix the dependency array. If for any reason the rule has to be skipped, provide a comment explaining why.

### More On `useEffect`

Make sure to follow React guidelines on `useEffect`: [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)

Common cases where `useEffect` is NOT needed:

* Transforming data for rendering (use variables or useMemo instead)
* Handling user events (use event handlers instead)
* Resetting state when props change (use key prop or calculate during render)
* Updating state based on props/state changes (calculate during render)
* Set default values for input fields

Only use useEffect for:

* Synchronizing with external systems (APIs, DOM, third-party libraries)
* Cleanup that must happen when component unmounts

## Avoid Custom Styling

It is tempting to “just add a bit of CSS” for minor tweaks, but this usually indicates we are drifting away from native PatternFly behavior and should reconsider the approach. If you feel the need to add CSS or apply "styles" or "className" properties to "adjust" the UI, you're likely going in the wrong direction.

Using PF utility classes to enforce spacing or to fix layout issues is also considered problematic. Spacing and responsiveness should be handled using layout components (`Stack`, `Flex`, `Grid`, etc.) with a proper configuration. Exceptions can be made, but they have to be justified inside PR descriptions or comments.

Sometimes we find scenarios where PF doesn't quite manage something as we wanted. This is usually related to complex component structures, or to components that do not yet support the feature we are trying to implement.
This should be a rare exception, and we should resort to it sparingly. The more we add customizations, the more we have to deal with PF upgrades breaking them.

## Data Loading and Error States

When displaying data retrieved with asynchronous operations, always take care of the loading and error state of those operations.

While data is being loaded, a proper UI state should be displayed. PF offers `Skeleton` and `Spinner` components for this purpose. Read the corresponding design guidelines to decide how to design/implement loading case by case.

In a similar way you should always handle possible errors. UIs should not fail silently if something went wrong. PF offers an "Alert" component with general indication in the related design guidelines.

## TypeScript 

This is a legacy codebase. Not all the code has been migrated to TS. Every time you encounter JS files and change them, you are highly encouraged to convert them to TS first. The TS conversion should happen in a separate PR/ticket before further changes are introduced.

Some general rules to follow:
- Avoid using `any`. If type information is completely absent and cannot be retrieved, use `unknown` instead and implement type guards 
- Avoid [type assertions](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions) using `as`. They usually mean you are violating TypeScript indications. You probably have a type error that you are trying to bypass. A rare acceptable exception is when working with DOM APIs, e.g.: `const input = event.target as HTMLInputElement;`
- Provide fallback values when using optional chaining. Do not use optional chaining as a way to manage the absence of data while loading.
- Optional type properties are optional only when they can be optionally passed, not to overcome type errors or because it's easier to implement them
- Avoid default exports. All exports should be explicit.
- Avoid barrel files (`index.ts`) to re-export modules. They make refactoring harder, create a circular dependency risk, complicate tree-shaking.
- Avoid silencing TS errors with `// @ts-ignore` comments. They should be properly motivated exceptions.

## Third-party Libraries

### Redux

We still use Redux for data fetching and state management in multiple areas, but this implementation is considered legacy. Redux must not be used for any new development.

We switched to [TanStack Query](https://tanstack.com/query/latest) for data-fetching and async state management.

### Lodash

Only use lodash when it's needed. Avoid it when it's possible to achieve the same result with plain TS/JS. A common example is `lodash/get`, you can replace it with optional chaining and nullish coalescing.

## Documenting

Every UI component, representing a feature or a reusable UI block must be properly documented. This is crucial for many reasons:
- Allow developers to easily discover what is already implemented without having to browse the entire application
- Allow developers to discover all possible statuses supported by a component, including error states, without having to resort to complex mocking
- Clearly identify a component interface and its dependencies
- Improve consistency across components solving similar problems
- Share knowledge and avoid accidental single-point expertise

We have [a Storybook instance](contributing.md#storybook) for this purpose. Every new component should be documented with a story.

Writing components with clear responsibilities and dependencies is crucial to make it possible to easily document and test them.

### Testing

All code changes must be tested. Follow the [user-centered approach](https://testing-library.com/docs/react-testing-library/intro/#the-problem) introduced by RTL when writing unit tests. You can find more information in the dedicated [unit tests guidelines](unit-testing.md).
