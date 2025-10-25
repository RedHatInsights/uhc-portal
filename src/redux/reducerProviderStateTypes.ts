/**
 * Re-exports of Redux reducer state types for easier importing.
 *
 * This file provides a centralized location to import commonly used reducer state types
 * instead of importing directly from individual reducer files.
 *
 * @example
 * import type { CloudProvidersState, MachineTypesState } from '~/redux/reducerProviderStateTypes';
 */

export type { State as CloudProvidersState } from './reducers/cloudProvidersReducer';
export type { State as MachineTypesState } from './reducers/machineTypesReducer';
export type { OrganizationState, UserProfileState } from './reducers/userReducer';
