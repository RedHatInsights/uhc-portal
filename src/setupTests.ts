import { setAutoFreeze } from 'immer';
import { sprintf } from 'sprintf-js';

import config from './config';

// Mock apiRequest for all tests
jest.mock('~/services/apiRequest');

setAutoFreeze(false);
if (!process.env.LISTENING_TO_UNHANDLED_REJECTION) {
  process.on('unhandledRejection', () => {});
  process.env.LISTENING_TO_UNHANDLED_REJECTION = 'true';
}

// Warnings are printed with console.error.
// - TODO: Fail tests with proptypes warnings.
// - Fail on "Maximum update depth exceeded" because infinite loops are nasty in CI.
const { error } = console;
console.error = (msg, ...args) => {
  const text =
    typeof msg === 'string' ? sprintf(msg, ...args) : [msg, ...args].map(String).join(' ');

  if (
    // The following are due to the deprecated PF select option element
    !text.includes('React does not recognize the `inputId` prop on a DOM element') &&
    !text.includes('React does not recognize the `keyHandler` prop on a DOM element') &&
    !text.includes('React does not recognize the `sendRef` prop on a DOM element') &&
    !text.includes('React does not recognize the `isSelected` prop on a DOM element') &&
    // The following are due to PF Tab element
    !text.includes('React does not recognize the `isHidden` prop on a DOM element')
  ) {
    console.log('Following error in test: ', expect.getState().currentTestName);
    error(msg, ...args); // Even if we going to throw below, it's useful to log *full* args.
  }

  if (text.includes('Maximum update depth exceeded')) {
    throw text;
  }

  if (text.match(/Failed prop type|type .+ is invalid/)) {
    // TODO: HAC-4934 // throw text;
  }
};

(global as any).insights = {};

config.dateConfig();
