import { vpcList } from '~/components/clusters/common/__tests__/vpcs.fixtures';
import { CloudVpc, Subnetwork } from '~/types/clusters_mgmt.v1';

import {
  filterOutRedHatManagedVPCs,
  getMatchingAvailabilityZones,
  getSelectedAvailabilityZones,
  inferRegionFromSubnets,
  isSubnetMatchingPrivacy,
  SubnetPrivacy,
  vpcHasRequiredSubnets,
} from './vpcHelpers';

const privatePrivacy = 'private' as SubnetPrivacy;
const publicPrivacy = 'public' as SubnetPrivacy;

describe('filterOutRedHatManagedVPCs', () => {
  it('returns only the VPCs that are not managed by Red Hat', () => {
    const filteredVPCs = filterOutRedHatManagedVPCs(vpcList);
    expect(filteredVPCs).toHaveLength(4);

    const remainingVPCNames = filteredVPCs.map((vpc) => vpc.name);
    expect(remainingVPCNames).not.toContain('jaosorior-8vns4-vpc');
    expect(remainingVPCNames).toContain('lz-p2-318-z6fst-vpc');
  });
});

describe('vpcHasRequiredSubnets', () => {
  const privateSubnetId1 = 'subnet-0fcc28e72f90f0ac4';
  const privateSubnetId2 = 'subnet-04f5c843f1753f29d';
  const publicSubnetId = 'subnet-071863ea8dfeb4786';

  const getVpcWithSelectedSubnets = (subnetIds: string[]) => {
    const testVpc = vpcList.find((vpc) => vpc.name === 'caa-e2e-test-vpc') as CloudVpc;

    return {
      ...testVpc,
      aws_subnets: (testVpc.aws_subnets || []).filter((subnet) =>
        subnetIds.includes(subnet.subnet_id || ''),
      ),
    };
  };

  it.each([
    // usePrivateLink=true
    [true, true, 'at least 1 private subnet', [privateSubnetId1]],
    [false, true, 'no private subnets', [publicSubnetId]],
    // usePrivateLink=false
    [
      true,
      false,
      'at least 1 private subnet and 1 public subnet',
      [publicSubnetId, privateSubnetId1],
    ],
    [false, false, 'only private subnets', [privateSubnetId2, privateSubnetId1]],
    [false, false, 'only public subnets', [publicSubnetId]],
    // usePrivateLink=undefined (for HCP, we need to show the VPCs, but we don't know yet if they will use public subnets too)
    [true, undefined, 'at least 1 private subnet', [privateSubnetId1]],
    [false, undefined, 'no private subnets', [publicSubnetId]],
  ])(
    'returns %p for a VPC that has %s and privateLink=%p',
    (
      result: boolean,
      usePrivateLink: boolean | undefined,
      _vpcType: string,
      subnetIds: string[],
    ) => {
      const testVpc = getVpcWithSelectedSubnets(subnetIds);
      expect(vpcHasRequiredSubnets(testVpc, usePrivateLink)).toEqual(result);
    },
  );
});

describe('isSubnetMatchingPrivacy', () => {
  it('returns true if "privacy" is unset', () => {
    const fakeSubnet = {} as Subnetwork;
    expect(isSubnetMatchingPrivacy(fakeSubnet, undefined)).toEqual(true);
  });

  it.each([
    [true, privatePrivacy, privatePrivacy],
    [false, privatePrivacy, publicPrivacy],
    [true, publicPrivacy, publicPrivacy],
    [false, publicPrivacy, privatePrivacy],
  ])(
    'returns %p if privacy is %p and subnet privacy is %p',
    (result: boolean, privacy: SubnetPrivacy, subnetPrivacy: SubnetPrivacy) => {
      const subnet = {
        public: subnetPrivacy === 'public',
      } as Subnetwork;
      expect(isSubnetMatchingPrivacy(subnet, privacy)).toEqual(result);
    },
  );
});

