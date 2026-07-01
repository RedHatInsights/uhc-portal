import React from 'react';
import { useField } from 'formik';
import { shallowEqual } from 'react-redux';

import { clusterBillingModelToRelatedResource } from '~/components/clusters/common/billingModelMapper';
import { availableQuota } from '~/components/clusters/common/quotaSelectors';
import { useFormState } from '~/components/clusters/wizards/hooks';
import { useFetchDefaultFlavour } from '~/queries/ClusterDetailsQueries/MachinePoolTab/MachineTypes/useFetchDefaultFlavour';
import { MachineTypesResponse } from '~/queries/types';
import { useGlobalState } from '~/redux/hooks';
import { RelatedResourceBilling_model as RelatedResourceBillingModel } from '~/types/accounts_mgmt.v1';
import { BillingModel, CloudProvider } from '~/types/clusters_mgmt.v1';
import { ErrorState } from '~/types/types';

import { QuotaTypes } from '../quotaModel';

import type { MachineTypeSelectionRenderProps } from './MachineTypeSelection/MachineTypeSelection';
import {
  defaultComputeInstanceTypeFromFlavour,
  machineTypeFullLabel,
  shouldUseRegionFilteredData,
} from './MachineTypeSelection/machineTypeSelectionHelper';
import sortMachineTypes from './MachineTypeSelection/sortMachineTypes';

/** Stable empty payload when region response is absent (avoids new `typesByID` refs each render). */
const EMPTY_MACHINE_TYPES_RESPONSE: MachineTypesResponse = { types: {}, typesByID: {} };

export type UseMachineTypeSelectionInput = {
  fieldId: string;
  machineTypesResponse: MachineTypesResponse;
  machineTypesErrorResponse?: Pick<ErrorState, 'errorDetails' | 'errorMessage' | 'operationID'>;
  machineTypesByRegionResponse?: MachineTypesResponse;
  machineTypesByRegionErrorResponse?: Pick<
    ErrorState,
    'errorDetails' | 'errorMessage' | 'operationID'
  >;
  machineTypesByRegionPending?: boolean;
  isMultiAz?: boolean;
  isBYOC?: boolean;
  isMachinePool?: boolean;
  cloudProviderID: CloudProvider['id'];
  productId: string;
  billingModel: BillingModel;
  allExpanded?: boolean;
  inModal?: boolean;
};

