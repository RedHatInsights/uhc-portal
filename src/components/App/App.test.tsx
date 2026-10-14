import React from 'react';

import { render } from '~/testUtils';

import App from './App';

jest.mock('./Router');

describe('<App />', () => {
  it('renders the app shell with the router and react-query providers', () => {
    render(<App />);

    expect(document.getElementById('app-outer-div')).toBeInTheDocument();
  });
});
