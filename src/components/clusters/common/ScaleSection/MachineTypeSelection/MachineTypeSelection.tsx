// MachineTypeSelection renders a series of radio buttons for all available node types,
// allowing the user to select just one.

import React from 'react';
import { useField } from 'formik';
import { shallowEqual, useDispatch } from 'react-redux';

import {
  Alert,
  AlertVariant,
  FormGroup,
  HelperText,
  HelperTextItem,
  Icon,
  Spinner,
} from '@patternfly/react-core';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';

import { noMachineTypes } from '~/common/helpers';
import { normalizedProducts } from '~/common/subscriptionTypes';
import { constants } from '~/components/clusters/common/CreateOSDFormConstants';
import { availableQuota } from '~/components/clusters/common/quotaSelectors';
import { CloudProviderType } from '~/components/clusters/wizards/common/constants';
import ErrorBox from '~/components/common/ErrorBox';
import ExternalLink from '~/components/common/ExternalLink';
import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';
import PopoverHint from '~/components/common/PopoverHint';
import { MachineTypesResponse } from '~/queries/types';
import { DEFAULT_FLAVOUR_ID, getDefaultFlavour } from '~/redux/actions/flavourActions';
import { getMachineTypesByRegionARN } from '~/redux/actions/machineTypesActions';
import { useGlobalState } from '~/redux/hooks';
import { RelatedResourceBilling_model as RelatedResourceBillingModel } from '~/types/accounts_mgmt.v1';
import { BillingModel, CloudProvider, CloudVpc, MachineType } from '~/types/clusters_mgmt.v1';
import { ErrorState } from '~/types/types';

import { QuotaTypes } from '../../quotaModel';

import {
  TreeViewData,
  TreeViewSelect,
  TreeViewSelectMenuItem,
} from './TreeViewSelect/TreeViewSelect';
import {
  groupedMachineTypes,
  isMachineTypeIncludedInFilteredSet,
  machineTypeDescriptionLabel,
  machineTypeFullLabel,
  machineTypeLabel,
} from './machineTypeSelectionHelper';
import sortMachineTypes from './sortMachineTypes';

// Default selection scenarios:
// - First time, default is available => select it.
// - First time, default is not listed (due to quota or ccs_only) => leave placeholder ''.
// - Error fetching flavours (very unlikely) => no need to show error to user, leave placeholder.
// - User selected a type manually, then changed CSS or multiAz, choice still listed.
//   => keep it.
// - User selected a type manually, then changed CSS or multiAz, choice no longer listed.
//   => restore placeholder '' to force choice (even if have quota for default).
//   - componentDidUpdate running in this situation (e.g. onToggle) should not select default.
// - Something was selected (either automatically or manually), then changed cloud provider.
//   CloudProviderSelectionField does `change('machine_type', '')` => same as first time.
type MachineTypeSelectionProps = {
  fieldId: string;
  machineTypesResponse: MachineTypesResponse;
  machineTypesErrorResponse?: Pick<ErrorState, 'errorDetails' | 'errorMessage' | 'operationID'>;
  selectedVpc?: CloudVpc;
  region?: string;
  installerRoleArn?: string;
  isMultiAz?: boolean;
  isBYOC?: boolean;
  isMachinePool?: boolean;
  inModal?: boolean;
  cloudProviderID: CloudProvider['id'];
  productId: string;
  billingModel: BillingModel;
  allExpanded?: boolean;
};

