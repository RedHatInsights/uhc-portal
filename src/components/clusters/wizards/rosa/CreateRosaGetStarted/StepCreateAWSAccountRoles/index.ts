import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { setOfflineToken } from '~/redux/actions/rosaActions';
import { GlobalState } from '~/redux/stateTypes';

import StepCreateAWSAccountRoles from './StepCreateAWSAccountRoles';

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setOfflineToken: (token: string) => dispatch(setOfflineToken(token)),
});

const mapStateToProps = (state: GlobalState) => {
  const { offlineToken } = state.rosaReducer;

  return {
    offlineToken,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(StepCreateAWSAccountRoles);
