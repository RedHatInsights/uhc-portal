// MachineTypeSelection renders a series of radio buttons for all available node types,
// allowing the user to select just one.

import React from 'react';

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
import { constants } from '~/components/clusters/common/CreateOSDFormConstants';
import ErrorBox from '~/components/common/ErrorBox';
import ExternalLink from '~/components/common/ExternalLink';
import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';
import PopoverHint from '~/components/common/PopoverHint';
import { MachineTypesResponse } from '~/queries/types';
import { MachineType } from '~/types/clusters_mgmt.v1';
import { ErrorState } from '~/types/types';

import type { TreeViewData } from './TreeViewSelect/TreeViewSelect';
import { TreeViewSelect, TreeViewSelectMenuItem } from './TreeViewSelect/TreeViewSelect';
import {
  groupedMachineTypes,
  isMachineTypeIncludedInFilteredSet,
  machineTypeDescriptionLabel,
  machineTypeLabel,
} from './machineTypeSelectionHelper';

const MACHINE_TYPE_UNAVAILABLE_WARNING =
  'OCM does not have access to all AWS account details. Machine node type cannot be verified to be accessible for this AWS user.';

const PossiblyUnavailableWarnIcon = () => (
  <Icon status="warning" size="md">
    <ExclamationTriangleIcon />
  </Icon>
);

export type MachineTypeSelectionRenderProps =
  | { phase: 'loading' }
  | {
      phase: 'error';
      activeMachineTypesError: Pick<ErrorState, 'errorDetails' | 'errorMessage' | 'operationID'>;
    }
  | { phase: 'noTypes' }
  | {
      phase: 'form';
      filteredMachineTypes: MachineType[];
      regionFilterForAvailability: MachineTypesResponse;
      selectedInstanceTypeId: string | undefined;
      selectionText: string;
      onSelectMachineType: (machineTypeId: string) => void;
      treeViewSwitchActive: boolean;
      setTreeViewSwitchActive: React.Dispatch<React.SetStateAction<boolean>>;
      useRegionFilteredData: boolean;
      touched: boolean;
      instanceTypeError: string | undefined;
      allExpanded: boolean;
    };

type MachineTypeSelectionFormProps = Extract<MachineTypeSelectionRenderProps, { phase: 'form' }>;

const findSelectedTreeViewItem = (map: TreeViewData[], machineID: string | undefined) => {
  if (!machineID) {
    return undefined;
  }
  let selectedTreeViewNode: TreeViewData | undefined;
  map.forEach((category) => {
    category.children?.forEach((machineType) => {
      if (machineType.id === machineID) selectedTreeViewNode = machineType;
    });
  });
  return selectedTreeViewNode;
};

/** Form branch only — keeps hooks unconditional (Rules of Hooks). */
const MachineTypeSelectionForm = (props: MachineTypeSelectionFormProps) => {
  const {
    filteredMachineTypes,
    regionFilterForAvailability,
    selectedInstanceTypeId,
    selectionText,
    onSelectMachineType,
    treeViewSwitchActive,
    setTreeViewSwitchActive,
    useRegionFilteredData,
    touched,
    instanceTypeError,
    allExpanded,
  } = props;

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
              treeViewSwitchActive &&
              !isMachineTypeIncludedInFilteredSet(machineType.id, regionFilterForAvailability);
            return {
              name: (
                <TreeViewSelectMenuItem
                  name={machineTypeLabel(machineType)}
                  description={machineTypeDescriptionLabel(machineType)}
                  popoverText={possiblyUnavailable ? MACHINE_TYPE_UNAVAILABLE_WARNING : ''}
                  icon={possiblyUnavailable ? <PossiblyUnavailableWarnIcon /> : undefined}
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
      regionFilterForAvailability,
      treeViewSwitchActive,
      useRegionFilteredData,
    ],
  );

  const selectedTreeViewItem = React.useMemo(
    () => findSelectedTreeViewItem(machineTypeMap, selectedInstanceTypeId),
    [machineTypeMap, selectedInstanceTypeId],
  );

  const currentSelectionPossiblyUnavailable =
    useRegionFilteredData &&
    Boolean(selectedInstanceTypeId) &&
    !isMachineTypeIncludedInFilteredSet(selectedInstanceTypeId, regionFilterForAvailability);

  return (
    <FormGroup
      label="Compute node instance type"
      isRequired
      labelHelp={<PopoverHint hint={constants.computeNodeInstanceTypeHint} />}
    >
      <TreeViewSelect
        treeViewSelectionMap={machineTypeMap}
        selected={selectedTreeViewItem}
        selectionPlaceholderText={selectionText}
        setSelected={(_event, selection) => {
          if (selection.id) {
            onSelectMachineType(selection.id);
          }
        }}
        menuToggleBadge={
          currentSelectionPossiblyUnavailable ? <PossiblyUnavailableWarnIcon /> : undefined
        }
        treeViewSwitchActive={treeViewSwitchActive}
        setTreeViewSwitchActive={setTreeViewSwitchActive}
        helperText={
          currentSelectionPossiblyUnavailable && (
            <HelperText>
              <HelperTextItem variant="warning">{MACHINE_TYPE_UNAVAILABLE_WARNING}</HelperTextItem>
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
};

const MachineTypeSelection = (props: MachineTypeSelectionRenderProps) => {
  const { phase } = props;

  if (phase === 'loading') {
    return (
      <>
        <div className="spinner-fit-container">
          <Spinner size="md" aria-label="Loading..." />
        </div>
        <div className="spinner-loading-text">Loading node types...</div>
      </>
    );
  }

  if (phase === 'error') {
    const { activeMachineTypesError } = props;
    return <ErrorBox message="Error loading node types" response={activeMachineTypesError} />;
  }

  if (phase === 'noTypes') {
    return (
      <Alert variant={AlertVariant.danger} isInline title={noMachineTypes} role="alert">
        <ExternalLink href="https://cloud.redhat.com/products/dedicated/contact/">
          Contact sales to purchase additional quota.
        </ExternalLink>
      </Alert>
    );
  }

  return <MachineTypeSelectionForm {...props} />;
};

export { MachineTypeSelection };