const MachineTypeSelection = ({
  fieldId,
  machineTypesResponse,
  machineTypesErrorResponse,
  selectedVpc,
  region = '',
  installerRoleArn = '',
  isMultiAz,
  isBYOC,
  isMachinePool,
  inModal,
  cloudProviderID,
  productId,
  billingModel,
  allExpanded = true,
}: MachineTypeSelectionProps) => {
  const dispatch = useDispatch();

  const [
    _field,
    { value: instanceType, touched, error: instanceTypeError },
    { setValue: setFieldValue },
  ] = useField(fieldId);

  const { flavours, machineTypesByRegion, organization, quota } = useGlobalState(
    (state) => ({
      flavours: state.flavours,
      machineTypesByRegion: state.machineTypesByRegion,
      organization: state.userProfile.organization,
      quota: state.userProfile.organization.quotaList,
    }),
    shallowEqual,
  );

  // checks if previous selection was from unfiltered machine set. Will flip filter value.
  const previousSelectionFromUnfilteredSet =
    machineTypesByRegion.fulfilled &&
    !machineTypesByRegion?.typesByID[instanceType?.id]?.id &&
    machineTypesResponse?.typesByID?.[instanceType?.id]?.id;

  /** Checks whether required data arrived. */
  const isDataReady =
    organization.fulfilled &&
    machineTypesResponse &&
    // Tolerate flavours error gracefully.
    (flavours.fulfilled || flavours.error);

  const isRegionSpecificDataReady =
    machineTypesByRegion.fulfilled || (machineTypesByRegion.error && isDataReady);

  // use region data switch, wait for region data to be ready
  const useRegionFilteredData =
    (isBYOC || productId === normalizedProducts.ROSA) &&
    cloudProviderID === CloudProviderType.Aws &&
    !inModal;

  const [isMachineTypeFilteredByRegion, setIsMachineTypeFilteredByRegion] = React.useState(
    !previousSelectionFromUnfilteredSet,
  );

  const useMachineTypesByRegion =
    isRegionSpecificDataReady && useRegionFilteredData && isMachineTypeFilteredByRegion;
  const activeMachineTypes: MachineTypesResponse = useMachineTypesByRegion
    ? machineTypesByRegion
    : machineTypesResponse;
  const activeMachineTypesError = useMachineTypesByRegion
    ? machineTypesByRegion.error
    : machineTypesErrorResponse;

  /**
   * Checks whether type can be offered, based on quota and ccs_only.
   * Returns false if necessary data not fulfilled yet.
   */
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
        // availableQuota expects a RelatedResourceBillingModel, but checks for a 'marketplace' prefix too, so the availableQuota function should be changed.
        // link to comment on PR explainng this: https://github.com/RedHatInsights/uhc-portal/pull/224#discussion_r2055913698
        billingModel: billingModel as RelatedResourceBillingModel,
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
    const defaultTypeId = cloudProviderID
      ? flavours?.byID?.[DEFAULT_FLAVOUR_ID]?.[cloudProviderID]?.compute_instance_type
      : undefined;

    if (defaultTypeId && isTypeAvailable(defaultTypeId)) {
      const defaultMachineType = activeMachineTypes?.typesByID?.[defaultTypeId];
      setFieldValue(defaultMachineType);
    }
  }, [
    cloudProviderID,
    flavours?.byID,
    isTypeAvailable,
    setFieldValue,
    activeMachineTypes?.typesByID,
  ]);

  React.useEffect(() => {
    dispatch(getDefaultFlavour()); // This should be migrated to React Query instead of sorting it in Redux. See issue #OCMUI-3323
  }, [dispatch]);

  React.useEffect(() => {
    if (
      isDataReady &&
      (!useRegionFilteredData || isRegionSpecificDataReady) &&
      activeMachineTypes.typesByID &&
      !instanceType
    ) {
      setDefaultValue();
    }
  }, [
    instanceType,
    isDataReady,
    activeMachineTypes?.typesByID,
    useRegionFilteredData,
    isRegionSpecificDataReady,
    isTypeAvailable,
    setDefaultValue,
  ]);

  const sortedMachineTypes = React.useMemo(
    () => sortMachineTypes(activeMachineTypes, cloudProviderID),
    [cloudProviderID, activeMachineTypes],
  );

  const filteredMachineTypes = React.useMemo(
    () => sortedMachineTypes.filter((type) => isTypeAvailable(type.id)),
    [isTypeAvailable, sortedMachineTypes],
  );

  React.useEffect(() => {
    if (!installerRoleArn || !region) {
      return;
    }
    const AZs = [
      ...new Set(
        selectedVpc?.aws_subnets?.map((el) => el.availability_zone ?? '')?.filter(Boolean),
      ),
    ];
    dispatch(getMachineTypesByRegionARN(installerRoleArn, region, [...AZs]));
  }, [dispatch, selectedVpc, installerRoleArn, region]);

  const machineTypeUnavailableWarning =
    'OCM does not have access to all AWS account details. Machine node type cannot be verified to be accessible for this AWS user.';
  const possiblyUnavailableWarnIcon = React.useMemo(
    () => (
      <Icon status="warning" size="md">
        <ExclamationTriangleIcon />
      </Icon>
    ),
    [],
  );

  const machineTypeMap: TreeViewData[] = React.useMemo(
    () =>
      Object.entries(groupedMachineTypes(filteredMachineTypes))
        .filter(([_label, categoryMachines]) => categoryMachines.length)
        .map(([categoryLabel, categoryMachines]) => ({
          name: categoryLabel,
          category: categoryLabel,
          children: categoryMachines.map((machineType: MachineType) => {
            const possiblyUnavailable =
              useRegionFilteredData &&
              !isMachineTypeFilteredByRegion &&
              !isMachineTypeIncludedInFilteredSet(machineType.id, machineTypesByRegion);
            return {
              name: (
                <TreeViewSelectMenuItem
                  name={machineTypeLabel(machineType)}
                  description={machineTypeDescriptionLabel(machineType)}
                  popoverText={possiblyUnavailable ? machineTypeUnavailableWarning : ''}
                  icon={possiblyUnavailable && possiblyUnavailableWarnIcon}
                />
              ),
              category: categoryLabel,
              nameLabel: machineTypeLabel(machineType),
              descriptionLabel: machineTypeDescriptionLabel(machineType),
              id: machineType.id,
            };
          }),
        })),
    [
      filteredMachineTypes,
      isMachineTypeFilteredByRegion,
      machineTypesByRegion,
      useRegionFilteredData,
      possiblyUnavailableWarnIcon,
    ],
  );

  const findSelectedTreeViewItem = (machineID: string) => {
    let selectedTreeViewNode;
    machineTypeMap.forEach((category) => {
      category.children?.forEach((machineType) => {
        if (machineType.id === machineID) selectedTreeViewNode = machineType;
      });
    });
    return selectedTreeViewNode;
  };

  // In the dropdown we put the machine type id in separate description row,
  // but the Select toggle doesn't support that, so combine both into one label.
  const selectionText = React.useMemo(
    () => machineTypeFullLabel(instanceType || null),
    [instanceType],
  );

  if (
    isDataReady &&
    (!useRegionFilteredData || isRegionSpecificDataReady) &&
    !activeMachineTypesError
  ) {
    if (filteredMachineTypes.length === 0) {
      return (
        <Alert variant={AlertVariant.danger} isInline title={noMachineTypes} role="alert">
          <ExternalLink href="https://cloud.redhat.com/products/dedicated/contact/">
            Contact sales to purchase additional quota.
          </ExternalLink>
        </Alert>
      );
    }

    const currentSelectionPossiblyUnavailable =
      useRegionFilteredData &&
      instanceType &&
      !isMachineTypeIncludedInFilteredSet(instanceType?.id, machineTypesByRegion);
    return (
      <FormGroup
        label="Compute node instance type"
        isRequired
        labelHelp={<PopoverHint hint={constants.computeNodeInstanceTypeHint} />}
      >
        <TreeViewSelect
          treeViewSelectionMap={machineTypeMap}
          // findSelectedTreeViewItem is used to find the selected item in the tree view (as a TreeViewData object).
          selected={findSelectedTreeViewItem(instanceType?.id)}
          selectionPlaceholderText={selectionText}
          setSelected={(_event, selection) =>
            setFieldValue(
              filteredMachineTypes.find((machineType) => machineType.id === selection.id),
            )
          }
          menuToggleBadge={currentSelectionPossiblyUnavailable && possiblyUnavailableWarnIcon}
          treeViewSwitchActive={!isMachineTypeFilteredByRegion}
          setTreeViewSwitchActive={(switchValue) => setIsMachineTypeFilteredByRegion(!switchValue)}
          helperText={
            currentSelectionPossiblyUnavailable && (
              <HelperText>
                <HelperTextItem variant="warning">{machineTypeUnavailableWarning}</HelperTextItem>
              </HelperText>
            )
          }
          placeholder="Select instance type"
          searchPlaceholder="Find an instance size"
          includeFilterSwitch={useRegionFilteredData}
          switchLabelOnText="Include types that might be unavailable to your account or region"
          allExpanded={allExpanded}
          ariaLabel="Machine type select"
        />
        <FormGroupHelperText touched={touched} error={instanceTypeError} />
      </FormGroup>
    );
  }

  return activeMachineTypesError ? (
    <ErrorBox message="Error loading node types" response={activeMachineTypesError} />
  ) : (
    <>
      <div className="spinner-fit-container">
        <Spinner size="md" aria-label="Loading..." />
      </div>
      <div className="spinner-loading-text">Loading node types...</div>
    </>
  );
};

export { MachineTypeSelection, MachineTypeSelectionProps };
