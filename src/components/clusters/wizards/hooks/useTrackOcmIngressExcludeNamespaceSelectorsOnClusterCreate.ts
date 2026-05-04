import { useEffect, useRef } from 'react';
import { FormikValues } from 'formik';

import { ocmResourceTypeByProduct, trackEvents } from '~/common/analytics';
import { hasConfiguredExcludeNamespaceSelectors } from '~/components/clusters/wizards/common/excludeNamespaceSelectorsForm';
import { FieldId } from '~/components/clusters/wizards/osd/constants';
import useAnalytics from '~/hooks/useAnalytics';
import { useGlobalState } from '~/redux/hooks/useGlobalState';

/**
 * Fires `OcmIngressExcludeNamespaceSelectorsSet` after cluster create succeeds, when the form
 * included exclude-namespace selectors. This is intentionally not in `DefaultIngressFields`:
 * that component only knows about editing — not whether the create API succeeded. Contrast with
 * `DnsZoneSelected`, which tracks a control interaction at selection time.
 */
export function useTrackOcmIngressExcludeNamespaceSelectorsOnClusterCreate(
  values: FormikValues,
  product: string,
): void {
  const track = useAnalytics();
  const createClusterResponse = useGlobalState((state) => state.clusters.createdCluster);
  const trackedRef = useRef(false);

  const hasConfigured = hasConfiguredExcludeNamespaceSelectors(
    values[FieldId.DefaultRouterExcludeNamespaceSelectors],
  );

  useEffect(() => {
    if (!createClusterResponse.fulfilled || trackedRef.current) {
      return;
    }
    if (!hasConfigured) {
      return;
    }
    track(trackEvents.OcmIngressExcludeNamespaceSelectorsSet, {
      resourceType: (ocmResourceTypeByProduct as Record<string, string>)[product],
      customProperties: { cluster_creation: true },
    });
    trackedRef.current = true;
  }, [createClusterResponse.fulfilled, hasConfigured, track, product]);
}