export function useMachineTypeSelection({
  fieldId,
  machineTypesResponse,
  machineTypesErrorResponse,
  isMultiAz,
  isBYOC,
  isMachinePool,
  inModal,
  cloudProviderID,
  productId,
  billingModel,
  allExpanded = true,
  machineTypesByRegionResponse,
  machineTypesByRegionErrorResponse,
  machineTypesByRegionPending = false,
}: UseMachineTypeSelectionInput): MachineTypeSelectionRenderProps {
  const {
    values: { [fieldId]: selectedInstanceType },
  } = useFormState();

  const defaultFlavourResponse = useFetchDefaultFlavour();

  const { organization, quota } = useGlobalState(
    (state) => ({
      organization: state.userProfile.organization,
      quota: state.userProfile.organization.quotaList,
    }),
    shallowEqual,
  );

  const regionTypesPayload: MachineTypesResponse =
    machineTypesByRegionResponse ?? EMPTY_MACHINE_TYPES_RESPONSE;

  const regionDataFulfilled =
    Boolean(machineTypesByRegionResponse) &&
    !machineTypesByRegionPending &&
    !machineTypesByRegionErrorResponse;

  const regionDataErrored = Boolean(machineTypesByRegionErrorResponse);

  const previousSelectionFromUnfilteredSet =
    regionDataFulfilled &&
    !regionTypesPayload.typesByID?.[selectedInstanceType?.id]?.id &&
    machineTypesResponse?.typesByID?.[selectedInstanceType?.id]?.id;

  const isDataReady =
    organization.fulfilled &&
    machineTypesResponse &&
    (defaultFlavourResponse.isSuccess || defaultFlavourResponse.isError);

  const isRegionSpecificDataReady = regionDataFulfilled || (regionDataErrored && isDataReady);

  const useRegionFilteredData = shouldUseRegionFilteredData(
    productId,
    cloudProviderID,
    isBYOC,
    inModal,
  );

  const [isMachineTypeFilteredByRegion, setIsMachineTypeFilteredByRegion] = React.useState(
    !previousSelectionFromUnfilteredSet,
  );

  const useMachineTypesByRegion =
    isRegionSpecificDataReady && useRegionFilteredData && isMachineTypeFilteredByRegion;

  const activeMachineTypes: MachineTypesResponse = useMachineTypesByRegion
    ? regionTypesPayload
    : machineTypesResponse;

  const activeMachineTypesHasError = useMachineTypesByRegion
    ? regionDataErrored
    : Boolean(machineTypesErrorResponse);

  const activeMachineTypesError = useMachineTypesByRegion
    ? machineTypesByRegionErrorResponse
    : machineTypesErrorResponse;

  const regionFilterForAvailability: MachineTypesResponse = regionTypesPayload;

  const [
    _field,
    { value: instanceType, touched, error: instanceTypeError },
    { setValue: setFieldValue },
  ] = useField({
    name: fieldId,
    validate: (value) => {
      if (!isDataReady || (useRegionFilteredData && machineTypesByRegionPending)) {
        return 'Data is not ready';
      }
      if (activeMachineTypesHasError) {
        return 'An error occurred during machine-types request';
      }
      if (!value) {
        return 'No value available';
      }
      return undefined;
    },
  });

  const isTypeAvailable = React.useCallback(
    (machineTypeID: string) => {
      if (
        !isDataReady ||
        (useRegionFilteredData && !isRegionSpecificDataReady) ||
        !activeMachineTypes.typesByID
      ) {
        return false;
      }

      const machineType = activeMachineTypes?.typesByID[machineTypeID];
      if (!machineType) {
        return false;
      }
      const resourceName = machineType.generic_name;

      if (!isBYOC && machineType.ccs_only) {
        return false;
      }

      const quotaParams = {
        product: productId,
        cloudProviderID,
        isBYOC,
        isMultiAz,
        resourceName,
        billingModel:
          clusterBillingModelToRelatedResource(billingModel) ??
          RelatedResourceBillingModel.standard,
      };

      const clustersAvailable = availableQuota(quota, {
        ...quotaParams,
        resourceType: QuotaTypes.CLUSTER,
      });
      const nodesAvailable = availableQuota(quota, {
        ...quotaParams,
        resourceType: QuotaTypes.NODE,
      });

      if (isMachinePool) {
        // TODO: backend does allow creating machine pool with 0 nodes!
        // But in most cases you want a machine type you do have quota for,
        // and if we allow >= 0, the highlight of available types becomes useless.
        // Can we improve the experience without blocking 0-node pool creation?
        return nodesAvailable >= 1;
      }

      if (isBYOC) {
        const minimumNodes = isMultiAz ? 3 : 2;
        return clustersAvailable > 0 && nodesAvailable >= minimumNodes;
      }

      return clustersAvailable >= 1;
    },
    [
      activeMachineTypes?.typesByID,
      billingModel,
      cloudProviderID,
      isBYOC,
      isDataReady,
      isRegionSpecificDataReady,
      useRegionFilteredData,
      isMachinePool,
      isMultiAz,
      productId,
      quota,
    ],
  );

  const setDefaultValue = React.useCallback(() => {
    const defaultTypeId = defaultComputeInstanceTypeFromFlavour(
      defaultFlavourResponse.data,
      cloudProviderID,
    );

    if (defaultTypeId && isTypeAvailable(defaultTypeId)) {
      const defaultMachineType = activeMachineTypes?.typesByID?.[defaultTypeId];
      setFieldValue(defaultMachineType);
    }
  }, [
    cloudProviderID,
    defaultFlavourResponse.data,
    isTypeAvailable,
    setFieldValue,
    activeMachineTypes?.typesByID,
  ]);

  const setInvalidValue = React.useCallback(() => {
    setFieldValue(null);
  }, [setFieldValue]);

  React.useEffect(() => {
    if (
      isDataReady &&
      (!useRegionFilteredData || isRegionSpecificDataReady) &&
      activeMachineTypes.typesByID
    ) {
      if (!instanceType) {
        setDefaultValue();
      }

      if (instanceType && !isTypeAvailable(instanceType?.id)) {
        setInvalidValue();
      }
    }
  }, [
    instanceType,
    isDataReady,
    activeMachineTypes?.typesByID,
    useRegionFilteredData,
    isRegionSpecificDataReady,
    isTypeAvailable,
    setDefaultValue,
    setInvalidValue,
  ]);

  const sortedMachineTypes = React.useMemo(
    () => sortMachineTypes(activeMachineTypes, cloudProviderID),
    [cloudProviderID, activeMachineTypes],
  );

  const filteredMachineTypes = React.useMemo(
    () => sortedMachineTypes.filter((type) => isTypeAvailable(type.id)),
    [isTypeAvailable, sortedMachineTypes],
  );

  const selectionText = React.useMemo(
    () => machineTypeFullLabel(instanceType || null),
    [instanceType],
  );

  const onSelectMachineType = React.useCallback(
    (machineTypeId: string) => {
      setFieldValue(filteredMachineTypes.find((machineType) => machineType.id === machineTypeId));
    },
    [filteredMachineTypes, setFieldValue],
  );

  const setTreeViewSwitchActive = React.useCallback<React.Dispatch<React.SetStateAction<boolean>>>(
    (switchValue) => {
      setIsMachineTypeFilteredByRegion((prevFiltered) =>
        typeof switchValue === 'function' ? !switchValue(!prevFiltered) : !switchValue,
      );
    },
    [],
  );

  if (
    isDataReady &&
    (!useRegionFilteredData || isRegionSpecificDataReady) &&
    !activeMachineTypesHasError
  ) {
    if (filteredMachineTypes.length === 0) {
      return { phase: 'noTypes' };
    }

    return {
      phase: 'form',
      filteredMachineTypes,
      regionFilterForAvailability,
      selectedInstanceTypeId: instanceType?.id,
      selectionText,
      onSelectMachineType,
      treeViewSwitchActive: !isMachineTypeFilteredByRegion,
      setTreeViewSwitchActive,
      useRegionFilteredData,
      touched,
      instanceTypeError,
      allExpanded,
    };
  }

  if (activeMachineTypesHasError) {
    return {
      phase: 'error',
      activeMachineTypesError: activeMachineTypesError ?? {},
    };
  }

  return { phase: 'loading' };
}
