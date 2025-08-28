import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { EmptyState } from '@patternfly/react-core';
import {
  ActionsColumn,
  Table,
  TableVariant,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications';

import ErrorBox from '~/components/common/ErrorBox';
import { usePreviousProps } from '~/hooks/usePreviousProps';
import { useDeleteNotificationContact } from '~/queries/ClusterDetailsQueries/ClusterSupportTab/useDeleteNotificationContact';
import { useFetchNotificationContacts } from '~/queries/ClusterDetailsQueries/ClusterSupportTab/useFetchNotificationContacts';
import {
  buildNotificationsMeta,
  clearDeleteNotificationContacts,
} from '~/redux/actions/supportActions';
import { ErrorState } from '~/types/types';

type NotificationContactsCardProps = {
  subscriptionID: string;
  isDisabled: boolean;
  isAddNotificationContactSuccess: boolean;
  isAddNotificationContactPending: boolean;
  addNotificationStatus: string;
};

const NotificationContactsCard = ({
  subscriptionID,
  isDisabled,
  isAddNotificationContactPending,
  isAddNotificationContactSuccess,
  addNotificationStatus,
}: NotificationContactsCardProps) => {
  const dispatch = useDispatch();
  const addNotification = useAddNotification();
  const { notificationContacts, refetch } = useFetchNotificationContacts(subscriptionID);
  const {
    mutate,
    isSuccess: isDeleteNotificationSuccess,
    isPending: isDeleteNotificationPending,
    isError: isDeleteNotificationError,
    error: deleteNotificationError,
  } = useDeleteNotificationContact(subscriptionID);

  const previousAddContactResponsePending = usePreviousProps(addNotificationStatus);
  const previousDeleteContactResponsePending = usePreviousProps(isDeleteNotificationPending);

  useEffect(() => {
    if (notificationContacts.subscriptionID !== subscriptionID || !notificationContacts.pending) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notificationContacts.subscriptionID, subscriptionID, refetch]);

  useEffect(() => {
    if (addNotificationStatus === 'success' && previousAddContactResponsePending === 'pending') {
      // Display notification after successful addition of notification contact
      const title = 'Notification contact added successfully';
      // TODO investigate why there even can be several notification contacts
      // const title =
      // addNotificationResponse === 1
      //     ? 'Notification contact added successfully'
      //     : `${addContactResponse.count} notification contacts added successfully`;

      addNotification({
        variant: 'success',
        title,
        dismissable: false,
      });
    }

    // fetch contacts again if we just added/deleted one.
    if (
      ((isDeleteNotificationSuccess && previousDeleteContactResponsePending) ||
        (isAddNotificationContactSuccess && previousAddContactResponsePending)) &&
      !notificationContacts.pending
    ) {
      refetch();
    }
  }, [
    refetch,
    addNotificationStatus,
    isAddNotificationContactPending,
    isDeleteNotificationSuccess,
    isAddNotificationContactSuccess,
    dispatch,
    notificationContacts.pending,
    previousAddContactResponsePending,
    previousDeleteContactResponsePending,
    subscriptionID,
    addNotification,
  ]);

  const columns = [
    {
      title: 'Username',
    },
    { title: 'Email' },
    {
      title: 'First Name',
    },
    { title: 'Last Name' },
    { title: '', screenReaderText: 'Actions' },
  ];

  const actions = (userId: string) => [
    {
      title: 'Delete',
      onClick: () => {
        dispatch(clearDeleteNotificationContacts());
        mutate(userId);
        const title = 'Notification contact deleted successfully';
        if (!isDeleteNotificationError) {
          addNotification({
            variant: 'success',
            title,
            dismissable: false,
          });
          buildNotificationsMeta('Notification contact deleted successfully', userId);
        }
      },
      className: 'hand-pointer',
    },
  ];

  const tableRow = (contact: {
    userID: string | undefined;
    username: string;
    email: string | undefined;
    firstName: string | undefined;
    lastName: string | undefined;
  }) => (
    <Tr key={contact.userID}>
      <Td>{contact.username}</Td>
      <Td>{contact.email}</Td>
      <Td>{contact.firstName}</Td>
      <Td>{contact.lastName}</Td>
      {contact.userID ? (
        <Td isActionCell>
          <ActionsColumn items={actions(contact.userID)} isDisabled={isDisabled} />
        </Td>
      ) : null}
    </Tr>
  );

  return notificationContacts.contacts && notificationContacts.contacts.length ? (
    <>
      {isDeleteNotificationError && (
        <EmptyState>
          <ErrorBox
            message="Error deleting Notification Contact"
            response={deleteNotificationError.error as ErrorState}
          />
        </EmptyState>
      )}

      <Table aria-label="Notification Contacts" variant={TableVariant.compact}>
        <Thead>
          <Tr>
            {columns.map((header) => (
              <Th screenReaderText={header.screenReaderText}>{header.title}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>{notificationContacts?.contacts.map((contact) => tableRow(contact))}</Tbody>
      </Table>
    </>
  ) : null;
};

export default NotificationContactsCard;
