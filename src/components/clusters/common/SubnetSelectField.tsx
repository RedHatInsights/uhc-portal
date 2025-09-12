import React, { ChangeEvent, FocusEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { FieldInputProps, FieldMetaProps } from 'formik';

import { Flex, FlexItem, FormGroup, FormSelectProps } from '@patternfly/react-core';

import { isSubnetMatchingPrivacy } from '~/common/vpcHelpers';
import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';
import { FuzzySelect, FuzzySelectProps } from '~/components/common/FuzzySelect/FuzzySelect';
import { FuzzyDataType } from '~/components/common/FuzzySelect/types';
import { isRestrictedEnv } from '~/restrictedEnv';
import { CloudVpc, Subnetwork } from '~/types/clusters_mgmt.v1';

const TRUNCATE_THRESHOLD = 40;

const filterSubnetsByPrivacyAndAZ = (
  selectedVPC: CloudVpc,
  privacy?: 'public' | 'private',
  allowedAZs?: string[],
): Subnetwork[] => {
  const allFilteredSubnets: Subnetwork[] = [];
  selectedVPC.aws_subnets?.forEach((subnet) => {
    const subnetAZ = subnet.availability_zone || '';
    if (
      isSubnetMatchingPrivacy(subnet, privacy) &&
      (allowedAZs === undefined || allowedAZs.includes(subnetAZ))
    ) {
      allFilteredSubnets.push(subnet);
    }

    if (isRestrictedEnv()) {
      allFilteredSubnets.push(subnet);
    }
  });
  return allFilteredSubnets;
};

const divideSubnetsUsedOrUnused = (
  subnets: Subnetwork[],
  usedSubnetIds: string[],
): { unusedSubnets: Subnetwork[]; usedSubnets: Subnetwork[] } => {
  const unusedSubnets: Subnetwork[] = [];
  const usedSubnets: Subnetwork[] = [];

  subnets.forEach((subnet) => {
    if (usedSubnetIds.includes(subnet.subnet_id as string)) {
      usedSubnets.push(subnet);
    } else {
      unusedSubnets.push(subnet);
    }
  });

  return { unusedSubnets, usedSubnets };
};

const subnetsByAvailabilityZone = (subnets: Subnetwork[]): FuzzyDataType => {
  if (subnets.length === 0) {
    return {};
  }

  const subnetsByAZ: Record<string, Subnetwork[]> = {};

  subnets.forEach((subnet) => {
    const subnetAZ = subnet.availability_zone || '';
    if (!subnetsByAZ[subnetAZ]) {
      subnetsByAZ[subnetAZ] = [];
    }
    subnetsByAZ[subnetAZ].push(subnet);
  });

  const result: FuzzyDataType = {};

  Object.entries(subnetsByAZ)
    .sort(([azA], [azB]) => azA.localeCompare(azB))
    .forEach(([az, azSubnets]) => {
      result[az] = azSubnets.map((subnet) => ({
        groupId: az,
        entryId: subnet.subnet_id as string,
        label: subnet.name || (subnet.subnet_id as string),
      }));
    });

  return result;
};

// TODO: This should be cleaned up, but it mimics what was used
// when this component was used for both Redux forms and Formik
// at the same time.
type SampleInput = {
  name: string;
  onFocus?: FocusEvent<any>;
  checked?: boolean | undefined;
  value: any;
  onBlur?: FocusEvent<any> | ChangeEvent<any>;
  onChange: (subnetId: string | undefined) => void;
};

export interface SubnetSelectFieldProps {
  name: string;
  label: string;
  input: SampleInput | FieldInputProps<FormSelectProps>;
  // meta: Pick<WrappedFieldMetaProps, 'error' | 'touched'> | FieldMetaProps<FormSelectProps>;
  meta: Pick<FieldMetaProps<FormSelectProps>, 'error' | 'touched'>;
  isRequired?: boolean;
  className?: string;
  privacy?: 'public' | 'private';
  selectedVPC: CloudVpc;
  withAutoSelect?: boolean;
  allowedAZs?: string[];
  usedSubnetIds?: string[];
}

export const SubnetSelectField = ({
  name,
  label,
  input,
  meta,
  isRequired,
  className,
  privacy,
  withAutoSelect = true,
  selectedVPC,
  allowedAZs,
  usedSubnetIds = [],
}: SubnetSelectFieldProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showUsedSubnets, setShowUsedSubnets] = useState(false);

  const selectedSubnetId = input.value as string;
  const inputError = meta.touched && (meta.error || (isRequired && !selectedSubnetId));

  const { subnetsByAZ, subnetList, hasOptions, hasUsedSubnets, hasUnusedOptions } = useMemo<{
    subnetsByAZ: FuzzyDataType;
    subnetList: Subnetwork[];
    hasOptions: boolean;
    hasUsedSubnets: boolean;
    hasUnusedOptions: boolean;
  }>(() => {
    const allFilteredSubnets = filterSubnetsByPrivacyAndAZ(selectedVPC, privacy, allowedAZs);
    const { unusedSubnets, usedSubnets } = divideSubnetsUsedOrUnused(
      allFilteredSubnets,
      usedSubnetIds,
    );

    const orderedSubnetList = [...unusedSubnets, ...usedSubnets];
    const subnetsByAZ = subnetsByAvailabilityZone(unusedSubnets);

    const hasOptions = orderedSubnetList.length > 0;
    const hasUsedSubnets = usedSubnets.length > 0;
    const hasUnusedOptions = unusedSubnets.length > 0;
    return {
      subnetsByAZ,
      subnetList: orderedSubnetList,
      hasOptions,
      hasUsedSubnets,
      hasUnusedOptions,
    };
  }, [selectedVPC, allowedAZs, privacy, usedSubnetIds]);

  useEffect(() => {
    const isValidCurrentSelection = subnetList.some(
      (subnet) => subnet.subnet_id === selectedSubnetId,
    );

    let newSelectedSubnetId = null;
    if (withAutoSelect) {
      // When "autoSelect" is enabled, we will set the first UNUSED subnet as the selected one
      // Only auto-select if there are unused subnets available
      if (!isValidCurrentSelection && hasUnusedOptions) {
        const unusedSubnets = subnetList.filter(
          (subnet) => !usedSubnetIds.includes(subnet.subnet_id as string),
        );
        newSelectedSubnetId = unusedSubnets[0].subnet_id;
      }
    } else if (!isValidCurrentSelection) {
      // When "autoSelect" is disabled, we only need to update the selection when the current one is now invalid.
      // For example, because "selectedVPC" has changed
      newSelectedSubnetId = '';
    }

    if (newSelectedSubnetId !== null && newSelectedSubnetId !== selectedSubnetId) {
      input.onChange(newSelectedSubnetId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withAutoSelect, hasUnusedOptions, subnetList, selectedSubnetId, usedSubnetIds]);

  const onSelect: NonNullable<FuzzySelectProps['onSelect']> = useCallback(
    (_event, selectedSubnetId) => {
      input.onChange(selectedSubnetId as string);
      setIsExpanded(false);
    },
    [input],
  );

  const toggleUsedSubnets = useCallback(() => {
    setShowUsedSubnets((prev) => !prev);
  }, []);

  let placeholderText = `Select ${privacy} subnet`;
  if (selectedVPC?.id && !hasOptions && (allowedAZs === undefined || allowedAZs.length > 0)) {
    // This message will not appear when we are filtering by AZ, but it has not been selected yet
    placeholderText = `No ${privacy} subnets found.`;
  }

  return (
    <FormGroup
      fieldId={name || input.name}
      label={label}
      isRequired={isRequired}
      className={className}
    >
      <Flex>
        <FlexItem grow={{ default: 'grow' }}>
          <FuzzySelect
            aria-label={label}
            isOpen={isExpanded}
            onOpenChange={(isExpanded) => setIsExpanded(isExpanded)}
            onSelect={onSelect}
            selectedEntryId={selectedSubnetId}
            selectionData={subnetsByAZ}
            isDisabled={!selectedVPC?.id || !hasOptions}
            placeholderText={placeholderText}
            truncation={TRUNCATE_THRESHOLD}
            inlineFilterPlaceholderText="Filter by subnet ID / name"
            validated={inputError ? 'danger' : undefined}
            isPopover
            toggleId={name || input.name}
            showUsedSubnets={showUsedSubnets}
            onToggleUsedSubnets={toggleUsedSubnets}
            hasUsedSubnets={hasUsedSubnets}
            usedSubnetIds={usedSubnetIds}
            allSubnets={selectedVPC.aws_subnets}
            privacy={privacy}
            allowedAZs={allowedAZs}
          />
        </FlexItem>
      </Flex>
      {/* TODO:  InputError could be a boolean but FormGroupHelperText doesn't accept a boolean.
      This issue was discovered when changing types from Redux Forms to Formik
      */}
      {/* @ts-ignore */}
      <FormGroupHelperText touched={meta.touched} error={inputError} />
    </FormGroup>
  );
};
