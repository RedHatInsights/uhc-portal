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

import React, { useState } from 'react';

import useResizeObserver from '@react-hook/resize-observer';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { queryClient } from './queryClient';
import Router from './Router';

import './App.scss';

function getHeightUpdater(
  currentHeight: number,
  setter: React.Dispatch<React.SetStateAction<number>>,
) {
  return (entry: ResizeObserverEntry) => {
    const { target } = entry;
    const { height } = target.getBoundingClientRect();
    if (currentHeight !== height) {
      setter(height);
    }
  };
}

const App = () => {
  const mainPage = document.querySelector('main.pf-v6-c-page__main');
  const breadcrumb = document.querySelector('.chr-c-breadcrumbs__group');
  const [mainPageHeight, setMainPageHeaderHeight] = useState(
    mainPage ? mainPage.getBoundingClientRect().height : 0,
  );
  const [breadcrumbHeight, setBreadcrumbHeight] = useState(
    breadcrumb ? breadcrumb.getBoundingClientRect().height : 0,
  );

  useResizeObserver(mainPage, getHeightUpdater(mainPageHeight, setMainPageHeaderHeight));
  useResizeObserver(breadcrumb, getHeightUpdater(breadcrumbHeight, setBreadcrumbHeight));

  const containerHeight = mainPageHeight - breadcrumbHeight;

  return (
    <div id="app-outer-div" style={{ height: containerHeight > 0 ? containerHeight : 'auto' }}>
      <QueryClientProvider client={queryClient}>
        <Router />
        <ReactQueryDevtools initialIsOpen={false} position="bottom" buttonPosition="bottom-right" />
      </QueryClientProvider>
    </div>
  );
};

export default App;
