import { GlobalState } from '~/redux/state';

const shouldShowModal = (state: GlobalState, id: string) => state.modal.modalName === id;

export default shouldShowModal;
