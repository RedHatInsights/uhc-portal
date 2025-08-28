import { ProductCardNode } from '../../../../../../common/ProductCard/ProductCard';
import {
  FEATURED_PRODUCTS_CARDS,
  RECOMMENDED_OPERATORS_CARDS_DATA,
} from '../../../../../../overview/components/fixtures';

import { STATIC_ALERT_MESSAGES } from './RecommendedOperatorsAlert';

const advancedClusterSecurityCardData = { ...FEATURED_PRODUCTS_CARDS[0] };
const openshiftAiCardData = { ...FEATURED_PRODUCTS_CARDS[1] };
const openshiftVirtualizationCardData = { ...FEATURED_PRODUCTS_CARDS[2] };
const advancedClusterManagementCardData = { ...FEATURED_PRODUCTS_CARDS[3] };

const gitopsCardData = { ...RECOMMENDED_OPERATORS_CARDS_DATA[0] };
const pipelinesCardData = { ...RECOMMENDED_OPERATORS_CARDS_DATA[1] };
const serviceMeshCardData = { ...RECOMMENDED_OPERATORS_CARDS_DATA[2] };

const CARDS = [
  advancedClusterSecurityCardData,
  openshiftAiCardData,
  openshiftVirtualizationCardData,
  advancedClusterManagementCardData,
  gitopsCardData,
  pipelinesCardData,
  serviceMeshCardData,
];

type TestCase = ProductCardNode & { index: number };

const TEST_CASES = [] as TestCase[];
// add index to each TEST_CASE
for (let i = 0; i < CARDS.length; i += 1) {
  TEST_CASES.push({ ...CARDS[i], index: i });
}

export { CARDS, TEST_CASES, STATIC_ALERT_MESSAGES as ALERT_MESSAGES };
