import React from 'react';
import { InitialEntry } from 'history';
import { axe, toHaveNoViolations } from 'jest-axe';
import merge from 'lodash/merge';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { AnyAction } from 'redux';
import promiseMiddleware from 'redux-promise-middleware';

import * as useChromeHook from '@redhat-cloud-services/frontend-components/useChrome';
import { configureStore, Middleware } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, renderHook, RenderOptions } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';

import * as wizardHooks from '~/components/clusters/wizards/hooks';
import * as featureGates from '~/queries/featureGates/useFetchFeatureGate';

import promiseRejectionMiddleware from './redux/promiseRejectionMiddleware';
import { reduxReducers } from './redux/reducers';
import sentryMiddleware from './redux/sentryMiddleware';
import { GlobalState } from './redux/stateTypes';
import { store as globalStore } from './redux/store';
import * as restrictedEnv from './restrictedEnv';

import '@testing-library/jest-dom';

interface RenderOptionsWithRouter extends RenderOptions {
  withRouter: boolean;
}

// An extended version of RTL's "custom render()" pattern.

const reducer = reduxReducers;

export const TestRouter = ({
  children,
  initialEntries,
}: {
  children: React.ReactNode;
  initialEntries?: InitialEntry[];
}) => <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;

interface TestState {
  store: typeof globalStore;
  /** Wrapper can be used as component independently of render() */
  Wrapper: (props: { children: React.ReactNode }) => React.ReactNode;
  /** Convenience accessor to redux state. */
  getState: () => GlobalState;
  /** Convenience alias to store.dispatch, wrapped with act() to trigger all re-renders. */
  dispatch: (action: AnyAction) => any;
  render: (
    ui: React.ReactElement,
    options?: RenderOptionsWithRouter,
  ) => ReturnType<typeof render> & { user: UserEvent };
}

/** Construct a local redux store + test helpers for it.
 * A simple use is `{ container } = withState(initialState).render(...);`
 * but can save `testState = withState(initialState);` and reuse it later.
 *
 * Helpers are closures, no need to call as methods, safe to destructure e.g.:
 * `const { render, dispatch } = withState(initialState);`
 *
 * Accepts any subset of state, rest gets filled by reducers initial values.
 * If not passed a state, uses the global `store` and tries to block dispatch().
 */
const withState = (initialState?: any, mergeWithGlobalState?: boolean): TestState => {
  // This could be a class with bound methods but didn't want to require `new withState()`,
  // and old-school constructor function got too annoying to TypeScript, so plain Object it is.

  let newState = initialState;

  // console.log(globalStore.getState());

  if (newState && mergeWithGlobalState) {
    newState = merge({ ...globalStore.getState() }, initialState);
  }

  // NOTE: This should match what is set in src/redux/store.ts
  // BUT also includes an preloadedState key
  const store = initialState
    ? configureStore({
        reducer,
        preloadedState: newState,
        middleware: (getDefaultMiddleware) =>
          getDefaultMiddleware({
            serializableCheck: false,
            immutableCheck: { warnAfter: 256 }, // We can also set immutableCheck to false to prevent checking (and warnings)
          })
            .concat(promiseRejectionMiddleware as Middleware)
            .concat(promiseMiddleware)
            .concat(sentryMiddleware as Middleware),
      })
    : globalStore;
  // TODO: should we enable promiseMiddleware, thunkMiddleware on these stores?

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    return (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </Provider>
    );
  };

  const WrapperWithRouter = ({ children }: { children: React.ReactNode }) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    const providers = (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </Provider>
    );
    return <TestRouter>{providers}</TestRouter>;
  };

  return {
    store,
    Wrapper,

    // Our `GlobalState` type is slightly more precise.
    getState: () => store.getState() as unknown as GlobalState,

    dispatch: (action: AnyAction) => {
      if (store === globalStore) {
        throw new Error(
          'Tests must not dispatch() on global `store`; use `withState(initialState)` to create a local store.',
        );
      }
      act(() => {
        store.dispatch(action);
      });
    },

    render: (ui: React.ReactElement, options?: RenderOptionsWithRouter) => ({
      ...render(ui, {
        wrapper: options?.withRouter === false ? Wrapper : WrapperWithRouter,
        ...options,
      }),
      user: userEvent.setup({ delay: null }),
    }),
  };
};

