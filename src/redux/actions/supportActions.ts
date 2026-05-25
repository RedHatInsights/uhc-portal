import { action, ActionType } from 'typesafe-actions';

import {
  ADD_NOTIFICATION_CONTACT,
  DELETE_NOTIFICATION_CONTACT,
  GET_NOTIFICATION_CONTACTS,
  GET_SUPPORT_CASES,
  NOTIFICATION_CONTACTS,
} from '~/redux/constants/supportConstants';
import { accountsService } from '~/services';

import { INVALIDATE_ACTION } from '../reduxHelpers';

/** Build a notification
 * Meta object with notifications. Notifications middleware uses it to get prepared to response to:
 * - <type>_PENDING (not used) - notification is sent right after the request was created
 * - <type>_FULFILLED - once promise is resolved
 * - <type>_PENDING (not used) - once promise is rejected
 *
 * @param {string} name - name of a cluster
 * @param {string} action - action to display notification for (archive/unarchive)
 * @returns {object} - notification object
 *
 * @see https://github.com/RedHatInsights/frontend-components/blob/master/packages/notifications/doc/notifications.md
 */
export const buildNotificationsMeta = (title: string, accountID: string) => ({
  notifications: {
    fulfilled: {
      variant: 'success',
      title,
      dismissDelay: 8000,
      dismissable: false,
    },
  },
  accountID,
});

const clearNotificationContacts = () => action(INVALIDATE_ACTION(NOTIFICATION_CONTACTS));
const clearAddNotificationContacts = () => action(INVALIDATE_ACTION(ADD_NOTIFICATION_CONTACT));
const clearDeleteNotificationContacts = () =>
  action(INVALIDATE_ACTION(DELETE_NOTIFICATION_CONTACT));

const getNotificationContacts = (subscriptionID: string) =>
  action(GET_NOTIFICATION_CONTACTS, accountsService.getNotificationContacts(subscriptionID), {
    subscriptionID,
  });

const addNotificationContact = (subscriptionID: string, username: string) =>
  action(
    ADD_NOTIFICATION_CONTACT,
    accountsService.addNotificationContact(subscriptionID, username),
  );

const deleteNotificationContact = (subscriptionID: string, accountID: string) =>
  action(
    DELETE_NOTIFICATION_CONTACT,
    accountsService.deleteNotificationContact(subscriptionID, accountID),
    buildNotificationsMeta('Notification contact deleted successfully', accountID),
  );

const getSupportCases = (subscriptionID: string) =>
  action(GET_SUPPORT_CASES, accountsService.getSupportCases(subscriptionID), {
    subscriptionID,
  });

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const supportActions = {
  clearNotificationContacts,
  clearAddNotificationContacts,
  clearDeleteNotificationContacts,
  getNotificationContacts,
  addNotificationContact,
  deleteNotificationContact,
  getSupportCases,
};

type SupportActions = ActionType<typeof supportActions>;

export {
  clearNotificationContacts,
  clearAddNotificationContacts,
  clearDeleteNotificationContacts,
  getNotificationContacts,
  addNotificationContact,
  deleteNotificationContact,
  getSupportCases,
  SupportActions,
};
