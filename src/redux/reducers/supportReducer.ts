import { produce } from 'immer';

import { SupportCase } from '~/components/clusters/ClusterDetailsMultiRegion/components/Support/components/model/SupportCase';
import {
  ADD_NOTIFICATION_CONTACT,
  DELETE_NOTIFICATION_CONTACT,
  GET_NOTIFICATION_CONTACTS,
  GET_SUPPORT_CASES,
  NOTIFICATION_CONTACTS,
} from '~/redux/constants/supportConstants';

import { getErrorState } from '../../common/errors';
import { SupportActions } from '../actions/supportActions';
import {
  baseRequestState,
  FULFILLED_ACTION,
  INVALIDATE_ACTION,
  PENDING_ACTION,
  REJECTED_ACTION,
} from '../reduxHelpers';
import { PromiseReducerState } from '../state';
import type { PromiseActionType } from '../types';

type Contact = {
  userID?: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
};

type NotificationContact = { subscriptionID?: string; contacts: Contact[]; clusterID?: string };
type SupportCases = { cases: SupportCase[]; clusterID?: string; subscriptionID: string };
type ContactResponse = { count?: number; errorMessage?: string };

type SupportReducerState = {
  notificationContacts: PromiseReducerState<NotificationContact>;
  deleteContactResponse: PromiseReducerState<{ accountID: string }>;
  addContactResponse: PromiseReducerState<ContactResponse>;
  supportCases: PromiseReducerState<SupportCases>;
};

const initialState: SupportReducerState = {
  notificationContacts: {
    ...baseRequestState,
    contacts: [],
    clusterID: '',
  },
  deleteContactResponse: {
    ...baseRequestState,
  },
  addContactResponse: {
    ...baseRequestState,
  },
  supportCases: {
    ...baseRequestState,
    cases: [],
    clusterID: '',
    subscriptionID: '',
  },
};

const supportReducer = (state = initialState, action: PromiseActionType<SupportActions>) =>
  // eslint-disable-next-line consistent-return
  produce(state, (draft) => {
    let data;
    let items;
    let cases;
    // eslint-disable-next-line default-case
    switch (action.type) {
      // GET NOTIFICATION CONTACTS
      case PENDING_ACTION(GET_NOTIFICATION_CONTACTS):
        draft.notificationContacts.pending = true;
        break;

      case FULFILLED_ACTION(GET_NOTIFICATION_CONTACTS):
        items = action.payload?.data?.items || [];
        draft.notificationContacts = {
          ...baseRequestState,
          fulfilled: true,
          subscriptionID: action.meta?.subscriptionID,
          contacts: items.map((contact) => ({
            userID: contact.id,
            username: contact.username,
            email: contact.email,
            firstName: contact.first_name,
            lastName: contact.last_name,
          })),
        };
        break;
      case REJECTED_ACTION(GET_NOTIFICATION_CONTACTS):
        draft.notificationContacts = {
          ...initialState.notificationContacts,
          ...getErrorState(action),
        };
        break;

      // DELETE_NOTIFICATION_CONTACT
      case PENDING_ACTION(DELETE_NOTIFICATION_CONTACT):
        draft.deleteContactResponse.pending = true;
        draft.deleteContactResponse.accountID = action.meta.accountID;
        break;
      case FULFILLED_ACTION(DELETE_NOTIFICATION_CONTACT):
        draft.deleteContactResponse.pending = false;
        draft.deleteContactResponse.fulfilled = true;
        // Remove deleted user from contacts to have a proper display before fetch will finish
        draft.notificationContacts.contacts = draft.notificationContacts.contacts?.filter(
          (contact) => contact.userID !== draft.deleteContactResponse.accountID,
        );
        break;
      case REJECTED_ACTION(DELETE_NOTIFICATION_CONTACT):
        draft.deleteContactResponse = {
          ...getErrorState(action),
        };
        break;
      case INVALIDATE_ACTION(DELETE_NOTIFICATION_CONTACT):
        draft.deleteContactResponse = {
          ...baseRequestState,
        };
        break;

      // ADD_NOTIFICATION_CONTACT
      case PENDING_ACTION(ADD_NOTIFICATION_CONTACT):
        draft.addContactResponse.pending = true;
        break;
      case FULFILLED_ACTION(ADD_NOTIFICATION_CONTACT):
        draft.addContactResponse.pending = false;
        draft.addContactResponse.fulfilled = true;
        data = action.payload?.data || [];
        data = Array.isArray(data) ? data : [data];
        draft.addContactResponse.count = data.length;
        // add the new users to contacts to display them before fetch will finish
        data.forEach((contact) =>
          draft.notificationContacts.contacts?.push({
            userID: contact.id,
            username: contact.username,
            email: contact.email,
            firstName: contact.first_name,
            lastName: contact.last_name,
          }),
        );
        break;
      case REJECTED_ACTION(ADD_NOTIFICATION_CONTACT):
        draft.addContactResponse = {
          ...(getErrorState(action) as any),
        };
        // User-friendly message is in `reason` field. Not matching with AccountList model
        draft.addContactResponse.errorMessage =
          (action.payload?.response?.data as any)?.reason || draft.addContactResponse.errorMessage;
        break;
      case INVALIDATE_ACTION(ADD_NOTIFICATION_CONTACT):
        draft.addContactResponse = {
          ...baseRequestState,
        };
        break;
      // GET SUPPORT CASES
      case PENDING_ACTION(GET_SUPPORT_CASES):
        draft.supportCases.pending = true;
        break;
      case FULFILLED_ACTION(GET_SUPPORT_CASES):
        // TODO: not matching with SupportCasesCreatedResponse object
        cases = (action.payload?.data as any)?.response?.docs || [];
        draft.supportCases = {
          ...baseRequestState,
          fulfilled: true,
          subscriptionID: action.meta?.subscriptionID,
          cases: cases.map((supportCase: any) => ({
            summary: supportCase.case_summary,
            caseID: supportCase.case_number,
            ownerID: supportCase.case_owner,
            severity: supportCase.case_severity,
            status: supportCase.case_status,
            lastModifiedBy: supportCase.case_lastModifiedByName,
            lastModifiedDate: supportCase.case_lastModifiedDate,
          })),
        };
        break;
      case REJECTED_ACTION(GET_SUPPORT_CASES):
        draft.supportCases = {
          ...initialState.supportCases,
          ...getErrorState(action),
        };
        break;

      // INVALIDATE NOTIFICATION_CONTACTS
      case INVALIDATE_ACTION(NOTIFICATION_CONTACTS):
        return initialState;
    }
  });

supportReducer.initialState = initialState;

export { initialState, supportReducer, Contact };

export default supportReducer;
