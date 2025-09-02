import validators, {
  awsNumericAccountID,
  checkClusterConsoleURL,
  checkClusterUUID,
  checkCustomOperatorRolesPrefix,
  checkDisconnectedConsoleURL,
  checkDisconnectedMemCapacity,
  checkDisconnectedSockets,
  checkDisconnectedvCPU,
  checkGithubTeams,
  checkIdentityProviderName,
  checkKeyValueFormat,
  checkLabels,
  checkOpenIDIssuer,
  checkRouteSelectors,
  checkUserID,
  clusterAutoScalingValidators,
  clusterNameAsyncValidation,
  clusterNameValidation,
  createPessimisticValidator,
  domainPrefixAsyncValidation,
  domainPrefixValidation,
  required,
  validateAWSKMSKeyARN,
  validateGCPKMSServiceAccount,
  validateGCPSubnet,
  validateHTPasswdPassword,
  validateHTPasswdUsername,
  validateMultipleMachinePoolsSubnets,
  validateNumericInput,
  validatePrivateHostedZoneId,
  validateRequiredPublicSubnetId,
  validateRHITUsername,
  validateRoleARN,
  validateServiceAccountObject,
  validateUniqueAZ,
  validateUserOrGroupARN,
} from '../validators';

import fixtures from './validators.fixtures';

describe('Field is required', () => {
  it.each([
    [undefined, 'Field is required'],
    ['        ', 'Field is required'],
    ['foo', undefined],
  ])('value %p to be %p', (value: string | undefined, expected: string | undefined) => {
    expect(required(value)).toBe(expected);
  });
});

describe('Field is a valid identity provider name', () => {
  it.each([
    [undefined, 'Name is required.'],
    ['foo bar', 'Name must not contain whitespaces.'],
    [' ', 'Name must not contain whitespaces.'],
    ['foobar ', 'Name must not contain whitespaces.'],
    ['foobar$$', 'Name should contain only alphanumeric and dashes'],
    ['foo', undefined],
  ])('value %p to be %p', (value: string | undefined, expected: string | undefined) => {
    expect(checkIdentityProviderName(value)).toBe(expected);
  });
});

describe('clusterNameAsyncValidation', () => {
  const uniqueErrorMessage = 'Globally unique name in your organization';
  it('it validates with the correct message and validator', () => {
    const result = clusterNameAsyncValidation(undefined);

    expect(result[0].text).toEqual(uniqueErrorMessage);
    expect(result[0].validator).toBeInstanceOf(Function);
  });

  it('it validates correctly against existing multi region clusters', () => {
    const apSoutheastClusterName = 'testname1-ap-southeast-1';
    const usEastClusterName = 'testname1-us-east-1';

    const result = (value: string) => clusterNameAsyncValidation(value, true, true);

    expect(result(apSoutheastClusterName)[0].text).toEqual(uniqueErrorMessage);
    expect(result(usEastClusterName)[0].text).toEqual(uniqueErrorMessage);
  });
});

describe('Field is a valid cluster name [len, chars, start, end]', () => {
  const requirements = [
    // expected values will be in same order
    '1 - 54 characters',
    'Consist of lower-case alphanumeric characters, or hyphen (-)',
    'Start with a lower-case alphabetic character',
    'End with a lower-case alphanumeric character',
  ];
  const testCases: [string | undefined, boolean[]][] = [
    [undefined, [false, false, false, false]],
    ['', [false, false, false, false]],
    ['foo.bar', [true, false, true, true]],
    ['foobarfoobarfoobar', [true, true, true, true]],
    ['1foobar', [true, true, false, true]],
    ['foobar-', [true, true, true, false]],
    ['foo-1bar', [true, true, true, true]],
    ['foobarfoobarfoobar-foobarfoobarfoobar-foobarfoobarfoobar', [false, true, true, true]],
  ];

  it.each(testCases)('value %p to be %p', (value: string | undefined, validateds: boolean[]) => {
    const expected = requirements.map((text, i) => ({ text, validated: validateds[i] }));
    expect(clusterNameValidation(value)).toEqual(expected);
  });
});

describe('Field is a valid domain prefix [len, chars, start, end]', () => {
  const requirements = [
    // expected values will be in same order
    '1 - 15 characters',
    'Consist of lower-case alphanumeric characters, or hyphen (-)',
    'Start with a lower-case alphabetic character',
    'End with a lower-case alphanumeric character',
  ];
  const testCases: [string | undefined, boolean[]][] = [
    [undefined, [false, false, false, false]],
    ['', [false, false, false, false]],
    ['foo.bar', [true, false, true, true]],
    ['foobarfoobarfoobar', [false, true, true, true]],
    ['1foobar', [true, true, false, true]],
    ['foobar-', [true, true, true, false]],
    ['foo-1bar', [true, true, true, true]],
  ];

  it.each(testCases)('value %p to be %p', (value: string | undefined, validateds: boolean[]) => {
    const expected = requirements.map((text, i) => ({ text, validated: validateds[i] }));
    expect(domainPrefixValidation(value)).toEqual(expected);
  });
});

describe('domainPrefixAsyncValidation', () => {
  const uniqueErrorMessage = 'Globally unique domain prefix in your organization';
  it('it validates with the correct message and validator', () => {
    const result = domainPrefixAsyncValidation(undefined);

    expect(result[0].text).toEqual(uniqueErrorMessage);
    expect(result[0].validator).toBeInstanceOf(Function);
  });

  it('it validates the correctly against existing multi region clusters', () => {
    const apSoutheastPrefix = 'pre1SE';
    const usEastPrefix = 'pre1US';

    const result = (value: string) => domainPrefixAsyncValidation(value, true, undefined, true);

    expect(result(apSoutheastPrefix)[0].text).toEqual(uniqueErrorMessage);
    expect(result(usEastPrefix)[0].text).toEqual(uniqueErrorMessage);
  });
});

describe('Field is a valid UUID', () => {
  it.each([
    [undefined, 'Cluster ID is required.'],
    ['foo.bar', "Cluster ID 'foo.bar' is not a valid UUID."],
    ['1e479c87-9b83-41c5-854d-e5fec41ce7f8', undefined],
  ])('value %p to be %p', (value: string | undefined, expected: string | undefined) => {
    expect(checkClusterUUID(value)).toBe(expected);
  });
});

describe('User ID does not contain slash', () => {
  it.each([
    ['aaaaa/bbbbb', "User ID cannot contain '/'."],
    ['aaaaa:bbbbb', "User ID cannot contain ':'."],
    ['aaaaa%bbbbb', "User ID cannot contain '%'."],
    ['~', "User ID cannot be '~'."],
    ['.', "User ID cannot be '.'."],
    ['..', "User ID cannot be '..'."],
    ['', 'User ID cannot be empty.'],
    ['cluster-admin', "User ID cannot be 'cluster-admin'."],
    ['aaaa', undefined],
  ])('value %p to be %p', (value: string, expected: string | undefined) => {
    expect(checkUserID(value)).toBe(expected);
  });
});

