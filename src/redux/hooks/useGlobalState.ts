import { TypedUseSelectorHook, useSelector } from 'react-redux';

import { GlobalState } from '../stateTypes';

export const useGlobalState: TypedUseSelectorHook<GlobalState> = useSelector;
