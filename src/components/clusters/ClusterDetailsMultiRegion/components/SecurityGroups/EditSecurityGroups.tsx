import React from 'react';

import {
  Badge,
  Button,
  FormGroup,
  Grid,
  GridItem,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  SelectProps,
  Tooltip,
} from '@patternfly/react-core';
import RedoIcon from '@patternfly/react-icons/dist/esm/icons/redo-icon';

import { truncateTextWithEllipsis } from '~/common/helpers';
import { validateSecurityGroups } from '~/common/validators';
import { FormGroupHelperText } from '~/components/common/FormGroupHelperText';
import { securityGroupsSort } from '~/redux/reducers/ccsInquiriesReducer';
import { CloudVpc } from '~/types/clusters_mgmt.v1';

import SecurityGroupsViewList from './SecurityGroupsViewList';

import './EditSecurityGroups.scss';

export interface EditSecurityGroupsProps {
  label?: string;
  selectedGroupIds: string[];
  selectedVPC: CloudVpc;
  isReadOnly: boolean;
  isHypershift: boolean;
  onChange: (securityGroupIds: string[]) => void;
  refreshVPCCallback?: () => void;
  isVPCLoading?: boolean;
}

const getDisplayName = (securityGroupName: string) => {
  if (securityGroupName) {
    const maxVisibleLength = 50;
    const displayName = truncateTextWithEllipsis(securityGroupName, maxVisibleLength);
    return { displayName, isCut: securityGroupName.length > maxVisibleLength };
  }
  return { displayName: '--', isCut: false };
};

const EditSecurityGroups = ({
  label = 'Security groups',
  selectedVPC,
  selectedGroupIds = [],
  onChange,
  isReadOnly,
  isHypershift,
  refreshVPCCallback,
  isVPCLoading,
}: EditSecurityGroupsProps) => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const vpcSecurityGroups = React.useMemo(
    () => selectedVPC?.aws_security_groups || [],
    [selectedVPC?.aws_security_groups],
  );
  const selectedOptions = vpcSecurityGroups.filter((sg) => selectedGroupIds?.includes(sg.id || ''));
  selectedOptions.sort(securityGroupsSort);

  React.useEffect(() => {
    if (vpcSecurityGroups.length > 0) {
      const newGroupIds = vpcSecurityGroups.map((sg) => sg.id || '') || [];
      const newSelectedGroupIds = selectedGroupIds.filter((sg) => newGroupIds.includes(sg));

      if (newSelectedGroupIds.length !== selectedGroupIds.length) {
        onChange(newSelectedGroupIds);
      }
    }
  }, [vpcSecurityGroups, selectedGroupIds, onChange]);

  if (isReadOnly) {
    // Shows read-only label, or an empty message if no SGs are selected
    return (
      <SecurityGroupsViewList
        securityGroups={selectedOptions}
        emptyMessage="This machine pool does not have additional security groups."
      />
    );
  }

  const onDeleteGroup = (deleteGroupId: string) => {
    const newGroupIdsValue = selectedGroupIds.filter((sgId) => sgId !== deleteGroupId);
    onChange(newGroupIdsValue);
  };

  const onToggle = () => {
    setIsOpen(!isOpen);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={onToggle}
      isExpanded={isOpen}
      isFullWidth
      badge={
        selectedGroupIds.length > 0 && (
          <Badge screenReaderText="some items">{selectedGroupIds.length}</Badge>
        )
      }
      aria-label="Options menu"
      className="security-groups-menu-toggle"
    >
      Select security groups
    </MenuToggle>
  );

  const onSelect: SelectProps['onSelect'] = (_event, value) => {
    const selectedGroupId = value as string;
    const wasPreviouslySelected = selectedGroupIds.includes(selectedGroupId);
    if (wasPreviouslySelected) {
      // The SG has been unselected
      onDeleteGroup(selectedGroupId);
    } else {
      // The SG has been selected
      const newGroupIds = selectedGroupIds.concat(selectedGroupId);
      const selectedGroups = vpcSecurityGroups.filter((sg) => newGroupIds.includes(sg.id || ''));
      selectedGroups.sort(securityGroupsSort);

      onChange(selectedGroups.map((group) => group.id || ''));
    }
  };

  const validationError = validateSecurityGroups(selectedGroupIds, isHypershift);

  return (
    <GridItem>
      <FormGroup fieldId="securityGroupIds" label={label} className="pf-v5-u-mt-md">
        <Grid>
          <GridItem span={10}>
            <SecurityGroupsViewList securityGroups={selectedOptions} onCloseItem={onDeleteGroup} />
            <Select
              role="menu"
              isOpen={isOpen}
              selected={selectedGroupIds}
              toggle={toggle}
              onSelect={onSelect}
              onOpenChange={(isOpen) => setIsOpen(isOpen)}
              data-testid="securitygroups-id"
              aria-labelledby="Select AWS security groups"
              maxMenuHeight="300px"
            >
              <SelectList>
                {vpcSecurityGroups.map(({ id = '', name = '' }) => {
                  const { displayName, isCut } = getDisplayName(name);
                  return (
                    <SelectOption
                      key={id}
                      value={id}
                      description={id}
                      title={isCut ? name : ''}
                      hasCheckbox
                      isSelected={selectedGroupIds.includes(id)}
                    >
                      {displayName}
                    </SelectOption>
                  );
                })}
              </SelectList>
            </Select>
          </GridItem>
          {refreshVPCCallback && (
            <GridItem span={2} style={{ textAlign: 'left' }}>
              <Tooltip content="Refetch Security Groups list">
                <Button
                  id="refreshSecurityGroupsButton"
                  isDisabled={isVPCLoading}
                  variant="plain"
                  onClick={refreshVPCCallback}
                  icon={<RedoIcon />}
                />
              </Tooltip>
            </GridItem>
          )}
        </Grid>
      </FormGroup>
      <FormGroupHelperText touched error={validationError} />
    </GridItem>
  );
};

export default EditSecurityGroups;