describe('Username conforms RHIT pattern', () => {
  it.each([
    ['aaaa', undefined],
    ['aaaaa$bbbbb', 'Username includes illegal symbols'],
    ['aaaaa"bbbbb', 'Username includes illegal symbols'],
    ['aaaaa<bbbbb', 'Username includes illegal symbols'],
    ['aaaaa>bbbbb', 'Username includes illegal symbols'],
    ['aaaaa bbbbb', 'Username includes illegal symbols'],
    ['aaaaa^bbbbb', 'Username includes illegal symbols'],
    ['aaaaa|bbbbb', 'Username includes illegal symbols'],
    ['aaaaa%bbbbb', 'Username includes illegal symbols'],
    ['aaaaa\\bbbbb', 'Username includes illegal symbols'],
    ['aaaaa(bbbbb', 'Username includes illegal symbols'],
    ['aaaaa)bbbbb', 'Username includes illegal symbols'],
    ['aaaaa,bbbbb', 'Username includes illegal symbols'],
    ['aaaaa=bbbbb', 'Username includes illegal symbols'],
    ['aaaaa;bbbbb', 'Username includes illegal symbols'],
    ['aaaaa~bbbbb', 'Username includes illegal symbols'],
    ['aaaaa:bbbbb', 'Username includes illegal symbols'],
    ['aaaaa/bbbbb', 'Username includes illegal symbols'],
    ['aaaaa*bbbbb', 'Username includes illegal symbols'],
    ['aaaaa\rbbbbb', 'Username includes illegal symbols'],
    ['aaaaa\nbbbbb', 'Username includes illegal symbols'],
    ['$$$', 'Username includes illegal symbols'],
  ])('value %p to be %p', (value: string, expected: string | undefined) => {
    expect(validateRHITUsername(value)).toBe(expected);
  });
});

describe('Field is valid CIDR range', () => {
  it.each([
    [undefined, undefined],
    [
      'foo',
      "IP address range 'foo' isn't valid CIDR notation. It must follow the RFC-4632 format: '192.168.0.0/16'.",
    ],
    [
      '192.168.0.0',
      "IP address range '192.168.0.0' isn't valid CIDR notation. It must follow the RFC-4632 format: '192.168.0.0/16'.",
    ],
    [
      '192.168.0.0/',
      "IP address range '192.168.0.0/' isn't valid CIDR notation. It must follow the RFC-4632 format: '192.168.0.0/16'.",
    ],
    [
      '192.168.0.0/foo',
      "IP address range '192.168.0.0/foo' isn't valid CIDR notation. It must follow the RFC-4632 format: '192.168.0.0/16'.",
    ],
    ['192.168.0.0/16', undefined],
  ])('value %p to be %p', (value: string | undefined, expected: string | undefined) => {
    expect(validators.cidr(value)).toBe(expected);
  });
});

describe('Field is valid Machine CIDR for AWS', () => {
  it.each([
    [undefined, undefined, undefined],
    ['192.168.0.0/15', { multi_az: 'false' }, "The subnet mask can't be larger than '/16'."],
    ['192.168.0.0/16', { multi_az: 'false' }, undefined],
    ['192.168.0.0/25', { multi_az: 'false' }, undefined],
    ['192.168.0.0/26', { multi_az: 'false' }, "The subnet mask can't be smaller than '/25'."],
    ['192.168.0.0/15', { multi_az: 'true' }, "The subnet mask can't be larger than '/16'."],
    ['192.168.0.0/16', { multi_az: 'true' }, undefined],
    ['192.168.0.0/24', { multi_az: 'true' }, undefined],
    ['192.168.0.0/25', { multi_az: 'true' }, "The subnet mask can't be smaller than '/24'."],
    [
      '192.168.0.0/25',
      { multi_az: 'false', hypershift: 'true' },
      "The subnet mask can't be smaller than '/24'.",
    ],
    ['192.168.0.0/24', { multi_az: 'false', hypershift: 'true' }, undefined],
  ])(
    'value %p and formData %o to be %p',
    (
      value: string | undefined,
      formData: Record<string, string> | undefined,
      expected: string | undefined,
    ) => {
      expect(validators.awsMachineCidr(value, formData)).toBe(expected);
    },
  );
});

describe('Field is valid Machine CIDR for GCP', () => {
  it.each([
    [undefined, undefined, undefined],
    [
      '192.168.0.0/25',
      { multi_az: 'false', hypershift: 'true' },
      "The subnet mask can't be smaller than '/23', which provides up to 23 nodes.",
    ],
    ['192.168.0.0/23', { multi_az: 'false', hypershift: 'true' }, undefined],
    [
      '192.168.0.0/25',
      { multi_az: 'false' },
      "The subnet mask can't be smaller than '/23', which provides up to 23 nodes.",
    ],
    ['192.168.0.0/23', { multi_az: 'false' }, undefined],
    [
      '192.168.0.0/25',
      { multi_az: 'true' },
      "The subnet mask can't be smaller than '/23', which provides up to 69 nodes.",
    ],
    ['192.168.0.0/23', { multi_az: 'true' }, undefined],
  ])(
    'value %p and formData %o to be %p',
    (
      value: string | undefined,
      formData: Record<string, string> | undefined,
      expected: string | undefined,
    ) => {
      expect(validators.gcpMachineCidr(value, formData)).toBe(expected);
    },
  );
});

describe('Field is valid Service CIDR', () => {
  it.each([
    [undefined, undefined],
    ['192.168.0.0/0', undefined],
    [
      '192.168.0.0/25',
      "The subnet mask can't be smaller than '/24', which provides up to 254 services.",
    ],
  ])('value %p to be %p', (value: string | undefined, expected: string | undefined) => {
    expect(validators.serviceCidr(value)).toBe(expected);
  });
});

