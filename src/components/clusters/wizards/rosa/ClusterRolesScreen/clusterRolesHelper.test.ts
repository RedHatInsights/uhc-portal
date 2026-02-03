import {
  MAX_CLUSTER_NAME_LENGTH,
  MAX_CUSTOM_OPERATOR_ROLES_PREFIX_LENGTH,
} from '~/common/validators';

import { createOperatorRolesPrefix, getOperatorRolesCommand } from './clusterRolesHelper';

const defaultOptions = {
  isHypershiftSelected: true,
  byoOidcConfigID: '22phvja6kkki8f7h8mmk46a7j2h26uk1',
  customOperatorRolesPrefix: 'operator-prefix',
  installerRoleArn: 'arn:aws:iam::000000000006',
  sharedVpcRoleArn: 'arn:aws:iam::444234423423',
};

describe('getOperatorRolesCommand', () => {
  test('should return the proper operator roles command for hypershift clusters', () => {
    const options = { ...defaultOptions };
    const command = getOperatorRolesCommand(options);

    expect(command).toBe(
      `rosa create operator-roles --prefix "${options.customOperatorRolesPrefix}" --oidc-config-id "${options.byoOidcConfigID}" --hosted-cp --installer-role-arn ${options.installerRoleArn}`,
    );
  });

  test('should return the proper operator roles command for classic clusters with shared vpc', () => {
    const options = { ...defaultOptions, isHypershiftSelected: false };
    const command = getOperatorRolesCommand(options);

    expect(command).toBe(
      `rosa create operator-roles --prefix "${options.customOperatorRolesPrefix}" --oidc-config-id "${options.byoOidcConfigID}" --installer-role-arn ${options.installerRoleArn}`,
    );
  });

  test('should return the proper operator roles command for classic clusters without shared vpc', () => {
    const options = { ...defaultOptions, isHypershiftSelected: true };
    const command = getOperatorRolesCommand(options);

    expect(command).toBe(
      `rosa create operator-roles --prefix "${options.customOperatorRolesPrefix}" --oidc-config-id "${options.byoOidcConfigID}" --hosted-cp --installer-role-arn ${options.installerRoleArn}`,
    );
  });

  test('should return an empty string if "byoOidcConfigID" is empty', () => {
    const noByoID = { ...defaultOptions, byoOidcConfigID: '' };
    const command = getOperatorRolesCommand(noByoID);

    expect(command).toBe('');
  });

  test('should return an empty string if "customOperatorRolesPrefix" is empty', () => {
    const noOperatorPrefix = { ...defaultOptions, customOperatorRolesPrefix: '' };
    const command = getOperatorRolesCommand(noOperatorPrefix);

    expect(command).toBe('');
  });

  test('should return an empty string if "customOperatorRolesPrefix" is not valid', () => {
    const noOperatorPrefix = { ...defaultOptions, customOperatorRolesPrefix: 'invalid:value' };
    const command = getOperatorRolesCommand(noOperatorPrefix);

    expect(command).toBe('');
  });
});

describe('createOperatorRolesPrefix', () => {
  test('should not exceed max character limit', () => {
    const clusterName = 'a'.repeat(MAX_CLUSTER_NAME_LENGTH);
    const command = createOperatorRolesPrefix(clusterName);

    expect(command.length).toBeLessThanOrEqual(MAX_CUSTOM_OPERATOR_ROLES_PREFIX_LENGTH);
  });
});
