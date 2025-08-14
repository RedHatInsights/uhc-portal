import { produce } from 'immer';

import { getErrorState } from '../../common/errors';
import { githubReleasesToFetch } from '../../common/installLinks.mjs';
import type { GitHubRelease } from '../../services/githubService';
import { GITHUB_GET_LATEST_RELEASE, GithubActions } from '../actions/githubActions';
import {
  baseRequestState,
  FULFILLED_ACTION,
  PENDING_ACTION,
  REJECTED_ACTION,
} from '../reduxHelpers';
import { PromiseReducerState } from '../state';
import type { PromiseActionType } from '../types';

type State = { [repo: string]: PromiseReducerState<{ data: GitHubRelease }> };

// {'user/repo': {pending, fulfilled etc., data: release}}
const initialState: State = {};
githubReleasesToFetch.forEach((repo) => {
  initialState[repo] = baseRequestState;
});

function githubReducer(state = initialState, action: PromiseActionType<GithubActions>): State {
  return produce(state, (draft) => {
    // eslint-disable-next-line default-case
    switch (action.type) {
      case REJECTED_ACTION(GITHUB_GET_LATEST_RELEASE):
        draft[action.meta.repo] = {
          ...initialState[action.meta.repo],
          ...getErrorState(action),
        };
        break;
      case PENDING_ACTION(GITHUB_GET_LATEST_RELEASE):
        draft[action.meta.repo].pending = true;
        break;
      case FULFILLED_ACTION(GITHUB_GET_LATEST_RELEASE):
        draft[action.meta.repo] = {
          ...baseRequestState,
          fulfilled: true,
          data: action.payload.data,
        };
        break;
    }
  });
}

export default githubReducer;
