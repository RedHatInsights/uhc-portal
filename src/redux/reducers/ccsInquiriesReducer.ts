import { produce } from 'immer';

import { getErrorState } from '~/common/errors';
import {
  CLEAR_ALL_CLOUD_PROVIDER_INQUIRIES,
  CLEAR_CCS_CREDENTIALS_INQUIRY,
  CLEAR_LIST_VPCS,
  InquiriesAction,
  LIST_GCP_KEY_RINGS,
  LIST_GCP_KEYS,
  LIST_REGIONS,
  LIST_VPCS,
  VALIDATE_CLOUD_PROVIDER_CREDENTIALS,
} from '~/redux/actions/ccsInquiriesActions';
import {
  baseRequestState,
  FULFILLED_ACTION,
  PENDING_ACTION,
  REJECTED_ACTION,
} from '~/redux/reduxHelpers';
import type { PromiseReducerState } from '~/redux/stateTypes';
import type { PromiseActionType } from '~/redux/types';
import {
  CloudRegion,
  CloudVpc,
  EncryptionKey,
  KeyRing,
  SecurityGroup,
} from '~/types/clusters_mgmt.v1';
import { AWSCredentials } from '~/types/types';

// Credentials are only stored here as part of metadata on requests,
// to allow checking whether existing data is relevant.
// For GCP, it happened to be easier in the actions to store the unparsed JSON;
// this is not a critical choice, as long as it's comparable.
type GCPCredentialsJSON = string;

export type VPCResponse = {
  credentials?: AWSCredentials | GCPCredentialsJSON;
  cloudProvider?: string;
  region?: string;
  subnet?: string; // if set on request, only VPC connected to that subnet were listed.
  data: {
    items: CloudVpc[];
  };
};

export type State = {
  ccsCredentialsValidity: PromiseReducerState<{
    cloudProvider?: string;
    credentials?: AWSCredentials | GCPCredentialsJSON;
  }>;
  gcpKeyRings: PromiseReducerState<{
    cloudProvider?: string;
    credentials?: GCPCredentialsJSON;
    keyLocation?: string;
    data: {
      items: KeyRing[];
    };
  }>;
  gcpKeys: PromiseReducerState<{
    cloudProvider?: string;
    credentials?: GCPCredentialsJSON;
    keyLocation?: string;
    keyRing?: string;
    data: {
      items: EncryptionKey[];
    };
  }>;
  regions: PromiseReducerState<{
    cloudProvider?: string;
    credentials?: AWSCredentials | GCPCredentialsJSON;
    openshiftVersionId?: string; // if set on request, only compatibile regions were listed.
    data: {
      byID: {
        [id: string]: CloudRegion;
      };
    };
  }>;
  vpcs: PromiseReducerState<VPCResponse>;
};

const initialState: State = {
  ccsCredentialsValidity: {
    ...baseRequestState,
    cloudProvider: undefined,
    credentials: undefined,
  },
  gcpKeyRings: {
    ...baseRequestState,
    cloudProvider: undefined,
    credentials: undefined,
    keyLocation: undefined,
    data: {
      items: [],
    },
  },
  gcpKeys: {
    ...baseRequestState,
    cloudProvider: undefined,
    credentials: undefined,
    keyLocation: undefined,
    keyRing: undefined,
    data: {
      items: [],
    },
  },
  regions: {
    ...baseRequestState,
    cloudProvider: undefined,
    credentials: undefined,
    openshiftVersionId: undefined,
    data: {
      byID: {},
    },
  },
  vpcs: {
    ...baseRequestState,
    cloudProvider: undefined,
    credentials: undefined,
    region: undefined,
    data: {
      items: [],
    },
  },
};

export const securityGroupsSort = (a: SecurityGroup, b: SecurityGroup) => {
  // Sorts first VPCs that have a name over those that don't
  if (a.name && !b.name) {
    return -1;
  }
  if (b.name && !a.name) {
    return 1;
  }
  // Then the rest are sorted alphabetically by their name or ID
  const aId = a.name || a.id || '';
  const bId = b.name || b.id || '';
  return aId.localeCompare(bId);
};

/**
 * Enriches VPC response
 * Security groups: returns only the non-RH managed, and sorts them by display order
 */
export const processAWSVPCs = (vpcs: CloudVpc[]) => {
  const preProcessedVpcs = vpcs.map((vpc) => {
    if (vpc.aws_security_groups) {
      const sortedSecurityGroups = vpc.aws_security_groups.filter((sg) => !sg.red_hat_managed);
      sortedSecurityGroups.sort(securityGroupsSort);
      return {
        ...vpc,
        aws_security_groups: sortedSecurityGroups,
      };
    }
    return vpc;
  });
  return {
    items: preProcessedVpcs,
  };
};

/** Indexes regions by id. */
export const indexRegions = (data: { items?: CloudRegion[] }) => {
  const byID: { [id: string]: CloudRegion } = {};
  (data.items || []).forEach((region) => {
    if (region.id) {
      byID[region.id] = region;
    }
  });
  return byID;
};

