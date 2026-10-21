import { BulkDeleteHtpasswdUserError } from '~/queries/types';
import { HtPasswdIdentityProvider } from '~/types/clusters_mgmt.v1';

export const isSingleUserHtpasswd = (htpasswd: HtPasswdIdentityProvider) => !!htpasswd?.username;

export const singleUserHtpasswdMessage =
  'Single user htpasswd IDPs cannot be modified. Delete the IDP and recreate it as a multi user htpasswd IDP.';

export type GroupedBulkDeleteHtpasswdUserError = {
  usernames: string[];
  userIds?: string[];
  error: BulkDeleteHtpasswdUserError['error'];
};

// Groups bulk-delete failures that share the same underlying error.
export const groupBulkDeleteHtpasswdUserErrors = (
  failedDeletions: BulkDeleteHtpasswdUserError[],
): GroupedBulkDeleteHtpasswdUserError[] => {
  const groups = new Map<string, GroupedBulkDeleteHtpasswdUserError>();

  failedDeletions.forEach((failure) => {
    const groupKey =
      failure.error?.errorMessage?.replace(/HTPasswd user '[^']+'/gi, "HTPasswd user '*'") ??
      'unknown';

    const existing = groups.get(groupKey);
    if (existing) {
      if (failure.username) {
        existing.usernames.push(failure.username);
      }
      if (failure.userId) {
        (existing.userIds ??= []).push(failure.userId);
      }
      return;
    }

    groups.set(groupKey, {
      usernames: failure.username ? [failure.username] : [],
      ...(failure.userId ? { userIds: [failure.userId] } : {}),
      error: failure.error,
    });
  });

  return Array.from(groups.values()).map((group) => ({
    ...group,
    error: {
      ...group.error,
      errorMessage:
        group.userIds && group.userIds.length > 0 && group.error.errorMessage
          ? group.error.errorMessage.replace(
              /HTPasswd user '[^']+'/i,
              `HTPasswd user '${group.userIds.join(', ')}'`,
            )
          : group.error.errorMessage,
    },
  }));
};
