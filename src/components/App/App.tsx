/*
Copyright (c) 2018 Red Hat, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React from 'react';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { queryClient } from './queryClient';
import Router from './Router';

const BREADCRUMB_STICKY_STYLE = `
  main:has(#app-outer-div) > .chr-c-breadcrumbs__group {
    position: sticky;
    inset-block-start: 0;
    z-index: var(--pf-t--global--z-index--md);
    background-color: var(--pf-t--global--background--color--primary--default);
  }
`;

const App = () => (
  <>
    <style id="ocm-breadcrumb-sticky">{BREADCRUMB_STICKY_STYLE}</style>
    <div id="app-outer-div">
      <QueryClientProvider client={queryClient}>
        <Router />
        <ReactQueryDevtools initialIsOpen={false} position="bottom" buttonPosition="bottom-right" />
      </QueryClientProvider>
    </div>
  </>
);

export default App;
