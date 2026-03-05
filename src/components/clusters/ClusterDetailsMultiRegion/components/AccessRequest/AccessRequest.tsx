import React, { useCallback, useMemo } from 'react';
import { shallowEqual, useDispatch } from 'react-redux';

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Flex,
  FlexItem,
  Popover,
} from '@patternfly/react-core';
import OutlinedQuestionCircleIcon from '@patternfly/react-icons/dist/esm/icons/outlined-question-circle-icon';
import { SortByDirection } from '@patternfly/react-table';

import installLinks from '~/common/installLinks.mjs';
import useOrganization from '~/components/CLILoginPage/useOrganization';
import ExternalLink from '~/components/common/ExternalLink';
import ConnectedModal from '~/components/common/Modal/ConnectedModal';
import { modalActions } from '~/components/common/Modal/ModalActions';
import modals from '~/components/common/Modal/modals';
import { useGetAccessProtection } from '~/queries/AccessRequest/useGetAccessProtection';
import {
  refetchAccessRequests,
  useFetchAccessRequests,
} from '~/queries/ClusterDetailsQueries/AccessRequestTab/useFetchAccessRequests';
import { TABBED_CLUSTERS } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';
import { viewActions } from '~/redux/actions/viewOptionsActions';
import { viewConstants } from '~/redux/constants';
import { useGlobalState } from '~/redux/hooks';
import { isRestrictedEnv } from '~/restrictedEnv';
import { AccessRequest as AccessRequestModel } from '~/types/access_transparency.v1';
import { ViewSorting } from '~/types/types';

import AccessRequestModalForm from './components/AccessRequestModalForm';
import AccessRequestTable from './components/AccessRequestTable';
import AccessRequestTablePagination from './components/AccessRequestTablePagination';

import './AccessRequest.scss';

type AccessRequestProps = {
  subscriptionId?: string;
  showClusterName?: boolean;
};

const DESCRIPTION_TEXT =
  'Access requests to customer data on Red Hat OpenShift Service on AWS clusters and the corresponding cloud accounts can be created by SRE either in response to a customer-initiated support ticket or in response to alerts received by SRE, as part of the standard incident response process.';

export const AccessRequest = ({ subscriptionId, showClusterName = false }: AccessRequestProps) => {
  const dispatch = useDispatch();
  const viewType = viewConstants.ACCESS_REQUESTS_VIEW;
  const viewOptions = useGlobalState((state) => state.viewOptions[viewType], shallowEqual);
  const { organization } = useOrganization();
  const isTabbedClustersEnabled = useFeatureGate(TABBED_CLUSTERS);

  const {
    enabled: isOrganizationAccessProtectionEnabled,
    isLoading: isOrganizationAccessProtectionLoading,
  } = useGetAccessProtection(
    {
      organizationId: organization?.id,
    },
    isRestrictedEnv(),
  );

  const { data: accessRequests, isLoading: isAccessRequestsLoading } = useFetchAccessRequests({
    subscriptionId,
    organizationId: !subscriptionId ? organization?.id : undefined,
    params: viewOptions,
    isAccessProtectionLoading: isOrganizationAccessProtectionLoading,
    accessProtection: { enabled: isOrganizationAccessProtectionEnabled || false },
  });

  const isPendingNoData = useMemo(
    () => isAccessRequestsLoading || !accessRequests?.length,
    [isAccessRequestsLoading, accessRequests],
  );

  const sortBy = useMemo(
    () => ({
      index: viewOptions.sorting.sortIndex,
      direction: viewOptions.sorting.isAscending ? SortByDirection.asc : SortByDirection.desc,
    }),
    [viewOptions.sorting.sortIndex, viewOptions.sorting.isAscending],
  );

  const setSorting = useCallback(
    (sorting: ViewSorting) => dispatch(viewActions.onListSortBy(sorting, viewType)),
    [dispatch, viewType],
  );

  const openAccessRequest = useCallback(
    (accessRequestElement?: AccessRequestModel) =>
      dispatch(
        modalActions.openModal(modals.ACCESS_REQUEST_DETAILS, {
          accessRequest: accessRequestElement,
          onClose: () => {
            refetchAccessRequests();
          },
        }),
      ),
    [dispatch],
  );

  const readMoreLink = (
    <ExternalLink href={installLinks.ACCESS_REQUEST_DOC_LINK}>
      Read more about Access Requests functionality
    </ExternalLink>
  );

  const tableContent = (
    <AccessRequestTable
      accessRequestItems={accessRequests}
      setSorting={setSorting}
      openDetailsAction={openAccessRequest}
      sortBy={sortBy}
      isPending={isAccessRequestsLoading}
      showClusterName={showClusterName}
    />
  );

  const pagination = (paginationVariant: 'top' | 'bottom') => (
    <AccessRequestTablePagination
      viewType={viewType}
      viewOptions={viewOptions}
      variant={paginationVariant}
      isDisabled={isPendingNoData}
    />
  );

  return (
    <>
      {isTabbedClustersEnabled ? (
        <Card>
          <CardHeader>
            <Flex>
              <FlexItem grow={{ default: 'grow' }}>
                <span>Cluster access requests</span>
                <Popover
                  bodyContent={
                    <Flex>
                      <FlexItem>
                        <p>{DESCRIPTION_TEXT}</p>
                      </FlexItem>
                    </Flex>
                  }
                  footerContent={
                    <Flex>
                      <FlexItem>
                        <p>{readMoreLink}</p>
                      </FlexItem>
                    </Flex>
                  }
                  enableFlip={false}
                >
                  <Button icon={<OutlinedQuestionCircleIcon />} variant="plain" />
                </Popover>
              </FlexItem>
              <FlexItem align={{ default: 'alignRight' }}>{pagination('top')}</FlexItem>
            </Flex>
          </CardHeader>
          <CardBody>
            {tableContent}
            <CardFooter>{pagination('bottom')}</CardFooter>
          </CardBody>
        </Card>
      ) : (
        <>
          <Card>
            <CardTitle>Access Requests</CardTitle>
            <CardBody>
              <div>{DESCRIPTION_TEXT}</div>
              {readMoreLink}
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              {pagination('top')}
              {tableContent}
              {pagination('bottom')}
            </CardBody>
          </Card>
        </>
      )}

      <ConnectedModal ModalComponent={AccessRequestModalForm} />
    </>
  );
};
