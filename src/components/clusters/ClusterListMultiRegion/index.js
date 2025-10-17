import { connect } from 'react-redux';

import { cloudProviderActions } from '../../../redux/actions/cloudProviderActions';
import { clearGlobalError } from '../../../redux/actions/globalErrorActions';
import { machineTypesActions } from '../../../redux/actions/machineTypesActions';
import { userActions } from '../../../redux/actions/userActions';
import { modalActions } from '../../common/Modal/ModalActions';

import ClusterList from './ClusterList';
import ClusterListTab from './ClusterListTab';

const mapDispatchToProps = {
  getCloudProviders: cloudProviderActions.getCloudProviders,
  getMachineTypes: machineTypesActions.getMachineTypes,
  getOrganizationAndQuota: userActions.getOrganizationAndQuota,
  openModal: modalActions.openModal,
  closeModal: modalActions.closeModal,
  clearGlobalError,
};

const mapStateToProps = (state) => ({
  cloudProviders: state.cloudProviders,
  machineTypes: state.machineTypes,
  organization: state.userProfile.organization,
});

export default connect(mapStateToProps, mapDispatchToProps)(ClusterList);
export const ListTab = connect(mapStateToProps, mapDispatchToProps)(ClusterListTab);
