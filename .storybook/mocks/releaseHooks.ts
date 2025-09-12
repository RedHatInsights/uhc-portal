console.log('🔍 MOCK LOADED: releaseHooks.ts');

// Mock the useOCPLifeCycleStatusData hook
export const useOCPLifeCycleStatusData = () => {
  const data = [
    [
      {
        uuid: '0964595a-151e-4240-8a62-31e6c3730226',
        name: 'OpenShift Container Platform 4',
        versions: [
          {
            name: '4.14',
            type: 'Full Support',
          },
          {
            name: '4.13',
            type: 'Full Support',
          },
          {
            name: '4.12',
            type: 'Maintenance Support',
          },
          {
            name: '4.11',
            type: 'Maintenance Support',
          },
        ],
      },
    ],
    false, // isLoading
    null,  // error
  ];
  
  console.log('🔍 LIFECYCLE MOCK: Returning data:', JSON.stringify(data[0]?.[0]?.versions, null, 2));
  return data;
};
 
export const useOCPLatestVersion = () => ['4.14.0', true]; 