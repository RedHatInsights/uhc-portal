import { CloudVpc, Subnetwork } from '~/types/clusters_mgmt.v1';

export type SubnetPrivacy = 'private' | 'public';

const isSubnetMatchingPrivacy = (subnet: Subnetwork, privacy?: SubnetPrivacy) =>
  !privacy || (privacy === 'public' && subnet.public) || (privacy === 'private' && !subnet.public);

/**
 * Finds all the availability zones of this VPC's subnets,
 * that have at least one subnet matching each of the privacy types in "privacyList"
 *
 * e.g. us-west-2a: prv1, pub1, us-west-2c:prv2, us-west-2f:pub3
 * and privacyList=["public,private"] --> us-west-2a
 * and privacyList=["public"] --> us-west-2a, us-west-2f
 * and privacyList=["private"] --> us-west-2a, us-west-2c
 *
 * @param region region
 * @param vpc Cloud VPC
 * @param privacyList required privacy types ("public", "private")
 *
 * @returns SubnetPrivacy[] List of availability zones which have the required subnets
 */
const getMatchingAvailabilityZones = (
  region: string,
  vpc: CloudVpc,
  privacyList: SubnetPrivacy[],
) =>
  ['a', 'b', 'c', 'd', 'e', 'f']
    .map((letter) => `${region}${letter}`)
    .filter((zoneId) =>
      // For every zone and privacy type, there must be at least one subnet that matches both criteria
      privacyList.every((privacy) =>
        vpc.aws_subnets?.some(
          (subnet) =>
            subnet.availability_zone === zoneId && isSubnetMatchingPrivacy(subnet, privacy),
        ),
      ),
    );

/**
 * Obtains the information of the availability zone of a subnet from the VPC details
 *
 * @param vpc Cloud VPC
 * @param formSubnets subnet details taken from the form
 * @returns array of unique availability zones belonging to the specified private subnets
 */
const getSelectedAvailabilityZones = (
  vpc: CloudVpc,
  formSubnets: { privateSubnetId: string }[],
) => {
  const azs: string[] = [];
  formSubnets.forEach((formSubnet) => {
    const az = (vpc.aws_subnets || []).find(
      (vpcSubnet) => formSubnet.privateSubnetId === vpcSubnet.subnet_id,
    )?.availability_zone;
    if (az && !azs.includes(az)) {
      azs.push(az);
    }
  });
  return azs;
};

/**
 * Determines if the VPC has all the required subnets
 * @param vpc Cloud VPC
 * @param usePrivateLink if the cluster has private visibility
 */
const vpcHasRequiredSubnets = (vpc: CloudVpc, usePrivateLink?: boolean) => {
  const subnets = vpc.aws_subnets || [];
  const hasPrivateSubnets = subnets.some((subnet) => isSubnetMatchingPrivacy(subnet, 'private'));
  if (!hasPrivateSubnets) {
    return false;
  }
  // Only apply the filter for public subnets if explicitly passing "usePrivateLink=false"
  if (usePrivateLink === false) {
    return subnets.some((subnet) => isSubnetMatchingPrivacy(subnet, 'public'));
  }
  return true;
};

/**
 * Returns only the VPCs that are not managed by Red Hat

 * @param vpcs list of VPC items
 * @returns CloudVpc[] copy of the VPC list
 */
const filterOutRedHatManagedVPCs = (vpcs: CloudVpc[]) =>
  vpcs.filter((vpcItem) => !vpcItem.red_hat_managed);

/**
 * Returns all the individual field names for "machinePoolsSubnets"
 * @param isMultiAz is cluster multi zone
 */
const getAllSubnetFieldNames = (isMultiAz: boolean): string[] => {
  const mpSubnetFields = ['machinePoolsSubnets[0]'];

  if (isMultiAz) {
    mpSubnetFields.push('machinePoolsSubnets[1]');
    mpSubnetFields.push('machinePoolsSubnets[2]');
  }

  const allFieldNames: string[] = [];
  return mpSubnetFields.reduce((acc, field) => {
    const allFields = [...acc];
    allFields.push(`${field}.availabilityZone`);
    allFields.push(`${field}.privateSubnetId`);
    allFields.push(`${field}.publicSubnetId`);
    return allFields;
  }, allFieldNames);
};

// Helper to infer region if not present
const inferRegionFromSubnets = (vpc: CloudVpc) => {
  const availabilityZone = vpc.aws_subnets?.find(
    (subnet) => subnet.availability_zone,
  )?.availability_zone;

  if (!availabilityZone) {
    return undefined;
  }

  // Match AWS region patterns:
  // - Standard: us-west-2, eu-central-1, ap-southeast-1
  // - GovCloud: us-gov-west-1, us-gov-east-1
  // - Local zones: us-west-2-den-1a -> us-west-2, us-gov-west-1-lax-1b -> us-gov-west-1
  const regionMatch = availabilityZone.match(/^([a-z]+-(?:gov-)?[a-z]+-\d+)/);

  return regionMatch ? regionMatch[1] : undefined;
};

export {
  vpcHasRequiredSubnets,
  filterOutRedHatManagedVPCs,
  getMatchingAvailabilityZones,
  getSelectedAvailabilityZones,
  isSubnetMatchingPrivacy,
  getAllSubnetFieldNames,
  inferRegionFromSubnets,
};
