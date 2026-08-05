import { ProductLifeCycle } from '~/types/product-life-cycles';

const ocpLifeCycleStatuses: { data: { data: ProductLifeCycle[] } } = {
  data: {
    data: [
      {
        name: 'Red Hat OpenShift Container Platform',
        former_names: ['OpenShift Container Platform 4'],
        opl_uuid: null,
        is_layered_product: false,
        link: 'https://access.redhat.com/support/policy/updates/openshift/',
        versions: [
          {
            name: '5.1',
            type: 'Full Support',
            last_minor_release: null,
            extra_header_value: null,
            phases: [
              {
                name: 'General availability',
                start_date: '2027-01-15T00:00:00.000Z',
                end_date: '2027-01-15T00:00:00.000Z',
                start_date_format: 'date',
                end_date_format: 'date',
              },
              {
                name: 'Extended update support',
                start_date: 'N/A',
                end_date: 'N/A',
                start_date_format: 'string',
                end_date_format: 'string',
              },
            ],
          },
          {
            name: '5.0',
            type: 'Full Support',
            last_minor_release: null,
            extra_header_value: null,
            phases: [
              {
                name: 'General availability',
                start_date: '2026-09-01T00:00:00.000Z',
                end_date: '2026-09-01T00:00:00.000Z',
                start_date_format: 'date',
                end_date_format: 'date',
              },
              {
                name: 'Extended update support',
                start_date: '2028-03-01T00:00:00.000Z',
                end_date: '2028-09-01T00:00:00.000Z',
                start_date_format: 'date',
                end_date_format: 'date',
              },
            ],
          },
          {
            name: '4.12',
            type: 'Full Support',
            last_minor_release: null,
            extra_header_value: null,
            phases: [
              {
                name: 'General availability',
                start_date: '2021-07-27T00:00:00.000Z',
                end_date: '2021-07-27T00:00:00.000Z',
                start_date_format: 'date',
                end_date_format: 'date',
              },
              {
                name: 'Full support',
                start_date: 'Release of 4.9 + 1 month',
                end_date: 'Release of 4.9 + 1 month',
                start_date_format: 'string',
                end_date_format: 'string',
              },
              {
                name: 'Maintenance support',
                start_date: 'Release of 4.11',
                end_date: 'Release of 4.11',
                start_date_format: 'string',
                end_date_format: 'string',
              },
              {
                name: 'Extended update support',
                start_date: '2024-07-18T00:00:00.000Z',
                end_date: '2025-01-17T00:00:00.000Z',
                start_date_format: 'date',
                end_date_format: 'date',
              },
            ],
          },
          {
            name: '4.11',
            type: 'Full Support',
            last_minor_release: null,
            extra_header_value: null,
            phases: [
              {
                name: 'General availability',
                start_date: '2021-07-27T00:00:00.000Z',
                end_date: '2021-07-27T00:00:00.000Z',
                start_date_format: 'date',
                end_date_format: 'date',
              },
              {
                name: 'Full support',
                start_date: 'Release of 4.9 + 1 month',
                end_date: 'Release of 4.9 + 1 month',
                start_date_format: 'string',
                end_date_format: 'string',
              },
              {
                name: 'Maintenance support',
                start_date: 'Release of 4.11',
                end_date: 'Release of 4.11',
                start_date_format: 'string',
                end_date_format: 'string',
              },
              {
                name: 'Extended update support',
                start_date: 'N/A',
                end_date: 'N/A',
                start_date_format: 'string',
                end_date_format: 'string',
              },
            ],
          },
          {
            name: '4.8',
            type: 'Full Support',
            last_minor_release: null,
            extra_header_value: null,
            phases: [
              {
                name: 'General availability',
                start_date: '2021-07-27T00:00:00.000Z',
                end_date: '2021-07-27T00:00:00.000Z',
                start_date_format: 'date',
                end_date_format: 'date',
              },
              {
                name: 'Full support',
                start_date: 'Release of 4.9 + 1 month',
                end_date: 'Release of 4.9 + 1 month',
                start_date_format: 'string',
                end_date_format: 'string',
              },
              {
                name: 'Maintenance support',
                start_date: 'Release of 4.11',
                end_date: 'Release of 4.11',
                start_date_format: 'string',
                end_date_format: 'string',
              },
              {
                name: 'Extended update support',
                start_date: '2023-01-01T00:00:00.000Z',
                end_date: '2023-07-01T00:00:00.000Z',
                start_date_format: 'date',
                end_date_format: 'date',
              },
            ],
          },
          {
            name: '4.7',
            type: 'Maintenance Support',
            last_minor_release: null,
            extra_header_value: null,
            phases: [
              {
                name: 'General availability',
                start_date: '2021-02-24T00:00:00.000Z',
                end_date: '2021-02-24T00:00:00.000Z',
                start_date_format: 'date',
                end_date_format: 'date',
              },
              {
                name: 'Full support',
                start_date: '2021-08-27T00:00:00.000Z',
                end_date: '2021-08-27T00:00:00.000Z',
                start_date_format: 'date',
                end_date_format: 'date',
              },
              {
                name: 'Maintenance support',
                start_date: 'Release of 4.10',
                end_date: 'Release of 4.10',
                start_date_format: 'string',
                end_date_format: 'string',
              },
              {
                name: 'Extended update support',
                start_date: 'N/A',
                end_date: 'N/A',
                start_date_format: 'string',
                end_date_format: 'string',
              },
            ],
          },
          {
            name: '4.6 EUS',
            type: 'Maintenance Support',
            last_minor_release: null,
            extra_header_value: null,
            phases: [
              {
                name: 'General availability',
                start_date: '2020-10-27T00:00:00.000Z',
                end_date: '2020-10-27T00:00:00.000Z',
                start_date_format: 'date',
                end_date_format: 'date',
              },
              {
                name: 'Full support',
                start_date: '2021-03-24T00:00:00.000Z',
                end_date: '2021-03-24T00:00:00.000Z',
                start_date_format: 'date',
                end_date_format: 'date',
              },
              {
                name: 'Maintenance support',
                start_date: '2022-10-27T00:00:00.000Z',
                end_date: '2022-10-27T00:00:00.000Z',
                start_date_format: 'date',
                end_date_format: 'date',
                superscript: '9',
              },
            ],
          },
          {
            name: '4.6',
            type: 'Maintenance Support',
            last_minor_release: null,
            extra_header_value: null,
            phases: [
              {
                name: 'General availability',
                start_date: '2020-10-27T00:00:00.000Z',
                end_date: '2020-10-27T00:00:00.000Z',
                start_date_format: 'date',
                end_date_format: 'date',
              },
              {
                name: 'Full support',
                start_date: '2021-03-24T00:00:00.000Z',
                end_date: '2021-03-24T00:00:00.000Z',
                start_date_format: 'date',
                end_date_format: 'date',
              },
              {
                name: 'Maintenance support',
                start_date: 'Release of 4.9',
                end_date: 'Release of 4.9',
                start_date_format: 'string',
                end_date_format: 'string',
              },
              {
                name: 'Extended update support',
                start_date: '2022-10-27T00:00:00.000Z',
                end_date: '2023-04-27T00:00:00.000Z',
                start_date_format: 'date',
                end_date_format: 'date',
              },
            ],
          },
          {
            name: '4.5',
            type: 'End of life',
            last_minor_release: null,
            extra_header_value: null,
            phases: [
              {
                name: 'General availability',
                date: '2020-07-13T00:00:00.000Z',
                date_format: 'date',
              },
              {
                name: 'Full support',
                date: '2020-11-27T00:00:00.000Z',
                date_format: 'date',
              },
              {
                name: 'Maintenance support',
                date: '2021-07-27T00:00:00.000Z',
                date_format: 'date',
              },
            ],
          },
          {
            name: '4.4',
            type: 'End of life',
            last_minor_release: null,
            extra_header_value: null,
            phases: [
              {
                name: 'General availability',
                date: '2020-05-05T00:00:00.000Z',
                date_format: 'date',
              },
              {
                name: 'Full support',
                date: '2020-08-13T00:00:00.000Z',
                date_format: 'date',
              },
              {
                name: 'Maintenance support',
                date: '2021-02-24T00:00:00.000Z',
                date_format: 'date',
              },
            ],
          },
          {
            name: '4.3',
            type: 'End of life',
            last_minor_release: null,
            extra_header_value: null,
            phases: [
              {
                name: 'General availability',
                date: '2020-01-23T00:00:00.000Z',
                date_format: 'date',
              },
              {
                name: 'Full support',
                date: '2020-06-05T00:00:00.000Z',
                date_format: 'date',
              },
              {
                name: 'Maintenance support',
                date: '2020-10-27T00:00:00.000Z',
                date_format: 'date',
              },
            ],
          },
          {
            name: '4.2',
            type: 'End of life',
            last_minor_release: null,
            extra_header_value: null,
            phases: [
              {
                name: 'General availability',
                date: '2019-10-16T00:00:00.000Z',
                date_format: 'date',
              },
              {
                name: 'Full support',
                date: '2020-02-23T00:00:00.000Z',
                date_format: 'date',
              },
              {
                name: 'Maintenance support',
                date: '2020-07-13T00:00:00.000Z',
                date_format: 'date',
              },
            ],
          },
          {
            name: '4.1',
            type: 'End of life',
            last_minor_release: null,
            extra_header_value: null,
            phases: [
              {
                name: 'General availability',
                date: '2019-06-04T00:00:00.000Z',
                date_format: 'date',
              },
              {
                name: 'Full support',
                date: '2019-11-16T00:00:00.000Z',
                date_format: 'date',
              },
              {
                name: 'Maintenance support',
                date: '2020-05-05T00:00:00.000Z',
                date_format: 'date',
              },
            ],
          },
        ],
        all_phases: [
          {
            name: 'General availability',
            display_name: 'General availability',
          },
          { name: 'Full support', display_name: 'Full support ends' },
          {
            name: 'Maintenance support',
            display_name: 'Maintenance support ends',
          },
        ],
      },
    ],
  },
};

export default ocpLifeCycleStatuses;