describe('Field is valid Pod CIDR', () => {
  it.each([
    [undefined, undefined, undefined],
    ['192.168.0.0/17', { network_host_prefix: '/22' }, undefined], // unreachable
    ['192.168.0.0/18', { network_host_prefix: '/23' }, undefined],
    ['192.168.0.0/19', { network_host_prefix: '/24' }, undefined],
    ['192.168.0.0/20', { network_host_prefix: '/25' }, undefined],
    ['192.168.0.0/21', { network_host_prefix: '/26' }, undefined],
    [
      '192.168.0.0/22',
      { network_host_prefix: '/27' },
      "The subnet mask can't be smaller than /21.",
    ],
    ['192.168.0.0/17', { network_host_prefix: '/23' }, undefined],
    ['192.168.0.0/18', { network_host_prefix: '/23' }, undefined],
    [
      '192.168.0.0/19',
      { network_host_prefix: '/23' },
      'The subnet mask of /19 does not allow for enough nodes. Try changing the host prefix or the pod subnet range.',
    ],
    ['192.168.0.0/19', { network_host_prefix: '/24' }, undefined],
    [
      '192.168.0.0/20',
      { network_host_prefix: '/24' },
      'The subnet mask of /20 does not allow for enough nodes. Try changing the host prefix or the pod subnet range.',
    ],
    ['192.168.0.0/20', { network_host_prefix: '/25' }, undefined],
    [
      '192.168.0.0/21',
      { network_host_prefix: '/25' },
      'The subnet mask of /21 does not allow for enough nodes. Try changing the host prefix or the pod subnet range.',
    ],
    ['192.168.0.0/21', { network_host_prefix: '/26' }, undefined],
    [
      '192.168.0.0/22',
      { network_host_prefix: '/26' },
      "The subnet mask can't be smaller than /21.",
    ],
  ])(
    'value %p and formData %o to be %p',
    (
      value: string | undefined,
      formData: Record<string, string> | undefined,
      expected: string | undefined,
    ) => {
      expect(validators.podCidr(value, formData)).toBe(expected);
    },
  );
});

describe('Field is a private IP address', () => {
  it.each([
    [undefined, undefined],
    ['10.0.0.0/11', undefined],
    ['10.255.255.255/8', undefined],
    ['10.255.255.255/7', 'Range is not private.'],
    ['172.16.0.0/12', undefined],
    ['172.31.77.250/15', undefined],
    ['172.31.255.255/11', 'Range is not private.'],
    ['192.168.98.4/18', undefined],
    ['192.168.255.255/20', undefined],
    ['192.168.79.24/15', 'Range is not private.'],
    ['67.25.66.98/15', 'Range is not private.'],
  ])('value %p to be %p', (value: string | undefined, expected: string | undefined) => {
    expect(validators.privateAddress(value)).toBe(expected);
  });
});

describe('Field does not share subnets with other fields', () => {
  it.each([
    [undefined, {}, undefined],
    [
      '190.231.125.47/12',
      { network_service_cidr: '190.231.43.56/11', network_pod_cidr: '12.124.23.41' },
      'This subnet overlaps with the subnet in the Service CIDR field.',
    ],
    [
      '190.231.125.47/12',
      { network_service_cidr: '12.124.23.41', network_pod_cidr: '190.230.45.9/11' },
      'This subnet overlaps with the subnet in the Pod CIDR field.',
    ],
    [
      '190.231.125.47/12',
      { network_service_cidr: '190.229.251.44/14', network_pod_cidr: '190.230.45.9/11' },
      'This subnet overlaps with the subnets in the Service CIDR, Pod CIDR fields.',
    ],
  ])(
    'value %p and formData %p to be %p',
    (
      value: string | undefined,
      formData: { [name: string]: any },
      expected: string | undefined,
    ) => {
      expect(validators.disjointSubnets('network_machine_cidr')(value, formData)).toBe(expected);
    },
  );
});

describe('Subnet cidrs are valid against machine, network and pod cidr ranges', () => {
  const { selectedSubnets } = fixtures;
  // machine cidr
  it.each([
    [
      '10.0.0.0/16',
      { network_service_cidr: '172.30.0.0/16', network_pod_cidr: '10.128.0.0/16' },
      'undefined',
    ],
    [
      '10.32.0.0/16',
      { network_service_cidr: '172.30.0.0/16', network_pod_cidr: '10.128.0.0/16' },
      'string',
    ],
    [
      '172.30.0.0/16',
      { network_service_cidr: undefined, network_pod_cidr: '10.128.0.0/16' },
      'string',
    ],
    [
      '10.0.0.0/19',
      { network_service_cidr: '172.30.0.0/16', network_pod_cidr: '10.128.0.0/16' },
      'string',
    ],
    [
      '10.0.192.0/18',
      { network_service_cidr: '172.30.0.0/16', network_pod_cidr: '10.128.0.0/16' },
      'string',
    ],
  ])(
    'value %p and formData %p to be %p',
    (
      value: string | undefined,
      formData: { [name: string]: any },
      expected: string | undefined,
    ) => {
      expect(
        typeof validators.subnetCidrs(value, formData, 'network_machine_cidr', selectedSubnets),
      ).toBe(expected);
    },
  );

  // service cidr
  it.each([
    [
      '172.30.0.0/16',
      { network_machine_cidr: '10.0.0.0/16', network_pod_cidr: '10.128.0.0/16' },
      'undefined',
    ],
    [
      '10.0.0.0/16',
      { network_machine_cidr: '10.32.0.0/16', network_pod_cidr: '10.128.0.0/16' },
      'string',
    ],
    [
      '10.0.0.0/19',
      { network_machine_cidr: '10.0.0.0/16', network_pod_cidr: '10.128.0.0/16' },
      'string',
    ],
    [
      '10.0.34.0/24',
      { network_machine_cidr: '10.0.32.0/24', network_pod_cidr: '10.128.0.0/16' },
      'string',
    ],
  ])(
    'value %p and formData %p to be %p',
    (
      value: string | undefined,
      formData: { [name: string]: any },
      expected: string | undefined,
    ) => {
      expect(
        typeof validators.subnetCidrs(value, formData, 'network_service_cidr', selectedSubnets),
      ).toBe(expected);
    },
  );

  // pod cidr
  it.each([
    [
      '10.128.0.0/16',
      { network_machine_cidr: '10.0.0.0/16', network_service_cidr: '172.30.0.0/16' },
      'undefined',
    ],
    [
      '10.32.0.0/16',
      { network_machine_cidr: '10.0.0.0/16', network_service_cidr: '172.30.0.0/16' },
      'undefined',
    ],
    [
      '10.0.0.0/16',
      { network_machine_cidr: '10.32.0.0/16', network_service_cidr: '172.30.0.0/16' },
      'string',
    ],
  ])(
    'value %p and formData %p to be %p',
    (
      value: string | undefined,
      formData: { [name: string]: any },
      expected: string | undefined,
    ) => {
      expect(
        typeof validators.subnetCidrs(value, formData, 'network_pod_cidr', selectedSubnets),
      ).toBe(expected);
    },
  );
});

