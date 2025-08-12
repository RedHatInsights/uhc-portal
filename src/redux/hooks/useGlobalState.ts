import { TypedUseSelectorHook, useSelector } from 'react-redux';

import { GlobalState } from '../state';

export const useGlobalState: TypedUseSelectorHook<GlobalState> = useSelector;
