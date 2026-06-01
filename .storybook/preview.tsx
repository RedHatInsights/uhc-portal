import React from 'react';
import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/patternfly/patternfly-addons.css';
import '~/styles/main.scss';

import dayjs from 'dayjs';

import { BrowserRouter as Router } from 'react-router-dom';
import type { Preview } from '@storybook/react';

import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';
import advancedFormat from 'dayjs/plugin/advancedFormat';

dayjs.extend(utc);
dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <Router>
        <Story />
      </Router>
    ),
  ],
  tags: ['autodocs'],
};

export default preview;
