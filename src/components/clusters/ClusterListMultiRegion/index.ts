import { connect } from 'react-redux';

import type { State as CloudProvidersState } from '~/redux/reducers/cloudProvidersReducer';
import type { State as MachineTypesState } from '~/redux/reducers/machineTypesReducer';
import type { UserProfileState } from '~/redux/reducers/userReducer';

import { cloudProviderActions } from '../../../redux/actions/cloudProviderActions';
import { clearGlobalError } from '../../../redux/actions/globalErrorActions';
import { machineTypesActions } from '../../../redux/actions/machineTypesActions';
import { userActions } from '../../../redux/actions/userActions';
import { modalActions } from '../../common/Modal/ModalActions';

import ClusterList from './ClusterList';

const mapDispatchToProps = {
  getCloudProviders: cloudProviderActions.getCloudProviders,
  getMachineTypes: machineTypesActions.getMachineTypes,
  getOrganizationAndQuota: userActions.getOrganizationAndQuota,
  openModal: modalActions.openModal,
  closeModal: modalActions.closeModal,
  clearGlobalError,
};

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