function ccsInquiriesReducer(
  state: State = initialState,
  action: PromiseActionType<InquiriesAction>,
): State {
  // eslint-disable-next-line consistent-return
  return produce(state, (draft: State) => {
    // eslint-disable-next-line default-case
    switch (action.type) {
      case PENDING_ACTION(VALIDATE_CLOUD_PROVIDER_CREDENTIALS):
        draft.ccsCredentialsValidity.pending = true;
        break;
      case FULFILLED_ACTION(VALIDATE_CLOUD_PROVIDER_CREDENTIALS):
        draft.ccsCredentialsValidity = {
          ...baseRequestState,
          fulfilled: true,
          credentials: action.meta.credentials,
          cloudProvider: action.meta.cloudProvider,
        };
        break;
      case REJECTED_ACTION(VALIDATE_CLOUD_PROVIDER_CREDENTIALS):
        draft.ccsCredentialsValidity = {
          ...initialState.ccsCredentialsValidity,
          ...getErrorState(action),
          credentials: action.meta?.credentials,
          cloudProvider: action.meta?.cloudProvider,
        };
        break;
      case CLEAR_CCS_CREDENTIALS_INQUIRY:
        return {
          ...state,
          ccsCredentialsValidity: {
            ...initialState.ccsCredentialsValidity,
          },
        };

      case PENDING_ACTION(LIST_GCP_KEY_RINGS):
        draft.gcpKeyRings.pending = true;
        break;
      case FULFILLED_ACTION(LIST_GCP_KEY_RINGS):
        draft.gcpKeyRings = {
          ...baseRequestState,
          fulfilled: true,
          cloudProvider: action.meta?.cloudProvider,
          credentials: action.meta?.credentials,
          keyLocation: action.meta?.keyLocation,
          data: { items: action.payload.data.items || [] },
        };
        break;
      case REJECTED_ACTION(LIST_GCP_KEY_RINGS):
        draft.gcpKeyRings = {
          ...initialState.gcpKeyRings,
          ...getErrorState(action),
          cloudProvider: action.meta?.cloudProvider,
          credentials: action.meta?.credentials,
          keyLocation: action.meta?.keyLocation,
        };
        break;

      case PENDING_ACTION(LIST_GCP_KEYS):
        draft.gcpKeys.pending = true;
        break;
      case FULFILLED_ACTION(LIST_GCP_KEYS):
        draft.gcpKeys = {
          ...baseRequestState,
          fulfilled: true,
          cloudProvider: action.meta?.cloudProvider,
          credentials: action.meta?.credentials,
          keyLocation: action.meta?.keyLocation,
          keyRing: action.meta?.keyRing,
          data: { items: action.payload.data.items || [] },
        };
        break;
      case REJECTED_ACTION(LIST_GCP_KEYS):
        draft.gcpKeys = {
          ...initialState.gcpKeys,
          ...getErrorState(action),
          cloudProvider: action.meta?.cloudProvider,
          credentials: action.meta?.credentials,
          keyLocation: action.meta?.keyLocation,
          keyRing: action.meta?.keyRing,
        };
        break;

      case PENDING_ACTION(LIST_REGIONS):
        draft.regions.pending = true;
        break;
      case FULFILLED_ACTION(LIST_REGIONS):
        draft.regions = {
          ...baseRequestState,
          fulfilled: true,
          cloudProvider: action.meta?.cloudProvider,
          credentials: action.meta?.credentials,
          openshiftVersionId: action.meta?.openshiftVersionId,
          data: {
            byID: indexRegions(action.payload.data),
          },
        };
        break;
      case REJECTED_ACTION(LIST_REGIONS):
        draft.regions = {
          ...initialState.regions,
          ...getErrorState(action),
          cloudProvider: action.meta?.cloudProvider,
          credentials: action.meta?.credentials,
          openshiftVersionId: action.meta?.openshiftVersionId,
        };
        break;

      case PENDING_ACTION(LIST_VPCS):
        draft.vpcs.pending = true;
        break;
      case FULFILLED_ACTION(LIST_VPCS): {
        const items = action.payload.data.items || [];
        const data = action.meta?.cloudProvider === 'aws' ? processAWSVPCs(items) : { items };
        draft.vpcs = {
          ...baseRequestState,
          fulfilled: true,
          credentials: action.meta?.credentials,
          cloudProvider: action.meta?.cloudProvider,
          region: action.meta?.region,
          subnet: action.meta?.subnet,
          data,
        };
        break;
      }
      case REJECTED_ACTION(LIST_VPCS):
        draft.vpcs = {
          ...initialState.vpcs,
          ...getErrorState(action),
          credentials: action.meta?.credentials,
          cloudProvider: action.meta?.cloudProvider,
          region: action.meta?.region,
        };
        break;
      case CLEAR_LIST_VPCS:
        return {
          ...state,
          vpcs: initialState.vpcs,
        };

      case CLEAR_ALL_CLOUD_PROVIDER_INQUIRIES:
        return { ...initialState };
    }
  });
}

ccsInquiriesReducer.initialState = initialState;

export default ccsInquiriesReducer;
