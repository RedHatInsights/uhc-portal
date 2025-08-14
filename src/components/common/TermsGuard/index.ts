import { connect } from 'react-redux';

import { GlobalState } from '~/redux/state';

import { selfTermsReview } from '../../../redux/actions/userActions';

import TermsGuard from './TermsGuard';

const mapStateToProps = (state: GlobalState) => ({
  selfTermsReviewResult: state.userProfile.selfTermsReviewResult,
});

const mapDispatchToProps = {
  selfTermsReview,
};

export default connect(mapStateToProps, mapDispatchToProps)(TermsGuard);
