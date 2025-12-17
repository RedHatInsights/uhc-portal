// MachineTypeSelection renders a series of radio buttons for all available node types,
// allowing the user to select just one.

import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

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
import { humanizeValueWithUnit } from '~/common/units';
import { constants } from '~/components/clusters/common/CreateOSDFormConstants';
import { availableQuota } from '~/components/clusters/common/quotaSelectors';
import { CloudProviderType } from '~/components/clusters/wizards/common/constants';
import { useFormState } from '~/components/clusters/wizards/hooks';
import ErrorBox from '~/components/common/ErrorBox';
import ExternalLink from '~/components/common/ExternalLink';
import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';
import PopoverHint from '~/components/common/PopoverHint';
import { DEFAULT_FLAVOUR_ID } from '~/redux/actions/flavourActions';
import { getMachineTypesByRegionARN } from '~/redux/actions/machineTypesActions';

import { QuotaTypes } from '../../quotaModel';
import sortMachineTypes, {
  machineCategories,
} from '../../ScaleSection/MachineTypeSelection/sortMachineTypes';
// import { TreeViewSelect, TreeViewSelectMenuItem } from './TreeViewSelect/TreeViewSelect';
import {
  TreeViewSelect,
  TreeViewSelectMenuItem,
} from '../../ScaleSection/MachineTypeSelection/TreeViewSelect/TreeViewSelect';

/** Returns useful info about the machine type - CPUs, RAM, [GPUs]. */
const machineTypeDescriptionLabel = (machineType) => {
  if (!machineType) {
    return '';
  }
  const humanizedMemory = humanizeValueWithUnit(machineType.memory.value, machineType.memory.unit);
  let label = `${machineType.cpu.value} ${machineType.cpu.unit} ${humanizedMemory.value} ${humanizedMemory.unit} RAM`;
  if (machineType.category === 'accelerated_computing') {
    const numGPUsStr = machineType.name.match(/\d+ GPU[s]?/g);
    if (numGPUsStr) {
      label += ` (${numGPUsStr})`;
    }
  }
  return label;
};

/** Returns exact id used by cloud provider. */
const machineTypeLabel = (machineType) => {
  if (!machineType) {
    return '';
  }
  return machineType.id;
};

/** Returns useful info plus exact id used by the cloud provider. */
const machineTypeFullLabel = (machineType) => {
  if (!machineType) {
    return '';
  }
  return `${machineTypeLabel(machineType)} - ${machineTypeDescriptionLabel(machineType)}`;
};

/**
 * Partitions machine types by categories. Keeps relative order within each category.
 * @param machines - Array of machine_types API items.
 * @returns Array of [categoryLabel, categoryMachines] pairs.
 *   Some may contain 0 machines.
 */
const groupedMachineTypes = (machines) => {
  const machineGroups = [];
  const byCategoryName = {};
  machineCategories.forEach(({ name, label }) => {
    const categoryMachines = [];
    byCategoryName[name] = categoryMachines;
    machineGroups.push([label, categoryMachines]);
  });

  machines.forEach((machineType) => {
    if (byCategoryName[machineType.category]) {
      byCategoryName[machineType.category].push(machineType);
    }
  });

  return machineGroups;
};

export const isMachineTypeIncludedInFilteredSet = (machineTypeID, filteredMachineTypes) =>
  !!filteredMachineTypes?.typesByID?.[machineTypeID];

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

