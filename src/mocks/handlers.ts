import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('*/api/authorizations/v1/self_access_review', () =>
    HttpResponse.json({
      account_id: '2K89szemF25dKqb0w16cdfucF92',
      action: 'create',
      allowed: false,
      cluster_id: '',
      cluster_uuid: '',
      organization_id: '',
      reason: '',
      resource_type: 'Cluster',
      subscription_id: '',
    }),
  ),
];
