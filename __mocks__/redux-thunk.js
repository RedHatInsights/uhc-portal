// Mock redux-thunk for Storybook stories
// This provides the thunk middleware functionality without requiring the actual package
// The main app uses @reduxjs/toolkit which includes thunk middleware by default

const thunk = (store) => (next) => (action) => {
  if (typeof action === 'function') {
    return action(store.dispatch, store.getState);
  }
  return next(action);
};

module.exports = { thunk };
module.exports.default = thunk;
