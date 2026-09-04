import * as React from 'react';
import { useDispatch } from 'react-redux';

import { getOrganizationAndQuota } from '~/redux/actions/userActions';
import { useGlobalState } from '~/redux/hooks';

const useOrganization = () => {
  const dispatch = useDispatch();
  React.useEffect(() => {
    dispatch(getOrganizationAndQuota() as any);
  }, [dispatch]);

  return useGlobalState((state) => state.userProfile.organization);
};

export default useOrganization;
