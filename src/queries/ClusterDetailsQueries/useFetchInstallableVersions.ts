import { useQuery } from '@tanstack/react-query';
import { clusterService } from '~/services';
import { formatErrorData } from '../helpers';

type InstallableVersionsProps = {
  isRosa?: boolean;
  isMarketplaceGcp?: boolean;
  isWIF?: boolean;
  isHCP?: boolean;
  includeUnstableVersions?: boolean;
  canEdit?: boolean;
};

export const useFetchInstallableVersions = ({
  isRosa = false,
  isMarketplaceGcp = false,
  isWIF = false,
  isHCP = false,
  includeUnstableVersions = false,
  canEdit = false,
}: InstallableVersionsProps) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['useFecthInstallableVersions'],
    queryFn: async () => {
      const params = {
        isRosa,
        isMarketplaceGcp,
        isWIF,
        isHCP,
        includeUnstableVersions,
      };
      const response = await clusterService.getInstallableVersions(params);
      return response;
    },
    enabled: canEdit,
  });

  return {
    data: data?.data,
    isLoading,
    isError,
    error: formatErrorData(isLoading, isError, error),
  };
};
