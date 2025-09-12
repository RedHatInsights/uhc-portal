console.log('🔍 MOCK LOADED: services.ts');

export const clusterService = {
  getCloudProviders: () => Promise.resolve({ data: { items: [] } }),
  getMachineTypesByRegionARN: () => Promise.resolve({ data: { items: [] } }),
  getInstallableVersions: () => Promise.resolve({ data: { items: [] } }),
  getOidcConfigurations: (awsAccountID) => {
    console.log(`Mock getOidcConfigurations called for AWS Account: ${awsAccountID}`);
    return Promise.resolve({
      data: {
        items: [
          {
            id: '22qa79chsq8manq8hvmnt33upj48lmas',
            issuer_url: 'https://d3gttgcc2zmq3d.cloudfront.net/22qa79chsq8manq8hvmnt33upj48lmas',
            managed: false,
          },
          {
            id: '233dk2t6918rk6nOg8cOaau9btsiqjb',
            issuer_url: 'https://new-staging-oidc-b4s8.s3.us-east-1.amazonaws.com',
            managed: true,
          },
          {
            id: '2aOf9palp4bob7jq3h2lpc6q345644',
            issuer_url: 'https://rosa-oidc-prod.s3.amazonaws.com/2aOf9palp4bob7jq3h2lpc6q345644',
            managed: false,
          },
          {
            id: '45fg7h3kq9r2ts8vwx1y4za6bc9def12',
            issuer_url: 'https://d1a2b3c4e5f6g7.cloudfront.net/45fg7h3kq9r2ts8vwx1y4za6bc9def12',
            managed: true,
          },
        ]
      }
    });
  },
};

export const accountsService = {
  getRegionalInstances: () => Promise.resolve({ data: { items: [] } }),
  getOCMRole: (awsAccountID) => {
    console.log(`Mock getOCMRole called for AWS Account: ${awsAccountID}`);
    
    // Check if we should simulate an error
    if ((window as any).__storybookOCMRoleError) {
      console.log('Simulating OCM role error');
      return Promise.reject({
        response: {
          status: 404,
          data: {
            code: 'CLUSTERS-MGMT-404',
            reason: 'ocm-role is no longer linked to your Red Hat organization',
          },
        },
        errorMessage: 'ocm-role is no longer linked to your Red Hat organization',
        status: 404,
      });
    }
    
    console.log('Returning successful OCM role response');
    return Promise.resolve({
      data: {
        arn: 'arn:aws:iam::123456789012:role/ManagedOpenShift-OCM-Role-123456789',
        isAdmin: true,
      },
    });
  },
};

export const authorizationsService = {
  postSelfFeatureReview: () => Promise.resolve({ data: { enabled: true } }),
};

export const assistedService = {
  getAICluster: () => Promise.resolve({ data: {} }),
  getAIFeatureSupportLevels: () => Promise.resolve({ data: {} }),
};

export const costService = {
  getCostModels: () => Promise.resolve({ data: { items: [] } }),
  getClusterCost: () => Promise.resolve({ data: {} }),
  getQuotaCost: () => Promise.resolve({ data: {} }),
};

const services = {
  clusterService,
  accountsService,
  authorizationsService,
  assistedService,
  costService,
};

export default services;
