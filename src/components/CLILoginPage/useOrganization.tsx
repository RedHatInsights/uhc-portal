import React from 'react';
import { AxiosError } from 'axios';

import accountsService from '~/services/accountsService';
import { Organization } from '~/types/accounts_mgmt.v1';

const useOrganization = () => {
  const [organization, setOrganization] = React.useState<Organization | undefined>();
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<unknown>();

  const manageFetchOrganization = async () => {
    setError(undefined);
    setIsLoading(true);
    let organization;
    try {
      const currentAccount = await accountsService.getCurrentAccount();
      if (currentAccount.data.organization?.id) {
        organization = await accountsService.getOrganization(currentAccount.data.organization.id);
        setOrganization(organization.data);
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      setError(axiosError?.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    manageFetchOrganization();
  }, []);

  return { organization, isLoading, error };
};

export default useOrganization;
