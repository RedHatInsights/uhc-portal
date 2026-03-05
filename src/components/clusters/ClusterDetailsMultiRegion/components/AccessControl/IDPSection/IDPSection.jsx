import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  Stack,
  StackItem,
  Title,
  Tooltip,
} from '@patternfly/react-core';
import {
  ActionsColumn,
  ExpandableRowContent,
  Table,
  TableVariant,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';

import { Link, useNavigate } from '~/common/routing';
import { LoadingSkeletonCard } from '~/components/clusters/common/LoadingSkeletonCard/LoadingSkeletonCard';
import { useFetchIDPsWithHTPUsers } from '~/queries/ClusterDetailsQueries/AccessControlTab/UserQueries/useFetchIDPsWithHTPUsers';
import { ENHANCED_HTPASSWRD } from '~/queries/featureGates/featureConstants';
import { useFeatureGate } from '~/queries/featureGates/useFetchFeatureGate';

import links from '../../../../../../common/installLinks.mjs';
import ClipboardCopyLinkButton from '../../../../../common/ClipboardCopyLinkButton';
import { modalActions } from '../../../../../common/Modal/ModalActions';
import {
  isSingleUserHtpasswd,
  singleUserHtpasswdMessage,
} from '../../IdentityProvidersPage/components/HtpasswdDetails/htpasswdUtilities';
import {
  getOauthCallbackURL,
  IDPformValues,
  IDPNeedsOAuthURL,
  IDPTypeNames,
} from '../../IdentityProvidersPage/IdentityProvidersHelper';

const IDPSection = (props) => {
  const {
    clusterID,
    clusterUrls,
    idpActions = {},
    clusterHibernating,
    isReadOnly,
    isHypershift,
    subscriptionID,
    cluster,
    isROSA,
  } = props;
  const isHTPasswdEnhanced = useFeatureGate(ENHANCED_HTPASSWRD);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const region = cluster?.subscription?.rh_region_id;

  const {
    data: identityProviders,
    isLoading: isIdentityProvidersLoading,
    isError: isIdentityProvidersError,
  } = useFetchIDPsWithHTPUsers(clusterID, region);

  const learnMoreLink = (
    <a
      rel="noopener noreferrer"
      href={
        isROSA ? links.ROSA_UNDERSTANDING_IDENTITY_PROVIDER : links.UNDERSTANDING_IDENTITY_PROVIDER
      }
      target="_blank"
    >
      Learn more.
    </a>
  );

  const pending = isIdentityProvidersLoading && !isIdentityProvidersError;

  const hasIDPs = !!identityProviders?.length;

  const readOnlyReason = isReadOnly && 'This operation is not available during maintenance';
  const hibernatingReason =
    clusterHibernating && 'This operation is not available while cluster is hibernating';
  const notAllowedReason = (action) =>
    `You do not have permission to ${action} an identity provider. Only cluster owners, cluster editors, identity provider editors, and Organization Administrators can ${action} identity providers.`;
  const disableReason = readOnlyReason || hibernatingReason;
  const cannotCreateReason = disableReason || (!idpActions.create && notAllowedReason('add'));

  const IDPDropdownOptions = (
    <DropdownList>
      {Object.values(IDPTypeNames).map((idpName) => (
        <DropdownItem
          key={idpName}
          onClick={() =>
            navigate(`/details/s/${subscriptionID}/add-idp/${idpName.toLowerCase()}`, {
              state: {
                cluster,
                clusterIDPs: identityProviders,
                subscriptionID,
              },
            })
          }
        >
          {idpName}
        </DropdownItem>
      ))}
    </DropdownList>
  );

  const toggleRef = useRef();

  let addIDPDropdown = (
    <Dropdown
      isOpen={dropdownOpen}
      onOpenChange={(isOpen) => setDropdownOpen(isOpen)}
      toggle={{
        toggleRef,
        toggleNode: (
          <MenuToggle
            id="add-identity-provider"
            ref={toggleRef}
            isDisabled={cannotCreateReason}
            isExpanded={dropdownOpen}
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
            }}
          >
            Add identity provider
          </MenuToggle>
        ),
      }}
    >
      {IDPDropdownOptions}
    </Dropdown>
  );
  if (cannotCreateReason) {
    addIDPDropdown = <Tooltip content={cannotCreateReason}>{addIDPDropdown}</Tooltip>;
  }

  const columnNames = {
    name: 'Name',
    type: 'Type',
    callbackUrl: 'Auth callback URL',
  };

  const idpActionResolver = (idp) => {
    const editIDPAction = {
      title: 'Edit',
      onClick: () => {
        navigate(`/details/s/${subscriptionID}/edit-idp/${idp.name}`);
      },
    };

    if (
      !idpActions.update ||
      (idp.type === IDPformValues.HTPASSWD && isSingleUserHtpasswd(idp.htpasswd))
    ) {
      editIDPAction.isAriaDisabled = true;
      editIDPAction.tooltipProps = {
        content: !idpActions.update ? notAllowedReason('edit') : singleUserHtpasswdMessage,
      };
    }
    const deleteIDPAction = {
      title: 'Delete',
      isAriaDisabled: !idpActions.delete,
      onClick: () => {
        dispatch(
          modalActions.openModal('delete-idp', {
            clusterID,
            idpID: idp.id,
            idpName: idp.name,
            idpType: IDPTypeNames[idp.type],
            region,
          }),
        );
      },
    };
    if (!idpActions.delete) {
      deleteIDPAction.isAriaDisabled = true;
      deleteIDPAction.tooltipProps = { content: notAllowedReason('delete') };
    }

    if (IDPTypeNames[idp.type] === IDPTypeNames[IDPformValues.HTPASSWD] && !isHTPasswdEnhanced) {
      return [deleteIDPAction];
    }
    return [editIDPAction, deleteIDPAction];
  };

  const [expandedIdps, setExpandedIdps] = React.useState([]);
  const setIdpExpanded = (idp, isExpanding = true) =>
    setExpandedIdps((prevExpanded) => {
      const otherExpandedIdps = prevExpanded.filter((r) => r !== idp.id);
      return isExpanding ? [...otherExpandedIdps, idp.id] : otherExpandedIdps;
    });

  const isIdpExpanded = (idp) => expandedIdps.includes(idp.id);

  return pending ? (
    <LoadingSkeletonCard />
  ) : (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h2" size="lg" className="card-title">
          Identity providers
        </Title>
        <p>Configure identity providers to allow users to log into the cluster. {learnMoreLink}</p>
      </StackItem>
      <StackItem>{addIDPDropdown}</StackItem>
      <StackItem>
        {hasIDPs && idpActions.list && (
          <Table aria-label="Identity Providers" variant={TableVariant.compact}>
            <Thead>
              <Tr>
                <Th screenReaderText="Row expansion" />
                <Th width={30}>{columnNames.name}</Th>
                <Th width={30}>{columnNames.type}</Th>
                <Th width={30}>{columnNames.callbackUrl}</Th>
                <Th screenReaderText="Action" />
              </Tr>
            </Thead>
            {identityProviders.map((idp, rowIndex) => {
              const actions = idpActionResolver(idp);
              const htpUsersCount = idp.htpUsers?.length;

              return (
                <Tbody key={idp.id} isExpanded={isIdpExpanded(idp)}>
                  <Tr>
                    <Td
                      expand={
                        idp?.htpUsers && idpActions.update && isHTPasswdEnhanced
                          ? {
                              rowIndex,
                              isExpanded: isIdpExpanded(idp),
                              onToggle: () => setIdpExpanded(idp, !isIdpExpanded(idp)),
                              expandId: idp.id,
                            }
                          : undefined
                      }
                    />
                    <Td dataLabel={columnNames.name} modifier="truncate">
                      {idp.name}
                    </Td>
                    <Td dataLabel={columnNames.type}>{IDPTypeNames[idp.type] ?? idp.type}</Td>
                    <Td dataLabel={columnNames.callbackUrl}>
                      {IDPNeedsOAuthURL(idp.type) ? (
                        <ClipboardCopyLinkButton
                          className="access-control-tables-copy"
                          text={getOauthCallbackURL(clusterUrls, idp.name, isHypershift)}
                        >
                          Copy URL to clipboard
                        </ClipboardCopyLinkButton>
                      ) : (
                        'N/A'
                      )}
                    </Td>
                    <Td isActionCell>
                      <ActionsColumn items={actions} isDisabled={!!disableReason} />
                    </Td>
                  </Tr>
                  {idp?.htpUsers && idpActions.update && isHTPasswdEnhanced ? (
                    <Tr
                      key="expandable-row"
                      isExpanded={isIdpExpanded(idp)}
                      data-testid="expandable-row"
                    >
                      <Td />
                      <Td dataLabel="Users" noPadding colSpan={4}>
                        <ExpandableRowContent>
                          <ul className="pf-v6-u-mb-md" style={{ wordBreak: 'break-word' }}>
                            {idp.htpUsers.slice(0, 5).map((user) => (
                              <li key={user.id}>{user.username}</li>
                            ))}
                            <li>
                              <Link to={`/details/s/${subscriptionID}/edit-idp/${idp.name}`}>
                                View all users ({htpUsersCount})
                              </Link>
                            </li>
                          </ul>
                        </ExpandableRowContent>
                      </Td>
                    </Tr>
                  ) : null}
                </Tbody>
              );
            })}
          </Table>
        )}
      </StackItem>
    </Stack>
  );
};

IDPSection.propTypes = {
  cluster: PropTypes.object,
  clusterID: PropTypes.string,
  clusterUrls: PropTypes.shape({
    console: PropTypes.string,
    api: PropTypes.string,
  }),
  idpActions: PropTypes.shape({
    get: PropTypes.bool,
    list: PropTypes.bool,
    create: PropTypes.bool,
    update: PropTypes.bool,
    delete: PropTypes.bool,
  }),
  clusterHibernating: PropTypes.bool,
  isReadOnly: PropTypes.bool,
  isHypershift: PropTypes.bool,
  subscriptionID: PropTypes.string,
  isROSA: PropTypes.bool.isRequired,
};

export default IDPSection;
