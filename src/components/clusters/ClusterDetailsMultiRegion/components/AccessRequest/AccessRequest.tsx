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
  PageSection,
  Popover,
} from '@patternfly/react-core';
import OutlinedQuestionCircleIcon from '@patternfly/react-icons/dist/esm/icons/outlined-question-circle-icon';
import { SortByDirection } from '@patternfly/react-table';

import installLinks from '~/common/installLinks.mjs';
import useOrganization from '~/components/CLILoginPage/useOrganization';
import ButtonWithTooltip from '~/components/common/ButtonWithTooltip';
import ExternalLink from '~/components/common/ExternalLink';
import ConnectedModal from '~/components/common/Modal/ConnectedModal';
import { modalActions } from '~/components/common/Modal/ModalActions';
import modals from '~/components/common/Modal/modals';
import { useSetFilteredTotal } from '~/hooks/useSetFilteredTotal';
import {
  refetchAccessRequests,
  useFetchAccessRequests,
} from '~/queries/ClusterDetailsQueries/AccessRequestTab/useFetchAccessRequests';
import { useFetchActionsPermissions } from '~/queries/ClusterDetailsQueries/useFetchActionsPermissions';
import { queryConstants } from '~/queries/queriesConstants';
import { viewActions } from '~/redux/actions/viewOptionsActions';
import { viewConstants } from '~/redux/constants';
import { useGlobalState } from '~/redux/hooks';
import {
  AccessRequest as AccessRequestModel,
  AccessRequestStatusState,
} from '~/types/access_transparency.v1';
import { ViewSorting } from '~/types/types';

import AccessRequestModalForm from './components/AccessRequestModalForm';
import { AccessRequestNewModal } from './components/AccessRequestNewModal';
import AccessRequestTable from './components/AccessRequestTable';
import AccessRequestTablePagination from './components/AccessRequestTablePagination';

import './AccessRequest.scss';

type AccessRequestVariant = 'page' | 'card';

type AccessRequestProps = {
  variant?: AccessRequestVariant;
  subscriptionId?: string;
  showClusterName?: boolean;
};

const DESCRIPTION_TEXT =
  'Access requests to customer data on Red Hat OpenShift Service on AWS clusters and the corresponding cloud accounts can be created by SRE either in response to a customer-initiated support ticket or in response to alerts received by SRE, as part of the standard incident response process.';

export const AccessRequest = ({
  variant = 'card',
  subscriptionId,
  showClusterName = false,
}: AccessRequestProps) => {
  const dispatch = useDispatch();
  const viewType = viewConstants.ACCESS_REQUESTS_VIEW;
  const viewOptions = useGlobalState((state) => state.viewOptions[viewType], shallowEqual);
  const { organization } = useOrganization();
  const [isNewModalOpen, setIsNewModalOpen] = React.useState(false);

  const { data: accessRequests, isLoading: isAccessRequestsLoading } = useFetchAccessRequests({
    subscriptionId,
    organizationId: !subscriptionId ? organization?.id : undefined,
    params: viewOptions,
    isAccessProtectionLoading: false,
    accessProtection: { enabled: true },
  });

  const { canEdit } = useFetchActionsPermissions(
    subscriptionId || '',
    queryConstants.FETCH_CLUSTER_DETAILS_QUERY_KEY,
  );

  const isPendingNoData = useMemo(
    () => isAccessRequestsLoading || !accessRequests?.length,
    [isAccessRequestsLoading, accessRequests],
  );

  const isAccessRequestPending = useMemo(
    () =>
      accessRequests?.some(
        (accessRequest) => accessRequest.status?.state === AccessRequestStatusState.Pending,
      ) ?? false,
    [accessRequests],
  );

  // Update total count after filtering
  useSetFilteredTotal(accessRequests, isAccessRequestsLoading, viewOptions.totalCount, viewType);

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

  const handleClose = () => {
    setIsNewModalOpen(false);
  };

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
  const disableNewRequestReason =
    !canEdit && 'You do not have permission to create new access requests for this cluster.';
  const accessRequestButton = (
    <Flex>
      <FlexItem align={{ default: 'alignLeft' }}>
        <ButtonWithTooltip
          variant="secondary"
          onClick={() => setIsNewModalOpen(true)}
          disableReason={disableNewRequestReason}
        >
          Create access request
        </ButtonWithTooltip>
      </FlexItem>
    </Flex>
  );

  return (
    <>
      {variant === 'page' && (
        <PageSection hasBodyWrapper={false}>
          <PageSection hasBodyWrapper={false} hasShadowBottom hasShadowTop>
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
            </Flex>
            <Card>
              <CardHeader>
                <Flex>
                  <FlexItem align={{ default: 'alignRight' }}>{pagination('top')}</FlexItem>
                </Flex>
              </CardHeader>
              <CardBody>
                {tableContent}
                <CardFooter>{pagination('bottom')}</CardFooter>
              </CardBody>
            </Card>
          </PageSection>
        </PageSection>
      )}

      {variant === 'card' && (
        <>
          <Card className="ocm-c-access-request__card">
            <CardTitle className="ocm-c-access-request__card--header">Access Requests</CardTitle>
            <CardBody className="ocm-c-access-request__card--body">
              <div className="access-request-subtitle">{DESCRIPTION_TEXT}</div>
              {readMoreLink}
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              {!isAccessRequestPending && <Flex>{accessRequestButton}</Flex>}
              {pagination('top')}
              {tableContent}
              {pagination('bottom')}
            </CardBody>
          </Card>
          {subscriptionId && (
            <AccessRequestNewModal
              subscriptionId={subscriptionId}
              isModalOpen={isNewModalOpen}
              onClose={handleClose}
            />
          )}
        </>
      )}

      <ConnectedModal ModalComponent={AccessRequestModalForm} />
    </>
  );
};
