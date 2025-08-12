import { connect } from 'react-redux';

import { GlobalState } from '~/redux/state';

import { clustersActions } from '../../redux/actions/clustersActions';
import { subscriptionsActions } from '../../redux/actions/subscriptionsActions';

import Quota from './Quota';

const mapDispatchToProps = {
  fetchAccount: subscriptionsActions.fetchAccount,
  invalidateClusters: clustersActions.invalidateClusters,
};

const mapStateToProps = (state: GlobalState) => ({
  account: state.subscriptions.account,
});

export default connect(mapStateToProps, mapDispatchToProps)(Quota);