describe('Field is an IP address with subnet mask between 16-28', () => {
  it.each([
    ['network_machine_cidr_single_az', undefined, undefined],
    ['network_machine_cidr_single_az', '190.68.89.250/17', undefined],
    [
      'network_machine_cidr_single_az',
      '190.68.89.250/10',
      'Subnet mask must be between /16 and /25.',
    ],
    ['network_machine_cidr_single_az', '190.68.89.250/16', undefined],
    [
      'network_machine_cidr_single_az',
      '190.68.89.250/28',
      'Subnet mask must be between /16 and /25.',
    ],

    ['network_machine_cidr_multi_az', undefined, undefined],
    ['network_machine_cidr_multi_az', '190.68.89.250/17', undefined],
    [
      'network_machine_cidr_multi_az',
      '190.68.89.250/10',
      'Subnet mask must be between /16 and /24.',
    ],
    ['network_machine_cidr_multi_az', '190.68.89.250/16', undefined],
    [
      'network_machine_cidr_multi_az',
      '190.68.89.250/28',
      'Subnet mask must be between /16 and /24.',
    ],
    ['network_service_cidr', undefined, undefined],
    ['network_service_cidr', '190.68.89.250/17', undefined],
    ['network_service_cidr', '190.68.89.250/24', undefined],
    ['network_service_cidr', '190.68.89.250/28', 'Subnet mask must be between /1 and /24.'],
  ])(
    'value %p to be %p',
    (value: string | undefined, value2: string | undefined, expected: string | undefined) => {
      expect(validators.awsSubnetMask(value)(value2)).toBe(expected);
    },
  );
});

describe('Field is an address the corresponds with the first host in its subnet', () => {
  it.each([
    [undefined, undefined],
    [
      '192.148.30.71/16',
      'This is not a subnet address. The subnet prefix is inconsistent with the subnet mask.',
    ],
    ['255.128.0.0/10', undefined],
    [
      '255.130.0.0/10',
      'This is not a subnet address. The subnet prefix is inconsistent with the subnet mask.',
    ],
  ])('value %p to be %p', (value: string | undefined, expected: string | undefined) => {
    expect(validators.validateRange(value)).toBe(expected);
  });
});

describe('Field is valid subnet mask', () => {
  it.each([
    [undefined, undefined],
    [
      '/22',
      "The subnet mask can't be larger than '/23', which provides up to 510 Pod IP addresses.",
    ],
    ['/23', undefined],
    ['/26', undefined],
    [
      '/27',
      "The subnet mask can't be smaller than '/26', which provides up to 62 Pod IP addresses.",
    ],
    [
      '/33',
      "The value '/33' isn't a valid subnet mask. It must follow the RFC-4632 format: '/16'.",
    ],
    [
      '32',
      "The subnet mask can't be smaller than '/26', which provides up to 62 Pod IP addresses.",
    ],
    [
      '/foo',
      "The value '/foo' isn't a valid subnet mask. It must follow the RFC-4632 format: '/16'.",
    ],
    [
      'foo',
      "The value 'foo' isn't a valid subnet mask. It must follow the RFC-4632 format: '/16'.",
    ],
    ['/', "The value '/' isn't a valid subnet mask. It must follow the RFC-4632 format: '/16'."],
    [
      '/0',
      "The subnet mask can't be larger than '/23', which provides up to 510 Pod IP addresses.",
    ],
    ['0', "The subnet mask can't be larger than '/23', which provides up to 510 Pod IP addresses."],
    [
      '/-1',
      "The value '/-1' isn't a valid subnet mask. It must follow the RFC-4632 format: '/16'.",
    ],
    ['-1', "The value '-1' isn't a valid subnet mask. It must follow the RFC-4632 format: '/16'."],
  ])('value %p to be %p', (value: string | undefined, expected: string | undefined) => {
    expect(validators.hostPrefix(value)).toBe(expected);
  });
});

describe('Field is valid node count for OCP cluster', () => {
  it.each([
    [0, { value: 0 }, 250, undefined],
    [250, { value: 0 }, 250, undefined],
    [-1, { value: 0 }, 250, 'The minimum number of nodes is 0.'],
    [251, { value: 0 }, 250, 'Maximum number allowed is 250.'],
    [250, { value: 0 }, undefined, 'Maximum number allowed is 180.'],
    [
      3,
      { value: 4, validationMsg: 'At least 4 nodes are required.' },
      undefined,
      'At least 4 nodes are required.',
    ],
    [4, { value: 4, validationMsg: 'At least 4 nodes are required.' }, undefined, undefined],
    [5, { value: 4, validationMsg: 'At least 4 nodes are required.' }, undefined, undefined],
    [
      4,
      {
        value: 9,
        validationMsg: 'At least 9 nodes are required for multiple availability zone cluster.',
      },
      undefined,
      'At least 9 nodes are required for multiple availability zone cluster.',
    ],
    [
      9,
      {
        value: 9,
        validationMsg: 'At least 9 nodes are required for multiple availability zone cluster.',
      },
      undefined,
      undefined,
    ],
    [
      -1,
      { value: 4, validationMsg: 'At least 4 nodes are required.' },
      undefined,
      'At least 4 nodes are required.',
    ],
    [
      'aaa',
      { value: 4, validationMsg: 'At least 4 nodes are required.' },
      undefined,
      "'aaa' is not a valid number of nodes.",
    ],
  ]);
});

describe('Field is valid node count for multi AZ', () => {
  it.each([
    [3, undefined],
    [4, 'Number of nodes must be multiple of 3 for Multi AZ cluster.'],
    [5, 'Number of nodes must be multiple of 3 for Multi AZ cluster.'],
    [6, undefined],
  ])('value %p to be %p', (value: string | number, expected: string | undefined) => {
    expect(validators.nodesMultiAz(value)).toBe(expected);
  });
});

describe('Field is a valid console URL', () => {
  it.each([
    [undefined, undefined, undefined],
    ['', true, 'Cluster console URL should not be empty'],
    ['http://www.example.com', false, undefined],
    ['http://www.example.com', undefined, undefined],
    ['https://console-openshift-console.apps.example.com/', undefined, undefined],
    [
      'www.example.hey/hey',
      undefined,
      'The URL should include the scheme prefix (http://, https://)',
    ],
    ['ftp://hello.com', undefined, 'The URL should include the scheme prefix (http://, https://)'],
    ['http://example.com\noa', undefined, 'Invalid URL'],
    ['http://www.example:55815.com', undefined, 'Invalid URL'],
    ['https://www-whatever.apps.example.co.uk/', undefined, undefined],
    ['http://www.example.com:foo', undefined, 'Invalid URL'],
    ['http://www.example.com....', undefined, 'Invalid URL'],
    ['http://blog.example.com', undefined, undefined],
    ['http://255.255.255.255', undefined, undefined],
    ['http://www.site.com:8008', undefined, undefined],
    ['http://www.example.com/product', undefined, undefined],
    ['example.com/', undefined, 'The URL should include the scheme prefix (http://, https://)'],
    ['www.example.com', undefined, 'The URL should include the scheme prefix (http://, https://)'],
    [
      'http://www.example.com#up',
      undefined,
      'The URL must not include a query string (?) or fragment (#)',
    ],
    [
      'http://www.example.com/products?id=1&page=2',
      undefined,
      'The URL must not include a query string (?) or fragment (#)',
    ],
    ['255.255.255.255', undefined, 'The URL should include the scheme prefix (http://, https://)'],
    [
      'http://invalid.com/perl.cgi?key=',
      undefined,
      'The URL must not include a query string (?) or fragment (#)',
    ],
  ])(
    'value %p and isRequired %p to be %p',
    (value: string | undefined, isRequired: boolean | undefined, expected: string | undefined) => {
      expect(checkClusterConsoleURL(value, isRequired)).toBe(expected);
    },
  );
});

