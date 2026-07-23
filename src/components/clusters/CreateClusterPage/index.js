import { connect } from 'react-redux';

import { normalizedProducts } from '../../../common/subscriptionTypes';
import { tollboothActions } from '../../../redux/actions';
import { getOrganizationAndQuota } from '../../../redux/actions/userActions';
import { modalActions } from '../../common/Modal/ModalActions';
import { QuotaTypes } from '../common/quotaModel';
import { availableQuota } from '../common/quotaSelectors';

import CreateClusterPage from './CreateClusterPage';

const mapStateToProps = (state) => ({
  hasOSDTrialQuota:
    availableQuota(state.userProfile.organization.quotaList, {
      product: normalizedProducts.OSDTrial,
      resourceType: QuotaTypes.CLUSTER,
    }) >= 1,
  organization: state.userProfile.organization,
  token: state.tollbooth.token,
});

const mapDispatchToProps = () => (dispatch) => ({
  openModal: () => dispatch(modalActions.openModal),
  getAuthToken: () => dispatch(tollboothActions.createAuthToken()),
  getOrganizationAndQuota: () => dispatch(getOrganizationAndQuota()),
});

export default connect(mapStateToProps, mapDispatchToProps)(CreateClusterPage);