/**
 * Similar to testing-library's render() but provides a redux store.
 * @param initialState - if given, initialize redux with these values.
 */
const renderWithState = (
  ui: React.ReactElement,
  options?: Omit<RenderOptionsWithRouter, 'queries'>,
  initialState?: any, // setting to any because only a partial state structure may be sent
) => withState(initialState).render(ui, options);

export * from '@testing-library/react';
export { default as userEvent, UserEvent } from '@testing-library/user-event';

export { withState, renderWithState as render };

/**
 * Wraps render hook in react query provider
 *
 */

const renderHookWithProvider = (callback: (props?: any) => any, options?: any) => {
  const wrapper = ({ children }: { children: React.JSX.Element }) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
  return renderHook(callback, { ...options, wrapper });
};

export { renderHookWithProvider as renderHook };

/* ***** Items outside of React Test Library ************ */
expect.extend(toHaveNoViolations);

export const checkAccessibility = async (container: HTMLElement | string, options?: any) =>
  // Needs to be wrapped in "act" to prevent the "not wrapped in act" warnings
  // See https://www.benmvp.com/blog/avoiding-react-act-warning-when-accessibility-testing-next-link-jest-axe/
  act(async () => {
    expect(await axe(container)).toHaveNoViolations();
  });

export const stubbedChrome = {
  on: () => () => {},
  appNavClick: () => {},
  auth: {
    getUser: () => Promise.resolve({ data: {} }),
    getToken: () => Promise.resolve(),
    getOfflineToken: () => Promise.resolve({ data: { refresh_token: 'hello' } }),
  },
  getEnvironment: () => 'prod',
  segment: {
    setPageMetadata: () => {},
  },
};

export const mockRestrictedEnv = (mockValue = false) => {
  const mock = jest.spyOn(restrictedEnv, 'isRestrictedEnv');
  mock.mockReturnValue(mockValue);
  return mock;
};

export const mockRefreshToken = () => {
  const mock = jest.spyOn(restrictedEnv, 'getRefreshToken');
  mock.mockImplementationOnce((): Promise<any> => Promise.resolve('mock-refresh-token'));
  return mock;
};

export const mockUseChrome = (mockImpl?: any) => {
  const useChromeSpy = jest.spyOn(useChromeHook, 'default');
  useChromeSpy.mockImplementation(() => ({
    ...stubbedChrome,
    ...mockImpl,
  }));
  return useChromeSpy;
};

// Mocking Feature Gates
export type MockedGate = [string, boolean];

export const mockUseFeatureGate = (mockedGates: MockedGate[]) =>
  jest.spyOn(featureGates, 'useFeatureGate').mockImplementation((feature) => {
    const gateToMock = mockedGates.find((gate) => gate[0] === feature);
    return gateToMock ? gateToMock[1] : false;
  });

// Mocking useFormState hook
export interface MockFormStateOptions {
  values?: Record<string, any>;
  setFieldValue?: jest.Mock;
  setFieldTouched?: jest.Mock;
  getFieldProps?: jest.Mock;
  getFieldMeta?: jest.Mock;
  validateField?: jest.Mock;
  [key: string]: any; // Allow additional Formik context properties
}

export const mockUseFormState = (options: MockFormStateOptions = {}) => {
  const {
    values = {},
    setFieldValue = jest.fn(),
    setFieldTouched = jest.fn(),
    getFieldProps = jest.fn().mockReturnValue({
      name: '',
      value: '',
      onBlur: jest.fn(),
      onChange: jest.fn(),
    }),
    getFieldMeta = jest.fn().mockReturnValue({
      error: undefined,
      touched: false,
    }),
    validateField = jest.fn(),
    ...rest
  } = options;

  const useFormStateSpy = jest.spyOn(wizardHooks, 'useFormState');
  useFormStateSpy.mockReturnValue({
    values,
    setFieldValue,
    setFieldTouched,
    getFieldProps,
    getFieldMeta,
    validateField,
    ...rest,
  } as any);

  return useFormStateSpy;
};