describe('Field is a valid issuer', () => {
  it.each([
    [undefined, 'Issuer URL is required.'],
    [
      'http://www.example.com',
      'Invalid URL. Issuer must use https scheme without a query string (?) or fragment (#)',
    ],
    ['https://example.com/', undefined],
    [
      '...example....',
      'Invalid URL. Issuer must use https scheme without a query string (?) or fragment (#)',
    ],
    ['https://???', 'Invalid URL'],
    [
      'www.example.hey/hey',
      'Invalid URL. Issuer must use https scheme without a query string (?) or fragment (#)',
    ],
    [
      'ftp://hello.com',
      'Invalid URL. Issuer must use https scheme without a query string (?) or fragment (#)',
    ],
    ['https://www.example:55815.com', 'Invalid URL'],
    ['https://www-whatever.apps.example.co.uk/', undefined],
    ['https://www.example.com:foo', 'Invalid URL'],
    ['https://blog.example.com', undefined],
    ['https://255.255.255.255', undefined],
    ['https://www.site.com:8008', undefined],
    ['https://www.example.com/product', undefined],
    [
      'example.com/',
      'Invalid URL. Issuer must use https scheme without a query string (?) or fragment (#)',
    ],
    [
      'www.example.com',
      'Invalid URL. Issuer must use https scheme without a query string (?) or fragment (#)',
    ],
    ['https://www.example.com#up', 'The URL must not include a query string (?) or fragment (#)'],
    [
      'https://www.example.com/products?id=1&page=2',
      'The URL must not include a query string (?) or fragment (#)',
    ],
    [
      '255.255.255.255',
      'Invalid URL. Issuer must use https scheme without a query string (?) or fragment (#)',
    ],
    [
      'https://invalid.com/perl.cgi?key=',
      'The URL must not include a query string (?) or fragment (#)',
    ],
    ['https://login.openidprovider.com/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX/v2.0/', undefined],
    ['https://www.example.com#', 'The URL must not include a query string (?) or fragment (#)'],
  ])('value %p to be %p', (value: string | undefined, expected: string | undefined) => {
    expect(checkOpenIDIssuer(value)).toBe(expected);
  });
});

describe('Field contains a numeric string', () => {
  it.each([
    [undefined, undefined, undefined],
    ['8.8', { allowDecimal: true }, undefined],
    ['8.8', undefined, 'Input must be an integer.'],
    ['-10', undefined, 'Input must be a positive number.'],
    ['-10', { allowNeg: true }, undefined],
    ['asdf', undefined, 'Input must be a number.'],
    ['0', { allowZero: true }, undefined],
    ['1000', { max: 999 }, 'Input cannot be more than 999.'],
    ['999', { max: 999 }, undefined],
    [`${Number.MAX_SAFE_INTEGER}`, undefined, undefined],
    ['2', { min: 3 }, 'Input cannot be less than 3.'],
  ])(
    'value %p and props %o to be %p',
    (value: string | undefined, props: any | undefined, expected: string | undefined) => {
      expect(validateNumericInput(value, props)).toBe(expected);
    },
  );
});

describe('Field is a valid list of github teams', () => {
  it.each([
    [undefined, undefined],
    ['org/team', undefined],
    ['org1/team1,org2/team2', undefined],
    ['org1/team1,,org2/team2', "Each team must be of format 'org/team'."],
    ['org1/team1, org2/team2', 'Organization must not contain whitespaces.'],
    ['org1/team1,team2', "Each team must be of format 'org/team'."],
    ['/team', "Each team must be of format 'org/team'."],
    ['org/', "Each team must be of format 'org/team'."],
    ['org /team', 'Organization must not contain whitespaces.'],
    ['org/team a', 'Team must not contain whitespaces.'],
    ['team', "Each team must be of format 'org/team'."],
    ['team2,', "Each team must be of format 'org/team'."],
    ['team2,/', "Each team must be of format 'org/team'."],
  ])('value %p to be %p', (value: string | undefined, expected: string | undefined) => {
    expect(checkGithubTeams(value)).toBe(expected);
  });
});

describe('Field is a valid disconnected console URL', () => {
  it.each([
    [undefined, undefined],
    ['', undefined],
    ['http://www.example.com', undefined],
    ['https://console-openshift-console.apps.example.com/', undefined],
    ['www.example.hey/hey', 'The URL should include the scheme prefix (http://, https://)'],
    ['ftp://hello.com', 'The URL should include the scheme prefix (http://, https://)'],
    ['http://example.com\noa', 'Invalid URL'],
    ['http://www.example:55815.com', 'Invalid URL'],
    ['https://www-whatever.apps.example.co.uk/', undefined],
    ['http://www.example.com:foo', 'Invalid URL'],
    ['http://www.example.com....', 'Invalid URL'],
    ['http://blog.example.com', undefined],
    ['http://255.255.255.255', undefined],
    ['http://www.site.com:8008', undefined],
    ['http://www.example.com/product', undefined],
    ['example.com/', 'The URL should include the scheme prefix (http://, https://)'],
    ['www.example.com', 'The URL should include the scheme prefix (http://, https://)'],
    ['http://www.example.com#up', 'The URL must not include a query string (?) or fragment (#)'],
    [
      'http://www.example.com/products?id=1&page=2',
      'The URL must not include a query string (?) or fragment (#)',
    ],
    ['255.255.255.255', 'The URL should include the scheme prefix (http://, https://)'],
    [
      'http://invalid.com/perl.cgi?key=',
      'The URL must not include a query string (?) or fragment (#)',
    ],
  ])('value %p to be %p', (value: string | undefined, expected: string | undefined) => {
    expect(checkDisconnectedConsoleURL(value)).toBe(expected);
  });
});

