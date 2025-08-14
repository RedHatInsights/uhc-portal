import { connect } from 'react-redux';

import { GlobalState } from '~/redux/state';

import ApiError from './ApiError';
import { apiErrorActions } from './ApiErrorActions';

const mapStateToProps = (state: GlobalState) => ({
  apiError: state.apiError,
});

const mapDispatchToProps = {
  showApiError: apiErrorActions.showApiError,
  clearApiError: apiErrorActions.clearApiError,
};

export default connect(mapStateToProps, mapDispatchToProps)(ApiError);