const MachineTypeSelection = ({
  machine_type: machineType,
  machine_type_force_choice: machineTypeForceChoice,
  selectedVpc,
  getDefaultFlavour,
  flavours,
  machineTypes,
  region,
  installerRoleArn,
  machineTypesByRegion,
  isMultiAz,
  isBYOC,
  isMachinePool,
  inModal = false,
  cloudProviderID,
  product,
  billingModel,
  quota,
  organization,
  menuAppendTo,
  allExpanded = true,
}) => {
  const {
    input,
    meta: { error, touched },
  } = machineType;
  const { input: forceChoiceInput } = machineTypeForceChoice;
  const { setFieldValue } = useFormState();

  const dispatch = useDispatch();
  // checks if previous selection was from unfiltered machine set. Will flip filter value.
  const previousSelectionFromUnfilteredSet =
    machineTypesByRegion.fulfilled &&
    !machineTypesByRegion?.typesByID[machineType.input.value]?.id &&
    machineTypes?.typesByID[machineType.input.value]?.id;

  /** Checks whether required data arrived. */
  const isDataReady =
    organization.fulfilled &&
    machineTypes.fulfilled &&
    // Tolerate flavours error gracefully.
    (flavours.fulfilled || flavours.error);

  const isRegionSpecificDataReady =
    machineTypesByRegion.fulfilled || (machineTypesByRegion.error && isDataReady);

  // use region data switch, wait for region data to be ready
  const useRegionFilteredData =
    (isBYOC || product === normalizedProducts.ROSA) &&
    cloudProviderID === CloudProviderType.Aws &&
    !inModal;

  const [isMachineTypeFilteredByRegion, setIsMachineTypeFilteredByRegion] = React.useState(
    !previousSelectionFromUnfilteredSet,
  );
  const activeMachineTypes =
    isRegionSpecificDataReady && useRegionFilteredData && isMachineTypeFilteredByRegion
      ? machineTypesByRegion
      : machineTypes;

  /**
   * Checks whether type can be offered, based on quota and ccs_only.
   * Returns false if necessary data not fulfilled yet.
   */
  const isTypeAvailable = React.useCallback(
    (machineTypeID) => {
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
        product,
        cloudProviderID,
        isBYOC,
        isMultiAz,
        resourceName,
        billingModel,
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
      product,
      quota,
    ],
  );

  const setDefaultValue = React.useCallback(() => {
    // Select the type suggested by backend, if possible.
    if (forceChoiceInput.value) {
      return; // Keep untouched, wait for user to choose.
    }

    const defaultType =
      flavours?.byID[DEFAULT_FLAVOUR_ID]?.[cloudProviderID]?.compute_instance_type;

    if (defaultType && isTypeAvailable(defaultType)) {
      input.onChange(defaultType);
    }
  }, [cloudProviderID, flavours?.byID, forceChoiceInput.value, input, isTypeAvailable]);

  const setInvalidValue = React.useCallback(() => {
    // Tell redux form the current value of this field is empty.
    // This will cause it to not pass 'required' validation.
    // Order might matter here!
    // If we cleared to '' before force_choice, componentDidUpdate could select new value(?)
    forceChoiceInput.onChange(true);
    input.onChange('');
  }, [forceChoiceInput, input]);

  React.useEffect(() => {
    getDefaultFlavour();
  }, [getDefaultFlavour]);

  React.useEffect(() => {
    if (
      isDataReady &&
      (!useRegionFilteredData || isRegionSpecificDataReady) &&
      activeMachineTypes.typesByID
    ) {
      if (!input.value) {
        setDefaultValue();
      }

      // If user had made a choice, then some external param changed like CCS/MultiAz,
      // (we can get here on mount after switching wizard steps)
      // and selected type is no longer availble, force user to choose again.
      if (input.value && !isTypeAvailable(input.value)) {
        setInvalidValue();
      }
    }
  }, [
    input.value,
    isDataReady,
    activeMachineTypes.typesByID,
    useRegionFilteredData,
    isRegionSpecificDataReady,
    isTypeAvailable,
    setDefaultValue,
    setInvalidValue,
  ]);

  const changeHandler = React.useCallback(
    (_, value) => {
      input.onChange(value);
      forceChoiceInput.onChange(false);
    },
    [forceChoiceInput, input],
  );

  const sortedMachineTypes = React.useMemo(
    () => sortMachineTypes(activeMachineTypes, cloudProviderID),
    [cloudProviderID, activeMachineTypes],
  );

  const filteredMachineTypes = React.useMemo(
    () => sortedMachineTypes.filter((type) => isTypeAvailable(type.id)),
    [isTypeAvailable, sortedMachineTypes],
  );
  React.useEffect(() => {
    const AZs = [...new Set(selectedVpc?.aws_subnets?.map((el) => el.availability_zone))];
    if (AZs) {
      dispatch(getMachineTypesByRegionARN(installerRoleArn, region, [...AZs]));
    }
  }, [selectedVpc, dispatch, installerRoleArn, region]);

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

  const machineTypeMap = React.useMemo(() => {
    const machineGroups = groupedMachineTypes(filteredMachineTypes);
    const selectGroups = machineGroups
      .map(([categoryLabel, categoryMachines]) => {
        if (categoryMachines.length > 0) {
          return {
            name: categoryLabel,
            category: categoryLabel,
            children: categoryMachines.map((machineType) => {
              const possiblyUnavailable =
                useRegionFilteredData &&
                !isMachineTypeFilteredByRegion &&
                !isMachineTypeIncludedInFilteredSet(machineType.id, machineTypesByRegion);
              return {
                name: (
                  <TreeViewSelectMenuItem
                    name={machineTypeLabel(machineType)}
                    description={machineTypeDescriptionLabel(machineType)}
                    popoverText={possiblyUnavailable && machineTypeUnavailableWarning}
                    icon={possiblyUnavailable && possiblyUnavailableWarnIcon}
                  />
                ),
                category: categoryLabel,
                nameLabel: machineTypeLabel(machineType),
                descriptionLabel: machineTypeDescriptionLabel(machineType),
                id: machineType.id,
              };
            }),
          };
        }
        return undefined;
      })
      .filter(Boolean);
    return selectGroups;
  }, [
    filteredMachineTypes,
    isMachineTypeFilteredByRegion,
    machineTypesByRegion,
    useRegionFilteredData,
    possiblyUnavailableWarnIcon,
  ]);

  const findSelectedTreeViewItem = (machineID) => {
    let selectedTreeViewNode;
    machineTypeMap.forEach((category) => {
      category.children.forEach((machineType) => {
        if (machineType.id === machineID) selectedTreeViewNode = machineType;
      });
    });
    return selectedTreeViewNode;
  };

  // In the dropdown we put the machine type id in separate description row,
  // but the Select toggle doesn't support that, so combine both into one label.
  const selectionText = React.useMemo(
    () =>
      machineTypeFullLabel(
        filteredMachineTypes.find((machineType) => machineType.id === input.value) || null,
      ),
    [filteredMachineTypes, input.value],
  );

  React.useEffect(() => {
    const availabilityOfAMachinePool =
      useRegionFilteredData &&
      input.value &&
      !isMachineTypeIncludedInFilteredSet(input.value, machineTypesByRegion);
    setFieldValue('machine_type_availability', availabilityOfAMachinePool);
    // eslint-disable-next-line  react-hooks/exhaustive-deps
  }, [setFieldValue, useRegionFilteredData, input.value]);

  if (
    isDataReady &&
    (!useRegionFilteredData || isRegionSpecificDataReady) &&
    !activeMachineTypes.error
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
      input.value &&
      !isMachineTypeIncludedInFilteredSet(input.value, machineTypesByRegion);
    return (
      <FormGroup
        label="Compute node instance type"
        isRequired
        fieldId="node_type"
        labelHelp={<PopoverHint hint={constants.computeNodeInstanceTypeHint} />}
      >
        <TreeViewSelect
          treeViewSelectionMap={machineTypeMap}
          inModal={inModal}
          menuAppendTo={menuAppendTo}
          selected={() => findSelectedTreeViewItem(input.value)}
          selectionPlaceholderText={selectionText}
          setSelected={(event, selection) => {
            changeHandler(event, selection.id);
          }}
          menuToggleBadge={currentSelectionPossiblyUnavailable && possiblyUnavailableWarnIcon}
          treeViewSwitchActive={!isMachineTypeFilteredByRegion}
          setTreeViewSwitchActive={(switchValue) => {
            forceChoiceInput.onChange(false);
            setIsMachineTypeFilteredByRegion(!switchValue);
          }}
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
          switchLabelOffText="Include types that might be unavailable to your account or region"
          allExpanded={allExpanded}
          ariaLabel="Machine type select"
        />
        <FormGroupHelperText touched={touched} error={error} />
      </FormGroup>
    );
  }

  return activeMachineTypes.error ? (
    <ErrorBox message="Error loading node types" response={activeMachineTypes} />
  ) : (
    <>
      <div className="spinner-fit-container">
        <Spinner size="md" aria-label="Loading..." />
      </div>
      <div className="spinner-loading-text">Loading node types...</div>
    </>
  );
};