describe('Field contains a valid number of vCPUs', () => {
  it.each([
    [undefined, undefined],
    ['8.8', 'Input must be an integer.'],
    ['-10', 'Input must be a positive number.'],
    ['asdf', 'Input must be a number.'],
    ['0', 'Input must be a positive number.'],
    ['18000', 'Input cannot be more than 16000.'],
    ['16000', undefined],
    [`${Number.MAX_SAFE_INTEGER}`, 'Input cannot be more than 16000.'],
  ])('value %p to be %p', (value: string | undefined, expected: string | undefined) => {
    expect(checkDisconnectedvCPU(value)).toBe(expected);
  });
});

describe('Field contains a valid number of sockets', () => {
  it.each([
    [undefined, undefined],
    ['8.8', 'Input must be an integer.'],
    ['-10', 'Input must be a positive number.'],
    ['asdf', 'Input must be a number.'],
    ['0', 'Input must be a positive number.'],
    ['3000', 'Input cannot be more than 2000.'],
    ['1999', undefined],
    [`${Number.MAX_SAFE_INTEGER}`, 'Input cannot be more than 2000.'],
  ])('value %p to be %p', (value: string | undefined, expected: string | undefined) => {
    expect(checkDisconnectedSockets(value)).toBe(expected);
  });
});

describe('Field contains a valid number of memory', () => {
  it.each([
    [undefined, undefined],
    ['8.8', undefined],
    ['-10', 'Input must be a positive number.'],
    ['asdf', 'Input must be a number.'],
    ['0', 'Input must be a positive number.'],
    ['512000', 'Input cannot be more than 256000.'],
    ['128000', undefined],
    [`${Number.MAX_SAFE_INTEGER}`, 'Input cannot be more than 256000.'],
  ])('value %p to be %p', (value: string | undefined, expected: string | undefined) => {
    expect(checkDisconnectedMemCapacity(value)).toBe(expected);
  });
});

describe('Field is a valid user or group ARN', () => {
  it.each([
    ['arn:aws:iam::012345678901:user/richard', undefined],
    ['arn:aws:iam::012345678901:group/sda', undefined],
    ['arn:aws:iam::012345678901:group/s da', 'Value must not contain whitespaces.'],
    [
      'arn:aws:iam::0123456789:user/richard',
      'ARN value should be in the format arn:aws:iam::123456789012:user/name.',
    ],
    [
      'arn:aws:iam:0123456789:user/richard',
      'ARN value should be in the format arn:aws:iam::123456789012:user/name.',
    ],
    [
      '0123456789:user/richard',
      'ARN value should be in the format arn:aws:iam::123456789012:user/name.',
    ],
  ])('value %p to be %p', (value: string, expected: string | undefined) => {
    expect(validateUserOrGroupARN(value)).toBe(expected);
  });
});

describe('Field is a valid user or group ARN', () => {
  it.each([
    ['arn:aws:iam::012345678901:role/some-role', undefined],
    ['arn:aws-cn:iam::123456789012:role/cypress-account-roles-gov-int-Installer-Role', undefined],
    [
      'arn:aws-us-gov:iam::123456789012:role/cypress-account-roles-gov-int-Installer-Role',
      undefined,
    ],
    ['arn:aws:iam::012345678901:role/s da', 'Value must not contain whitespaces.'],
    [
      'arn:aws:iam:0123456789:roles/bad-format',
      'ARN value should be in the format arn:aws:iam::123456789012:role/role-name.',
    ],
  ])('value %p to be %p', (value: string, expected: string | undefined) => {
    expect(validateRoleARN(value)).toBe(expected);
  });
});

describe('Field is a valid key value pair', () => {
  const validKeyError =
    "A valid key name must consist of alphanumeric characters, '-', '.' , '_'  or '/' and must start and end with an alphanumeric character";
  const validValueError =
    "A valid value must consist of alphanumeric characters, '-', '.' or '_' and must start and end with an alphanumeric character";
  const maxLenKeyError = 'A valid key name must be 63 characters or less';
  const maxLenKeyPrefixError = 'A valid key prefix must be 253 characters or less';
  const maxLenValueError = 'A valid value must be 63 characters or less';
  const longKeyStr = 'ffffffffffffffffffffffffffffffffkkkkddddddddddddddddddddffffffff=val';
  const longKeyPrefixStr =
    'ffffffffffffffffffffffffffffffffkkkkddddddddddddddddddddffffffffffffffffffffffffffffffffffffffffkkkkddddddddddddddddddddffffffffffffffffffffffffffffffffffffffffkkkkddddddddddddddddddddffffffffffffffffffffffffffffffffffffffffkkkkddddddddddddddddddddffffffffffffffffffffffffffffffffffffffffkkkkddddddddddddddddddddffffffffffffffffffffffffffffffffffffffffkkkkddddddddddddddddddddffffffffffffffffffffffffffffffffffffffffkkkkddddddddddddddddddddffffffffffffffffffffffffffffffffffffffffkkkkddddddddddddddddddddffffffffffffffffffffffffffffffffffffffffkkkkddddddddddddddddddddffffffffffffffffffffffffffffffffffffffffkkkkddddddddddddddddddddffffffffffffffffffffffffffffffffffffffffkkkkddddddddddddddddddddffffffffffffffffffffffffffffffffffffffffkkkkddddddddddddddddddddffffffff/a=val';
  const longValStr = 'key=ffffffffffffffffffffffffffffffffkkkkddddddddddddddddddddffffffff';
  const prefixError =
    "A valid key prefix part of a lowercase RFC 1123 subdomain must consist of lower case alphanumeric characters, '-' or '.', and must start and end with an alphanumeric character";
  const multipleSlashError =
    "A qualified name must consist of alphanumeric characters, '-', '_' or '.', and must start and end with an alphanumeric character with an optional DNS subdomain prefix and '/' (e.g. 'example.com/MyName')";

  it.each([
    [undefined, undefined],
    ['', undefined],
    ['foo', undefined],
    ['foo=', undefined],
    ['foo=bar', undefined],
    ['fOo=BAr', undefined],
    ['foo=3', undefined],
    ['foo=bar,foo=3', undefined],
    ['fo_o=ba-r', undefined],
    ['fo-o=ba_r', undefined],
    ['foo.bar=wat', undefined],
    ['foo=bar.wat', undefined],
    ['hello\\hai', validKeyError],
    ['键=值', validKeyError],
    ['foo:bar', validKeyError],
    ['_foo=bar', validKeyError],
    ['foo-=bar', validKeyError],
    ['foo.bar.=wat', validKeyError],
    ['foo.io/bar#!@=wat', validKeyError],
    ['foo=-bar', validValueError],
    ['foo=bar_', validValueError],
    ['foo=bar_', validValueError],
    ['foo=bar.wat.', validValueError],
    [longKeyPrefixStr, maxLenKeyPrefixError],
    [longValStr, maxLenValueError],
    ['/foo', prefixError],
    [`prefixError./not-a-prefix-domain}`, prefixError],
    [`prefixError..com/not-a-prefix-domain}`, prefixError],
    ['prefixError/foo', prefixError],
    ['test_t.com/hello', prefixError],
    [longKeyStr, maxLenKeyError],
    [`some.prefix/${longKeyStr}`, maxLenKeyError],
    ['tn.co/t/test', multipleSlashError],
    ['foo.io/bar#!//@=wat', multipleSlashError],
    ['foo.io/bar/baz#!//@=wat', multipleSlashError],
  ])('value %p to be %p', (value: string | undefined, expected: string | undefined) => {
    expect(checkLabels(value)).toBe(expected);
  });
});

