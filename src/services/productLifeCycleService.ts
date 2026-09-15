// this file uses axios directly because it talks to an unauthenticated public API
import axios from 'axios';

import { ProductLifeCycles } from '../types/product-life-cycles';

export const V1_API_URL = 'https://access.redhat.com/product-life-cycles/api/v1/products';
export const V2_API_URL = 'https://access.redhat.com/product-life-cycles/api/v2/products';
export const V1_PRODUCT_NAME = 'Openshift Container Platform 4';
export const V2_PRODUCT_NAME = 'Red Hat OpenShift Container Platform';

const getOCPLifeCycleStatus = (useOcp5Support: boolean) =>
  axios.get<ProductLifeCycles>(useOcp5Support ? V2_API_URL : V1_API_URL, {
    params: {
      name: useOcp5Support ? V2_PRODUCT_NAME : V1_PRODUCT_NAME,
    },
  });

export default getOCPLifeCycleStatus;