describe('getMatchingAvailabilityZones', () => {
  const testRegion = 'myRegion';

  describe('for "Private" privacy', () => {
    it('returns the AZs where there is at least one private subnet', () => {
      const vpc = {
        aws_subnets: [
          { subnet_id: '1', availability_zone: 'myRegiona', public: true },
          { subnet_id: '2', availability_zone: 'myRegionc', public: true },
          { subnet_id: '3', availability_zone: 'myRegione', public: false },
          { subnet_id: '4', availability_zone: 'myRegionc', public: true },
          { subnet_id: '5', availability_zone: 'myRegionb', public: false },
        ],
      } as CloudVpc;
      expect(getMatchingAvailabilityZones(testRegion, vpc, [privatePrivacy])).toEqual([
        'myRegionb',
        'myRegione',
      ]);
    });
  });

  describe('for "Public" privacy', () => {
    it('returns the AZs where there is at least one public subnet', () => {
      const vpc = {
        aws_subnets: [
          { subnet_id: '1', availability_zone: 'myRegiona', public: true },
          { subnet_id: '2', availability_zone: 'myRegionc', public: true },
          { subnet_id: '3', availability_zone: 'myRegione', public: false },
          { subnet_id: '4', availability_zone: 'myRegionc', public: true },
          { subnet_id: '5', availability_zone: 'myRegionb', public: false },
        ],
      } as CloudVpc;

      // Tests also that there's not duplicates for Region C
      expect(getMatchingAvailabilityZones(testRegion, vpc, [publicPrivacy])).toEqual([
        'myRegiona',
        'myRegionc',
      ]);
    });
  });

  describe('for "Public" and "Private" privacy', () => {
    it('returns the AZs where there is at least one public subnet AND one private subnet', () => {
      const vpc = {
        aws_subnets: [
          // Region D only has private subnets, Region B only has public subnets, Region C has both
          { subnet_id: '1', availability_zone: 'myRegiond', public: false },
          { subnet_id: '2', availability_zone: 'myRegionb', public: true },
          { subnet_id: '3', availability_zone: 'myRegionb', public: true },
          { subnet_id: '4', availability_zone: 'myRegionc', public: false },
          { subnet_id: '5', availability_zone: 'myRegiond', public: false },
          { subnet_id: '6', availability_zone: 'myRegionb', public: true },
          { subnet_id: '7', availability_zone: 'myRegionc', public: true },
          { subnet_id: '8', availability_zone: 'myRegionc', public: false },
        ],
      } as CloudVpc;
      expect(
        getMatchingAvailabilityZones(testRegion, vpc, [publicPrivacy, privatePrivacy]),
      ).toEqual(['myRegionc']);
    });
  });
});

describe('getSelectedAvailabilityZones', () => {
  it('obtains the availability zones from the VPC details', () => {
    const vpc = vpcList.find((vpc) => vpc.id === 'vpc-0cbe6c1d5f216cdb9') as CloudVpc;
    expect(vpc.name).toEqual('caa-e2e-test-vpc');

    const formSubnets = [
      { privateSubnetId: 'subnet-0fcc28e72f90f0ac4' },
      { privateSubnetId: 'subnet-04f5c843f1753f29d' },
    ];
    expect(getSelectedAvailabilityZones(vpc, formSubnets)).toEqual(['us-east-1d', 'us-east-1a']);
  });

  it('returns empty if the VPC details does not contain the specified subnets', () => {
    const vpc = vpcList.find((vpc) => vpc.id === 'vpc-046c3e3efea64c91e') as CloudVpc;
    expect(vpc.name).toEqual('jaosorior-8vns4-vpc');

    const formSubnets = [
      { privateSubnetId: 'subnet-0fcc28e72f90f0ac4' },
      { privateSubnetId: 'subnet-04f5c843f1753f29d' },
    ];
    expect(getSelectedAvailabilityZones(vpc, formSubnets)).toHaveLength(0);
  });
});