describe('awsNumericAccountID', () => {
  const errStr = 'AWS account ID must be a 12 digits positive number.';

  it.each([
    [undefined, 'AWS account ID is required.'],
    ['1', errStr],
    ['123456789', errStr],
    ['1e5', errStr],
    ['11111111122222222aaaaaaaaaa', errStr],
    ['-12345678901', errStr],
    ['123456789012', undefined],
  ])('value %p to be %p', (value: string | undefined, expected: string | undefined) => {
    expect(awsNumericAccountID(value)).toBe(expected);
  });
});

describe('GCP service account JSON', () => {
  type ExpectedError = {
    property: string;
    message: string;
  };
  fixtures.GCPServiceAccounts.forEach((item) => {
    const { expectedError, testObj } = item;
    if (expectedError) {
      try {
        validateServiceAccountObject(testObj);
      } catch (e) {
        const error = e as ExpectedError;
        expect(error.property).toBe(expectedError.property);
        expect(error.message).toBe(expectedError.message);
      }
    } else {
      expect(validateServiceAccountObject(testObj)).toBe(undefined);
    }
  });
});

describe('AWS Subnet ROSA / OSD', () => {
  describe('validateUniqueAZ', () => {
    const allValues = {
      machinePoolsSubnets: [
        { availabilityZone: 'us-west-2b', privateSubnetId: 'subnet-1', publicSubnetId: '' },
        { availabilityZone: 'us-west-2b', privateSubnetId: 'subnet-2', publicSubnetId: '' },
        { availabilityZone: 'us-west-2f', privateSubnetId: 'subnet-3', publicSubnetId: '' },
      ],
    };
    it.each([
      ['us-west-2a', undefined],
      ['us-west-2f', undefined],
      ['us-west-2b', 'Must select 3 different AZs.'],
    ])('validates %s to be "%s"', (azId: string, expected: string | undefined) => {
      expect(validateUniqueAZ(azId, allValues)).toBe(expected);
    });
  });

  describe('validateMultipleMachinePoolsSubnets', () => {
    const allValues = {
      machinePoolsSubnets: [
        { availabilityZone: 'us-west-2f', privateSubnetId: 'subnet-3', publicSubnetId: '' },
        { availabilityZone: 'us-west-2b', privateSubnetId: 'subnet-2', publicSubnetId: '' },
        { availabilityZone: 'us-west-2b', privateSubnetId: 'subnet-2', publicSubnetId: '' },
        { availabilityZone: 'us-west-2b', privateSubnetId: 'subnet-2b', publicSubnetId: '' },
      ],
    };
    it.each([
      ['', 'Subnet is required'],
      ['subnet-2', 'Every machine pool must be associated to a different subnet'],
      ['subnet-3', undefined],
    ])('validates %p, %p to be "%s"', (subnetId: string, expected: string | undefined) => {
      expect(validateMultipleMachinePoolsSubnets(subnetId, allValues)).toBe(expected);
    });
  });
});

describe('Private hosted zone ID', () => {
  it.each([
    ['Z148QEXAMPLE8V', undefined],
    ['Z04846483BCEKWUIANDJP', undefined],
    ['A04846483BCEKWUIANDJP', 'Not a valid Private hosted zone ID.'],
    ['A04', 'Not a valid Private hosted zone ID.'],
  ])('value %p to be %p', (value: string, expected: string | undefined) => {
    expect(validatePrivateHostedZoneId(value)).toBe(expected);
  });
});

describe('GCP Subnet', () => {
  it.each([
    [undefined, 'Field is required.'],
    ['Subnet Name', 'Name must not contain whitespaces.'],
    ['Subet$$', 'Name should contain only lowercase letters, numbers and hyphens.'],
    [
      'testnameeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      'Name may not exceed 63 characters.',
    ],
  ])('value %p to be %p', (value: string | undefined, expected: string | undefined) => {
    expect(validateGCPSubnet(value)).toBe(expected);
  });
});

describe('GCP KMSService Account', () => {
  const inValidValueTest1 = '9%%#$#$-compute@developer.gserviceaccount.com';
  const inValidValueTest2 = '100000000000-compute@developer.gserviceaccount.commmm';

  const validValueTest1 = '100000000000-compute@developer.gserviceaccount.com';
  const validValueTest2 = 'myserviceaccount@exampleproj-3.iam.gserviceaccount.com';

  const expectedMsg =
    'Field start with lowercase letter and can only contain hyphens (-), at (@) and dot (.).' +
    'For e.g. "myserviceaccount@myproj.iam.gserviceaccount.com" or "<projectnumericid>-compute@developer.gserviceaccount.com".';

  it.each([
    [undefined, 'Field is required.'],
    ['service account', 'Field must not contain whitespaces.'],
    [inValidValueTest1, expectedMsg],
    [inValidValueTest2, expectedMsg],
    [validValueTest1, undefined],
    [validValueTest2, undefined],
  ])('value %p to be %p', (value: string | undefined, expected: string | undefined) => {
    expect(validateGCPKMSServiceAccount(value)).toBe(expected);
  });
});

