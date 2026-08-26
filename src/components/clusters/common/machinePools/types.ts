import { AwsNodePool } from '~/types/clusters_mgmt.v1';

/**
 * Spot market options for a Hypershift (HCP) AWS node pool.
 *
 * Unlike the classic `AWSSpotMarketOptions.max_price` (a number), the API
 * expects `max_price` on `aws_node_pool.spot_market_options` as a *string*
 * (confirmed via CLUSTERS-MGMT-400: "cannot unmarshal number into Go struct
 * field AwsNodePoolSpotMarketOptions...max_price of type string").
 */
export type AwsNodePoolSpotMarketOptions = {
  max_price?: string;
};

/**
 * `AWSNodePool` (Hypershift) does not yet expose `spot_market_options` in the
 * generated OpenAPI types, unlike its classic `AWSMachinePool` counterpart.
 * This type bridges the gap so the UI can read/write Spot instance settings
 * for HCP node pools. Remove this once the generated types are regenerated
 * to include the field.
 */
export type AwsNodePoolWithSpotMarketOptions = AwsNodePool & {
  spot_market_options?: AwsNodePoolSpotMarketOptions;
};