describe('inferRegionFromSubnets', () => {
  it('correctly infers region from different availability zone formats', () => {
    const testCases = [
      { az: 'us-west-2b', expectedRegion: 'us-west-2' },
      { az: 'eu-central-1c', expectedRegion: 'eu-central-1' },
      { az: 'ap-southeast-1a', expectedRegion: 'ap-southeast-1' },
      { az: 'ca-central-1d', expectedRegion: 'ca-central-1' },
    ];

    testCases.forEach(({ az, expectedRegion }) => {
      const vpc = {
        aws_subnets: [{ subnet_id: '1', availability_zone: az, public: true }],
      } as CloudVpc;

      expect(inferRegionFromSubnets(vpc)).toEqual(expectedRegion);
    });
  });

  it('handles availability zone without letter suffix', () => {
    const vpc = {
      aws_subnets: [{ subnet_id: '1', availability_zone: 'us-east-1', public: true }],
    } as CloudVpc;

    expect(inferRegionFromSubnets(vpc)).toEqual('us-east-1');
  });

  it('uses first subnet with availability zone when multiple subnets exist', () => {
    const vpc = {
      aws_subnets: [
        { subnet_id: '1', availability_zone: undefined, public: true },
        { subnet_id: '2', availability_zone: 'eu-west-1a', public: false },
        { subnet_id: '3', availability_zone: 'us-east-1b', public: true },
      ],
    } as CloudVpc;

    expect(inferRegionFromSubnets(vpc)).toEqual('eu-west-1');
  });

  it('returns undefined when VPC has no subnets', () => {
    const vpc = {
      aws_subnets: undefined,
    } as CloudVpc;

    expect(inferRegionFromSubnets(vpc)).toBeUndefined();
  });

  it('returns undefined when VPC has empty subnets array', () => {
    const vpc = {
      aws_subnets: [],
    } as CloudVpc;

    expect(inferRegionFromSubnets(vpc)).toBeUndefined();
  });

  it('returns undefined when no subnet has availability zone', () => {
    const vpc = {
      aws_subnets: [
        { subnet_id: '1', availability_zone: undefined, public: true },
        { subnet_id: '2', availability_zone: undefined, public: false },
      ],
    } as CloudVpc;

    expect(inferRegionFromSubnets(vpc)).toBeUndefined();
  });

  it('handles availability zone with empty string', () => {
    const vpc = {
      aws_subnets: [{ subnet_id: '1', availability_zone: '', public: true }],
    } as CloudVpc;

    expect(inferRegionFromSubnets(vpc)).toBeUndefined();
  });

  it('handles regions with more than 3 dash-separated parts', () => {
    // Test with gov cloud regions that have 4 parts
    const testCases = [
      { az: 'us-gov-east-1a', expectedRegion: 'us-gov-east-1' },
      { az: 'us-gov-west-1b', expectedRegion: 'us-gov-west-1' },
    ];

    testCases.forEach(({ az, expectedRegion }) => {
      const vpc = {
        aws_subnets: [{ subnet_id: '1', availability_zone: az, public: true }],
      } as CloudVpc;

      expect(inferRegionFromSubnets(vpc)).toEqual(expectedRegion);
    });
  });

  it('returns undefined for non-AWS availability zone formats', () => {
    // The regex is specifically designed for AWS patterns, so non-matching patterns return undefined
    const testCases = ['custom-region-a', 'some-custom-region', 'invalid', '123-456'];

    testCases.forEach((az) => {
      const vpc = {
        aws_subnets: [{ subnet_id: '1', availability_zone: az, public: true }],
      } as CloudVpc;

      expect(inferRegionFromSubnets(vpc)).toBeUndefined();
    });
  });

  it('correctly handles AWS local zones for both standard and gov cloud regions', () => {
    // Test various local zone formats
    const testCases = [
      // Standard region local zones
      { az: 'us-west-2-den-1a', expectedRegion: 'us-west-2' },
      { az: 'us-west-2-lax-1b', expectedRegion: 'us-west-2' },
      { az: 'us-east-1-bos-1a', expectedRegion: 'us-east-1' },
      { az: 'us-east-1-mia-1b', expectedRegion: 'us-east-1' },
      // GovCloud local zones
      { az: 'us-gov-west-1-lax-1a', expectedRegion: 'us-gov-west-1' },
      { az: 'us-gov-west-1-phx-1b', expectedRegion: 'us-gov-west-1' },
      { az: 'us-gov-east-1-atl-1a', expectedRegion: 'us-gov-east-1' },
      // Local zones without AZ letter suffix (edge case)
      { az: 'us-west-2-den-1', expectedRegion: 'us-west-2' },
      { az: 'us-gov-west-1-lax-1', expectedRegion: 'us-gov-west-1' },
    ];

    testCases.forEach(({ az, expectedRegion }) => {
      const vpc = {
        aws_subnets: [{ subnet_id: '1', availability_zone: az, public: true }],
      } as CloudVpc;

      expect(inferRegionFromSubnets(vpc)).toEqual(expectedRegion);
    });
  });
});
