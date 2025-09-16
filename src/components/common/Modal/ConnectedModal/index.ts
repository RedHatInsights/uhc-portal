import React from 'react';
import { connect } from 'react-redux';

import { GlobalState } from '~/redux/stateTypes';

import shouldShowModal from '../ModalSelectors';

import ConnectedModal from './ConnectedModal';

const mapStateToProps = (
  state: GlobalState,
  ownProps: React.ComponentProps<typeof ConnectedModal>,
) => ({
  isOpen: shouldShowModal(state, ownProps.ModalComponent.modalName),
});

export default connect(mapStateToProps)(ConnectedModal);
