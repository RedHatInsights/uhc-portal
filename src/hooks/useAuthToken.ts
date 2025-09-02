import React from 'react';
import { useDispatch } from 'react-redux';

import { tollboothActions } from '~/redux/actions';
import { useGlobalState } from '~/redux/hooks';

const useAuthToken = () => {
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(tollboothActions.createAuthToken());

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const token = useGlobalState((state) => state.tollbooth.token);

  return token;
};

export default useAuthToken;
