/*
Copyright (c) 2023 Red Hat, Inc.

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
import { MachineTypesByRegionAction } from '../actions/machineTypesActions';
import { machineTypesConstants } from '../constants';
import {
  baseRequestState,
  FULFILLED_ACTION,
  PENDING_ACTION,
  REJECTED_ACTION,
} from '../reduxHelpers';
import { PromiseReducerState } from '../state';
import { PromiseActionType } from '../types';

type MachineTypesByRegionState = PromiseReducerState<{
  types: {
    [key: string]: MachineType[];
  };
  typesByID: { [id: string]: any };
  region?: { [id: string]: any };
}>;

const initialState: MachineTypesByRegionState = {
  ...baseRequestState,
  types: {},
  typesByID: {},
  region: undefined,
};

const mapMachineTypesById = (types: { [id: string]: MachineType[] }) =>
  keyBy([...(types.aws ?? []), ...(types.gcp ?? [])], 'id');

function machineTypesByRegionReducer(
  state = initialState,
  action: PromiseActionType<MachineTypesByRegionAction>,
): MachineTypesByRegionState {
  switch (action.type) {
    case REJECTED_ACTION(machineTypesConstants.GET_MACHINE_TYPES_BY_REGION):
      return {
        ...initialState,
        ...state,
        region: action.meta.region,
        ...getErrorState(action),
      };

    case PENDING_ACTION(machineTypesConstants.GET_MACHINE_TYPES_BY_REGION):
      return {
        ...initialState,
        region: action.meta.region,
        pending: true,
      };

    case FULFILLED_ACTION(machineTypesConstants.GET_MACHINE_TYPES_BY_REGION):
      return {
        ...baseRequestState,
        types: action.payload,
        typesByID: mapMachineTypesById(action.payload),
        fulfilled: true,
        region: action.meta.region,
      };

    case machineTypesConstants.RESET_INITIAL_STATE:
      return {
        ...baseRequestState,
        types: undefined,
        typesByID: undefined,
        fulfilled: false,
        region: undefined,
      };

    default:
      return state;
  }
}

machineTypesByRegionReducer.initialState = initialState;

export { initialState, mapMachineTypesById, MachineTypesByRegionState };

export default machineTypesByRegionReducer;