describe('HTPasswd password', () => {
  it.each([
    [
      '',
      {
        emptyPassword: true,
        // Blank string also fails all the other requirements,
        // but deliberately suppressed to focus user attention on it being blank.
        baseRequirements: false,
        uppercase: false,
        lowercase: false,
        numbersOrSymbols: false,
      },
    ],
    [
      'SOMETHINGsomething1',
      undefined, // all good
    ],
    [
      'somethingsomething',
      {
        emptyPassword: false,
        baseRequirements: false,
        uppercase: true,
        lowercase: false,
        numbersOrSymbols: true,
      },
    ],
    [
      'something',
      {
        emptyPassword: false,
        baseRequirements: true,
        uppercase: true,
        lowercase: false,
        numbersOrSymbols: true,
      },
    ],
    [
      'somethingsomething',
      {
        emptyPassword: false,
        baseRequirements: false,
        uppercase: true,
        lowercase: false,
        numbersOrSymbols: true,
      },
    ],
    [
      'SOMETHINGSOMEHING',
      {
        emptyPassword: false,
        baseRequirements: false,
        uppercase: false,
        lowercase: true,
        numbersOrSymbols: true,
      },
    ],
    [
      'SOMETHINGsomething',
      {
        emptyPassword: false,
        baseRequirements: false,
        uppercase: false,
        lowercase: false,
        numbersOrSymbols: true,
      },
    ],
    [
      'something\u00D5',
      {
        emptyPassword: false,
        baseRequirements: true,
        uppercase: true,
        lowercase: false,
        numbersOrSymbols: false,
      },
    ],
    [
      'something something',
      {
        emptyPassword: false,
        baseRequirements: true,
        uppercase: true,
        lowercase: false,
        numbersOrSymbols: true,
      },
    ],
  ])('value %p to be %p', (value: string, expected: any | undefined) => {
    expect(validateHTPasswdPassword(value)).toStrictEqual(expected);
  });
});

describe('HTPasswd username', () => {
  const validationErrorMessage = 'Username must not contain /, :, %, or empty spaces.';
  it.each([
    ['username1234', undefined],
    ['username%', validationErrorMessage],
    ['username:', validationErrorMessage],
    ['username/', validationErrorMessage],
    ['username1  ', validationErrorMessage],
    [' ', validationErrorMessage],
  ])('value %p to be %p', (value: string, expected: string | undefined) => {
    expect(validateHTPasswdUsername(value)).toBe(expected);
  });
});

describe('Custom operator roles prefix', () => {
  it('prefix1234', () => {
    expect(checkCustomOperatorRolesPrefix('prefix1234')).toBe(undefined);
  });

  it('prefix%', () => {
    expect(checkCustomOperatorRolesPrefix('prefix%')).toContain(
      "isn't valid, must consist of lower-case alphanumeric characters or",
    );
  });

  it('a2345678901234567890123456789012', () => {
    expect(checkCustomOperatorRolesPrefix('a2345678901234567890123456789012')).toBe(undefined);
  });

  it('a23456789012345678901234567890123456', () => {
    expect(checkCustomOperatorRolesPrefix('a23456789012345678901234567890123456')).toContain(
      'may not exceed',
    );
  });
});

describe('createPessimisticValidator', () => {
  it('returns a function that outputs the first failed error message', () => {
    const validatorFunction = createPessimisticValidator((): any => [
      { validated: true, text: 'first (valid)' },
      { validated: false, text: 'second (invalid)' },
      { validated: true, text: 'third (valid)' },
    ]);
    expect(validatorFunction('')).toBe('second (invalid)');
  });

  it('returns undefined when validationProvider is missing', () => {
    const validatorFunction = createPessimisticValidator();
    expect(validatorFunction('')).toBeUndefined();
  });
});

describe('validateAWSKMSKeyARN', () => {
  it.each([
    [
      'arn:aws:kms:us-east-1:111111111111:key/1470a953-a261-4350-850d-2d8d1ef6e82b',
      'us-east-1',
      undefined,
    ],
    [
      'arn:aws-us-gov:kms:us-east-1:111111111111:key/1470a953-a261-4350-850d-2d8d1ef6e82b',
      'us-east-1',
      undefined,
    ],
    ['', 'some-region', 'Field is required.'],
    ['arn:with whitespace', 'some-region', 'Value must not contain whitespaces.'],
    [
      'arn:with:wrong:format',
      'some-region',
      'Key provided is not a valid ARN. It should be in the format "arn:aws:kms:<region>:<accountid>:key/<keyid>".',
    ],
    [
      `arn:aws:kms:us-west-1:111111111111:key/1470a953-a261-4350-850d-2d8d1ef6e82b`,
      'us-east-1',
      'Your KMS key must contain your selected region.',
    ],
  ])(
    'value %p region %p to be %p',
    (value: string, region: string, expected: string | undefined) => {
      expect(validateAWSKMSKeyARN(value, region)).toBe(expected);
    },
  );
});

describe('validateRequiredPublicSubnetId', () => {
  it('returns undefined when field is pristine', () => {
    expect(validateRequiredPublicSubnetId('', {}, { pristine: true })).toBeUndefined();
  });

  it('returns undefined when field is touched and a subnet is selected', () => {
    expect(validateRequiredPublicSubnetId('subnet-id', {}, { pristine: false })).toBeUndefined();
  });

  it('returns an error message when field is touched and a subnet is not selected', () => {
    expect(validateRequiredPublicSubnetId('', {}, { pristine: false })).toBe('Subnet is required');
  });
});

describe('k8sGpuParameter', () => {
  it.each([
    ['somevendor.com/gpu:10:15', undefined],
    ['anothervendor:0:4', undefined],
    ['somevendor.com/gpu:10:15,anothervendor:0:4', undefined],
    [
      'first-invalid:aa:bb,second-valid:4:20,third-invalid:4:1',
      'Invalid params: first-invalid:aa:bb,third-invalid:4:1',
    ],
    ['only-has-one-part', 'Invalid params: only-has-one-part'],
    ['only-has-two:parts', 'Invalid params: only-has-two:parts'],
    ['somevendor.com/gpu:aa:bb', 'Invalid params: somevendor.com/gpu:aa:bb'],
    ['somevendor.com/gpu:0:bb', 'Invalid params: somevendor.com/gpu:0:bb'],
    ['somevendor.com/gpu:aa:0', 'Invalid params: somevendor.com/gpu:aa:0'],
    ['somevendor.com/gpu:10:0', 'Invalid params: somevendor.com/gpu:10:0'],
    ['somevendor.com/gpu:4:1', 'Invalid params: somevendor.com/gpu:4:1'],
  ])('value %p to be %p', (value: string, expected: string | undefined) =>
    expect(clusterAutoScalingValidators.k8sGpuParameter(value)).toBe(expected),
  );

  it.each([
    ['', undefined],
    ['whatever', 'Routes should match comma separated pairs in key=value format'],
    ['key=value', undefined],
    ['key=value,key1=value1', undefined],
  ])('checkKeyValueFormat value %p to be %p', (value: string, expected: string | undefined) =>
    expect(checkKeyValueFormat(value)).toBe(expected),
  );

  it.each([
    ['key=', undefined],
    ['key=,key2=', undefined],
    ['key=a,key=b', 'Each label should have a unique key. "key" already exists.'],
  ])('checkRouteSelectors value %p to be %p', (value: string, expected: string | undefined) =>
    expect(checkRouteSelectors(value)).toBe(expected),
  );
});
