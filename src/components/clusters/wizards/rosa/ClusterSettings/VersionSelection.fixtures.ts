export const mockOCPLifeCycleStatusData = [
  [
    {
      uuid: '0964595a-151e-4240-8a62-31e6c3730226',
      name: 'OpenShift Container Platform 4',
      former_names: [],
      show_last_minor_release: false,
      show_final_minor_release: false,
      is_layered_product: false,
      all_phases: [
        {
          name: 'General availability',
          ptype: 'normal',
          tooltip: undefined,
          display_name: 'General availability',
        },
        {
          name: 'Full support',
          ptype: 'normal',
          tooltip: undefined,
          display_name: 'Full support ends',
        },
        {
          name: 'Maintenance support',
          ptype: 'normal',
          tooltip: undefined,
          display_name: 'Maintenance support ends',
        },
        {
          name: 'Extended update support',
          ptype: 'normal',
          tooltip: undefined,
          display_name: 'Extended update support ends',
        },
        {
          name: 'Extended life phase',
          ptype: 'extended',
          tooltip:
            'The Extended Life Cycle Phase (ELP) is the post-retirement time period. We require that customers running Red Hat Enterprise Linux products beyond their retirement continue to have active subscriptions which ensures that they continue receiving access to all previously released content, documentation, and knowledge base articles as well as receive limited technical support. As there are no bug fixes, security fixes, hardware enablement, or root cause analysis available during the Extended Life Phase, customers may choose to purchase the Extended Life Cycle Support Add-On during the Extended Life Phase, which will provide them with critical impact security fixes and selected urgent priority bug fixes.',
          display_name: 'Extended life phase ends',
        },
      ],
      versions: [
        {
          name: '4.20',
          type: 'Full Support',
          last_minor_release: null,
          final_minor_release: null,
          extra_header_value: null,
          phases: [
            {
              name: 'General availability',
              date: '2025-01-17T00:00:00.000Z',
              date_format: 'date',
            },
            { name: 'Full support', date: 'Release of 4.13 + 3 months', date_format: 'string' },
            {
              name: 'Maintenance support',
              date: '2024-07-17T00:00:00.000Z',
              date_format: 'date',
            },
            {
              name: 'Extended update support',
              date: '2026-01-17T00:00:00.000Z',
              date_format: 'date',
            },
            { name: 'Extended life phase', date: '', date_format: 'string' },
          ],
          extra_dependences: [],
        },
        {
          name: '4.12',
          type: 'Full Support',
          last_minor_release: null,
          final_minor_release: null,
          extra_header_value: null,
          phases: [
            {
              name: 'General availability',
              date: '2023-01-17T00:00:00.000Z',
              date_format: 'date',
            },
            { name: 'Full support', date: 'Release of 4.13 + 3 months', date_format: 'string' },
            {
              name: 'Maintenance support',
              date: '2024-07-17T00:00:00.000Z',
              date_format: 'date',
            },
            {
              name: 'Extended update support',
              date: '2025-01-17T00:00:00.000Z',
              date_format: 'date',
            },
            { name: 'Extended life phase', date: '', date_format: 'string' },
          ],
          extra_dependences: [],
        },
        {
          name: '4.11',
          type: 'Maintenance Support',
          last_minor_release: null,
          final_minor_release: null,
          extra_header_value: null,
          phases: [
            {
              name: 'General availability',
              date: '2022-08-10T00:00:00.000Z',
              date_format: 'date',
            },
            { name: 'Full support', date: '2023-04-17T00:00:00.000Z', date_format: 'date' },
            {
              name: 'Maintenance support',
              date: '2024-02-10T00:00:00.000Z',
              date_format: 'date',
            },
            { name: 'Extended update support', date: 'N/A', date_format: 'string' },
            { name: 'Extended life phase', date: 'N/A', date_format: 'string' },
          ],
          extra_dependences: [],
        },
        {
          name: '4.10',
          type: 'Maintenance Support',
          last_minor_release: null,
          final_minor_release: null,
          extra_header_value: null,
          phases: [
            {
              name: 'General availability',
              date: '2022-03-10T00:00:00.000Z',
              date_format: 'date',
            },
            { name: 'Full support', date: '2022-11-10T00:00:00.000Z', date_format: 'date' },
            {
              name: 'Maintenance support',
              date: '2023-09-10T00:00:00.000Z',
              date_format: 'date',
            },
            { name: 'Extended update support', date: 'N/A', date_format: 'string' },
            { name: 'Extended life phase', date: 'N/A', date_format: 'string' },
          ],
          extra_dependences: [],
        },
      ],
      link: 'https://access.redhat.com/support/policy/updates/openshift/',
      policies: 'https://access.redhat.com/site/support/policy/updates/openshift/policies/',
    },
  ],
  true,
];
