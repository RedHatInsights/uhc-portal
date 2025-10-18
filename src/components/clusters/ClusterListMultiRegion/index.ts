import { connect } from 'react-redux';

import type { MachineType } from '~/types/clusters_mgmt.v1';

import { cloudProviderActions } from '../../../redux/actions/cloudProviderActions';
import { clearGlobalError } from '../../../redux/actions/globalErrorActions';
import { machineTypesActions } from '../../../redux/actions/machineTypesActions';
import { userActions } from '../../../redux/actions/userActions';
import type { State as CloudProvidersState } from '../../../redux/reducers/cloudProvidersReducer';
import type { UserProfileState } from '../../../redux/reducers/userReducer';
import type { PromiseReducerState } from '../../../redux/stateTypes';
import { modalActions } from '../../common/Modal/ModalActions';
import ClusterListTab from '../Clusters/ClusterListTab';

import ClusterList from './ClusterList';

const mapDispatchToProps = {
  getCloudProviders: cloudProviderActions.getCloudProviders,
  getMachineTypes: machineTypesActions.getMachineTypes,
  getOrganizationAndQuota: userActions.getOrganizationAndQuota,
  openModal: modalActions.openModal,
  closeModal: modalActions.closeModal,
  clearGlobalError,
};

type MachineTypesState = PromiseReducerState<{
  types: {
    [key: string]: MachineType[];
  };
  typesByID: { [id: string]: any };
}>;

type RootState = {
  cloudProviders: CloudProvidersState;
  machineTypes: MachineTypesState;
  userProfile: UserProfileState;
};

const mapStateToProps = (state: RootState) => ({
  cloudProviders: state.cloudProviders,
  machineTypes: state.machineTypes,
  organization: state.userProfile.organization,
});

export default connect(mapStateToProps, mapDispatchToProps)(ClusterList);
export const ListTab = connect(mapStateToProps, mapDispatchToProps)(ClusterListTab);
