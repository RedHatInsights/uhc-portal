import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { GlobalState } from '~/redux/state';

import { createRosaEntitlement } from '../../../redux/actions/tokensActions';

import EntitlementConfig from './EntitlementConfig';

const mapStateToProps = (state: GlobalState) => ({
  fulfilled: state.entitlementConfig.fulfilled,
  pending: state.entitlementConfig.pending,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  createRosaEntitlement: () => dispatch(createRosaEntitlement()),
});

export default connect(mapStateToProps, mapDispatchToProps)(EntitlementConfig);
