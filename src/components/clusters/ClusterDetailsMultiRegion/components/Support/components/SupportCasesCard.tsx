import React, { useMemo } from 'react';

import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Spinner,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { useFetchSupportCases } from '~/queries/ClusterDetailsQueries/ClusterSupportTab/useFetchSupportCases';
import { isRestrictedEnv } from '~/restrictedEnv';
import { AugmentedCluster } from '~/types/types';

import { normalizedProducts } from '../../../../../../common/subscriptionTypes';

import { getSupportCaseURL, supportCaseRow } from './SupportCasesCardHelper';

type SupportCasesCardProps = {
  subscriptionID: string;
  isDisabled?: boolean;
  cluster: AugmentedCluster;
};

const SupportCasesErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <EmptyState
    headingLevel="h4"
    icon={ExclamationCircleIcon}
    status="danger"
    titleText="Support cases could not be loaded"
  >
    <EmptyStateBody>
      <Button variant="link" isInline onClick={onRetry}>
        Retry
      </Button>
    </EmptyStateBody>
  </EmptyState>
);

const SupportCasesCard = ({
  subscriptionID,
  isDisabled = false,
  cluster,
}: SupportCasesCardProps) => {
  const product = cluster?.subscription?.plan?.type;
  const isRestricted = isRestrictedEnv();
  const { supportCases, isLoading, isError, refetch } = useFetchSupportCases(
    subscriptionID,
    isRestricted,
  );

  const rows = useMemo(() => supportCases.cases?.map(supportCaseRow), [supportCases.cases]);
  const hasRows = useMemo(() => rows && rows.length > 0, [rows]);
  const showOpenSupportCaseButton = product !== normalizedProducts.OSDTrial && !isDisabled;

  return (
    <>
      {showOpenSupportCaseButton && (
        <a
          href={getSupportCaseURL(product, cluster?.openshift_version, cluster?.external_id)}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="support-case-btn"
        >
          <Button variant="secondary">Open support case</Button>
        </a>
      )}
      {!isRestricted && isLoading && <Spinner aria-label="Loading support cases" />}
      {!isRestricted && !isLoading && isError && <SupportCasesErrorState onRetry={refetch} />}
      {!isRestricted && !isLoading && !isError && (
        <>
          <Table
            variant={TableVariant.compact}
            aria-label="Support Cases"
            data-testid="support-cases-table"
          >
            <Thead>
              <Tr>
                <Th>Case ID</Th>
                <Th>Issue summary</Th>
                <Th>Owner</Th>
                <Th>Modified by</Th>
                <Th>Severity</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {rows?.map((row: { cells: (string | React.JSX.Element)[] }) => (
                <Tr>
                  <Td>{row.cells[0]}</Td>
                  <Td>{row.cells[1]}</Td>
                  <Td>{row.cells[2]}</Td>
                  <Td>{row.cells[3]}</Td>
                  <Td>{row.cells[4]}</Td>
                  <Td>{row.cells[5]}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          {!hasRows && (
            <EmptyState variant={EmptyStateVariant.sm}>
              <EmptyStateBody>You have no open support cases</EmptyStateBody>
            </EmptyState>
          )}
        </>
      )}
    </>
  );
};

export default SupportCasesCard;
