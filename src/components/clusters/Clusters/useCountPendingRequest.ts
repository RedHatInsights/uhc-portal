import { useMemo } from 'react';

import useOrganization from '~/components/CLILoginPage/useOrganization';
import { useGetAccessProtection } from '~/queries/AccessRequest/useGetAccessProtection';
import { useGetOrganizationalPendingRequests } from '~/queries/AccessRequest/useGetOrganizationalPendingRequests';
import { useFetchClusterTransferDetail } from '~/queries/ClusterDetailsQueries/ClusterTransferOwnership/useFetchClusterTransferDetails';
import { useGlobalState } from '~/redux/hooks';
import { isRestrictedEnv } from '~/restrictedEnv';
import { ClusterTransferStatus } from '~/types/accounts_mgmt.v1';

export const useCountPendingRequest = (): number => {
  const username = useGlobalState((state) => state.userProfile.keycloakProfile.username);

  const { data: transferData } = useFetchClusterTransferDetail({ username });
  const totalPendingTransfers = useMemo(
    () =>
      transferData?.items?.filter(
        (transfer) =>
          transfer.status?.toLowerCase() === ClusterTransferStatus.Pending.toLowerCase(),
      ).length || 0,
    [transferData],
  );

  const { organization } = useOrganization();
  const { enabled: isOrganizationAccessProtectionEnabled } = useGetAccessProtection(
    {
      organizationId: organization?.id,
    },
    isRestrictedEnv(),
  );

  const { total } = useGetOrganizationalPendingRequests(
    organization?.id || '',
    isOrganizationAccessProtectionEnabled || false,
  );

  const pendingAccessRequests = total ?? 0;

  return totalPendingTransfers + pendingAccessRequests;
};
