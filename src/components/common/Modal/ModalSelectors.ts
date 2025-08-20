import { GlobalState } from '~/redux/stateTypes';

const shouldShowModal = (state: GlobalState, id: string) => state.modal.modalName === id;

export default shouldShowModal;
