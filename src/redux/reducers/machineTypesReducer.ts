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
import keyBy from 'lodash/keyBy';

import { getErrorState } from '../../common/errors';
import { MachineType } from '../../types/clusters_mgmt.v1';
import { MachineTypesAction } from '../actions/machineTypesActions';
import { machineTypesConstants } from '../constants';
import {
  baseRequestState,
  FULFILLED_ACTION,
  PENDING_ACTION,
  REJECTED_ACTION,
} from '../reduxHelpers';
import { PromiseReducerState } from '../state';
import { PromiseActionType } from '../types';

type State = PromiseReducerState<{
  types: {
    [key: string]: MachineType[];
  };
  typesByID: { [id: string]: any };
}>;

const initialState: State = {
  ...baseRequestState,
  types: {},
  typesByID: {},
};

const mapMachineTypesById = (types: { [id: string]: MachineType[] }) =>
  keyBy([...(types.aws ?? []), ...(types.gcp ?? [])], 'id');

function machineTypesReducer(
  state = initialState,
  action: PromiseActionType<MachineTypesAction>,
): State {
  switch (action.type) {
    case REJECTED_ACTION(machineTypesConstants.GET_MACHINE_TYPES):
      return {
        ...initialState,
        ...state,
        ...getErrorState(action),
      };

    case PENDING_ACTION(machineTypesConstants.GET_MACHINE_TYPES):
      return {
        ...initialState,
        ...state,
        pending: true,
      };

    case FULFILLED_ACTION(machineTypesConstants.GET_MACHINE_TYPES):
      return {
        ...baseRequestState,
        types: action.payload,
        typesByID: mapMachineTypesById(action.payload),
        fulfilled: true,
      };

    default:
      return state;
  }
}

machineTypesReducer.initialState = initialState;

export { initialState, mapMachineTypesById };

export default machineTypesReducer;