const inputMetaPropTypes = PropTypes.shape({
  input: PropTypes.shape({
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string,
  }).isRequired,
  meta: PropTypes.shape({
    error: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    touched: PropTypes.bool,
  }),
  id: PropTypes.string,
  ccs_only: PropTypes.bool,
  generic_name: PropTypes.string,
});

MachineTypeSelection.propTypes = {
  machine_type: inputMetaPropTypes,
  machine_type_force_choice: inputMetaPropTypes,
  getDefaultFlavour: PropTypes.func.isRequired,
  flavours: PropTypes.object.isRequired,
  machineTypes: PropTypes.object.isRequired,
  machineTypesByRegion: PropTypes.object.isRequired,
  isMultiAz: PropTypes.bool.isRequired,
  isBYOC: PropTypes.bool.isRequired,
  isMachinePool: PropTypes.bool,
  inModal: PropTypes.bool,
  cloudProviderID: PropTypes.string,
  product: PropTypes.oneOf(Object.keys(normalizedProducts)).isRequired,
  billingModel: PropTypes.string.isRequired,
  quota: PropTypes.object.isRequired,
  organization: PropTypes.object.isRequired,
  menuAppendTo: PropTypes.object,
  selectedVpc: PropTypes.object,
  region: PropTypes.string,
  installerRoleArn: PropTypes.object,
  allExpanded: PropTypes.bool,
};

export default MachineTypeSelection;
