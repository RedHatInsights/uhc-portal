import { useDispatch, useSelector } from 'react-redux';
import { AnyAction, Dispatch } from 'redux';

import { clusterService } from '../../services';
import techPreviewActions from '../actions/techPreviewActions';
import { GlobalState } from '../state';

export const techPreviewStatusSelector = (state: GlobalState, product: string, type: string) =>
  state.clusters.techPreview[product] && state.clusters.techPreview[product][type];

export const useTechPreviewStatus = (product: string, type: string) =>
  useSelector((state: GlobalState) => techPreviewStatusSelector(state, product, type));

export const dispatchTechPreviewStatus = async (
  dispatch: Dispatch<AnyAction>,
  product: string,
  type: string,
) => {
  dispatch(techPreviewActions.getTechPreviewStatusPending(product, type));
  return clusterService
    .getTechPreviewStatus(product, type)
    .then((response) =>
      dispatch(techPreviewActions.getTechPreviewStatusFulfilled(product, type, response.data)),
    )
    .catch((error) => dispatch(techPreviewActions.getTechPreviewStatusError(product, type)));
};

export const useGetTechPreviewStatus = (product: string, type: string) => {
  const dispatch = useDispatch();
  return () => dispatchTechPreviewStatus(dispatch, product, type);
};
