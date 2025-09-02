import { GlobalState } from '~/redux/stateTypes';

import reducer from '../ModalReducer';
import shouldShowModal from '../ModalSelectors';

describe('Modal Selector', () => {
  it('should return true if modal name matches', () => {
    const activeModalState = {
      modal: { modalName: 'test-modal', data: {} },
    } as unknown as GlobalState;
    const result = shouldShowModal(activeModalState, 'test-modal');
    expect(result).toBeTruthy();
  });

  it('should return false if modal name does not matches', () => {
    const state = { modal: reducer.initialState } as unknown as GlobalState;
    const result = shouldShowModal(state, 'test-modal');
    expect(result).toBeFalsy();
  });
});
