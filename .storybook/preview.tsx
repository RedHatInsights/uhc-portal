import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import type { Preview } from '@storybook/react';

import '@patternfly/react-core/dist/styles/base.css';
import '../src/styles/main.scss';
import '@patternfly/patternfly/patternfly-addons.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  initialGlobals: {
    features: {},
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div
          style={{
            backgroundColor: 'var(--pf-v5-global--BackgroundColor--100)',
            padding: '1em',
            height: '100vh',
          }}
        >
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
};

export default preview;
