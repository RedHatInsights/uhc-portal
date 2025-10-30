import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

import { onSetTotal } from '~/redux/actions/viewOptionsActions';

/**
 * Custom hook to set the total count in Redux after data has been filtered.
 * Uses a ref to prevent infinite loops by only dispatching when the count actually changes.
 *
 * @param filteredData - The filtered data array
 * @param isLoading - Whether the data is currently loading
 * @param totalCount - The current total count from Redux
 * @param viewType - The view type constant (e.g., ACCESS_REQUESTS_VIEW)
 */
export const useSetFilteredTotal = <T>(
  filteredData: T[] | undefined,
  isLoading: boolean,
  totalCount: number,
  viewType: string,
): void => {
  const dispatch = useDispatch();
  const previousCountRef = useRef<number | undefined>();

  useEffect(() => {
    const currentCount = filteredData?.length ?? 0;

    // Only dispatch if:
    // 1. Not loading
    // 2. Count is different from what we last set
    // 3. Count is different from Redux
    if (!isLoading && currentCount !== previousCountRef.current && currentCount !== totalCount) {
      previousCountRef.current = currentCount;
      dispatch(onSetTotal(currentCount, viewType));
    }
  }, [isLoading, filteredData?.length, totalCount, dispatch, viewType]);
};
