import { connect } from 'react-redux';

import { GlobalState } from '~/redux/state';

import { subscriptionsActions } from '../../../redux/actions/subscriptionsActions';

import OSDSubscriptionCard from './OSDSubscriptionCard';

const mapDispatchToProps = {
  fetchQuotaCost: (organizationID: string) => subscriptionsActions.fetchQuotaCost(organizationID),
};

const mapStateToProps = (state: GlobalState) => ({
  quotaCost: state.subscriptions.quotaCost,
});

export default connect(mapStateToProps, mapDispatchToProps)(OSDSubscriptionCard);
