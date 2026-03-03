import React from 'react';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import { Label, Skeleton } from '@patternfly/react-core';
import {
  ActionsColumn,
  expandable,
  ExpandableRowContent,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';

import { versionFormatter } from '~/common/versionHelpers';
import { isMultiAZ } from '~/components/clusters/ClusterDetailsMultiRegion/clusterDetailsHelper';
import { useGlobalState } from '~/redux/hooks';

import { openModal } from '../../../../common/Modal/ModalActions';
import modals from '../../../../common/Modal/modals';

import MachinePoolExpandedRow from './components/MachinePoolExpandedRow';
import { canMachinePoolBeUpgradedSelector } from './UpdateMachinePools/updateMachinePoolsHelpers';
import MachinePoolNodesSummary from './MachinePoolNodesSummary';
import { actionResolver, hasSubnets } from './machinePoolsHelper';
import { UpdatePoolButton } from './UpdateMachinePools';

const getOpenShiftVersion = (
  machinePool,
  isDisabled,
  isMachinePoolError,
  isHypershift,
  clusterVersionID,
  clusterVersionRawID,
) => {
  const extractedVersion = get(machinePool, 'version.id', '');

  if (!extractedVersion) {
    return 'N/A';
  }
  return (
    <>
      {versionFormatter(extractedVersion) || extractedVersion}{' '}
      {!isDisabled ? (
        <UpdatePoolButton
          machinePool={machinePool}
          isMachinePoolError={isMachinePoolError}
          isHypershift={isHypershift}
          controlPlaneVersion={clusterVersionID}
          controlPlaneRawVersion={clusterVersionRawID}
        />
      ) : null}
    </>
  );
};

const SkeletonMachinePoolRow = ({ colSpan }) => (
  <Tr>
    <Td />
    <Td colSpan={colSpan}>
      <Skeleton screenreaderText="Deleting machine pool..." />
    </Td>
  </Tr>
);

export const MachinePoolsTable = ({
  isHypershift,
  machinePoolData,
  isDeleteMachinePoolPending,
  isDeleteMachinePoolSuccess,
  isDeleteMachinePoolError,
  setEditMachinePoolId,
  setHideDeleteMachinePoolError,
  cluster,
  isMachinePoolError,
  machinePoolsActions,
  machineTypes,
  tableActionsDisabled,
  deleteMachinePoolMutation,
}) => {
  const dispatch = useDispatch();

  const clusterUpgradesSchedules = useGlobalState((state) => state.clusterUpgrades.schedules);

  const [deletingMachinePoolId, setDeletingMachinePoolId] = React.useState(null);
  const [expandedMachinePools, setExpandedMachinePools] = React.useState([]);

  const isMultiZoneCluster = React.useMemo(() => isMultiAZ(cluster), [cluster]);

  const isExpandable = React.useCallback(
    (machinePool = {}) => {
      const securityGroupIds =
        machinePool?.aws?.additional_security_group_ids ||
        machinePool?.aws_node_pool?.additional_security_group_ids ||
        [];
      const spotMarketOptions = machinePool?.aws?.spot_market_options;
      const hasAutoRepair = isHypershift;

      return (
        !isEmpty(machinePool.labels) ||
        machinePool.taints?.length > 0 ||
        machinePool.autoscaling ||
        securityGroupIds.length > 0 ||
        !!spotMarketOptions ||
        hasAutoRepair ||
        hasSubnets(machinePool)
      );
    },
    [isHypershift],
  );

  React.useEffect(() => {
    if (!isDeleteMachinePoolPending && (isDeleteMachinePoolSuccess || isDeleteMachinePoolError)) {
      setDeletingMachinePoolId(null);
    }
  }, [isDeleteMachinePoolPending, isDeleteMachinePoolSuccess, isDeleteMachinePoolError]);

  const performDeleteAction = React.useCallback(
    async (_, machinePool) => {
      if (isDeleteMachinePoolError) {
        setHideDeleteMachinePoolError(false);
      }

      setDeletingMachinePoolId(machinePool.id);
      deleteMachinePoolMutation(machinePool.id);
    },
    [isDeleteMachinePoolError, setHideDeleteMachinePoolError, deleteMachinePoolMutation],
  );

  const onClickDeleteAction = React.useCallback(
    (_, rowID, machinePool) => {
      dispatch(
        openModal(modals.DELETE_MACHINE_POOL, {
          machinePool,
          performDeleteAction: () => performDeleteAction(rowID, machinePool),
        }),
      );
    },
    [dispatch, performDeleteAction],
  );

  const onClickEdit = React.useCallback(
    (_, __, machinePool) => setEditMachinePoolId(machinePool.id),
    [setEditMachinePoolId],
  );

  const onClickUpdateAction = React.useCallback(
    (machinePool) =>
      dispatch(
        openModal(modals.UPDATE_MACHINE_POOL_VERSION, {
          machinePool,
        }),
      ),
    [dispatch],
  );

  const columnCells = React.useMemo(() => {
    const cells = {
      machinePool: { title: 'Machine pool', cellFormatters: [expandable] },
      instanceType: { title: 'Instance type' },
      availabilityZones: { title: 'Availability zones', columnWidth: 15 },
      nodeCount: { title: 'Node count' },
      autoscaling: { title: 'Autoscaling', columnWidth: 15 },
    };

    if (isHypershift) {
      cells.version = { title: 'Version', columnWidth: 15 };
    }

    cells.actions = { title: '', screenReaderText: 'Actions' };
    return cells;
  }, [isHypershift]);

  const columnCellsRender = React.useMemo(
    () =>
      Object.keys(columnCells).map((column) => {
        const columnOptions = columnCells[column];
        return (
          <Th
            key={columnOptions.title}
            width={columnOptions.columnWidth}
            screenReaderText={columnOptions.screenReaderText}
          >
            {columnOptions.title}
          </Th>
        );
      }),
    [columnCells],
  );

  const setMachinePoolExpanded = React.useCallback(
    (row, isExpanding = true) =>
      setExpandedMachinePools((prevExpanded) => {
        const otherExpandedRows = prevExpanded.filter((r) => r !== row.id);
        return isExpanding ? [...otherExpandedRows, row.id] : otherExpandedRows;
      }),
    [],
  );
  const isMachinePoolExpanded = React.useCallback(
    (expandedMachinePool) => expandedMachinePools.includes(expandedMachinePool.id),
    [expandedMachinePools],
  );

  return (
    <Table>
      <Thead>
        <Tr>
          <Th screenReaderText="Row expansion" width={10} />
          {columnCellsRender}
        </Tr>
      </Thead>
      {machinePoolData.map((machinePool, rowIndex) => {
        const expandableRow = isExpandable(machinePool);

        if (deletingMachinePoolId === machinePool.id) {
          return (
            <Tbody key={`${machinePool.id}-deleting`}>
              <SkeletonMachinePoolRow colSpan={Object.keys(columnCells).length - 1} />
            </Tbody>
          );
        }

        const actions = actionResolver({
          machinePool,
          onClickDelete: onClickDeleteAction,
          onClickUpdate: canMachinePoolBeUpgradedSelector(
            clusterUpgradesSchedules,
            cluster?.version?.id || '',
            machinePool,
            isMachinePoolError,
            isHypershift,
            cluster?.version?.raw_id || '',
          )
            ? onClickUpdateAction
            : undefined,
          canDelete: machinePoolsActions.delete,
          cluster,
          machinePools: machinePoolData,
          machineTypes,
          onClickEdit,
        });

        return (
          <Tbody key={machinePool.id} isExpanded={isMachinePoolExpanded(machinePool)}>
            <Tr key={`${machinePool.id}-main-row`}>
              <Td
                expand={
                  expandableRow
                    ? {
                        rowIndex,
                        isExpanded: isMachinePoolExpanded(machinePool),
                        onToggle: () =>
                          setMachinePoolExpanded(machinePool, !isMachinePoolExpanded(machinePool)),
                        expandId: machinePool.id,
                      }
                    : null
                }
              />
              <Td>{machinePool.id}</Td>
              <Td>
                {isHypershift
                  ? machinePool.aws_node_pool?.instance_type
                  : machinePool.instance_type}
                {machinePool.aws?.spot_market_options && (
                  <Label variant="outline" className="ocm-c-machine-pools__spot-label">
                    Spot
                  </Label>
                )}
              </Td>
              <Td>{machinePool.availability_zones?.join(', ') || machinePool.availability_zone}</Td>
              <Td>
                <MachinePoolNodesSummary
                  isMultiZoneCluster={isMultiZoneCluster}
                  machinePool={machinePool}
                />
              </Td>
              <Td>{machinePool.autoscaling ? 'Enabled' : 'Disabled'}</Td>
              {isHypershift && (
                <Td>
                  {getOpenShiftVersion(
                    machinePool,
                    tableActionsDisabled,
                    isMachinePoolError,
                    isHypershift,
                    cluster?.version?.id,
                    cluster?.version?.raw_id,
                  )}
                </Td>
              )}
              <Td isActionCell>
                <ActionsColumn items={actions} isDisabled={tableActionsDisabled} />
              </Td>
            </Tr>

            <Tr
              key={`${machinePool.id}-expandable-row`}
              isExpanded={isMachinePoolExpanded(machinePool)}
              data-testid="expandable-row"
            >
              <Td />
              <Td dataLabel="Machine Pool details" colSpan={100}>
                <ExpandableRowContent>
                  <MachinePoolExpandedRow
                    region={cluster?.subscription?.rh_region_id}
                    cluster={cluster}
                    isMultiZoneCluster={isMultiZoneCluster}
                    machinePool={machinePool}
                  />
                </ExpandableRowContent>
              </Td>
            </Tr>
          </Tbody>
        );
      })}
    </Table>
  );
};

MachinePoolsTable.propTypes = {
  isHypershift: PropTypes.bool,
  machinePoolData: PropTypes.array,
  isDeleteMachinePoolPending: PropTypes.bool,
  isDeleteMachinePoolSuccess: PropTypes.bool,
  isDeleteMachinePoolError: PropTypes.bool,
  setEditMachinePoolId: PropTypes.func,
  setHideDeleteMachinePoolError: PropTypes.func,
  cluster: PropTypes.object,
  isMachinePoolError: PropTypes.bool,
  machinePoolsActions: PropTypes.object,
  machineTypes: PropTypes.object,
  tableActionsDisabled: PropTypes.bool,
  deleteMachinePoolMutation: PropTypes.func,
};

SkeletonMachinePoolRow.propTypes = {
  colSpan: PropTypes.number,
};
